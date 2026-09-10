import { create } from 'zustand';
import * as authApi from '../api/auth';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  async login(email, password) {
    const { accessToken, user } = await authApi.login(email, password);
    localStorage.setItem('token', accessToken);
    set({ user });
  },
  async register(email, password) {
    const { accessToken, user } = await authApi.register(email, password);
    localStorage.setItem('token', accessToken);
    set({ user });
  },
  async fetchMe() {
    try {
      const user = await authApi.me();
      set({ user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, loading: false });
    }
  },
  logout() {
    localStorage.removeItem('token');
    set({ user: null });
  },
}));
