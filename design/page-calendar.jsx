// 마더텅 매니저 - 캘린더 페이지 (월간 그리드)

function Calendar({ isAdmin, onCreateEvent }) {
  const [cursor, setCursor] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [filter, setFilter] = useState('all'); // all | company | personal
  const [selectedTeam, setSelectedTeam] = useState('all');

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const gridStart = addDays(monthStart, -monthStart.getDay()); // start sunday

  const days = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(gridStart, i));
  }

  const goPrev = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => setCursor(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));

  return (
    <div className="content cal-content">
      <div className="cal-toolbar">
        <div className="row" style={{ gap: 12 }}>
          <div className="cal-month-title tnum">
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
            <button className={`seg-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>전체</button>
            <button className={`seg-btn ${filter === 'company' ? 'active' : ''}`} onClick={() => setFilter('company')}>회사</button>
            <button className={`seg-btn ${filter === 'personal' ? 'active' : ''}`} onClick={() => setFilter('personal')}>개인</button>
          </div>

          <select className="select" style={{ width: 130, height: 32 }}
            value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}>
            <option value="all">모든 팀</option>
            {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <button className="btn btn-primary" onClick={onCreateEvent}>
            <Icon name="plus" size={14} /> 일정 등록
          </button>
        </div>
      </div>

      <div className="cal-legend">
        <span className="row" style={{ gap: 4 }}><span className="dotleg" style={{ background: 'var(--brand)' }} />회사 일정</span>
        <span className="row" style={{ gap: 4 }}><span className="dotleg" style={{ background: '#3D7DD9' }} />연차</span>
        <span className="row" style={{ gap: 4 }}><span className="dotleg" style={{ background: '#8662C7' }} />반차</span>
        <span className="row" style={{ gap: 4 }}><span className="dotleg" style={{ background: '#D9504E' }} />공휴일</span>
      </div>

      <div className="cal-grid card">
        <div className="cal-headrow">
          {KOR_DAYS.map((d, i) => (
            <div key={d} className={`cal-headcell ${i === 0 ? 'sun' : i === 6 ? 'sat' : ''}`}>{d}</div>
          ))}
        </div>
        <div className="cal-body">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = isSameDay(d, TODAY);
            const dow = d.getDay();
            const { company, personal } = eventsOnDate(d);
            const filteredPersonal = selectedTeam === 'all'
              ? personal
              : personal.filter(p => getMember(p.userId).team === selectedTeam);
            let chips = [];
            if (filter !== 'personal') chips = chips.concat(company.map(e => ({ kind: 'company', e })));
            if (filter !== 'company') chips = chips.concat(filteredPersonal.map(e => ({ kind: 'personal', e })));
            const showChips = chips.slice(0, 3);
            const more = chips.length - showChips.length;
            return (
              <div key={i} className={`cal-cell ${!inMonth ? 'out' : ''} ${isToday ? 'today' : ''}`}>
                <div className={`cal-cell-num ${dow === 0 ? 'sun' : dow === 6 ? 'sat' : ''} tnum`}>
                  {isToday ? <span className="cal-today-pill">{d.getDate()}</span> : d.getDate()}
                </div>
                <div className="cal-cell-chips">
                  {showChips.map((c, idx) => <EventChip key={idx} event={c.e} kind={c.kind} />)}
                  {more > 0 && <div className="cal-more">+{more}개 더보기</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Calendar });
