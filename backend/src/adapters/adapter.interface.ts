/**
 * 厂商适配器统一接口。
 * 所有适配器把「统一 ChatRequest」翻译成具体厂商的 HTTP 请求，
 * 并把厂商响应解析回统一结构，前端只需面对一种数据格式。
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatParams {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream: boolean;
}

export interface ChatRequest {
  provider: string;
  baseUrl?: string;
  apiKey?: string; // 一次性传入；未传时后端从数据库读取
  model: string;
  messages: ChatMessage[];
  params: ChatParams;
}

export interface ChatUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatResponse {
  ok: true;
  provider: string;
  model: string;
  content: string;
  raw: unknown;
  usage?: ChatUsage;
  timing: { firstTokenMs?: number; totalMs: number };
}

export interface StreamDelta {
  deltaText?: string;
  done?: boolean;
  usage?: ChatUsage;
  raw?: unknown;
}

/** 参数边界，用于前端动态校验与后端边界校验 */
export interface ParamBound {
  min: number;
  max: number;
  default: number;
}

export interface ParamBounds {
  temperature?: ParamBound;
  top_p?: ParamBound;
  max_tokens?: ParamBound;
}

/** 计费（元/百万 token） */
export interface Pricing {
  input: number;
  inputCached?: number;
  output: number;
  currency?: string;
}

export interface LlmAdapter {
  readonly name: string;
  readonly defaultBaseUrl: string;
  readonly models: string[];
  buildRequest(
    req: ChatRequest,
    apiKey: string,
  ): { url: string; headers: Record<string, string>; body: any };
  parseResponse(raw: any): { content: string; usage?: ChatUsage; raw: unknown };
  parseStreamChunk(chunkStr: string): StreamDelta[];

  /** 参数边界，用于前端动态设置 slider 范围与后端边界校验 */
  readonly paramBounds?: ParamBounds;
  /** 是否支持 top_p（部分 ernie 不支持），默认 true */
  readonly supportsTopP?: boolean;
  /** 额外请求体字段（如混元 enable_enhancement） */
  readonly extraBody?: (req: ChatRequest) => Record<string, any>;
  /** 前端 Key 输入框 placeholder 提示 */
  readonly keyHint?: string;
  /** Key 格式正则（弱校验，仅提示） */
  readonly keyFormat?: string;
  /** 计费信息 */
  readonly pricing?: Pricing;
  /** 是否允许自定义 model 输入（豆包 ep-xxx），默认 false */
  readonly supportsCustomModel?: boolean;
}
