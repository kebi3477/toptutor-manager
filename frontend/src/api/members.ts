import { Member } from '../types';
import { request } from './base';

export interface CreateMemberPayload {
  name: string;
  teamId: string;
  role: '팀장' | '매니저' | '사원';
}

export const membersApi = {
  getAll: () => request<Member[]>('/members'),
  getOne: (id: string) => request<Member>(`/members/${id}`),
  create: (data: CreateMemberPayload) =>
    request<Member>('/members', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CreateMemberPayload>) =>
    request<Member>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<void>(`/members/${id}`, { method: 'DELETE' }),
};
