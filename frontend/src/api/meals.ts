import { MealDay } from '../types';
import { BASE_URL, request } from './base';

export const mealsApi = {
  getWeeks: () => request<string[]>('/meals/weeks'),

  getWeek: (weekStart: string) =>
    request<MealDay[]>(`/meals?week=${encodeURIComponent(weekStart)}`),

  updateDay: (date: string, data: { lunch?: string[] | null; holiday?: string | null }) =>
    request<MealDay>(`/meals/${date}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  saveWeek: (days: MealDay[]) =>
    Promise.all(
      days.map((d) =>
        request<MealDay>(`/meals/${d.date}`, {
          method: 'PUT',
          body: JSON.stringify({
            weekStart: d.weekStart,
            day: d.day,
            lunch: d.lunch,
            holiday: d.holiday ?? null,
          }),
        }),
      ),
    ),
};
