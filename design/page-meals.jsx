// 마더텅 매니저 - 식단표 페이지

function Meals({ isAdmin }) {
  const weekKeys = Object.keys(MEALS).sort();
  const todayWeekKey = fmtDate(startOfWeek(TODAY));
  const initialIdx = Math.max(0, weekKeys.indexOf(todayWeekKey));
  const [idx, setIdx] = useState(initialIdx);
  const key = weekKeys[idx];
  const week = MEALS[key];
  const start = parseDate(key);
  const end = addDays(start, 4);

  return (
    <div className="content">
      <div className="meals-toolbar">
        <div className="row" style={{ gap: 12 }}>
          <div className="meals-week-title tnum">
            {start.getFullYear()}년 {start.getMonth() + 1}월 {start.getDate()}일 ~ {end.getMonth() + 1}월 {end.getDate()}일
          </div>
          <div className="row" style={{ gap: 2 }}>
            <button className="btn btn-icon btn-ghost"
              disabled={idx === 0}
              onClick={() => setIdx(Math.max(0, idx - 1))}>
              <Icon name="chevron-left" />
            </button>
            <button className="btn btn-ghost" onClick={() => setIdx(initialIdx)} style={{ padding: '6px 10px' }}>이번 주</button>
            <button className="btn btn-icon btn-ghost"
              disabled={idx === weekKeys.length - 1}
              onClick={() => setIdx(Math.min(weekKeys.length - 1, idx + 1))}>
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>
        {isAdmin && (
          <button className="btn">
            <Icon name="edit" size={14} /> 이번 주 식단 편집
          </button>
        )}
      </div>

      <div className="meals-grid">
        {week.map(m => {
          const d = parseDate(m.date);
          const isToday = isSameDay(d, TODAY);
          return (
            <div key={m.date} className={`meal-card ${isToday ? 'is-today' : ''} ${m.holiday ? 'is-holiday' : ''}`}>
              <div className="meal-card-head">
                <div>
                  <div className="meal-card-day">{m.day}요일</div>
                  <div className="meal-card-date tnum">{d.getMonth() + 1}.{d.getDate()}</div>
                </div>
                {isToday && <span className="chip chip-event" style={{ fontSize: 10 }}>오늘</span>}
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
                      {m.lunch.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="meals-footnote">
        <Icon name="pin" size={12} /> 4층 구내식당 · 알레르기 정보는 식당 입구 안내판을 참고해 주세요.
      </div>
    </div>
  );
}

Object.assign(window, { Meals });
