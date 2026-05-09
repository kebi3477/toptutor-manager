import { User } from '../types';
import { request } from './base';

export interface CreateUserPayload {
  name: string;
  teamId: string;
  role: '팀장' | '매니저' | '사원';
}

export const usersApi = {
  getAll: () => request<User[]>('/users'),
  getOne: (id: string) => request<User>(`/users/${id}`),
  create: (data: CreateUserPayload) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateUserPayload & { isAdmin: boolean }>) =>
    request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
};
