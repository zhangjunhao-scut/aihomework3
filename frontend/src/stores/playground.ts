import { create } from 'zustand';
import type {
  ChatMessage,
  ChatParams,
  ChatResponse,
  ProviderInfo,
  ParamBounds,
  Pricing,
} from '../api/types';
import { listProviders, getKey } from '../api/provider';

interface PlaygroundState {
  providers: ProviderInfo[];
  provider: string;
  model: string;
  baseUrl: string;
  useCustomBaseUrl: boolean;
  apiKey: string; // 一次性输入；不持久化
  keyMasked: string;
  keySaved: boolean;

  systemPrompt: string;
  messages: ChatMessage[];
  params: ChatParams;
  stream: boolean;

  content: string;
  raw: unknown;
  usage: any;
  timing: any;
  sending: boolean;
  error: string;

  loadProviders: () => Promise<void>;
  setProvider: (name: string) => void;
  setModel: (m: string) => void;
  setBaseUrl: (url: string) => void;
  setUseCustomBaseUrl: (v: boolean) => void;
  setApiKey: (k: string) => void;
  loadKey: () => Promise<void>;
  setSystemPrompt: (s: string) => void;
  setMessages: (m: ChatMessage[]) => void;
  updateMessage: (i: number, m: Partial<ChatMessage>) => void;
  addMessage: (m: ChatMessage) => void;
  removeMessage: (i: number) => void;
  setParam: <K extends keyof ChatParams>(k: K, v: ChatParams[K]) => void;
  setStream: (v: boolean) => void;
  resetResult: () => void;
  applyResult: (r: ChatResponse) => void;
  appendDelta: (t: string) => void;
  setSending: (v: boolean) => void;
  setError: (e: string) => void;
  loadFromHistory: (req: any, res: any) => void;
}

const defaultParams: ChatParams = {
  temperature: 0.7,
  top_p: 1,
  max_tokens: 1024,
  stream: false,
};

/** 根据厂商 paramBounds 构造参数默认值 */
function buildDefaultParams(
  bounds?: ParamBounds,
  supportsTopP?: boolean,
): ChatParams {
  const p: ChatParams = { stream: false };
  if (bounds?.temperature)
    p.temperature = bounds.temperature.default;
  else p.temperature = 0.7;
  if (supportsTopP !== false) {
    if (bounds?.top_p) p.top_p = bounds.top_p.default;
    else p.top_p = 1;
  } else {
    p.top_p = undefined;
  }
  if (bounds?.max_tokens)
    p.max_tokens = bounds.max_tokens.default;
  else p.max_tokens = 1024;
  return p;
}

export const usePlayground = create<PlaygroundState>((set, get) => ({
  providers: [],
  provider: 'deepseek',
  model: 'deepseek-chat',
  baseUrl: 'https://api.deepseek.com',
  useCustomBaseUrl: false,
  apiKey: '',
  keyMasked: '',
  keySaved: false,

  systemPrompt: '',
  messages: [{ role: 'user', content: '把下面的句子翻译成英文：你好' }],
  params: { ...defaultParams },
  stream: false,

  content: '',
  raw: null,
  usage: null,
  timing: null,
  sending: false,
  error: '',

  async loadProviders() {
    const providers = await listProviders();
    if (providers.length) {
      const p = providers[0];
      const params = buildDefaultParams(p.paramBounds, p.supportsTopP);
      set({
        providers,
        provider: p.name,
        model: p.models[0] || '',
        baseUrl: p.defaultBaseUrl,
        params,
      });
      await get().loadKey();
    } else {
      set({ providers });
    }
  },

  setProvider(name) {
    const p = get().providers.find((x) => x.name === name);
    const params = buildDefaultParams(p?.paramBounds, p?.supportsTopP);
    set({
      provider: name,
      model: p?.models[0] || '',
      baseUrl: p?.defaultBaseUrl || '',
      params,
    });
    get().loadKey();
  },
  setModel(m) {
    set({ model: m });
  },
  setBaseUrl(url) {
    set({ baseUrl: url });
  },
  setUseCustomBaseUrl(v) {
    set({ useCustomBaseUrl: v });
  },
  setApiKey(k) {
    set({ apiKey: k });
  },
  async loadKey() {
    try {
      const info = await getKey(get().provider);
      set({ keyMasked: info.masked || '', keySaved: info.saved });
    } catch {
      set({ keyMasked: '', keySaved: false });
    }
  },

  setSystemPrompt(s) {
    set({ systemPrompt: s });
  },
  setMessages(m) {
    set({ messages: m });
  },
  updateMessage(i, m) {
    const arr = [...get().messages];
    arr[i] = { ...arr[i], ...m };
    set({ messages: arr });
  },
  addMessage(m) {
    set({ messages: [...get().messages, m] });
  },
  removeMessage(i) {
    set({ messages: get().messages.filter((_, idx) => idx !== i) });
  },
  setParam(k, v) {
    set({ params: { ...get().params, [k]: v } });
  },
  setStream(v) {
    set({ stream: v, params: { ...get().params, stream: v } });
  },

  resetResult() {
    set({ content: '', raw: null, usage: null, timing: null, error: '' });
  },
  applyResult(r) {
    set({
      content: r.content,
      raw: r.raw,
      usage: r.usage,
      timing: r.timing,
    });
  },
  appendDelta(t) {
    set({ content: get().content + t });
  },
  setSending(v) {
    set({ sending: v });
  },
  setError(e) {
    set({ error: e });
  },

  loadFromHistory(req, res) {
    if (req) {
      const p = get().providers.find((x) => x.name === req.provider);
      set({
        provider: req.provider || get().provider,
        model: req.model || get().model,
        baseUrl: req.baseUrl || p?.defaultBaseUrl || get().baseUrl,
        useCustomBaseUrl: !!req.baseUrl,
        systemPrompt:
          req.messages?.find?.((m: ChatMessage) => m.role === 'system')?.content || '',
        messages:
          req.messages?.filter?.((m: ChatMessage) => m.role !== 'system') || [],
        params: req.params || get().params,
        stream: req.params?.stream ?? false,
      });
      get().loadKey();
    }
    if (res) {
      set({
        content: res.content || '',
        raw: res.raw,
        usage: res.usage,
        timing: res.timing,
      });
    }
  },
}));

/** 把当前 playground 状态组装成 ChatRequest */
export function buildRequest(s: PlaygroundState) {
  const msgs: ChatMessage[] = [];
  if (s.systemPrompt.trim()) {
    msgs.push({ role: 'system', content: s.systemPrompt.trim() });
  }
  for (const m of s.messages) msgs.push({ role: m.role, content: m.content });
  return {
    provider: s.provider,
    baseUrl: s.useCustomBaseUrl ? s.baseUrl : undefined,
    apiKey: s.apiKey ? s.apiKey : undefined,
    model: s.model,
    messages: msgs,
    params: { ...s.params, stream: s.stream },
  };
}

/** 计算预估费用（元），无 pricing 返回 null */
export function estimateCost(
  usage: { prompt_tokens: number; completion_tokens: number } | null | undefined,
  pricing: Pricing | undefined,
): number | null {
  if (!usage || !pricing) return null;
  const inputCost = (usage.prompt_tokens / 1_000_000) * pricing.input;
  const outputCost = (usage.completion_tokens / 1_000_000) * pricing.output;
  return Math.round((inputCost + outputCost) * 1e6) / 1e6;
}
