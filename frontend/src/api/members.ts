import { Member } from '../types';
import { request } from './base';

export const membersApi = {
  getAll: () => request<Member[]>('/members'),
  getOne: (id: string) => request<Member>(`/members/${id}`),
  update: (id: string, data: Partial<Pick<Member, 'name' | 'teamId' | 'role'>>) =>
    request<Member>(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<void>(`/members/${id}`, { method: 'DELETE' }),
};
