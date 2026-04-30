// 마더텅 매니저 - 일정 등록 모달

function CreateEventModal({ open, onClose, isAdmin }) {
  const [type, setType] = useState('leave'); // leave | half | personal-event | company
  const [startDate, setStartDate] = useState(fmtDate(TODAY));
  const [endDate, setEndDate] = useState(fmtDate(TODAY));
  const [half, setHalf] = useState('AM');
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');

  if (!open) return null;

  const me = isAdmin ? ADMIN : ME;
  const myTeam = getTeam(me.team);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h2>일정 등록</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-bd">
          <div className="row" style={{ gap: 8, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 10 }}>
            <Avatar member={me} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{me.name}</div>
              <div className="muted" style={{ fontSize: 11 }}>{myTeam.name} · 본인 일정 등록</div>
            </div>
          </div>

          <div className="field">
            <label className="field-label">일정 유형</label>
            <div className="type-grid">
              {[
                { id: 'leave', label: '연차', desc: '종일 휴가' },
                { id: 'half', label: '반차', desc: '오전 / 오후' },
                { id: 'personal-event', label: '외근/출장', desc: '업무 외부 일정' },
                ...(isAdmin ? [{ id: 'company', label: '회사 일정', desc: '전사 공지' }] : []),
              ].map(t => (
                <button key={t.id}
                  className={`type-card ${type === t.id ? 'active' : ''}`}
                  onClick={() => setType(t.id)}>
                  <div className="type-card-label">{t.label}</div>
                  <div className="type-card-desc">{t.desc}</div>
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
              <input className="input" placeholder="일정 제목" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
          )}

          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ flex: 1 }}>
              <label className="field-label">시작일</label>
              <input type="date" className="input tnum" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            {type !== 'half' && (
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label">종료일</label>
                <input type="date" className="input tnum" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            )}
          </div>

          <div className="field">
            <label className="field-label">메모 <span className="muted" style={{ fontWeight: 400 }}>(선택)</span></label>
            <textarea className="textarea" placeholder="팀에 공유할 내용이 있다면 적어주세요" value={memo} onChange={e => setMemo(e.target.value)} />
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-ghost" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={onClose}>
            <Icon name="check" size={14} /> 등록
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CreateEventModal });
