import { Member } from '../types';
import { request } from './base';

export interface CreateMemberPayload {
  name: string;
  teamId: string;
  role: '팀장' | '매니저' | '사원';
}

export const membersApi = {
  getAll: () => request<Member[]>('/users'),
  getOne: (id: string) => request<Member>(`/users/${id}`),
  create: (data: CreateMemberPayload) =>
    request<Member>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateMemberPayload & { isAdmin: boolean }>) =>
    request<Member>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<void>(`/users/${id}`, { method: 'DELETE' }),
};
