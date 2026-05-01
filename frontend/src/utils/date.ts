import { CompanyEvent, PersonalEvent } from '../types';

export { TODAY } from '../data';

export const KOR_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const KOR_MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function fmtDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay() + 1);
  return x;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function dateInRange(date: Date, startStr: string, endStr: string): boolean {
  const s = parseDate(startStr);
  const e = parseDate(endStr);
  return date >= s && date <= e;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / (1000 * 60 * 60 * 24));
}

export function eventsOnDate(
  date: Date,
  companyEvents: CompanyEvent[],
  personalEvents: PersonalEvent[],
): { company: CompanyEvent[]; personal: PersonalEvent[] } {
  const dStr = fmtDate(date);
  const company = companyEvents.filter(e => {
    if (e.startDate && e.endDate) return dateInRange(date, e.startDate, e.endDate);
    return e.date === dStr;
  });
  const personal = personalEvents.filter(e => dateInRange(date, e.startDate, e.endDate));
  return { company, personal };
}

export function todaysLeaves(personalEvents: PersonalEvent[], today: Date): PersonalEvent[] {
  return personalEvents.filter(e => dateInRange(today, e.startDate, e.endDate));
}
