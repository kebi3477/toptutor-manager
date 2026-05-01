import { CompanyEvent, PersonalEvent, CreateCompanyEventPayload, CreatePersonalEventPayload } from '../types';
import { request } from './base';

export const eventsApi = {
  getAllCompany: () => request<CompanyEvent[]>('/events/company'),
  createCompany: (data: CreateCompanyEventPayload) =>
    request<CompanyEvent>('/events/company', { method: 'POST', body: JSON.stringify(data) }),
  updateCompany: (id: string, data: Partial<CreateCompanyEventPayload>) =>
    request<CompanyEvent>(`/events/company/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removeCompany: (id: string) =>
    request<void>(`/events/company/${id}`, { method: 'DELETE' }),

  getAllPersonal: () => request<PersonalEvent[]>('/events/personal'),
  createPersonal: (data: CreatePersonalEventPayload) =>
    request<PersonalEvent>('/events/personal', { method: 'POST', body: JSON.stringify(data) }),
  updatePersonal: (id: string, data: Partial<CreatePersonalEventPayload>) =>
    request<PersonalEvent>(`/events/personal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  removePersonal: (id: string) =>
    request<void>(`/events/personal/${id}`, { method: 'DELETE' }),
};
