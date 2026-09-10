import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * 火山方舟豆包适配器。
 * base_url：https://ark.cn-beijing.volces.com/api/v3
 * Key 格式：sk-xxx
 * 模型：doubao-1.5-pro-32k-250115 / doubao-1.5-lite-32k / doubao-pro-32k / doubao-pro-128k
 *   （直接模型名，不做 ep- 自定义输入）
 */
@Injectable()
export class DoubaoAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'doubao';
  readonly defaultBaseUrl = 'https://ark.cn-beijing.volces.com/api/v3';
  readonly models = ['doubao-1.5-pro-32k-250115', 'doubao-1.5-lite-32k', 'doubao-pro-32k', 'doubao-pro-128k'];
  readonly paramBounds = {
    temperature: { min: 0, max: 2, default: 0.7 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 32768, default: 1024 },
  };
  readonly keyHint = '在火山方舟控制台获取，格式 sk-xxx';
  readonly keyFormat = '^sk-';
  readonly pricing = {
    input: 5,
    output: 5,
    currency: 'CNY',
  };
}
