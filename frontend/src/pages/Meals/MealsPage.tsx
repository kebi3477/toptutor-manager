import React, { useState } from 'react';
import { MEALS } from '../../data';
import { TODAY, fmtDate, parseDate, addDays, startOfWeek, isSameDay } from '../../utils/date';
import Icon from '../../components/Icon/Icon';
import styles from './MealsPage.module.scss';

interface MealsPageProps {
  isAdmin: boolean;
}

function MealsPage({ isAdmin }: MealsPageProps) {
  const weekKeys = Object.keys(MEALS).sort();
  const todayWeekKey = fmtDate(startOfWeek(TODAY));
  const initialIdx = Math.max(0, weekKeys.indexOf(todayWeekKey));
  const [idx, setIdx] = useState(initialIdx);

  const key = weekKeys[idx];
  const week = MEALS[key];
  const start = parseDate(key);
  const end = addDays(start, 4);

  return (
    <div className={styles.content}>
      <div className={styles.toolbar}>
        <div className="row" style={{ gap: 12 }}>
          <div className={`${styles.weekTitle} tnum`}>
            {start.getFullYear()}년 {start.getMonth() + 1}월 {start.getDate()}일 ~ {end.getMonth() + 1}월 {end.getDate()}일
          </div>
          <div className="row" style={{ gap: 2 }}>
            <button
              className="btn btn-icon btn-ghost"
              disabled={idx === 0}
              onClick={() => setIdx(Math.max(0, idx - 1))}
            >
              <Icon name="chevron-left" />
            </button>
            <button className="btn btn-ghost" onClick={() => setIdx(initialIdx)} style={{ padding: '6px 10px' }}>
              이번 주
            </button>
            <button
              className="btn btn-icon btn-ghost"
              disabled={idx === weekKeys.length - 1}
              onClick={() => setIdx(Math.min(weekKeys.length - 1, idx + 1))}
            >
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {week.map(m => {
          const d = parseDate(m.date);
          const isToday = isSameDay(d, TODAY);
          return (
            <div
              key={m.date}
              className={`${styles.card} ${isToday ? styles.cardToday : ''} ${m.holiday ? styles.cardHoliday : ''}`}
            >
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardDay}>{m.day}요일</div>
                  <div className={`${styles.cardDate} tnum`}>{d.getMonth() + 1}.{d.getDate()}</div>
                </div>
                {isToday && <span className="chip chip-event" style={{ fontSize: 10 }}>오늘</span>}
              </div>

              {m.holiday ? (
                <div className={styles.mealEmpty}>
                  <div className={styles.mealEmptyTitle}>{m.holiday}</div>
                  <div className={styles.mealEmptySub}>휴무</div>
                </div>
              ) : (
                <div className={styles.cardBody}>
                  <div className={styles.mealSection}>
                    <div className={styles.sectionLabel}>
                      <span>중식</span>
                      <span className="muted tnum">12:00 — 13:30</span>
                    </div>
                    <ul className={styles.mealList}>
                      {m.lunch?.map((x, i) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className={styles.footnote}>
        <Icon name="pin" size={12} /> 4층 구내식당 · 알레르기 정보는 식당 입구 안내판을 참고해 주세요.
      </div>
    </div>
  );
}

export default MealsPage;
