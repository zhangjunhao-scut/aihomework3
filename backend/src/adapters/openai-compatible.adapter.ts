import { Injectable } from '@nestjs/common';
import {
  ChatRequest,
  ChatUsage,
  LlmAdapter,
  StreamDelta,
} from './adapter.interface';

/**
 * OpenAI 兼容协议适配器基类。
 * 封装通用的 OpenAI Chat Completions 请求/响应/SSE 解析逻辑，
 * 子类只需声明差异配置（name / defaultBaseUrl / models / paramBounds 等）。
 *
 * 协议：
 *   POST {baseUrl}/chat/completions
 *   Authorization: Bearer <apiKey>
 *   Body 与 OpenAI 一致；流式 SSE 也一致（data: {...}\n\n + data: [DONE]）。
 */
@Injectable()
export abstract class OpenAiCompatibleAdapter implements LlmAdapter {
  abstract readonly name: string;
  abstract readonly defaultBaseUrl: string;
  abstract readonly models: string[];

  readonly paramBounds?: import('./adapter.interface').ParamBounds;
  readonly supportsTopP?: boolean;
  readonly extraBody?: (req: ChatRequest) => Record<string, any>;
  readonly keyHint?: string;
  readonly keyFormat?: string;
  readonly pricing?: import('./adapter.interface').Pricing;
  readonly supportsCustomModel?: boolean;

  buildRequest(
    req: ChatRequest,
    apiKey: string,
  ): { url: string; headers: Record<string, string>; body: any } {
    const baseUrl = (req.baseUrl || this.defaultBaseUrl).replace(/\/$/, '');
    const url = `${baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      Accept: req.params.stream
        ? 'text/event-stream'
        : 'application/json',
    };
    const body: any = {
      model: req.model,
      messages: req.messages,
      stream: !!req.params.stream,
    };
    if (req.params.temperature !== undefined)
      body.temperature = req.params.temperature;
    if (this.supportsTopP !== false && req.params.top_p !== undefined)
      body.top_p = req.params.top_p;
    if (req.params.max_tokens !== undefined)
      body.max_tokens = req.params.max_tokens;
    const extra = this.extraBody?.(req);
    if (extra) Object.assign(body, extra);
    return { url, headers, body };
  }

  parseResponse(raw: any): {
    content: string;
    usage?: ChatUsage;
    raw: unknown;
  } {
    const content: string =
      raw?.choices?.[0]?.message?.content ??
      raw?.choices?.[0]?.delta?.content ??
      '';
    const usage: ChatUsage | undefined = raw?.usage
      ? {
          prompt_tokens: raw.usage.prompt_tokens ?? 0,
          completion_tokens: raw.usage.completion_tokens ?? 0,
          total_tokens:
            raw.usage.total_tokens ??
            (raw.usage.prompt_tokens ?? 0) +
              (raw.usage.completion_tokens ?? 0),
        }
      : undefined;
    return { content, usage, raw };
  }

  /**
   * 解析一条 SSE chunk。
   * OpenAI 兼容的流式每个事件形如：data: {...}\n\n
   * 终止事件：data: [DONE]
   */
  parseStreamChunk(chunkStr: string): StreamDelta[] {
    const deltas: StreamDelta[] = [];
    const lines = chunkStr.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') {
        deltas.push({ done: true });
        continue;
      }
      try {
        const json = JSON.parse(payload);
        const delta = json?.choices?.[0]?.delta;
        const text: string = delta?.content ?? '';
        const usage = json?.usage
          ? {
              prompt_tokens: json.usage.prompt_tokens ?? 0,
              completion_tokens: json.usage.completion_tokens ?? 0,
              total_tokens:
                json.usage.total_tokens ??
                (json.usage.prompt_tokens ?? 0) +
                  (json.usage.completion_tokens ?? 0),
            }
          : undefined;
        deltas.push({ deltaText: text, usage, raw: json });
      } catch {
        // 忽略无法解析的事件（如心跳注释行）
      }
    }
    return deltas;
  }
}
