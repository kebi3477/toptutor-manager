// 마더텅 매니저 - 대시보드 페이지

function Dashboard({ isAdmin, onCreateEvent }) {
  const today = TODAY;
  const todayStr = `${today.getFullYear()}년 ${KOR_MONTHS[today.getMonth()]} ${today.getDate()}일`;
  const dayName = KOR_DAYS[today.getDay()] + '요일';

  const todays = todaysLeaves();
  const todayCompany = COMPANY_EVENTS.filter(e => {
    if (e.startDate && e.endDate) return dateInRange(today, e.startDate, e.endDate);
    return e.date === fmtDate(today);
  });

  // 이번 주 회사 일정
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const weekCompany = COMPANY_EVENTS.filter(e => {
    const d = parseDate(e.startDate || e.date);
    return d >= weekStart && d <= weekEnd;
  }).sort((a, b) => parseDate(a.startDate || a.date) - parseDate(b.startDate || b.date));

  // 다가오는 일정 (오늘부터 14일)
  const upcoming = COMPANY_EVENTS
    .filter(e => {
      const d = parseDate(e.startDate || e.date);
      return d >= today && daysBetween(fmtDate(today), e.startDate || e.date) <= 21;
    })
    .sort((a, b) => parseDate(a.startDate || a.date) - parseDate(b.startDate || b.date))
    .slice(0, 5);

  // 이번 주 식단
  const weekMealsKey = fmtDate(weekStart);
  const weekMeals = MEALS[weekMealsKey] || MEALS['2026-04-27'];

  return (
    <div className="content">
      <div className="dash-hero">
        <div>
          <div className="dash-hero-date tnum">{todayStr}</div>
          <div className="dash-hero-day">{dayName}</div>
        </div>
        <div className="dash-hero-stats">
          <div className="dash-stat">
            <div className="dash-stat-num tnum">{todays.length}</div>
            <div className="dash-stat-lbl">오늘 부재 인원</div>
          </div>
          <div className="dash-stat-sep" />
          <div className="dash-stat">
            <div className="dash-stat-num tnum">{todayCompany.length}</div>
            <div className="dash-stat-lbl">오늘 회사 일정</div>
          </div>
          <div className="dash-stat-sep" />
          <div className="dash-stat">
            <div className="dash-stat-num tnum">{MEMBERS.length - todays.length}</div>
            <div className="dash-stat-lbl">정상 출근</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* 오늘 부재 */}
        <div className="card dash-leaves" style={{ gridColumn: 'span 8' }}>
          <div className="card-hd">
            <div>
              <h3 className="card-title">오늘 부재 중인 직원</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>{todays.length}명 · 종료 예정일 기준</div>
            </div>
          </div>
          <div className="card-bd">
            {todays.length === 0 ? (
              <div className="empty">오늘은 모두 출근입니다 🎉</div>
            ) : (
              <div className="leave-grid">
                {todays.map(e => {
                  const m = getMember(e.userId);
                  const t = getTeam(m.team);
                  const returnDate = addDays(parseDate(e.endDate), 1);
                  const isToday = isSameDay(returnDate, addDays(today, 1));
                  return (
                    <div key={e.id} className="leave-card">
                      <div className="leave-card-head">
                        <Avatar member={m} size="lg" />
                        <div style={{ minWidth: 0 }}>
                          <div className="leave-card-name">{m.name}</div>
                          <div className="leave-card-team">{t.name}</div>
                        </div>
                      </div>
                      <div className="leave-card-meta">
                        <span className={`chip ${e.type === 'half' ? 'chip-half' : 'chip-leave'}`}>
                          {e.type === 'half' ? (e.half === 'AM' ? '오전 반차' : '오후 반차') : '연차'}
                        </span>
                        <span className="leave-card-return tnum">
                          {isToday ? '내일 복귀' : `${returnDate.getMonth() + 1}/${returnDate.getDate()} 복귀`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 오늘 일정 */}
        <div className="card" style={{ gridColumn: 'span 4' }}>
          <div className="card-hd">
            <div>
              <h3 className="card-title">오늘 회사 일정</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>{KOR_MONTHS[today.getMonth()]} {today.getDate()}일</div>
            </div>
          </div>
          <div className="card-bd">
            {todayCompany.length === 0 ? (
              <div className="empty">예정된 일정 없음</div>
            ) : (
              <div className="today-events">
                {todayCompany.map(e => (
                  <div key={e.id} className="today-event">
                    <div className="today-event-time tnum">{e.time || '종일'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="today-event-title">{e.title}</div>
                      {e.location && <div className="today-event-loc"><Icon name="pin" size={12} /> {e.location}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 다가오는 일정 */}
        <div className="card" style={{ gridColumn: 'span 5' }}>
          <div className="card-hd">
            <div>
              <h3 className="card-title">다가오는 일정</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>3주 내</div>
            </div>
          </div>
          <div className="card-bd">
            <div className="upcoming-list">
              {upcoming.map(e => {
                const d = parseDate(e.startDate || e.date);
                const diff = Math.round((d - today) / 86400000);
                return (
                  <div key={e.id} className="upcoming-item">
                    <div className="upcoming-date">
                      <div className="upcoming-day tnum">{d.getDate()}</div>
                      <div className="upcoming-month">{KOR_MONTHS[d.getMonth()]}</div>
                    </div>
                    <div className="upcoming-body">
                      <div className="upcoming-title">{e.title}</div>
                      <div className="upcoming-meta">
                        <span className="muted">{KOR_DAYS[d.getDay()]}요일{e.time ? ` · ${e.time}` : ''}{e.location ? ` · ${e.location}` : ''}</span>
                      </div>
                    </div>
                    <div className="upcoming-dday tnum">{diff === 0 ? 'D-DAY' : `D-${diff}`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 이번 주 식단 */}
        <div className="card" style={{ gridColumn: 'span 7' }}>
          <div className="card-hd">
            <div>
              <h3 className="card-title">이번 주 점심</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>{weekStart.getMonth() + 1}/{weekStart.getDate()} ~ {weekEnd.getMonth() + 1}/{weekEnd.getDate()}</div>
            </div>
          </div>
          <div className="card-bd">
            <div className="meal-week">
              {weekMeals.map(m => {
                const d = parseDate(m.date);
                const isToday = isSameDay(d, today);
                return (
                  <div key={m.date} className={`meal-day ${isToday ? 'is-today' : ''}`}>
                    <div className="meal-day-head">
                      <span className="meal-day-name">{m.day}</span>
                      <span className="meal-day-date tnum">{d.getDate()}</span>
                    </div>
                    {m.holiday ? (
                      <div className="meal-day-holiday">{m.holiday}<br />휴무</div>
                    ) : (
                      <ul className="meal-day-menu">
                        {m.lunch.slice(0, 4).map((x, i) => <li key={i}>{x}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
