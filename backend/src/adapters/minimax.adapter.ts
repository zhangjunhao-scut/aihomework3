import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * MiniMax 适配器。
 * base_url：https://api.minimaxi.com/v1
 * Key 格式：sk-xxx
 * 模型：abab6.5-chat / abab6.5s-chat / MiniMax-M2
 */
@Injectable()
export class MinimaxAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'minimax';
  readonly defaultBaseUrl = 'https://api.minimaxi.com/v1';
  readonly models = ['abab6.5-chat', 'abab6.5s-chat', 'MiniMax-M2'];
  readonly paramBounds = {
    temperature: { min: 0, max: 2, default: 0.7 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 8192, default: 1024 },
  };
  readonly keyHint = '在 MiniMax 开放平台获取，格式 sk-xxx';
  readonly keyFormat = '^sk-';
  readonly pricing = {
    input: 30,
    output: 30,
    currency: 'CNY',
  };
}
