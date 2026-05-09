export interface Team {
  id: string;
  name: string;
  color: string;
  order?: number;
}

export interface CreateTeamPayload {
  id: string;
  name: string;
  color: string;
}

export interface UpdateTeamPayload {
  name?: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  teamId: string | null;
  role: '팀장' | '매니저' | '사원';
  email?: string | null;
  isAdmin?: boolean;
}

export interface CompanyEvent {
  id: string;
  title: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  location?: string;
  type: 'meeting' | 'event' | 'holiday';
}

export interface PersonalEvent {
  id: string;
  userId: string;
  type: 'leave' | 'half' | 'trip';
  startDate: string;
  endDate: string;
  half?: 'AM' | 'PM';
  label: string;
}

export interface CreateCompanyEventPayload {
  id?: string;
  title: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  location?: string;
  type: 'meeting' | 'event' | 'holiday';
}

export interface CreatePersonalEventPayload {
  id?: string;
  userId: string;
  type: 'leave' | 'half' | 'trip';
  startDate: string;
  endDate: string;
  half?: 'AM' | 'PM';
  label: string;
}

export interface MealDay {
  date: string;
  day: string;
  weekStart?: string;
  breakfast?: string[] | null;
  lunch: string[] | null;
  holiday?: string | null;
}

export type MealWeek = MealDay[];

export type PageId = 'dashboard' | 'calendar' | 'meals' | 'teams' | 'users' | 'meals-edit';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  teamId: string | null;
  role: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
