import React, { useEffect, useState } from 'react';
import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';
import { getTeam, TEAMS } from '../../data';
import { TODAY, fmtDate } from '../../utils/date';
import { useAppContext } from '../../context/AppContext';
import { eventsApi } from '../../api';
import { PersonalEvent } from '../../types';
import styles from './CreateEventModal.module.scss';

type EventType = 'leave' | 'half' | 'personal-event' | 'company';
type CompanyType = 'event' | 'meeting' | 'holiday';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

function CreateEventModal({ open, onClose, isAdmin }: CreateEventModalProps) {
  const {
    users, companyEvents, personalEvents,
    setPersonalEvents, setCompanyEvents,
    createEventInitialDate,
    editingEvent, setEditingEvent,
    currentUser,
  } = useAppContext();

  const [type, setType] = useState<EventType>('leave');
  const [companyType, setCompanyType] = useState<CompanyType>('event');
  const [startDate, setStartDate] = useState(fmtDate(TODAY));
  const [endDate, setEndDate] = useState(fmtDate(TODAY));
  const [half, setHalf] = useState<'AM' | 'PM'>('AM');
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = editingEvent !== null;

  function handleClose() {
    setEditingEvent(null);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    setLoading(false);
    if (editingEvent) {
      if (editingEvent.kind === 'company') {
        const ce = editingEvent.event;
        setType('company');
        setCompanyType(ce.type as CompanyType);
        setTitle(ce.title);
        setStartDate(ce.startDate || ce.date || fmtDate(TODAY));
        setEndDate(ce.endDate || ce.startDate || ce.date || fmtDate(TODAY));
        setTime(ce.time || '');
        setLocation(ce.location || '');
        setHalf('AM');
        setTargetUserId('');
      } else {
        const pe = editingEvent.event as PersonalEvent;
        setStartDate(pe.startDate);
        setEndDate(pe.endDate);
        setCompanyType('event');
        setTime('');
        setLocation('');
        setTargetUserId('');
        if (pe.type === 'half') {
          setType('half');
          setHalf((pe.half as 'AM' | 'PM') || 'AM');
          setTitle('');
        } else if (pe.type === 'trip') {
          setType('personal-event');
          setTitle(pe.label === '외근/출장' ? '' : pe.label);
        } else {
          setType('leave');
          setTitle('');
        }
      }
    } else {
      const d = createEventInitialDate ?? fmtDate(TODAY);
      setStartDate(d);
      setEndDate(d);
      setType('leave');
      setCompanyType('event');
      setTitle('');
      setHalf('AM');
      setTime('');
      setLocation('');
      setTargetUserId(currentUser?.id ?? '');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const me = users.find(u => u.id === currentUser?.id) ?? null;
  if (!me) return null;

  // 어드민이 개인 일정 등록 시 대상 사용자 (본인 또는 선택)
  const targetUser = isAdmin && type !== 'company'
    ? (users.find(u => u.id === targetUserId) ?? me)
    : me;
  const targetTeam = targetUser.teamId ? getTeam(targetUser.teamId) : null;

  const typeOptions = [
    { id: 'leave' as EventType, label: '연차', desc: '종일 휴가' },
    { id: 'half' as EventType, label: '반차', desc: '오전 / 오후' },
    { id: 'personal-event' as EventType, label: '외근/출장', desc: '업무 외부 일정' },
    ...(isAdmin || (isEditMode && editingEvent?.kind === 'company')
      ? [{ id: 'company' as EventType, label: '회사 일정', desc: '전사 공지' }]
      : []),
  ];

  const companyTypeOptions: { id: CompanyType; label: string }[] = [
    { id: 'event', label: '이벤트' },
    { id: 'meeting', label: '회의' },
    { id: 'holiday', label: '공휴일' },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isEditMode && editingEvent) {
        const id = editingEvent.event.id;
        if (editingEvent.kind === 'company') {
          const updated = await eventsApi.updateCompany(id, {
            title, startDate, endDate, type: companyType,
            ...(companyType !== 'holiday' && time.trim() ? { time: time.trim() } : {}),
            ...(companyType !== 'holiday' && location.trim() ? { location: location.trim() } : {}),
          });
          setCompanyEvents(companyEvents.map(e => e.id === updated.id ? updated : e));
        } else {
          const label = type === 'half'
            ? (half === 'AM' ? '오전 반차' : '오후 반차')
            : type === 'leave' ? '연차'
            : title.trim() || '외근/출장';
          const updated = await eventsApi.updatePersonal(id, {
            type: (type === 'personal-event' ? 'trip' : type) as 'leave' | 'half' | 'trip',
            startDate,
            endDate: type === 'half' ? startDate : endDate,
            label,
            ...(type === 'half' ? { half } : {}),
          });
          setPersonalEvents(personalEvents.map(e => e.id === updated.id ? updated : e));
        }
      } else {
        if (type === 'company') {
          const created = await eventsApi.createCompany({
            title, startDate, endDate, type: companyType,
            ...(companyType !== 'holiday' && time.trim() ? { time: time.trim() } : {}),
            ...(companyType !== 'holiday' && location.trim() ? { location: location.trim() } : {}),
          });
          setCompanyEvents([...companyEvents, created]);
        } else if (type === 'leave' || type === 'half') {
          const label = type === 'half' ? (half === 'AM' ? '오전 반차' : '오후 반차') : '연차';
          const created = await eventsApi.createPersonal({
            userId: targetUser.id, type, startDate,
            endDate: type === 'half' ? startDate : endDate,
            label,
            ...(type === 'half' ? { half } : {}),
          });
          setPersonalEvents([...personalEvents, created]);
        } else if (type === 'personal-event') {
          const created = await eventsApi.createPersonal({
            userId: targetUser.id, type: 'trip', startDate, endDate,
            label: title.trim() || '외근/출장',
          });
          setPersonalEvents([...personalEvents, created]);
        }
      }
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;
    setLoading(true);
    try {
      const id = editingEvent.event.id;
      if (editingEvent.kind === 'company') {
        await eventsApi.removeCompany(id);
        setCompanyEvents(companyEvents.filter(e => e.id !== id));
      } else {
        await eventsApi.removePersonal(id);
        setPersonalEvents(personalEvents.filter(e => e.id !== id));
      }
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  // 타입 변경 시 company 전환이면 targetUserId 초기화
  const handleTypeChange = (t: EventType) => {
    setType(t);
    if (t === 'company') setTargetUserId('');
    else if (!targetUserId) setTargetUserId(me.id);
  };

  return (
    <div className="modal-bg" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h2>{isEditMode ? '일정 수정' : '일정 등록'}</h2>
          <button className="btn btn-icon btn-ghost" onClick={handleClose} disabled={loading}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="modal-bd">
          {/* 대상 사용자 */}
          {!isEditMode && type !== 'company' && (
            isAdmin ? (
              <div className="field">
                <label className="field-label">대상 직원</label>
                <div className={styles.userSelectRow}>
                  {targetUser && <Avatar user={targetUser} />}
                  <select
                    className="select"
                    style={{ flex: 1, height: 36 }}
                    value={targetUserId || me.id}
                    onChange={e => setTargetUserId(e.target.value)}
                    disabled={loading}
                  >
                    <option value={me.id}>{me.name} (본인)</option>
                    {users
                      .filter(u => u.id !== me.id)
                      .sort((a, b) => {
                        const ta = TEAMS.findIndex(t => t.id === a.teamId);
                        const tb = TEAMS.findIndex(t => t.id === b.teamId);
                        return ta !== tb ? ta - tb : a.name.localeCompare(b.name, 'ko');
                      })
                      .map(u => {
                        const t = u.teamId ? getTeam(u.teamId) : null;
                        return (
                          <option key={u.id} value={u.id}>
                            {u.name}{t ? ` · ${t.name}` : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>
            ) : (
              <div className={styles.userRow}>
                <Avatar user={me} />
                <div>
                  <div className={styles.userName}>{me.name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{targetTeam?.name ?? ''} · 본인 일정 등록</div>
                </div>
              </div>
            )
          )}

          {/* 일정 유형 */}
          <div className="field">
            <label className="field-label">일정 유형</label>
            <div className={styles.typeGrid}>
              {typeOptions.map(t => (
                <button
                  key={t.id}
                  className={`${styles.typeCard} ${type === t.id ? styles.typeCardActive : ''}`}
                  onClick={() => handleTypeChange(t.id)}
                  disabled={loading}
                  type="button"
                >
                  <div className={styles.typeCardLabel}>{t.label}</div>
                  <div className={styles.typeCardDesc}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 회사 일정 타입 */}
          {type === 'company' && (
            <div className="field">
              <label className="field-label">회사 일정 분류</label>
              <div className="seg" style={{ width: '100%' }}>
                {companyTypeOptions.map(o => (
                  <button
                    key={o.id}
                    className={`seg-btn ${companyType === o.id ? 'active' : ''}`}
                    onClick={() => setCompanyType(o.id)}
                    style={{ flex: 1 }}
                    disabled={loading}
                    type="button"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 반차 시간 */}
          {type === 'half' && (
            <div className="field">
              <label className="field-label">반차 시간</label>
              <div className="seg" style={{ width: 'fit-content' }}>
                <button className={`seg-btn ${half === 'AM' ? 'active' : ''}`} onClick={() => setHalf('AM')} type="button" disabled={loading}>오전 (09–13)</button>
                <button className={`seg-btn ${half === 'PM' ? 'active' : ''}`} onClick={() => setHalf('PM')} type="button" disabled={loading}>오후 (13–18)</button>
              </div>
            </div>
          )}

          {/* 제목 */}
          {(type === 'company' || type === 'personal-event') && (
            <div className="field">
              <label className="field-label">제목</label>
              <input
                className="input"
                placeholder={type === 'company' ? '일정 제목' : '외근/출장 내용'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {/* 날짜 */}
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">시작일</label>
              <input
                type="date"
                className="input tnum"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                disabled={loading}
              />
            </div>
            {type !== 'half' && (
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label">종료일</label>
                <input
                  type="date"
                  className="input tnum"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* 회사 일정 — 시간/장소 (공휴일 제외) */}
          {type === 'company' && companyType !== 'holiday' && (
            <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label">
                  시간 <span className="muted" style={{ fontWeight: 400 }}>(선택)</span>
                </label>
                <input
                  className="input tnum"
                  placeholder="예: 14:00"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label">
                  장소 <span className="muted" style={{ fontWeight: 400 }}>(선택)</span>
                </label>
                <input
                  className="input"
                  placeholder="예: 4층 회의실"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </div>

        <div className="modal-ft" style={{ justifyContent: 'space-between' }}>
          {isEditMode ? (
            <button
              className="btn btn-ghost"
              style={{ color: 'var(--red)' }}
              onClick={handleDelete}
              disabled={loading}
              type="button"
            >
              <Icon name="trash" size={13} /> 삭제
            </button>
          ) : <span />}
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-ghost" onClick={handleClose} disabled={loading} type="button">취소</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} type="button">
              <Icon name="check" size={14} /> {loading ? '처리 중...' : isEditMode ? '저장' : '등록'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;
