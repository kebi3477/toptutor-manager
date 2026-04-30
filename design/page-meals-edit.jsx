// 마더텅 매니저 - 식단표 등록 페이지 (관리자)

function MealsEdit() {
  const weekKeys = Object.keys(MEALS).sort();
  const todayWeekKey = fmtDate(startOfWeek(TODAY));
  const initialIdx = Math.max(0, weekKeys.indexOf(todayWeekKey));
  const [idx, setIdx] = useState(initialIdx);
  const key = weekKeys[idx];
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(MEALS[key])));
  const [activeDay, setActiveDay] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(MEALS[weekKeys[idx]])));
    setActiveDay(0);
    setDirty(false);
    setSaved(false);
  }, [idx]);

  const start = parseDate(weekKeys[idx]);
  const end = addDays(start, 4);

  const updateDay = (di, patch) => {
    const next = [...draft];
    next[di] = { ...next[di], ...patch };
    setDraft(next);
    setDirty(true);
    setSaved(false);
  };

  const updateMenu = (di, menu) => {
    updateDay(di, { lunch: menu });
  };

  const toggleHoliday = (di) => {
    const day = draft[di];
    if (day.holiday) updateDay(di, { holiday: null, lunch: ['','','',''] });
    else updateDay(di, { holiday: '휴무', lunch: null });
  };

  const handleSave = () => {
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2400);
  };

  const handleReset = () => {
    setDraft(JSON.parse(JSON.stringify(MEALS[weekKeys[idx]])));
    setDirty(false);
  };

  const day = draft[activeDay];
  const dayDate = parseDate(day.date);

  return (
    <div className="content">
      <div className="meals-toolbar">
        <div className="row" style={{ gap: 12 }}>
          <div className="meals-week-title tnum">
            {start.getFullYear()}년 {start.getMonth() + 1}월 {start.getDate()}일 ~ {end.getMonth() + 1}월 {end.getDate()}일
          </div>
          <div className="row" style={{ gap: 2 }}>
            <button className="btn btn-icon btn-ghost"
              disabled={idx === 0} onClick={() => setIdx(Math.max(0, idx - 1))}>
              <Icon name="chevron-left" />
            </button>
            <button className="btn btn-ghost" onClick={() => setIdx(initialIdx)} style={{ padding: '6px 10px' }}>이번 주</button>
            <button className="btn btn-icon btn-ghost"
              disabled={idx === weekKeys.length - 1} onClick={() => setIdx(Math.min(weekKeys.length - 1, idx + 1))}>
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {saved && (
            <span className="row" style={{ gap: 4, color: 'var(--green)', fontSize: 12.5, fontWeight: 600 }}>
              <Icon name="check" size={14} /> 저장되었습니다
            </span>
          )}
          {dirty && (
            <span className="row" style={{ gap: 4, color: 'var(--text-3)', fontSize: 12, fontStyle: 'italic' }}>
              저장되지 않은 변경사항
            </span>
          )}
          <button className="btn" onClick={handleReset} disabled={!dirty}>되돌리기</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!dirty}>
            <Icon name="check" size={14} /> 저장 및 게시
          </button>
        </div>
      </div>

      <div className="meals-edit-layout">
        {/* 좌측 요일 탭 */}
        <div className="card meals-day-tabs">
          {draft.map((d, i) => {
            const dt = parseDate(d.date);
            const isToday = isSameDay(dt, TODAY);
            return (
              <button key={d.date}
                className={`day-tab ${activeDay === i ? 'active' : ''} ${d.holiday ? 'is-holiday' : ''}`}
                onClick={() => setActiveDay(i)}>
                <div className="day-tab-name">{d.day}요일 {isToday && <span style={{ color: 'var(--brand-strong)', fontSize: 10 }}>오늘</span>}</div>
                <div className="day-tab-date tnum">{dt.getMonth() + 1}.{dt.getDate()}</div>
                {d.holiday ? (
                  <div className="day-tab-status holiday">{d.holiday}</div>
                ) : (
                  <div className="day-tab-status">
                    {d.lunch.filter(x => x).length}개 메뉴
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 우측 편집 영역 */}
        <div className="card meals-editor">
          <div className="meals-editor-head">
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {KOR_MONTHS[dayDate.getMonth()]} {dayDate.getDate()}일 · {day.day}요일
              </div>
              <h2 className="meals-editor-title">중식 메뉴 편집</h2>
            </div>
            <label className="row" style={{ gap: 8, fontSize: 12.5 }}>
              <input type="checkbox" className="cb" checked={!!day.holiday} onChange={() => toggleHoliday(activeDay)} />
              휴무일로 설정
            </label>
          </div>

          {day.holiday ? (
            <div className="holiday-form">
              <div className="field">
                <label className="field-label">휴무 사유</label>
                <input className="input" value={day.holiday}
                  onChange={e => updateDay(activeDay, { holiday: e.target.value })}
                  placeholder="예: 어린이날, 근로자의 날" />
              </div>
              <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                휴무일로 설정하면 직원에게 식단이 표시되지 않습니다.
              </div>
            </div>
          ) : (
            <MenuEditor menu={day.lunch} onChange={(menu) => updateMenu(activeDay, menu)} />
          )}
        </div>
      </div>

      {/* 미리보기 */}
      <div style={{ marginTop: 24 }}>
        <div className="row" style={{ gap: 8, marginBottom: 10, color: 'var(--text-3)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          <Icon name="sparkle" size={13} /> 직원 화면 미리보기
        </div>
        <div className="meals-grid">
          {draft.map(m => {
            const d = parseDate(m.date);
            const isToday = isSameDay(d, TODAY);
            const isActive = m.date === draft[activeDay].date;
            return (
              <div key={m.date}
                className={`meal-card ${isToday ? 'is-today' : ''} ${m.holiday ? 'is-holiday' : ''} ${isActive ? 'is-editing' : ''}`}
                style={{ minHeight: 220 }}>
                <div className="meal-card-head">
                  <div>
                    <div className="meal-card-day">{m.day}요일</div>
                    <div className="meal-card-date tnum">{d.getMonth() + 1}.{d.getDate()}</div>
                  </div>
                  {isActive && <span className="chip chip-event" style={{ fontSize: 10 }}>편집중</span>}
                </div>
                {m.holiday ? (
                  <div className="meal-empty">
                    <div className="meal-empty-title">{m.holiday}</div>
                    <div className="meal-empty-sub">휴무</div>
                  </div>
                ) : (
                  <div className="meal-card-body">
                    <div className="meal-section">
                      <div className="meal-section-label">
                        <span>중식</span>
                        <span className="muted tnum">12:00 — 13:30</span>
                      </div>
                      <ul className="meal-list">
                        {m.lunch.filter(x => x).map((x, i) => <li key={i}>{x}</li>)}
                        {m.lunch.filter(x => x).length === 0 && (
                          <li style={{ color: 'var(--text-4)', fontStyle: 'italic' }}>메뉴를 입력해주세요</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MenuEditor({ menu, onChange }) {
  const items = menu || [];
  const update = (i, val) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };
  const add = () => onChange([...items, '']);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="menu-editor">
      <div className="menu-editor-list">
        {items.map((it, i) => (
          <div key={i} className="menu-row">
            <span className="menu-row-num tnum">{i + 1}</span>
            <input className="input menu-row-input" value={it}
              onChange={e => update(i, e.target.value)}
              placeholder="메뉴 이름 (예: 김치찌개)" />
            <div className="row" style={{ gap: 2 }}>
              <button className="btn btn-icon btn-ghost" disabled={i === 0} onClick={() => move(i, -1)} title="위로">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 15l6-6 6 6"/></svg>
              </button>
              <button className="btn btn-icon btn-ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} title="아래">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <button className="btn btn-icon btn-ghost" onClick={() => remove(i)} title="삭제" style={{ color: 'var(--red)' }}>
                <Icon name="x" size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="empty" style={{ padding: 24 }}>아직 메뉴가 없습니다.</div>
        )}
      </div>
      <button className="btn menu-add-btn" onClick={add}>
        <Icon name="plus" size={14} /> 메뉴 추가
      </button>

      <div className="menu-templates">
        <div className="muted" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 8 }}>빠른 추가</div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {['쌀밥','잡곡밥','김치','단무지','요거트','과일','국','반찬1','반찬2'].map(t => (
            <button key={t} className="quick-chip" onClick={() => onChange([...items, t])}>+ {t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MealsEdit });
