// 마더텅 매니저 - 공통 컴포넌트 & 유틸

const { useState, useMemo, useEffect, useRef } = React;

// ── 날짜 유틸 ──────────────────────────────────────────────
const KOR_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const KOR_MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function pad(n) { return String(n).padStart(2, '0'); }
function fmtDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function startOfWeek(d) { const x = new Date(d); x.setDate(x.getDate() - x.getDay() + 1); return x; } // monday
function isSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

function dateInRange(date, startStr, endStr) {
  const s = parseDate(startStr);
  const e = parseDate(endStr);
  return date >= s && date <= e;
}

function daysBetween(a, b) {
  const ms = parseDate(b) - parseDate(a);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// ── 데이터 헬퍼 ─────────────────────────────────────────────
function getTeam(id) { return TEAMS.find(t => t.id === id); }
function getMember(id) { return MEMBERS.find(m => m.id === id); }
function membersByTeam(teamId) { return MEMBERS.filter(m => m.team === teamId); }

function eventsOnDate(date) {
  const dStr = fmtDate(date);
  const company = COMPANY_EVENTS.filter(e => {
    if (e.startDate && e.endDate) return dateInRange(date, e.startDate, e.endDate);
    return e.date === dStr;
  });
  const personal = PERSONAL_EVENTS.filter(e => dateInRange(date, e.startDate, e.endDate));
  return { company, personal };
}

function todaysLeaves() {
  return PERSONAL_EVENTS.filter(e => dateInRange(TODAY, e.startDate, e.endDate));
}

// ── Avatar ──────────────────────────────────────────────
function Avatar({ member, size }) {
  if (!member) return null;
  const team = getTeam(member.team);
  const initial = member.name.slice(member.name.length - 2);
  const cls = 'avatar' + (size === 'lg' ? ' lg' : size === 'sm' ? ' sm' : '');
  return (
    <div className={cls} style={{ background: team.color }} title={`${member.name} · ${team.name}`}>
      {initial}
    </div>
  );
}

// ── Icon (lucide-style inline) ─────────────────────────
function Icon({ name, size }) {
  const s = size || 16;
  const props = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':
      return <svg {...props}><path d="M3 12L12 4l9 8" /><path d="M5 10v10h14V10" /></svg>;
    case 'calendar':
      return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>;
    case 'meal':
      return <svg {...props}><path d="M5 3v8a3 3 0 0 0 3 3v7" /><path d="M8 3v8M11 3v8" /><path d="M16 3c-1.5 2-2 4-2 6 0 2 1 3 2 3v9" /></svg>;
    case 'users':
      return <svg {...props}><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3 3-5 6-5s6 2 6 5" /><circle cx="17" cy="9" r="2.5" /><path d="M21 19c0-2-2-3.5-4-3.5" /></svg>;
    case 'plus':
      return <svg {...props}><path d="M12 5v14M5 12h14" /></svg>;
    case 'chevron-left':
      return <svg {...props}><path d="M15 6l-6 6 6 6" /></svg>;
    case 'chevron-right':
      return <svg {...props}><path d="M9 6l6 6-6 6" /></svg>;
    case 'chevron-down':
      return <svg {...props}><path d="M6 9l6 6 6-6" /></svg>;
    case 'x':
      return <svg {...props}><path d="M18 6L6 18M6 6l12 12" /></svg>;
    case 'search':
      return <svg {...props}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></svg>;
    case 'bell':
      return <svg {...props}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8" /><path d="M10 21a2 2 0 0 0 4 0" /></svg>;
    case 'settings':
      return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></svg>;
    case 'clock':
      return <svg {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'pin':
      return <svg {...props}><path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>;
    case 'megaphone':
      return <svg {...props}><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" /><path d="M14 8a4 4 0 0 1 0 8" /></svg>;
    case 'sparkle':
      return <svg {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5l2.5 2.5M16 16l2.5 2.5M5.5 18.5L8 16M16 8l2.5-2.5" /></svg>;
    case 'check':
      return <svg {...props}><path d="M5 12l5 5L20 7" /></svg>;
    case 'edit':
      return <svg {...props}><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M14 6l4 4" /></svg>;
    case 'folder':
      return <svg {...props}><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>;
    case 'trash':
      return <svg {...props}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>;
    case 'palette':
      return <svg {...props}><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1-1-2 1-2 2-2h2a4 4 0 0 0 0-8 9 9 0 0 0-5-4z" /><circle cx="7.5" cy="11" r="1" /><circle cx="9.5" cy="7" r="1" /><circle cx="14" cy="7" r="1" /><circle cx="16.5" cy="11" r="1" /></svg>;
    default:
      return null;
  }
}

// ── 일정 칩 (캘린더 셀 안에서 사용) ────────────────────
function EventChip({ event, kind }) {
  if (kind === 'company') {
    const cls = event.type === 'holiday' ? 'chip-holiday' : event.type === 'meeting' ? 'chip-meeting' : 'chip-event';
    return (
      <div className={`cal-chip ${cls}`} title={event.title}>
        <span className="cal-chip-dot" />
        <span className="truncate">{event.title}</span>
      </div>
    );
  }
  // personal
  const member = getMember(event.userId);
  const team = getTeam(member.team);
  const cls = event.type === 'half' ? 'chip-half' : 'chip-leave';
  return (
    <div className={`cal-chip ${cls}`} title={`${member.name} · ${event.label}`}>
      <span className="cal-chip-dot" style={{ background: team.color }} />
      <span className="truncate">{member.name} {event.type === 'half' ? (event.half === 'AM' ? '오전반차' : '오후반차') : '연차'}</span>
    </div>
  );
}

Object.assign(window, {
  KOR_DAYS, KOR_MONTHS, pad, fmtDate, parseDate, addDays, startOfWeek, isSameDay,
  dateInRange, daysBetween, getTeam, getMember, membersByTeam,
  eventsOnDate, todaysLeaves,
  Avatar, Icon, EventChip,
});
