import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * 月之暗面 Kimi 适配器。
 * base_url：https://api.moonshot.cn/v1
 * Key 格式：sk-xxx
 * 模型：moonshot-v1-8k / moonshot-v1-32k / moonshot-v1-128k / kimi-k2.6
 * 特殊：模型名带上下文长度，选择模型即决定上下文窗口
 */
@Injectable()
export class KimiAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'kimi';
  readonly defaultBaseUrl = 'https://api.moonshot.cn/v1';
  readonly models = ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k', 'kimi-k2.6'];
  readonly paramBounds = {
    temperature: { min: 0, max: 1, default: 0.7 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 128000, default: 1024 },
  };
  readonly keyHint = '在 Moonshot 平台获取，格式 sk-xxx';
  readonly keyFormat = '^sk-';
  readonly pricing = {
    input: 12,
    output: 12,
    currency: 'CNY',
  };
}
