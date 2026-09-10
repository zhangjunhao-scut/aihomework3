import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * 通义千问适配器。
 * base_url：https://dashscope.aliyuncs.com/compatible-mode/v1
 *   （必须用 compatible-mode 路径，否则走 DashScope 原生协议不兼容）
 * Key 格式：sk-xxx
 * 模型：qwen-plus / qwen-max / qwen-turbo / qwen3-max
 */
@Injectable()
export class QwenAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'qwen';
  readonly defaultBaseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  readonly models = ['qwen-plus', 'qwen-max', 'qwen-turbo', 'qwen3-max'];
  readonly paramBounds = {
    temperature: { min: 0, max: 2, default: 0.7 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 8192, default: 1024 },
  };
  readonly keyHint = '在阿里云 DashScope 获取，格式 sk-xxx';
  readonly keyFormat = '^sk-';
  readonly pricing = {
    input: 40,
    output: 120,
    currency: 'CNY',
  };
}
