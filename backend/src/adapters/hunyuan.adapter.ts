import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * 腾讯混元适配器。
 * base_url：https://api.hunyuan.cloud.tencent.com/v1
 * Key 格式：sk-xxx（不要用 SecretId/SecretKey 签名方式）
 * 模型：hunyuan-turbos-latest / hunyuan-standard / hunyuan-pro / hunyuan-lite
 * 特殊：有自定义参数 enable_enhancement（默认 true），用 extraBody 注入
 */
@Injectable()
export class HunyuanAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'hunyuan';
  readonly defaultBaseUrl = 'https://api.hunyuan.cloud.tencent.com/v1';
  readonly models = ['hunyuan-turbos-latest', 'hunyuan-standard', 'hunyuan-pro', 'hunyuan-lite'];
  readonly paramBounds = {
    temperature: { min: 0, max: 2, default: 0.7 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 4000, default: 1024 },
  };
  readonly keyHint = '在混元控制台创建 API Key，格式 sk-xxx（勿用 SecretId/SecretKey）';
  readonly keyFormat = '^sk-';
  readonly pricing = {
    input: 15,
    output: 50,
    currency: 'CNY',
  };
  // 混元特有：开启功能增强
  readonly extraBody = () => ({ enable_enhancement: true });
}
