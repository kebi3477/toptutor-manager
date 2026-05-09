import React, { useState } from 'react';
import { TEAMS, getMember, getTeam } from '../../data';
import { TODAY, KOR_DAYS, KOR_MONTHS, addDays, isSameDay, eventsOnDate, fmtDate } from '../../utils/date';
import Icon from '../../components/Icon/Icon';
import EventChip from '../../components/EventChip/EventChip';
import Avatar from '../../components/Avatar/Avatar';
import { useAppContext } from '../../context/AppContext';
import { eventsApi } from '../../api';
import { CompanyEvent, PersonalEvent, Member } from '../../types';
import styles from './CalendarPage.module.scss';

interface CalendarPageProps {
  isAdmin: boolean;
}

type Filter = 'all' | 'company' | 'personal';

type ChipItem = { kind: 'company'; e: CompanyEvent } | { kind: 'personal'; e: PersonalEvent };
type ChipPopoverState = { item: ChipItem; x: number; y: number };
type MorePopoverState = { date: Date; chips: ChipItem[]; x: number; y: number };

// ── 이벤트 상세 팝오버 ────────────────────────────────────────

function ChipDetailPopover({
  popover,
  members,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
}: {
  popover: ChipPopoverState;
  members: Member[];
  onClose: () => void;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { item, x, y } = popover;
  const left = Math.min(x, window.innerWidth - 264);
  const top = Math.min(y, window.innerHeight - 200);
  const canEdit = item.kind === 'personal' || isAdmin;

  async function handleDelete() {
    setDeleting(true);
    await onDelete();
  }

  return (
    <>
      <div className={styles.popoverOverlay} onClick={onClose} />
      <div className={styles.chipPopover} style={{ left, top }}>
        {item.kind === 'personal' ? (
          <PersonalDetail event={item.e} members={members} />
        ) : (
          <CompanyDetail event={item.e} />
        )}
        {canEdit && (
          <div className={styles.popoverActions}>
            {confirmDelete ? (
              <>
                <span className={styles.popoverConfirm}>삭제하시겠습니까?</span>
                <button className="btn btn-ghost" style={{ padding: '3px 10px', fontSize: 12 }} onClick={() => setConfirmDelete(false)} disabled={deleting} type="button">취소</button>
                <button className="btn" style={{ background: 'var(--red)', color: '#fff', padding: '3px 10px', fontSize: 12 }} onClick={handleDelete} disabled={deleting} type="button">
                  {deleting ? '...' : '삭제'}
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-icon" title="수정" onClick={() => { onClose(); onEdit(); }} type="button">
                  <Icon name="edit" size={14} />
                </button>
                <button className="btn btn-ghost btn-icon" title="삭제" style={{ color: 'var(--red)' }} onClick={() => setConfirmDelete(true)} type="button">
                  <Icon name="trash" size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function PersonalDetail({ event: e, members }: { event: PersonalEvent; members: Member[] }) {
  const member = getMember(e.userId, members);
  if (!member) return null;
  const team = member.teamId ? getTeam(member.teamId) : null;
  const typeLabel =
    e.type === 'half' ? (e.half === 'AM' ? '오전 반차' : '오후 반차')
    : e.type === 'trip' ? e.label
    : '연차';
  const chipCls = e.type === 'half' ? 'chip-half' : e.type === 'trip' ? 'chip-trip' : 'chip-leave';

  return (
    <>
      <div className={styles.popoverPerson}>
        <Avatar member={member} />
        <div>
          <div className={styles.popoverName}>{member.name}</div>
          <div className={styles.popoverTeam}>
            <span className={styles.teamDot} style={{ background: team?.color ?? 'var(--text-3)' }} />
            {team?.name ?? '—'}
          </div>
        </div>
      </div>
      <div className={styles.popoverMeta}>
        <span className={`chip ${chipCls}`}>{typeLabel}</span>
        <span className={styles.popoverDate}>
          {e.startDate === e.endDate ? e.startDate : `${e.startDate} ~ ${e.endDate}`}
        </span>
      </div>
    </>
  );
}

function CompanyDetail({ event: e }: { event: CompanyEvent }) {
  const typeLabel = e.type === 'holiday' ? '공휴일' : e.type === 'meeting' ? '회의' : '이벤트';
  const chipCls = e.type === 'holiday' ? 'chip-holiday' : e.type === 'meeting' ? 'chip-meeting' : 'chip-event';
  const dateStr = e.date ?? (e.startDate && e.endDate ? `${e.startDate} ~ ${e.endDate}` : '');

  return (
    <>
      <div className={styles.popoverTitle}>{e.title}</div>
      <div className={styles.popoverMeta}>
        <span className={`chip ${chipCls}`}>{typeLabel}</span>
        {dateStr && <span className={styles.popoverDate}>{dateStr}</span>}
        {e.time && <span className={styles.popoverDate}>{e.time}</span>}
        {e.location && <span className={styles.popoverDate}>{e.location}</span>}
      </div>
    </>
  );
}

// ── +N 더보기 팝오버 ───────────────────────────────────────────

function MoreEventsPopover({
  popover,
  onClose,
  onChipClick,
}: {
  popover: MorePopoverState;
  onClose: () => void;
  onChipClick: (item: ChipItem, x: number, y: number) => void;
}) {
  const { date, chips, x, y } = popover;
  const left = Math.min(x, window.innerWidth - 228);
  const top = Math.min(y, window.innerHeight - 240);

  return (
    <>
      <div className={styles.popoverOverlay} onClick={onClose} />
      <div className={styles.morePopover} style={{ left, top }}>
        <div className={styles.morePopoverHd}>
          <span>{date.getMonth() + 1}월 {date.getDate()}일 ({chips.length})</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} type="button">
            <Icon name="x" size={13} />
          </button>
        </div>
        <div className={styles.morePopoverList}>
          {chips.map((c, i) => (
            <button
              key={i}
              className={styles.moreChipBtn}
              type="button"
              onClick={ev => {
                const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
                onClose();
                onChipClick(c, rect.left, rect.bottom + 6);
              }}
            >
              {c.kind === 'company'
                ? <EventChip kind="company" event={c.e} />
                : <EventChip kind="personal" event={c.e} />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────

function CalendarPage({ isAdmin }: CalendarPageProps) {
  const {
    members, companyEvents, personalEvents,
    setCompanyEvents, setPersonalEvents,
    setShowCreateEvent, setCreateEventInitialDate, setEditingEvent,
  } = useAppContext();
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [chipPopover, setChipPopover] = useState<ChipPopoverState | null>(null);
  const [morePopover, setMorePopover] = useState<MorePopoverState | null>(null);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));

  function handleAddEvent(d: Date) {
    setCreateEventInitialDate(fmtDate(d));
    setShowCreateEvent(true);
  }

  function handleChipClick(item: ChipItem, ev: React.MouseEvent) {
    ev.stopPropagation();
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    setMorePopover(null);
    setChipPopover({ item, x: rect.left, y: rect.bottom + 6 });
  }

  function handleChipClickFromMore(item: ChipItem, x: number, y: number) {
    setChipPopover({ item, x, y });
  }

  function handleEditChip() {
    if (!chipPopover) return;
    const { item } = chipPopover;
    setEditingEvent(item.kind === 'company'
      ? { kind: 'company', event: item.e }
      : { kind: 'personal', event: item.e }
    );
    setShowCreateEvent(true);
  }

  async function handleDeleteChip() {
    if (!chipPopover) return;
    const { item } = chipPopover;
    if (item.kind === 'company') {
      await eventsApi.removeCompany(item.e.id);
      setCompanyEvents(companyEvents.filter(e => e.id !== item.e.id));
    } else {
      await eventsApi.removePersonal(item.e.id);
      setPersonalEvents(personalEvents.filter(e => e.id !== item.e.id));
    }
    setChipPopover(null);
  }

  function closeAll() {
    setChipPopover(null);
    setMorePopover(null);
  }

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
        <span className="row" style={{ gap: 4 }}><span className={styles.dot} style={{ background: '#1E6B3A' }} />외근/출장</span>
        <span className="row" style={{ gap: 4 }}><span className={styles.dot} style={{ background: '#D9504E' }} />공휴일</span>
      </div>

      <div className="card" onClick={closeAll}>
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

            const chips: ChipItem[] = [];
            if (filter !== 'personal') company.forEach(e => chips.push({ kind: 'company', e }));
            if (filter !== 'company') filteredPersonal.forEach(e => chips.push({ kind: 'personal', e }));

            const showChips = chips.slice(0, 3);
            const more = chips.length - showChips.length;

            return (
              <div
                key={i}
                className={`${styles.cell} ${!inMonth ? styles.cellOut : ''} ${isToday ? styles.cellToday : ''}`}
              >
                <div className={styles.cellHeader}>
                  <div className={`${styles.cellNum} ${dow === 0 ? styles.sun : dow === 6 ? styles.sat : ''} tnum`}>
                    {isToday ? <span className={styles.todayPill}>{d.getDate()}</span> : d.getDate()}
                  </div>
                  <button
                    className={styles.addBtn}
                    type="button"
                    onClick={ev => { ev.stopPropagation(); handleAddEvent(d); }}
                    title={`${d.getMonth() + 1}월 ${d.getDate()}일 일정 추가`}
                  >
                    <Icon name="plus" size={11} />
                  </button>
                </div>
                <div className={styles.cellChips}>
                  {showChips.map((c, idx) => (
                    <div
                      key={idx}
                      className={styles.chipWrapper}
                      onClick={ev => handleChipClick(c, ev)}
                    >
                      {c.kind === 'company'
                        ? <EventChip kind="company" event={c.e} />
                        : <EventChip kind="personal" event={c.e} />}
                    </div>
                  ))}
                  {more > 0 && (
                    <button
                      className={styles.more}
                      type="button"
                      onClick={ev => {
                        ev.stopPropagation();
                        const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
                        setChipPopover(null);
                        setMorePopover({ date: d, chips, x: rect.left, y: rect.bottom + 6 });
                      }}
                    >
                      +{more}개 더보기
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {chipPopover && (
        <ChipDetailPopover
          popover={chipPopover}
          members={members}
          onClose={() => setChipPopover(null)}
          isAdmin={isAdmin}
          onEdit={handleEditChip}
          onDelete={handleDeleteChip}
        />
      )}
      {morePopover && (
        <MoreEventsPopover
          popover={morePopover}
          onClose={() => setMorePopover(null)}
          onChipClick={handleChipClickFromMore}
        />
      )}
    </div>
  );
}

export default CalendarPage;
