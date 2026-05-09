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

  completeSignup: (email: string, name: string, teamId: string, role?: string) =>
    request<AuthResponse>('/auth/complete-signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, teamId, role }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<AuthUser>('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),
};
