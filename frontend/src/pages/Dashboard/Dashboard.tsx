import React, { useState, useEffect } from 'react';
import { COMPANY_EVENTS, MEMBERS, getMember, getTeam } from '../../data';
import { MealDay } from '../../types';
import { mealsApi } from '../../api';
import { TODAY, KOR_MONTHS, KOR_DAYS, fmtDate, parseDate, addDays, startOfWeek, isSameDay, dateInRange, daysBetween, todaysLeaves } from '../../utils/date';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon/Icon';
import styles from './Dashboard.module.scss';

interface DashboardProps {
  isAdmin: boolean;
  onCreateEvent: () => void;
}

function Dashboard({ isAdmin, onCreateEvent }: DashboardProps) {
  const today = TODAY;
  const todayStr = `${today.getFullYear()}년 ${KOR_MONTHS[today.getMonth()]} ${today.getDate()}일`;
  const dayName = KOR_DAYS[today.getDay()] + '요일';

  const todays = todaysLeaves();
  const todayCompany = COMPANY_EVENTS.filter(e => {
    if (e.startDate && e.endDate) return dateInRange(today, e.startDate, e.endDate);
    return e.date === fmtDate(today);
  });

  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const weekMealsKey = fmtDate(weekStart);

  const upcoming = COMPANY_EVENTS
    .filter(e => {
      const d = parseDate(e.startDate || e.date!);
      return d >= today && daysBetween(fmtDate(today), e.startDate || e.date!) <= 21;
    })
    .sort((a, b) => parseDate(a.startDate || a.date!).getTime() - parseDate(b.startDate || b.date!).getTime())
    .slice(0, 5);

  const [weekMeals, setWeekMeals] = useState<MealDay[]>([]);
  const [mealsLoading, setMealsLoading] = useState(true);

  useEffect(() => {
    setMealsLoading(true);
    mealsApi.getWeek(weekMealsKey)
      .then(setWeekMeals)
      .catch(() => {})
      .finally(() => setMealsLoading(false));
  }, [weekMealsKey]);

  return (
    <div className={styles.content}>
      <div className={styles.hero}>
        <div>
          <div className={`${styles.heroDate} tnum`}>{todayStr}</div>
          <div className={styles.heroDay}>{dayName}</div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <div className={`${styles.statNum} tnum`}>{todays.length}</div>
            <div className={styles.statLbl}>오늘 부재 인원</div>
          </div>
          <div className={styles.statSep} />
          <div className={styles.stat}>
            <div className={`${styles.statNum} tnum`}>{todayCompany.length}</div>
            <div className={styles.statLbl}>오늘 회사 일정</div>
          </div>
          <div className={styles.statSep} />
          <div className={styles.stat}>
            <div className={`${styles.statNum} tnum`}>{MEMBERS.length - todays.length}</div>
            <div className={styles.statLbl}>정상 출근</div>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* 오늘 부재 */}
        <div className={`card ${styles.col8}`}>
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
              <div className={styles.leaveGrid}>
                {todays.map(e => {
                  const m = getMember(e.userId);
                  const t = getTeam(m.team);
                  const returnDate = addDays(parseDate(e.endDate), 1);
                  const isNextDay = isSameDay(returnDate, addDays(today, 1));
                  return (
                    <div key={e.id} className={styles.leaveCard}>
                      <div className={styles.leaveCardHead}>
                        <Avatar member={m} size="lg" />
                        <div style={{ minWidth: 0 }}>
                          <div className={styles.leaveCardName}>{m.name}</div>
                          <div className={styles.leaveCardTeam}>{t.name}</div>
                        </div>
                      </div>
                      <div className={styles.leaveCardMeta}>
                        <span className={`chip ${e.type === 'half' ? 'chip-half' : 'chip-leave'}`}>
                          {e.type === 'half' ? (e.half === 'AM' ? '오전 반차' : '오후 반차') : '연차'}
                        </span>
                        <span className={`${styles.leaveReturn} tnum`}>
                          {isNextDay ? '내일 복귀' : `${returnDate.getMonth() + 1}/${returnDate.getDate()} 복귀`}
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
        <div className={`card ${styles.col4}`}>
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
              <div className={styles.todayEvents}>
                {todayCompany.map(e => (
                  <div key={e.id} className={styles.todayEvent}>
                    <div className={`${styles.todayEventTime} tnum`}>{e.time || '종일'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className={styles.todayEventTitle}>{e.title}</div>
                      {e.location && (
                        <div className={styles.todayEventLoc}>
                          <Icon name="pin" size={12} /> {e.location}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 다가오는 일정 */}
        <div className={`card ${styles.col5}`}>
          <div className="card-hd">
            <div>
              <h3 className="card-title">다가오는 일정</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>3주 내</div>
            </div>
          </div>
          <div className="card-bd">
            <div className={styles.upcomingList}>
              {upcoming.map(e => {
                const d = parseDate(e.startDate || e.date!);
                const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
                return (
                  <div key={e.id} className={styles.upcomingItem}>
                    <div className={styles.upcomingDate}>
                      <div className={`${styles.upcomingDay} tnum`}>{d.getDate()}</div>
                      <div className={styles.upcomingMonth}>{KOR_MONTHS[d.getMonth()]}</div>
                    </div>
                    <div className={styles.upcomingBody}>
                      <div className={styles.upcomingTitle}>{e.title}</div>
                      <div className={styles.upcomingMeta}>
                        <span className="muted">
                          {KOR_DAYS[d.getDay()]}요일{e.time ? ` · ${e.time}` : ''}{e.location ? ` · ${e.location}` : ''}
                        </span>
                      </div>
                    </div>
                    <div className={`${styles.dday} tnum`}>{diff === 0 ? 'D-DAY' : `D-${diff}`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 이번 주 식단 */}
        <div className={`card ${styles.col7}`}>
          <div className="card-hd">
            <div>
              <h3 className="card-title">이번 주 점심</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>
                {weekStart.getMonth() + 1}/{weekStart.getDate()} ~ {weekEnd.getMonth() + 1}/{weekEnd.getDate()}
              </div>
            </div>
          </div>
          <div className="card-bd">
            {mealsLoading ? (
              <div className="empty">불러오는 중...</div>
            ) : weekMeals.length === 0 ? (
              <div className="empty">이번 주 식단 정보가 없습니다.</div>
            ) : (
            <div className={styles.mealWeek}>
              {weekMeals.map(m => {
                const d = parseDate(m.date);
                const isToday = isSameDay(d, today);
                return (
                  <div key={m.date} className={`${styles.mealDay} ${isToday ? styles.mealDayToday : ''}`}>
                    <div className={styles.mealDayHead}>
                      <span className={styles.mealDayName}>{m.day}</span>
                      <span className={`${styles.mealDayDate} tnum`}>{d.getDate()}</span>
                    </div>
                    {m.holiday ? (
                      <div className={styles.mealDayHoliday}>{m.holiday}<br />휴무</div>
                    ) : (
                      <ul className={styles.mealDayMenu}>
                        {m.lunch?.slice(0, 4).map((x, i) => <li key={i}>{x}</li>)}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
