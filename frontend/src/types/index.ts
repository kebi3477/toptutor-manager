export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  id: string;
  name: string;
  team: string;
  role: '팀장' | '매니저' | '사원';
  joinedYear: number;
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
  type: 'leave' | 'half';
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
