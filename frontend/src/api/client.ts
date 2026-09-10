import axios from 'axios';

const baseURL = '/api';

export const api = axios.create({ baseURL, timeout: 120000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token');
      if (!location.pathname.startsWith('/login')) {
        location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

export function errMsg(e: any): string {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error?.message ||
    e?.message ||
    '未知错误'
  );
}
