import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * 智谱 GLM 适配器。
 * base_url：https://open.bigmodel.cn/api/paas/v4
 * Key 格式：{apiid}.{secret}（点号分隔，整体作为 Bearer token）
 * 模型：glm-4 / glm-4-plus / glm-4-air / glm-4-flash / glm-5.1
 */
@Injectable()
export class ZhipuAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'zhipu';
  readonly defaultBaseUrl = 'https://open.bigmodel.cn/api/paas/v4';
  readonly models = ['glm-4', 'glm-4-plus', 'glm-4-air', 'glm-4-flash', 'glm-5.1'];
  readonly paramBounds = {
    temperature: { min: 0, max: 0.99, default: 0.7 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 128000, default: 1024 },
  };
  readonly keyHint = '在智谱开放平台获取，格式 {apiid}.{secret}';
  readonly keyFormat = '^[a-zA-Z0-9]+\\.[a-zA-Z0-9]+$';
  readonly pricing = {
    input: 50,
    output: 50,
    currency: 'CNY',
  };
}
