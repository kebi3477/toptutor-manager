import React, { useEffect, useState } from 'react';
import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';
import { getTeam } from '../../data';
import { TODAY, fmtDate } from '../../utils/date';
import { useAppContext } from '../../context/AppContext';
import { eventsApi } from '../../api';
import { PersonalEvent } from '../../types';
import styles from './CreateEventModal.module.scss';

type EventType = 'leave' | 'half' | 'personal-event' | 'company';

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
  const [startDate, setStartDate] = useState(fmtDate(TODAY));
  const [endDate, setEndDate] = useState(fmtDate(TODAY));
  const [half, setHalf] = useState<'AM' | 'PM'>('AM');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  const isEditMode = editingEvent !== null;

  function handleClose() {
    setEditingEvent(null);
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    setLoading(false);
    setMemo('');
    if (editingEvent) {
      if (editingEvent.kind === 'company') {
        const ce = editingEvent.event;
        setType('company');
        setTitle(ce.title);
        setStartDate(ce.startDate || ce.date || fmtDate(TODAY));
        setEndDate(ce.endDate || ce.startDate || ce.date || fmtDate(TODAY));
        setHalf('AM');
      } else {
        const pe = editingEvent.event as PersonalEvent;
        setStartDate(pe.startDate);
        setEndDate(pe.endDate);
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
      setTitle('');
      setHalf('AM');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const me = users.find(u => u.id === currentUser?.id) ?? null;
  if (!me) return null;
  const myTeam = me.teamId ? getTeam(me.teamId) : null;

  const typeOptions = [
    { id: 'leave' as EventType, label: '연차', desc: '종일 휴가' },
    { id: 'half' as EventType, label: '반차', desc: '오전 / 오후' },
    { id: 'personal-event' as EventType, label: '외근/출장', desc: '업무 외부 일정' },
    ...(isAdmin || (isEditMode && editingEvent?.kind === 'company')
      ? [{ id: 'company' as EventType, label: '회사 일정', desc: '전사 공지' }]
      : []),
  ];

  const handleSubmit = async () => {
    if (!me) return;
    setLoading(true);
    try {
      if (isEditMode && editingEvent) {
        const id = editingEvent.event.id;
        if (editingEvent.kind === 'company') {
          const updated = await eventsApi.updateCompany(id, { title, startDate, endDate, type: 'event' });
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
          const created = await eventsApi.createCompany({ title, startDate, endDate, type: 'event' });
          setCompanyEvents([...companyEvents, created]);
        } else if (type === 'leave' || type === 'half') {
          const label = type === 'half' ? (half === 'AM' ? '오전 반차' : '오후 반차') : '연차';
          const created = await eventsApi.createPersonal({
            userId: me.id, type, startDate,
            endDate: type === 'half' ? startDate : endDate,
            label,
            ...(type === 'half' ? { half } : {}),
          });
          setPersonalEvents([...personalEvents, created]);
        } else if (type === 'personal-event') {
          const created = await eventsApi.createPersonal({
            userId: me.id, type: 'trip', startDate, endDate,
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
          {!isEditMode && (
            <div className={styles.userRow}>
              <Avatar user={me} />
              <div>
                <div className={styles.userName}>{me.name}</div>
                <div className="muted" style={{ fontSize: 11 }}>{myTeam?.name ?? ''} · 본인 일정 등록</div>
              </div>
            </div>
          )}

          <div className="field">
            <label className="field-label">일정 유형</label>
            <div className={styles.typeGrid}>
              {typeOptions.map(t => (
                <button
                  key={t.id}
                  className={`${styles.typeCard} ${type === t.id ? styles.typeCardActive : ''}`}
                  onClick={() => setType(t.id)}
                  disabled={loading}
                  type="button"
                >
                  <div className={styles.typeCardLabel}>{t.label}</div>
                  <div className={styles.typeCardDesc}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {type === 'half' && (
            <div className="field">
              <label className="field-label">반차 시간</label>
              <div className="seg" style={{ width: 'fit-content' }}>
                <button className={`seg-btn ${half === 'AM' ? 'active' : ''}`} onClick={() => setHalf('AM')} type="button" disabled={loading}>오전 (09–13)</button>
                <button className={`seg-btn ${half === 'PM' ? 'active' : ''}`} onClick={() => setHalf('PM')} type="button" disabled={loading}>오후 (13–18)</button>
              </div>
            </div>
          )}

          {(type === 'company' || type === 'personal-event') && (
            <div className="field">
              <label className="field-label">제목</label>
              <input
                className="input"
                placeholder="일정 제목"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

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

          <div className="field">
            <label className="field-label">
              메모 <span className="muted" style={{ fontWeight: 400 }}>(선택)</span>
            </label>
            <textarea
              className="textarea"
              placeholder="팀에 공유할 내용이 있다면 적어주세요"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              disabled={loading}
            />
          </div>
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
