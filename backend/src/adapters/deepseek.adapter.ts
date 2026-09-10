import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * DeepSeek 适配器。
 * DeepSeek 采用 OpenAI 兼容协议，直接继承基类即可。
 *
 * 模型列表：
 *   - deepseek-chat：通用对话
 *   - deepseek-reasoner：带推理过程的模型
 */
@Injectable()
export class DeepSeekAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'deepseek';
  readonly defaultBaseUrl = 'https://api.deepseek.com';
  readonly models = ['deepseek-chat', 'deepseek-reasoner'];
  readonly paramBounds = {
    temperature: { min: 0, max: 2, default: 0.7 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 8192, default: 1024 },
  };
  readonly keyHint = '在 DeepSeek 开放平台获取，格式 sk-xxx';
  readonly keyFormat = '^sk-';
  readonly pricing = {
    input: 1,
    inputCached: 0.1,
    output: 2,
    currency: 'CNY',
  };
}
