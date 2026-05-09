import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getMember, membersByTeam } from '../../data';
import { TODAY, todaysLeaves } from '../../utils/date';
import { teamsApi, membersApi } from '../../api';
import { Team, Member } from '../../types';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon/Icon';
import { useAppContext } from '../../context/AppContext';
import styles from './TeamsAdmin.module.scss';

const PRESET_COLORS = [
  // 블루 계열
  '#7C8DB5', '#5B8DA8', '#5F95A8', '#4D7FA8', '#6B7AB5', '#5B6E9A',
  // 그린 계열
  '#6FA890', '#7BA08A', '#5A8C6A', '#60A898', '#4D9E9E', '#7A9E82',
  // 레드/핑크 계열
  '#C28B8B', '#A87B9D', '#C97B88', '#B87B8D', '#C28B9E', '#A86B7A',
  // 옐로/오렌지 계열
  '#B89260', '#C2854A', '#FEA32B', '#C89B4A', '#B8A078', '#C8854A',
];

// ── 컬러 그리드 ───────────────────────────────────────────────
function ColorGrid({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  return (
    <div className="color-grid">
      {PRESET_COLORS.map(c => (
        <button
          key={c}
          className={`color-chip ${color === c ? 'active' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          type="button"
        >
          {color === c && <Icon name="check" size={14} />}
        </button>
      ))}
    </div>
  );
}

// ── 팀 추가 모달 ─────────────────────────────────────────────
function AddTeamModal({ onClose, onAdd }: { onClose: () => void; onAdd: (team: Team) => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!name.trim() || !slug.trim()) { setError('팀 이름과 ID를 입력해주세요.'); return; }
    if (!/^[a-z0-9_-]+$/.test(slug)) { setError('ID는 영문 소문자, 숫자, -, _ 만 사용 가능합니다.'); return; }
    setLoading(true);
    setError('');
    try {
      const team = await teamsApi.create({ id: slug, name: name.trim(), color });
      onAdd(team);
      onClose();
    } catch (e: any) {
      setError(e?.message?.includes('409') ? '이미 사용 중인 ID입니다.' : '추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h2>새 팀 추가</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} type="button"><Icon name="x" /></button>
        </div>
        <div className="modal-bd">
          <div className="field">
            <label className="field-label">팀 이름</label>
            <input className="input" placeholder="예: 영어독해팀" value={name}
              onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div className="field">
            <label className="field-label">팀 ID <span className="muted" style={{ fontWeight: 400 }}>(영문 소문자·숫자·-·_)</span></label>
            <input className="input" placeholder="예: eng3" value={slug}
              onChange={e => setSlug(e.target.value.toLowerCase())} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          <div className="field">
            <label className="field-label">팀 컬러</label>
            <ColorGrid color={color} onChange={setColor} />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 13, margin: '4px 0 0' }}>{error}</p>}
        </div>
        <div className="modal-ft">
          <button className="btn btn-ghost" onClick={onClose} type="button">취소</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} type="button">
            <Icon name="check" size={14} /> {loading ? '추가 중…' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 컬러 변경 모달 ────────────────────────────────────────────
function EditColorModal({
  team,
  onClose,
  onSave,
}: {
  team: Team;
  onClose: () => void;
  onSave: (id: string, color: string) => void;
}) {
  const [color, setColor] = useState(team.color);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (color === team.color) { onClose(); return; }
    setLoading(true);
    try {
      await teamsApi.update(team.id, { color });
      onSave(team.id, color);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h2>{team.name} 컬러 변경</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} type="button"><Icon name="x" /></button>
        </div>
        <div className="modal-bd">
          <div className="field">
            <label className="field-label">팀 컬러</label>
            <ColorGrid color={color} onChange={setColor} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>미리보기</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: 8, background: color,
              color: '#fff', fontWeight: 700, fontSize: 14,
            }}>
              {team.name.slice(0, 1)}
            </span>
            <span className="team-row-color" style={{ background: color, width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
            <span style={{ fontSize: 13 }}>{team.name}</span>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-ghost" onClick={onClose} type="button">취소</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} type="button">
            <Icon name="check" size={14} /> {loading ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 삭제 확인 모달 ────────────────────────────────────────────
function DeleteConfirmModal({
  team,
  memberCount,
  onClose,
  onDelete,
}: {
  team: Team;
  memberCount: number;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await teamsApi.remove(team.id);
      onDelete();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h2>팀 삭제</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} type="button"><Icon name="x" /></button>
        </div>
        <div className="modal-bd">
          <p style={{ lineHeight: 1.7 }}>
            <strong>{team.name}</strong>을(를) 삭제하시겠습니까?
            {memberCount > 0 && (
              <><br /><span style={{ color: 'var(--red)', fontSize: 13 }}>⚠ 현재 {memberCount}명의 팀원이 배정되어 있습니다.</span></>
            )}
          </p>
        </div>
        <div className="modal-ft">
          <button className="btn btn-ghost" onClick={onClose} type="button">취소</button>
          <button className="btn" style={{ background: 'var(--red)', color: '#fff' }}
            onClick={handleDelete} disabled={loading} type="button">
            <Icon name="trash" size={14} /> {loading ? '삭제 중…' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 인라인 이름 편집 ──────────────────────────────────────────
function InlineNameEditor({
  team,
  onSave,
  onCancel,
}: {
  team: Team;
  onSave: (id: string, name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(team.name);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); inputRef.current?.select(); }, []);

  async function handleSave() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === team.name) { onCancel(); return; }
    setLoading(true);
    try {
      await teamsApi.update(team.id, { name: trimmed });
      onSave(team.id, trimmed);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') onCancel();
  }

  return (
    <div className="row" style={{ gap: 6, flex: 1 }}>
      <input
        ref={inputRef}
        className="input"
        style={{ fontSize: 18, fontWeight: 700, padding: '2px 8px', height: 32, flex: 1, maxWidth: 220 }}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
      <button className="btn btn-primary btn-icon" title="저장" onClick={handleSave} disabled={loading} type="button">
        <Icon name="check" size={14} />
      </button>
      <button className="btn btn-ghost btn-icon" title="취소" onClick={onCancel} type="button">
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

// ── 팀원 배정 모달 ────────────────────────────────────────────
function AssignMembersModal({
  team,
  allMembers,
  teams,
  onClose,
  onAssign,
}: {
  team: Team;
  allMembers: Member[];
  teams: Team[];
  onClose: () => void;
  onAssign: (updated: Member[]) => void;
}) {
  const unassigned = allMembers.filter(m => m.teamId !== team.id);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const filtered = search ? unassigned.filter(m => m.name.includes(search)) : unassigned;

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  async function handleAssign() {
    if (selected.length === 0) { onClose(); return; }
    setLoading(true);
    try {
      const updated = await Promise.all(
        selected.map(id => membersApi.update(id, { teamId: team.id }))
      );
      onAssign(updated);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 480 }}>
        <div className="modal-hd">
          <h2>{team.name} 팀원 배정</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} type="button"><Icon name="x" /></button>
        </div>
        <div className="modal-bd">
          <div className="search-box" style={{ marginBottom: 12 }}>
            <Icon name="search" size={13} />
            <input className="search-input" placeholder="이름으로 검색" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <p className="empty" style={{ padding: '16px 0' }}>
              {unassigned.length === 0 ? '모든 멤버가 이미 이 팀에 속해 있습니다.' : '검색 결과가 없습니다.'}
            </p>
          ) : (
            <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filtered.map(m => {
                const t = teams.find(x => x.id === m.teamId);
                const checked = selected.includes(m.id);
                return (
                  <label
                    key={m.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                      background: checked ? 'var(--divider)' : 'transparent',
                    }}
                  >
                    <input type="checkbox" className="cb" checked={checked} onChange={() => toggle(m.id)} />
                    <Avatar member={m} />
                    <span style={{ fontWeight: 600, flex: 1 }}>{m.name}</span>
                    {t && (
                      <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                        {t.name}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>
        <div className="modal-ft">
          <button className="btn btn-ghost" onClick={onClose} type="button">취소</button>
          <button className="btn btn-primary" onClick={handleAssign} disabled={loading || selected.length === 0} type="button">
            <Icon name="check" size={14} /> {loading ? '처리 중…' : `${selected.length}명 배정`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 팀원 수정 모달 ────────────────────────────────────────────
function EditMemberModal({
  member,
  teams,
  onClose,
  onSave,
}: {
  member: Member;
  teams: Team[];
  onClose: () => void;
  onSave: (id: string, data: { name: string; teamId: string; role: Member['role'] }) => Promise<void>;
}) {
  const [name, setName] = useState(member.name);
  const [teamId, setTeamId] = useState(member.teamId ?? teams[0]?.id ?? '');
  const [role, setRole] = useState<Member['role']>(member.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) { setError('이름을 입력해주세요.'); return; }
    setLoading(true);
    setError('');
    try {
      await onSave(member.id, { name: name.trim(), teamId, role });
      onClose();
    } catch {
      setError('저장 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 520 }}>
        <div className="modal-hd">
          <h2>{member.name} 정보 수정</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose} disabled={loading} type="button"><Icon name="x" /></button>
        </div>
        <div className="modal-bd">
          <div className="field">
            <label className="field-label">이름</label>
            <input
              className="input"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              placeholder="홍길동"
              disabled={loading}
            />
          </div>
          <div className="field">
            <label className="field-label">소속 팀</label>
            <div className="team-select-grid">
              {teams.map(t => (
                <button
                  key={t.id}
                  className={`team-select-chip ${teamId === t.id ? 'active' : ''}`}
                  onClick={() => setTeamId(t.id)}
                  disabled={loading}
                  type="button"
                >
                  <span className="team-row-color" style={{ background: t.color }} />
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label className="field-label">역할</label>
            <div className="seg" style={{ width: '100%' }}>
              {(['팀장', '매니저', '사원'] as const).map(r => (
                <button
                  key={r}
                  className={`seg-btn ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                  style={{ flex: 1 }}
                  disabled={loading}
                  type="button"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 12.5 }}>{error}</div>}
        </div>
        <div className="modal-ft">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading} type="button">취소</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} type="button">
            {loading ? '처리 중...' : <><Icon name="check" size={14} /> 저장</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
type Modal = { type: 'add' } | { type: 'editColor'; team: Team } | { type: 'delete'; team: Team } | { type: 'assign' } | { type: 'editMember'; member: Member };

function TeamsAdmin() {
  const { members, personalEvents, setMembers } = useAppContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<Modal | null>(null);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    teamsApi.getAll().then(data => {
      setTeams(data);
      if (data.length > 0) setSelectedId(data[0].id);
    }).finally(() => setLoading(false));
  }, []);

  const team = teams.find(t => t.id === selectedId);
  const allMembers = selectedId ? membersByTeam(selectedId, members) : [];
  const filtered = search ? allMembers.filter(m => m.name.includes(search)) : allMembers;
  const leaves = todaysLeaves(personalEvents, TODAY);

  const handleAdd = useCallback((added: Team) => {
    setTeams(prev => [...prev, added]);
    setSelectedId(added.id);
  }, []);

  const handleColorSave = useCallback((id: string, color: string) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, color } : t));
  }, []);

  const handleNameSave = useCallback((id: string, name: string) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, name } : t));
    setEditingName(false);
  }, []);

  const handleDelete = useCallback((deletedId: string) => {
    setTeams(prev => {
      const next = prev.filter(t => t.id !== deletedId);
      if (selectedId === deletedId) setSelectedId(next[0]?.id ?? '');
      return next;
    });
  }, [selectedId]);

  const handleAssign = useCallback((updated: Member[]) => {
    setMembers(members.map(m => {
      const u = updated.find(r => r.id === m.id);
      return u ?? m;
    }));
  }, [members, setMembers]);

  const handleMemberSave = useCallback(async (id: string, data: { name: string; teamId: string; role: Member['role'] }) => {
    const updated = await membersApi.update(id, data);
    setMembers(members.map(m => m.id === updated.id ? { ...m, ...updated } : m));
  }, [members, setMembers]);

  if (loading) {
    return <div className={styles.content}><div className="muted" style={{ padding: 32 }}>팀 목록을 불러오는 중...</div></div>;
  }

  return (
    <div className={styles.content}>
      <div className={styles.layout}>
        {/* 팀 목록 */}
        <div className={`card ${styles.listCard}`}>
          <div className="card-hd" style={{ padding: '14px 16px 10px' }}>
            <div>
              <h3 className="card-title">팀 목록</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>{teams.length}개 팀 · {members.length}명</div>
            </div>
            <button className="btn btn-icon" title="팀 추가" onClick={() => setModal({ type: 'add' })}>
              <Icon name="plus" size={14} />
            </button>
          </div>
          <div className={styles.list}>
            {teams.map(t => {
              const count = membersByTeam(t.id, members).length;
              return (
                <div
                  key={t.id}
                  className={`${styles.teamRow} ${selectedId === t.id ? styles.teamRowActive : ''}`}
                  onClick={() => { setSelectedId(t.id); setEditingName(false); }}
                >
                  <span className="team-row-color" style={{ background: t.color }} />
                  <span className={`${styles.teamRowName} truncate`}>{t.name}</span>
                  <span className={`${styles.teamRowCount} tnum`}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 팀 디테일 */}
        {team ? (
          <div className={styles.detail}>
            <div className={`card ${styles.detailHead}`}>
              <div className="row" style={{ gap: 14 }}>
                <div className={styles.detailAvatar} style={{ background: team.color }}>
                  {team.name.slice(0, 1)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="row" style={{ gap: 8 }}>
                    {editingName ? (
                      <InlineNameEditor
                        team={team}
                        onSave={handleNameSave}
                        onCancel={() => setEditingName(false)}
                      />
                    ) : (
                      <>
                        <h2 className={styles.detailName}>{team.name}</h2>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="이름 수정"
                          onClick={() => setEditingName(true)}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                    소속 인원 {allMembers.length}명 · 팀장 {allMembers.find(m => m.role === '팀장')?.name || '-'}
                  </div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn" onClick={() => setModal({ type: 'editColor', team })}>
                    <Icon name="palette" size={14} /> 컬러 변경
                  </button>
                  <button className="btn" style={{ color: 'var(--red)' }} onClick={() => setModal({ type: 'delete', team })}>
                    <Icon name="trash" size={14} /> 팀 삭제
                  </button>
                </div>
              </div>

              <div className={styles.teamStats}>
                {[
                  { label: '총원',     value: `${allMembers.length}명` },
                  { label: '팀장',     value: `${allMembers.filter(m => m.role === '팀장').length}명` },
                  { label: '매니저',   value: `${allMembers.filter(m => m.role === '매니저').length}명` },
                  { label: '사원',     value: `${allMembers.filter(m => m.role === '사원').length}명` },
                  { label: '오늘 부재',value: `${leaves.filter(e => getMember(e.userId, members)?.teamId === team.id).length}명` },
                ].map(s => (
                  <div key={s.label} className={styles.teamStat}>
                    <div className={styles.teamStatLabel}>{s.label}</div>
                    <div className={styles.teamStatValue}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-hd">
                <div>
                  <h3 className="card-title">팀원</h3>
                  <div className="card-sub" style={{ marginTop: 2 }}>{filtered.length}명 · 사용자 추가는 사용자 관리에서</div>
                </div>
                <div className="row" style={{ gap: 8 }}>
                  <div className="search-box">
                    <Icon name="search" size={13} />
                    <input className="search-input" placeholder="이름으로 검색" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" onClick={() => setModal({ type: 'assign' })} type="button"><Icon name="plus" size={14} /> 팀원 배정</button>
                </div>
              </div>
              <table className="user-table">
                <thead>
                  <tr>
                    <th style={{ width: 38 }}></th>
                    <th>이름</th>
                    <th>역할</th>
                    <th>오늘 상태</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => {
                    const leave = leaves.find(e => e.userId === m.id);
                    return (
                      <tr key={m.id}>
                        <td><Avatar member={m} /></td>
                        <td><span style={{ fontWeight: 600 }}>{m.name}</span></td>
                        <td>
                          <span className={`role-pill role-${m.role === '팀장' ? 'lead' : m.role === '매니저' ? 'mgr' : 'staff'}`}>
                            {m.role}
                          </span>
                        </td>
                        <td>
                          {leave ? (
                            <span className={`chip ${leave.type === 'half' ? 'chip-half' : leave.type === 'trip' ? 'chip-trip' : 'chip-leave'}`}>
                              {leave.type === 'half' ? (leave.half === 'AM' ? '오전 반차' : '오후 반차') : leave.type === 'trip' ? leave.label : '연차'}
                            </span>
                          ) : (
                            <span className="muted" style={{ fontSize: 12 }}>출근</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-ghost btn-icon" onClick={() => setModal({ type: 'editMember', member: m })} type="button"><Icon name="edit" size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="empty" style={{ padding: 30 }}>
                      {allMembers.length === 0 ? '배정된 팀원이 없습니다.' : '검색 결과가 없습니다.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={styles.detail}>
            <div className="card" style={{ padding: 40, textAlign: 'center' }}>
              <p className="muted">팀을 선택하거나 새 팀을 추가하세요.</p>
            </div>
          </div>
        )}
      </div>

      {modal?.type === 'add' && (
        <AddTeamModal onClose={() => setModal(null)} onAdd={handleAdd} />
      )}
      {modal?.type === 'editColor' && (
        <EditColorModal team={modal.team} onClose={() => setModal(null)} onSave={handleColorSave} />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirmModal
          team={modal.team}
          memberCount={membersByTeam(modal.team.id, members).length}
          onClose={() => setModal(null)}
          onDelete={() => handleDelete(modal.team.id)}
        />
      )}
      {modal?.type === 'assign' && team && (
        <AssignMembersModal
          team={team}
          allMembers={members}
          teams={teams}
          onClose={() => setModal(null)}
          onAssign={handleAssign}
        />
      )}
      {modal?.type === 'editMember' && (
        <EditMemberModal
          member={modal.member}
          teams={teams}
          onClose={() => setModal(null)}
          onSave={handleMemberSave}
        />
      )}
    </div>
  );
}

export default TeamsAdmin;
