import { request } from './base';
import type { AuthResponse, AuthUser } from '../types';

export const authApi = {
  signup: (email: string, password: string) =>
    request<{ message: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email: string, code: string) =>
    request<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  completeSignup: (email: string, name: string, teamId: string) =>
    request<AuthResponse>('/auth/complete-signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, teamId }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<AuthUser>('/auth/me'),
};
