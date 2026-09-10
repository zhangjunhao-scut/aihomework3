import { Injectable } from '@nestjs/common';
import { OpenAiCompatibleAdapter } from './openai-compatible.adapter';

/**
 * 讯飞星火适配器。
 * base_url：https://spark-api-open.xf-yun.com/v1（X1 用 /v2）
 * Key 格式：APIPassword（在控制台「HTTP 服务接口认证信息」获取，纯字符串）
 * 模型：spark-lite / spark-pro / spark-max / spark-4.0-ultra
 * 特殊：X1 需走 /v2，暂不支持（默认全部走 /v1）
 */
@Injectable()
export class SparkAdapter extends OpenAiCompatibleAdapter {
  readonly name = 'spark';
  readonly defaultBaseUrl = 'https://spark-api-open.xf-yun.com/v1';
  readonly models = ['spark-lite', 'spark-pro', 'spark-max', 'spark-4.0-ultra'];
  readonly paramBounds = {
    temperature: { min: 0, max: 1, default: 0.5 },
    top_p: { min: 0, max: 1, default: 1 },
    max_tokens: { min: 1, max: 8192, default: 1024 },
  };
  readonly keyHint = '在讯飞控制台 HTTP 服务接口获取 APIPassword，纯字符串';
  readonly keyFormat = '^[A-Za-z0-9_:-]+$';
  readonly pricing = {
    input: 10,
    output: 10,
    currency: 'CNY',
  };
}
