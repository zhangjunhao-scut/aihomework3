import { api } from './client';
import type { ChatRequest, ChatResponse, HistoryItem } from './types';

export const chat = (req: ChatRequest): Promise<ChatResponse> =>
  api.post('/chat', req).then((r) => r.data);

/**
 * 流式调用：用 fetch 直接读 ReadableStream（因为 axios 不便处理 SSE）。
 * token 通过 header 注入。回调逐字推送 delta。
 */
export async function chatStream(
  req: ChatRequest,
  onDelta: (text: string) => void,
  onDone?: (info: { usage?: any; timing?: any; raw?: any }) => void,
  onError?: (msg: string) => void,
): Promise<void> {
  const token = localStorage.getItem('token') || '';
  const resp = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(req),
  });

  if (!resp.ok) {
    let msg = `请求失败 (${resp.status})`;
    try {
      const data = await resp.json();
      msg = data?.message || msg;
    } catch {}
    onError?.(msg);
    return;
  }

  const reader = resp.body?.getReader();
  if (!reader) {
    onError?.('无响应流');
    return;
  }
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    for (const ev of events) {
      const line = ev.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        const obj = JSON.parse(payload);
        if (obj.type === 'delta' && obj.content) onDelta(obj.content);
        else if (obj.type === 'done') onDone?.({ usage: obj.usage, timing: obj.timing, raw: obj.raw });
        else if (obj.type === 'error') onError?.(obj.message || '服务错误');
      } catch {}
    }
  }
}

export const saveHistory = (dto: {
  title: string;
  request: ChatRequest;
  response: ChatResponse;
  durationMs: number;
}) => api.post('/history', dto).then((r) => r.data);

export const listHistory = (): Promise<HistoryItem[]> =>
  api.get('/history').then((r) => r.data);

export const deleteHistory = (id: string) =>
  api.delete(`/history/${id}`).then((r) => r.data);

export const clearHistory = () => api.delete('/history').then((r) => r.data);
