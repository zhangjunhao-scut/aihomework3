import { api } from './client';
import type { ProviderInfo, ApiKeyInfo } from './types';

export const listProviders = (): Promise<ProviderInfo[]> =>
  api.get('/providers').then((r) => r.data);

export const getKey = (provider: string): Promise<ApiKeyInfo> =>
  api.get(`/api-keys/${provider}`).then((r) => r.data);

export const saveKey = (provider: string, apiKey: string): Promise<ApiKeyInfo> =>
  api.put(`/api-keys/${provider}`, { apiKey }).then((r) => r.data);

export const deleteKey = (provider: string): Promise<ApiKeyInfo> =>
  api.delete(`/api-keys/${provider}`).then((r) => r.data);
