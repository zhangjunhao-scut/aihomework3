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
  apiKey?: string;
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

export interface Pricing {
  input: number;
  inputCached?: number;
  output: number;
  currency?: string;
}

export interface ProviderInfo {
  name: string;
  defaultBaseUrl: string;
  models: string[];
  paramBounds?: ParamBounds;
  supportsTopP?: boolean;
  keyHint?: string;
  keyFormat?: string;
  pricing?: Pricing;
  supportsCustomModel?: boolean;
}

export interface ApiKeyInfo {
  provider: string;
  saved: boolean;
  masked: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  durationMs: number;
  createdAt: string;
  request: ChatRequest;
  response: ChatResponse;
}
