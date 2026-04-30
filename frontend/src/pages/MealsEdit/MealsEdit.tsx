import React, { useState, useEffect, useCallback } from 'react';
import { MealDay } from '../../types';
import { mealsApi } from '../../api';
import { TODAY, KOR_MONTHS, fmtDate, parseDate, addDays, startOfWeek, isSameDay } from '../../utils/date';
import Icon from '../../components/Icon/Icon';
import styles from './MealsEdit.module.scss';

// ── MenuEditor ───────────────────────────────────────────

interface MenuEditorProps {
  menu: string[];
  onChange: (menu: string[]) => void;
}

const QUICK_TEMPLATES = ['쌀밥', '잡곡밥', '김치', '단무지', '요거트', '과일', '국', '반찬1', '반찬2'];

function MenuEditor({ menu, onChange }: MenuEditorProps) {
  const items = menu || [];

  const update = (i: number, val: string) => {
    const next = [...items];
    next[i] = val;
    onChange(next);
  };

  const add = () => onChange([...items, '']);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className={styles.menuEditor}>
      <div className={styles.menuEditorList}>
        {items.map((it, i) => (
          <div key={i} className={styles.menuRow}>
            <span className={`${styles.menuRowNum} tnum`}>{i + 1}</span>
            <input
              className={`input ${styles.menuRowInput}`}
              value={it}
              onChange={e => update(i, e.target.value)}
              placeholder="메뉴 이름 (예: 김치찌개)"
            />
            <div className="row" style={{ gap: 2 }}>
              <button className="btn btn-icon btn-ghost" disabled={i === 0} onClick={() => move(i, -1)} title="위로">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 15l6-6 6 6" />
                </svg>
              </button>
              <button className="btn btn-icon btn-ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} title="아래로">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
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

      <button className={`btn ${styles.menuAddBtn}`} onClick={add}>
        <Icon name="plus" size={14} /> 메뉴 추가
      </button>

      <div className={styles.menuTemplates}>
        <div className="muted" style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 8 }}>빠른 추가</div>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {QUICK_TEMPLATES.map(t => (
            <button key={t} className={styles.quickChip} onClick={() => onChange([...items, t])}>
              + {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MealsEdit ────────────────────────────────────────────

function MealsEdit() {
  const [weekKeys, setWeekKeys] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [draft, setDraft] = useState<MealDay[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [error, setError] = useState('');

  const todayWeekKey = fmtDate(startOfWeek(TODAY));

  // 주 목록 로드
  useEffect(() => {
    setLoadingWeeks(true);
    mealsApi.getWeeks()
      .then((keys) => {
        setWeekKeys(keys);
        const i = Math.max(0, keys.indexOf(todayWeekKey));
        setIdx(i);
      })
      .catch(() => setError('데이터를 불러오지 못했습니다.'))
      .finally(() => setLoadingWeeks(false));
  }, [todayWeekKey]);

  // 주 데이터 로드 → draft 초기화
  const loadWeek = useCallback((weekStart: string) => {
    setLoadingWeek(true);
    setError('');
    setDirty(false);
    setSaved(false);
    mealsApi.getWeek(weekStart)
      .then((days) => {
        setDraft(JSON.parse(JSON.stringify(days)));
        setActiveDay(0);
      })
      .catch(() => setError('식단 데이터를 불러오지 못했습니다.'))
      .finally(() => setLoadingWeek(false));
  }, []);

  useEffect(() => {
    if (weekKeys[idx]) loadWeek(weekKeys[idx]);
  }, [idx, weekKeys, loadWeek]);

  const todayInitialIdx = weekKeys.length > 0
    ? Math.max(0, weekKeys.indexOf(todayWeekKey))
    : 0;

  const start = weekKeys[idx] ? parseDate(weekKeys[idx]) : new Date();
  const end = addDays(start, 4);
  const day = draft[activeDay];

  const updateDay = (di: number, patch: Partial<MealDay>) => {
    const next = [...draft];
    next[di] = { ...next[di], ...patch };
    setDraft(next);
    setDirty(true);
    setSaved(false);
  };

  const toggleHoliday = (di: number) => {
    const d = draft[di];
    if (d.holiday) updateDay(di, { holiday: null, lunch: [] });
    else updateDay(di, { holiday: '휴무', lunch: null });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await mealsApi.saveWeek(draft);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch {
      setError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (weekKeys[idx]) loadWeek(weekKeys[idx]);
  };

  if (loadingWeeks) {
    return <div className={styles.content}><div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>불러오는 중...</div></div>;
  }

  return (
    <div className={styles.content}>
      {/* 툴바 */}
      <div className={styles.toolbar}>
        <div className="row" style={{ gap: 12 }}>
          <div className={`${styles.weekTitle} tnum`}>
            {start.getFullYear()}년 {start.getMonth() + 1}월 {start.getDate()}일 ~ {end.getMonth() + 1}월 {end.getDate()}일
          </div>
          <div className="row" style={{ gap: 2 }}>
            <button className="btn btn-icon btn-ghost" disabled={idx === 0} onClick={() => setIdx(Math.max(0, idx - 1))}>
              <Icon name="chevron-left" />
            </button>
            <button className="btn btn-ghost" onClick={() => setIdx(todayInitialIdx)} style={{ padding: '6px 10px' }}>
              이번 주
            </button>
            <button className="btn btn-icon btn-ghost" disabled={idx === weekKeys.length - 1} onClick={() => setIdx(Math.min(weekKeys.length - 1, idx + 1))}>
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {error && <span style={{ fontSize: 12, color: 'var(--red)' }}>{error}</span>}
          {saved && (
            <span className="row" style={{ gap: 4, color: 'var(--green)', fontSize: 12.5, fontWeight: 600 }}>
              <Icon name="check" size={14} /> 저장되었습니다
            </span>
          )}
          {dirty && !saved && (
            <span className={styles.unsaved}>저장되지 않은 변경사항</span>
          )}
          <button className="btn" onClick={handleReset} disabled={!dirty || saving}>되돌리기</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={!dirty || saving}>
            {saving
              ? <><span style={{ width: 13, height: 13, border: '2px solid rgba(31,29,23,.2)', borderTopColor: 'var(--text-on-brand)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} /> 저장 중...</>
              : <><Icon name="check" size={14} /> 저장 및 게시</>
            }
          </button>
        </div>
      </div>

      {loadingWeek || !day ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-3)' }}>불러오는 중...</div>
      ) : (
        <>
          {/* 편집 레이아웃 */}
          <div className={styles.editLayout}>
            {/* 좌측 요일 탭 */}
            <div className={`card ${styles.dayTabs}`}>
              {draft.map((d, i) => {
                const dt = parseDate(d.date);
                const isToday = isSameDay(dt, TODAY);
                return (
                  <button
                    key={d.date}
                    className={`${styles.dayTab} ${activeDay === i ? styles.dayTabActive : ''} ${d.holiday ? styles.dayTabHoliday : ''}`}
                    onClick={() => setActiveDay(i)}
                  >
                    <div className={styles.dayTabName}>
                      {d.day}요일
                      {isToday && <span className={styles.todayMark}>오늘</span>}
                    </div>
                    <div className={`${styles.dayTabDate} tnum`}>{dt.getMonth() + 1}.{dt.getDate()}</div>
                    {d.holiday ? (
                      <div className={`${styles.dayTabStatus} ${styles.dayTabStatusHoliday}`}>{d.holiday}</div>
                    ) : (
                      <div className={styles.dayTabStatus}>
                        {(d.lunch || []).filter(x => x).length}개 메뉴
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 우측 편집 영역 */}
            <div className={`card ${styles.editor}`}>
              <div className={styles.editorHead}>
                <div>
                  <div className={styles.editorDateLabel}>
                    {KOR_MONTHS[parseDate(day.date).getMonth()]} {parseDate(day.date).getDate()}일 · {day.day}요일
                  </div>
                  <h2 className={styles.editorTitle}>중식 메뉴 편집</h2>
                </div>
                <label className="row" style={{ gap: 8, fontSize: 12.5, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="cb"
                    checked={!!day.holiday}
                    onChange={() => toggleHoliday(activeDay)}
                  />
                  휴무일로 설정
                </label>
              </div>

              {day.holiday ? (
                <div className={styles.holidayForm}>
                  <div className="field">
                    <label className="field-label">휴무 사유</label>
                    <input
                      className="input"
                      value={day.holiday}
                      onChange={e => updateDay(activeDay, { holiday: e.target.value })}
                      placeholder="예: 어린이날, 근로자의 날"
                    />
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
                    휴무일로 설정하면 직원에게 식단이 표시되지 않습니다.
                  </div>
                </div>
              ) : (
                <MenuEditor
                  menu={day.lunch || []}
                  onChange={menu => updateDay(activeDay, { lunch: menu })}
                />
              )}
            </div>
          </div>

          {/* 직원 화면 미리보기 */}
          <div style={{ marginTop: 24 }}>
            <div className={styles.previewLabel}>
              <Icon name="sparkle" size={13} /> 직원 화면 미리보기
            </div>
            <div className={styles.previewGrid}>
              {draft.map(m => {
                const d = parseDate(m.date);
                const isToday = isSameDay(d, TODAY);
                const isActive = m.date === draft[activeDay]?.date;
                return (
                  <div
                    key={m.date}
                    className={`${styles.previewCard} ${isToday ? styles.previewCardToday : ''} ${m.holiday ? styles.previewCardHoliday : ''} ${isActive ? styles.previewCardEditing : ''}`}
                  >
                    <div className={styles.previewCardHead}>
                      <div>
                        <div className={styles.previewCardDay}>{m.day}요일</div>
                        <div className={`${styles.previewCardDate} tnum`}>{d.getMonth() + 1}.{d.getDate()}</div>
                      </div>
                      {isActive && <span className="chip chip-event" style={{ fontSize: 10 }}>편집중</span>}
                    </div>
                    {m.holiday ? (
                      <div className={styles.previewEmpty}>
                        <div className={styles.previewEmptyTitle}>{m.holiday}</div>
                        <div className={styles.previewEmptySub}>휴무</div>
                      </div>
                    ) : (
                      <div className={styles.previewCardBody}>
                        <div className={styles.previewSectionLabel}>
                          <span>중식</span>
                          <span className="muted tnum">12:00 — 13:30</span>
                        </div>
                        <ul className={styles.previewMealList}>
                          {(m.lunch || []).filter(x => x).map((x, i) => <li key={i}>{x}</li>)}
                          {(m.lunch || []).filter(x => x).length === 0 && (
                            <li className={styles.previewMealEmpty}>메뉴를 입력해주세요</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MealsEdit;
