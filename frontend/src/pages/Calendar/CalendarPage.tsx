import React, { useState } from 'react';
import { TEAMS, getMember } from '../../data';
import { TODAY, KOR_DAYS, KOR_MONTHS, addDays, isSameDay, eventsOnDate } from '../../utils/date';
import Icon from '../../components/Icon/Icon';
import EventChip from '../../components/EventChip/EventChip';
import { useAppContext } from '../../context/AppContext';
import styles from './CalendarPage.module.scss';

interface CalendarPageProps {
  isAdmin: boolean;
}

type Filter = 'all' | 'company' | 'personal';

function CalendarPage({ isAdmin }: CalendarPageProps) {
  const { members, companyEvents, personalEvents } = useAppContext();
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));

  return (
    <div className={styles.content}>
      <div className={styles.toolbar}>
        <div className="row" style={{ gap: 12 }}>
          <div className={`${styles.monthTitle} tnum`}>
            {cursor.getFullYear()}년 {KOR_MONTHS[cursor.getMonth()]}
          </div>
          <div className="row" style={{ gap: 2 }}>
            <button className="btn btn-icon btn-ghost" onClick={goPrev}><Icon name="chevron-left" /></button>
            <button className="btn btn-ghost" onClick={goToday} style={{ padding: '6px 10px' }}>오늘</button>
            <button className="btn btn-icon btn-ghost" onClick={goNext}><Icon name="chevron-right" /></button>
          </div>
        </div>

        <div className="row" style={{ gap: 10 }}>
          <div className="seg">
            {(['all', 'company', 'personal'] as Filter[]).map(f => (
              <button key={f} className={`seg-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? '전체' : f === 'company' ? '회사' : '개인'}
              </button>
            ))}
          </div>

          <select
            className="select"
            style={{ width: 130, height: 32 }}
            value={selectedTeam}
            onChange={e => setSelectedTeam(e.target.value)}
          >
            <option value="all">모든 팀</option>
            {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.legend}>
        <span className="row" style={{ gap: 4 }}><span className={styles.dot} style={{ background: 'var(--brand)' }} />회사 일정</span>
        <span className="row" style={{ gap: 4 }}><span className={styles.dot} style={{ background: '#3D7DD9' }} />연차</span>
        <span className="row" style={{ gap: 4 }}><span className={styles.dot} style={{ background: '#8662C7' }} />반차</span>
        <span className="row" style={{ gap: 4 }}><span className={styles.dot} style={{ background: '#D9504E' }} />공휴일</span>
      </div>

      <div className="card">
        <div className={styles.headRow}>
          {KOR_DAYS.map((d, i) => (
            <div key={d} className={`${styles.headCell} ${i === 0 ? styles.sun : i === 6 ? styles.sat : ''}`}>{d}</div>
          ))}
        </div>
        <div className={styles.body}>
          {days.map((d, i) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = isSameDay(d, TODAY);
            const dow = d.getDay();
            const { company, personal } = eventsOnDate(d, companyEvents, personalEvents);
            const filteredPersonal = selectedTeam === 'all'
              ? personal
              : personal.filter(p => getMember(p.userId, members)?.teamId === selectedTeam);

            let chips: { kind: 'company' | 'personal'; e: any }[] = [];
            if (filter !== 'personal') chips = chips.concat(company.map(e => ({ kind: 'company' as const, e })));
            if (filter !== 'company') chips = chips.concat(filteredPersonal.map(e => ({ kind: 'personal' as const, e })));

            const showChips = chips.slice(0, 3);
            const more = chips.length - showChips.length;

            return (
              <div
                key={i}
                className={`${styles.cell} ${!inMonth ? styles.cellOut : ''} ${isToday ? styles.cellToday : ''}`}
              >
                <div className={`${styles.cellNum} ${dow === 0 ? styles.sun : dow === 6 ? styles.sat : ''} tnum`}>
                  {isToday ? <span className={styles.todayPill}>{d.getDate()}</span> : d.getDate()}
                </div>
                <div className={styles.cellChips}>
                  {showChips.map((c, idx) => (
                    <EventChip key={idx} kind={c.kind} event={c.e} />
                  ))}
                  {more > 0 && <div className={styles.more}>+{more}개 더보기</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
