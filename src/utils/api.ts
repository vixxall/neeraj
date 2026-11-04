import { Budget, SavingsGoal, Transaction, UserProfile } from '../types/finance';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'pft_api_token_v1';

export const api = {
  token: () => localStorage.getItem(TOKEN_KEY),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(`${API_URL || ''}/api${path}`, { ...options, headers });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || `Request failed (${response.status})`);
    }
    return response.status === 204 ? undefined as T : response.json();
  },
  async login(email: string, password: string, name: string, register: boolean) {
    const result = await this.request<{ token: string; user: { name: string; email: string } }>(register ? '/auth/register' : '/auth/login', { method: 'POST', body: JSON.stringify({ email, password, name }) });
    localStorage.setItem(TOKEN_KEY, result.token);
    return result;
  },
  logout: () => this.request<void>('/auth/logout', { method: 'POST' }).finally(() => this.clearToken()),
  dashboard: () => this.request<{ profile: UserProfile; transactions: Transaction[]; budgets: Budget[]; goals: SavingsGoal[] }>('/dashboard'),
  saveProfile: (profile: UserProfile) => api.request<UserProfile>('/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  create: <T>(resource: string, value: unknown) => api.request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(value) }),
  update: <T>(resource: string, id: string, value: unknown) => api.request<T>(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(value) }),
  remove: (resource: string, id: string) => api.request<void>(`/${resource}/${id}`, { method: 'DELETE' }),
  addFunds: (id: string, amount: number) => api.request<SavingsGoal>(`/goals/${id}/funds`, { method: 'POST', body: JSON.stringify({ amount }) }),
};
