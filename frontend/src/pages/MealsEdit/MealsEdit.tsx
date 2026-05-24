import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MealDay } from '../../types';
import { mealsApi } from '../../api';
import { TODAY, KOR_MONTHS, KOR_DAYS, fmtDate, parseDate, addDays, startOfWeek, isSameDay } from '../../utils/date';
import Icon from '../../components/Icon/Icon';
import styles from './MealsEdit.module.scss';

// ── 유틸 ─────────────────────────────────────────────────

const TODAY_WEEK = fmtDate(startOfWeek(TODAY));

function generateWeeks(center: string, before = 8, after = 16): string[] {
  const base = parseDate(center);
  return Array.from({ length: before + after + 1 }, (_, i) =>
    fmtDate(addDays(base, (i - before) * 7)),
  );
}

const DAY_NAMES = ['월', '화', '수', '목', '금'];

function buildEmptyWeek(weekStart: string): MealDay[] {
  const base = parseDate(weekStart);
  return Array.from({ length: 5 }, (_, i) => {
    const d = addDays(base, i);
    return { date: fmtDate(d), day: DAY_NAMES[i], weekStart, lunch: [], holiday: null };
  });
}

// ── MenuEditor ───────────────────────────────────────────

interface MenuEditorProps {
  menu: string[];
  onChange: (menu: string[]) => void;
}

const QUICK_TEMPLATES = ['쌀밥', '잡곡밥', '김치', '단무지', '요거트', '과일', '국', '반찬1', '반찬2'];

function MenuEditor({ menu, onChange }: MenuEditorProps) {
  const items = menu || [];
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const focusIdx = useRef<number | null>(null);

  // 항목 추가 후 해당 인덱스로 포커스
  useEffect(() => {
    if (focusIdx.current !== null) {
      inputRefs.current[focusIdx.current]?.focus();
      focusIdx.current = null;
    }
  });

  const update = (i: number, val: string) => { const n = [...items]; n[i] = val; onChange(n); };

  const addAt = (afterIdx: number) => {
    const n = [...items];
    n.splice(afterIdx + 1, 0, '');
    focusIdx.current = afterIdx + 1;
    onChange(n);
  };

  const add = () => {
    focusIdx.current = items.length;
    onChange([...items, '']);
  };

  const remove = (i: number) => {
    if (items.length > 1) focusIdx.current = Math.max(0, i - 1);
    onChange(items.filter((_, idx) => idx !== i));
  };

  const move = (i: number, dir: number) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAt(i);
    } else if (e.key === 'Backspace' && items[i] === '' && items.length > 1) {
      e.preventDefault();
      remove(i);
    } else if (e.key === 'ArrowUp' && i > 0) {
      e.preventDefault();
      inputRefs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowDown' && i < items.length - 1) {
      e.preventDefault();
      inputRefs.current[i + 1]?.focus();
    }
  };

  return (
    <div className={styles.menuEditor}>
      <div className={styles.menuEditorList}>
        {items.map((it, i) => (
          <div key={i} className={styles.menuRow}>
            <span className={`${styles.menuRowNum} tnum`}>{i + 1}</span>
            <input
              ref={el => { inputRefs.current[i] = el; }}
              className={`input ${styles.menuRowInput}`}
              value={it}
              onChange={e => update(i, e.target.value)}
              onKeyDown={e => handleKeyDown(e, i)}
              placeholder="메뉴 이름 (예: 김치찌개)"
            />
            <div className="row" style={{ gap: 2 }}>
              <button className="btn btn-icon btn-ghost" disabled={i === 0} onClick={() => move(i, -1)} title="위로">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 15l6-6 6 6" /></svg>
              </button>
              <button className="btn btn-icon btn-ghost" disabled={i === items.length - 1} onClick={() => move(i, 1)} title="아래로">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
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
            <button key={t} className={styles.quickChip} onClick={() => onChange([...items, t])}>+ {t}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MealsEdit ────────────────────────────────────────────

function MealsEdit() {
  // DB에 존재하는 주 목록 (표시용)
  const [existingWeeks, setExistingWeeks] = useState<Set<string>>(new Set());

  // 고정 탐색 범위: TODAY_WEEK 기준 8주 전 ~ 16주 후
  const allWeeks = useMemo(() => generateWeeks(TODAY_WEEK, 8, 16), []);
  const todayIdx = useMemo(() => allWeeks.indexOf(TODAY_WEEK), [allWeeks]);

  const [idx, setIdx] = useState(todayIdx);
  const [draft, setDraft] = useState<MealDay[]>([]);
  const [activeDay, setActiveDay] = useState(0);
  const [isNew, setIsNew] = useState(false);   // 현재 주가 DB에 없는 신규 여부
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 존재하는 주 목록 초기 로드
  useEffect(() => {
    mealsApi.getWeeks().then(keys => setExistingWeeks(new Set(keys)));
  }, []);

  // 주 이동 시 데이터 로드 or 빈 템플릿
  const loadWeek = useCallback((weekStart: string) => {
    setDirty(false);
    setSaved(false);
    setSaveError('');
    setActiveDay(0);

    if (existingWeeks.has(weekStart)) {
      setLoadingWeek(true);
      mealsApi.getWeek(weekStart)
        .then(days => {
          // API 응답에 weekStart 보강
          setDraft(days.map(d => ({ ...d, weekStart })));
          setIsNew(false);
        })
        .catch(() => {})
        .finally(() => setLoadingWeek(false));
    } else {
      setDraft(buildEmptyWeek(weekStart));
      setIsNew(true);
    }
  }, [existingWeeks]);

  useEffect(() => {
    if (allWeeks[idx]) loadWeek(allWeeks[idx]);
  }, [idx, allWeeks, loadWeek]);

  const currentWeekStart = allWeeks[idx];
  const start = parseDate(currentWeekStart);
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
    if (d.holiday !== null) updateDay(di, { holiday: null, lunch: [] });
    else updateDay(di, { holiday: '휴무', lunch: null });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await mealsApi.saveWeek(draft);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
      // 신규 저장 시 existingWeeks 갱신
      if (isNew) {
        setExistingWeeks(prev => new Set(Array.from(prev).concat(currentWeekStart)));
        setIsNew(false);
      }
    } catch {
      setSaveError('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => loadWeek(currentWeekStart);

  return (
    <div className={styles.content}>
      {/* 툴바 */}
      <div className={styles.toolbar}>
        <div className="row" style={{ gap: 12 }}>
          <div className={`${styles.weekTitle} tnum`}>
            {start.getFullYear()}년 {start.getMonth() + 1}월 {start.getDate()}일 ~ {end.getMonth() + 1}월 {end.getDate()}일
          </div>
          {isNew && (
            <span className="chip chip-event" style={{ fontSize: 11, alignSelf: 'center' }}>새 식단</span>
          )}
          <div className="row" style={{ gap: 2 }}>
            <button className="btn btn-icon btn-ghost" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>
              <Icon name="chevron-left" />
            </button>
            <button className="btn btn-ghost" onClick={() => setIdx(todayIdx)} style={{ padding: '6px 10px' }}>
              이번 주
            </button>
            <button className="btn btn-icon btn-ghost" disabled={idx === allWeeks.length - 1} onClick={() => setIdx(i => i + 1)}>
              <Icon name="chevron-right" />
            </button>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {saveError && <span style={{ fontSize: 12, color: 'var(--red)' }}>{saveError}</span>}
          {saved && (
            <span className="row" style={{ gap: 4, color: 'var(--green)', fontSize: 12.5, fontWeight: 600 }}>
              <Icon name="check" size={14} /> {isNew ? '등록되었습니다' : '저장되었습니다'}
            </span>
          )}
          {dirty && !saved && <span className={styles.unsaved}>저장되지 않은 변경사항</span>}
          <button className="btn" onClick={handleReset} disabled={!dirty || saving}>되돌리기</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={(!dirty && !isNew) || saving}>
            {saving
              ? <><Spinner /> 저장 중...</>
              : <><Icon name="check" size={14} /> {isNew ? '등록 및 게시' : '저장 및 게시'}</>
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
                    className={`${styles.dayTab} ${activeDay === i ? styles.dayTabActive : ''} ${d.holiday !== null ? styles.dayTabHoliday : ''}`}
                    onClick={() => setActiveDay(i)}
                  >
                    <div className={styles.dayTabName}>
                      {d.day}요일
                      {isToday && <span className={styles.todayMark}>오늘</span>}
                    </div>
                    <div className={`${styles.dayTabDate} tnum`}>{dt.getMonth() + 1}.{dt.getDate()}</div>
                    {d.holiday !== null ? (
                      <div className={`${styles.dayTabStatus} ${styles.dayTabStatusHoliday}`}>{d.holiday || '휴무'}</div>
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
                    checked={day.holiday !== null}
                    onChange={() => toggleHoliday(activeDay)}
                  />
                  휴무일로 설정
                </label>
              </div>

              {day.holiday !== null ? (
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
                    className={`${styles.previewCard} ${isToday ? styles.previewCardToday : ''} ${m.holiday !== null ? styles.previewCardHoliday : ''} ${isActive ? styles.previewCardEditing : ''}`}
                  >
                    <div className={styles.previewCardHead}>
                      <div>
                        <div className={styles.previewCardDay}>{m.day}요일</div>
                        <div className={`${styles.previewCardDate} tnum`}>{d.getMonth() + 1}.{d.getDate()}</div>
                      </div>
                      {isActive && <span className="chip chip-event" style={{ fontSize: 10 }}>편집중</span>}
                    </div>
                    {m.holiday !== null ? (
                      <div className={styles.previewEmpty}>
                        <div className={styles.previewEmptyTitle}>{m.holiday || '휴무'}</div>
                        <div className={styles.previewEmptySub}>휴무</div>
                      </div>
                    ) : (
                      <div className={styles.previewCardBody}>
                        <div className={styles.previewSectionLabel}>
                          <span>중식</span>
                          <span className="muted tnum">12:00 — 12:30</span>
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

function Spinner() {
  return (
    <span style={{
      width: 13, height: 13, border: '2px solid rgba(31,29,23,.2)',
      borderTopColor: 'var(--text-on-brand)', borderRadius: '50%',
      animation: 'spin 0.6s linear infinite', display: 'inline-block',
    }} />
  );
}

export default MealsEdit;
