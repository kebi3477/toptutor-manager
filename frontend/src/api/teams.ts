import { Team, CreateTeamPayload, UpdateTeamPayload } from '../types';
import { BASE_URL, request } from './base';

export const teamsApi = {
  getAll: () => request<Team[]>('/teams'),

  create: (data: CreateTeamPayload) =>
    request<Team>('/teams', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateTeamPayload) =>
    request<Team>(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id: string) =>
    fetch(`${BASE_URL}/teams/${id}`, { method: 'DELETE' }).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
    }),
};
