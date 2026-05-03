import React, { useEffect, useState } from 'react';
import Avatar from '../Avatar/Avatar';
import Icon from '../Icon/Icon';
import { getTeam } from '../../data';
import { TODAY, fmtDate } from '../../utils/date';
import { useAppContext } from '../../context/AppContext';
import { eventsApi } from '../../api';
import styles from './CreateEventModal.module.scss';

type EventType = 'leave' | 'half' | 'personal-event' | 'company';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
}

function CreateEventModal({ open, onClose, isAdmin }: CreateEventModalProps) {
  const { members, companyEvents, personalEvents, setPersonalEvents, setCompanyEvents, createEventInitialDate } = useAppContext();
  const [type, setType] = useState<EventType>('leave');
  const [startDate, setStartDate] = useState(fmtDate(TODAY));
  const [endDate, setEndDate] = useState(fmtDate(TODAY));
  const [half, setHalf] = useState<'AM' | 'PM'>('AM');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (!open) return;
    const d = createEventInitialDate ?? fmtDate(TODAY);
    setStartDate(d);
    setEndDate(d);
    setType('leave');
    setTitle('');
    setMemo('');
    setHalf('AM');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const me = members[0];
  if (!me) return null;
  const myTeam = getTeam(me.teamId);

  const typeOptions = [
    { id: 'leave' as EventType, label: '연차', desc: '종일 휴가' },
    { id: 'half' as EventType, label: '반차', desc: '오전 / 오후' },
    { id: 'personal-event' as EventType, label: '외근/출장', desc: '업무 외부 일정' },
    ...(isAdmin ? [{ id: 'company' as EventType, label: '회사 일정', desc: '전사 공지' }] : []),
  ];

  const handleSubmit = async () => {
    if (!me) return;
    if (type === 'company') {
      const created = await eventsApi.createCompany({ title, startDate, endDate, type: 'event' });
      setCompanyEvents([...companyEvents, created]);
    } else if (type === 'leave' || type === 'half') {
      const label = type === 'half' ? (half === 'AM' ? '오전 반차' : '오후 반차') : '연차';
      const payload: Parameters<typeof eventsApi.createPersonal>[0] = {
        userId: me.id,
        type,
        startDate,
        endDate: type === 'half' ? startDate : endDate,
        label,
        ...(type === 'half' ? { half } : {}),
      };
      const created = await eventsApi.createPersonal(payload);
      setPersonalEvents([...personalEvents, created]);
    } else if (type === 'personal-event') {
      const created = await eventsApi.createPersonal({
        userId: me.id,
        type: 'trip',
        startDate,
        endDate,
        label: title.trim() || '외근/출장',
      });
      setPersonalEvents([...personalEvents, created]);
    }
    onClose();
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h2>일정 등록</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="modal-bd">
          <div className={styles.userRow}>
            <Avatar member={me} />
            <div>
              <div className={styles.userName}>{me.name}</div>
              <div className="muted" style={{ fontSize: 11 }}>{myTeam.name} · 본인 일정 등록</div>
            </div>
          </div>

          <div className="field">
            <label className="field-label">일정 유형</label>
            <div className={styles.typeGrid}>
              {typeOptions.map(t => (
                <button
                  key={t.id}
                  className={`${styles.typeCard} ${type === t.id ? styles.typeCardActive : ''}`}
                  onClick={() => setType(t.id)}
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
                <button className={`seg-btn ${half === 'AM' ? 'active' : ''}`} onClick={() => setHalf('AM')}>오전 (09–13)</button>
                <button className={`seg-btn ${half === 'PM' ? 'active' : ''}`} onClick={() => setHalf('PM')}>오후 (13–18)</button>
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
            />
          </div>
        </div>

        <div className="modal-ft">
          <button className="btn btn-ghost" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            <Icon name="check" size={14} /> 등록
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateEventModal;
