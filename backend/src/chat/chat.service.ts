import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AppConfig } from '../common/config';
import { PrismaService } from '../prisma.service';
import { CryptoUtil } from '../crypto/crypto.util';
import { ProviderRegistry } from '../adapters/provider.registry';
import {
  ChatRequest,
  ChatResponse,
  ChatUsage,
} from '../adapters/adapter.interface';
import { Response } from 'express';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly registry: ProviderRegistry,
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoUtil,
    private readonly config: AppConfig,
  ) {}

  /**
   * 解析用户身份下的 API Key：
   * 优先用请求体里一次性传入的 apiKey；否则从数据库读取已加密的 Key。
   * 始终只在内存使用，不写日志。
   */
  private async resolveApiKey(
    userId: string,
    req: ChatRequest,
  ): Promise<string> {
    if (req.apiKey && req.apiKey.trim()) {
      return req.apiKey.trim();
    }
    const row = await this.prisma.apiKey.findUnique({
      where: {
        userId_provider: { userId, provider: req.provider },
      },
    });
    if (!row) {
      throw new BadRequestException(
        `未找到厂商 ${req.provider} 的 API Key，请先在设置中保存`,
      );
    }
    return this.crypto.decrypt(row.cipher, row.iv);
  }

  private resolveAdapter(provider: string) {
    const adapter = this.registry.get(provider);
    if (!adapter) {
      throw new BadRequestException(`不支持的厂商: ${provider}`);
    }
    return adapter;
  }

  /** 根据 adapter.paramBounds 校验参数边界，越界返回 400 */
  private validateParams(adapter: any, req: ChatRequest) {
    const bounds = adapter.paramBounds;
    if (!bounds) return;
    const p = req.params;
    const check = (
      key: 'temperature' | 'top_p' | 'max_tokens',
      val: number | undefined,
    ) => {
      const b = bounds[key];
      if (b === undefined || val === undefined) return;
      if (typeof val !== 'number' || Number.isNaN(val)) {
        throw new BadRequestException(`${key} 必须为数字`);
      }
      if (val < b.min || val > b.max) {
        throw new BadRequestException(
          `${key} 越界：允许范围 ${b.min} ~ ${b.max}，当前 ${val}`,
        );
      }
    };
    check('temperature', p.temperature);
    if (adapter.supportsTopP !== false) check('top_p', p.top_p);
    check('max_tokens', p.max_tokens);
  }

  /** 校验自定义 BaseURL，防 SSRF */
  private validateBaseUrl(req: ChatRequest) {
    const baseUrl = req.baseUrl;
    if (!baseUrl) return;
    if (!this.config.allowCustomBaseUrl) {
      throw new BadRequestException(
        '当前未开启自定义 BaseURL（ALLOW_CUSTOM_BASEURL=false）',
      );
    }
    try {
      const u = new URL(baseUrl);
      if (u.protocol !== 'https:') {
        throw new BadRequestException('自定义 BaseURL 必须为 https');
      }
      const host = u.hostname;
      if (
        host === 'localhost' ||
        host.startsWith('127.') ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        host.startsWith('169.254.') ||
        host.startsWith('172.16.') ||
        host.startsWith('172.17.') ||
        host.startsWith('172.18.') ||
        host.startsWith('172.19.') ||
        host.startsWith('172.2') ||
        host.startsWith('172.3')
      ) {
        throw new BadRequestException('禁止访问内网地址');
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('BaseURL 格式非法');
    }
  }

  /** 非流式调用 */
  async chat(userId: string, req: ChatRequest): Promise<ChatResponse> {
    const adapter = this.resolveAdapter(req.provider);
    this.validateParams(adapter, req);
    this.validateBaseUrl(req);
    const apiKey = await this.resolveApiKey(userId, req);
    const { url, headers, body } = adapter.buildRequest(req, apiKey);

    const start = Date.now();
    const resp = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...body, stream: false }),
    });
    const totalMs = Date.now() - start;
    const text = await resp.text();
    if (!resp.ok) {
      this.logger.warn(
        `LLM 调用失败 status=${resp.status} provider=${req.provider}`,
      );
      throw new InternalServerErrorException({
        message: `大模型服务返回错误 (${resp.status})`,
        providerError: this.safeSlice(text),
        status: resp.status,
      });
    }
    let raw: any;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new InternalServerErrorException('大模型返回非 JSON 响应');
    }
    const parsed = adapter.parseResponse(raw);
    return {
      ok: true,
      provider: req.provider,
      model: req.model,
      content: parsed.content,
      raw: parsed.raw,
      usage: parsed.usage,
      timing: { totalMs },
    };
  }

  /**
   * 流式调用：从 LLM 拉 SSE，解析后转发给前端为统一事件流。
   * 事件格式见设计文档 6.3 节。
   */
  async chatStream(userId: string, req: ChatRequest, res: Response) {
    const adapter = this.resolveAdapter(req.provider);
    this.validateParams(adapter, req);
    this.validateBaseUrl(req);
    const apiKey = await this.resolveApiKey(userId, req);
    const { url, headers, body } = adapter.buildRequest(req, apiKey);

    const send = (obj: any) =>
      res.write(`data: ${JSON.stringify(obj)}\n\n`);

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const start = Date.now();
    let firstTokenMs: number | undefined;
    let lastUsage: ChatUsage | undefined;
    let lastRaw: unknown;

    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...body, stream: true }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        this.logger.warn(
          `LLM 流式调用失败 status=${resp.status} provider=${req.provider}`,
        );
        send({
          type: 'error',
          message: `大模型服务返回错误 (${resp.status})`,
          status: resp.status,
          providerError: this.safeSlice(errText),
        });
        return res.end();
      }
      const reader = resp.body?.getReader();
      if (!reader) {
        send({ type: 'error', message: '无响应流' });
        return res.end();
      }
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // SSE 事件以空行分隔；尽量按已有完整事件处理
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';
        for (const chunk of chunks) {
          const deltas = adapter.parseStreamChunk(chunk);
          for (const d of deltas) {
            if (d.deltaText) {
              if (firstTokenMs === undefined)
                firstTokenMs = Date.now() - start;
              send({ type: 'delta', content: d.deltaText });
            }
            if (d.usage) lastUsage = d.usage;
            if (d.raw) lastRaw = d.raw;
            if (d.done) {
              // 终止信号
            }
          }
        }
      }
      // 处理残留 buffer
      if (buffer.trim()) {
        const deltas = adapter.parseStreamChunk(buffer);
        for (const d of deltas) {
          if (d.deltaText) {
            if (firstTokenMs === undefined)
              firstTokenMs = Date.now() - start;
            send({ type: 'delta', content: d.deltaText });
          }
          if (d.usage) lastUsage = d.usage;
          if (d.raw) lastRaw = d.raw;
        }
      }
      send({
        type: 'done',
        timing: { firstTokenMs, totalMs: Date.now() - start },
        usage: lastUsage,
        raw: lastRaw,
      });
    } catch (e: any) {
      this.logger.error(`流式转发异常: ${e?.message}`);
      send({ type: 'error', message: e?.message || '转发异常' });
    } finally {
      res.end();
    }
  }

  /** 避免把超长错误信息塞进响应 */
  private safeSlice(s: string, n = 2000): string {
    return s.length > n ? s.slice(0, n) + '...' : s;
  }
}
