import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * 百度文心一言（千帆 v2）适配器。
 * base_url：https://qianfan.baidubce.com/v2（必须用 v2 端点）
 * Key 格式：bce-v3-xxx（在千帆控制台创建 API Key）
 * 模型：ernie-4.0-8k / ernie-3.5-8k / ernie-speed-8k / ernie-lite-8k
 * 特殊：部分模型不支持 top_p
 */
@Injectable()
export class ErnieAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'ernie';
  readonly defaultBaseUrl = 'https://qianfan.baidubce.com/v2';
  readonly models = ['ernie-4.0-8k', 'ernie-3.5-8k', 'ernie-speed-8k', 'ernie-lite-8k'];
  readonly paramBounds = {
    temperature: { min: 0, max: 1, default: 0.8 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 4096, default: 1024 },
  };
  readonly supportsTopP = false; // ernie 部分模型不支持 top_p
  readonly keyHint = '在千帆控制台创建 API Key，格式 bce-v3-xxx';
  readonly keyFormat = '^bce-v3-';
  readonly pricing = {
    input: 120,
    output: 120,
    currency: 'CNY',
  };
}
