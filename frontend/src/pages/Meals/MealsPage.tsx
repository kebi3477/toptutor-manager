import React, { useState, useEffect, useCallback } from 'react';
import { MealDay } from '../../types';
import { mealsApi } from '../../api';
import { TODAY, fmtDate, parseDate, addDays, startOfWeek, isSameDay } from '../../utils/date';
import Icon from '../../components/Icon/Icon';
import styles from './MealsPage.module.scss';

interface MealsPageProps {
  isAdmin: boolean;
}

function MealsPage({ isAdmin }: MealsPageProps) {
  const [weekKeys, setWeekKeys] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [week, setWeek] = useState<MealDay[]>([]);
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [error, setError] = useState('');

  // 주 목록 로드
  useEffect(() => {
    setLoadingWeeks(true);
    mealsApi.getWeeks()
      .then((keys) => {
        setWeekKeys(keys);
        const todayKey = fmtDate(startOfWeek(TODAY));
        const i = Math.max(0, keys.indexOf(todayKey));
        setIdx(i);
      })
      .catch(() => setError('식단 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoadingWeeks(false));
  }, []);

  // 선택된 주 데이터 로드
  const loadWeek = useCallback((weekStart: string) => {
    setLoadingWeek(true);
    setError('');
    mealsApi.getWeek(weekStart)
      .then(setWeek)
      .catch(() => setError('식단 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoadingWeek(false));
  }, []);

  useEffect(() => {
    if (weekKeys[idx]) loadWeek(weekKeys[idx]);
  }, [idx, weekKeys, loadWeek]);

  const todayInitialIdx = weekKeys.length > 0
    ? Math.max(0, weekKeys.indexOf(fmtDate(startOfWeek(TODAY))))
    : 0;

  const key = weekKeys[idx];
  const start = key ? parseDate(key) : new Date();
  const end = addDays(start, 4);

  if (loadingWeeks) {
    return (
      <div className={styles.content}>
        <div className={styles.loadingState}>식단 데이터를 불러오는 중...</div>
      </div>
    );
  }

  if (error && weekKeys.length === 0) {
    return (
      <div className={styles.content}>
        <div className={styles.errorState}>
          <Icon name="x" size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

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
            <button className="btn btn-ghost" onClick={() => setIdx(todayInitialIdx)} style={{ padding: '6px 10px' }}>
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

      {loadingWeek ? (
        <div className={styles.loadingState}>불러오는 중...</div>
      ) : (
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
                        <span className="muted tnum">12:00 — 12:30</span>
                      </div>
                      <ul className={styles.mealList}>
                        {(m.lunch || []).map((x, i) => <li key={i}>{x}</li>)}
                        {(m.lunch || []).length === 0 && (
                          <li className={styles.mealEmpty} style={{ border: 0 }}>
                            <span style={{ fontStyle: 'italic', color: 'var(--text-4)' }}>메뉴 없음</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.footnote}>
        <Icon name="pin" size={12} /> 4층 구내식당 · 알레르기 정보는 식당 입구 안내판을 참고해 주세요.
      </div>
    </div>
  );
}

export default MealsPage;
