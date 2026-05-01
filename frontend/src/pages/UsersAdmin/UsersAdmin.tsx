import React, { useState } from 'react';
import { TEAMS, getTeam, membersByTeam } from '../../data';
import { todaysLeaves } from '../../utils/date';
import { Member } from '../../types';
import Avatar from '../../components/Avatar/Avatar';
import Icon from '../../components/Icon/Icon';
import { useAppContext } from '../../context/AppContext';
import styles from './UsersAdmin.module.scss';

function UserEditModal({ member, onClose, mode }: { member?: Member; onClose: () => void; mode: 'add' | 'edit' }) {
  const [name, setName] = useState(member?.name || '');
  const [team, setTeam] = useState(member?.teamId || TEAMS[0].id);
  const [role, setRole] = useState<'팀장' | '매니저' | '사원'>(member?.role || '사원');
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 520 }}>
        <div className="modal-hd">
          <h2>{mode === 'add' ? '사용자 추가' : `${member?.name} 정보 수정`}</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-bd">
          <div className="field">
            <label className="field-label">이름</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="홍길동" />
          </div>

          <div className="field">
            <label className="field-label">소속 팀</label>
            <div className="team-select-grid">
              {TEAMS.map(t => (
                <button
                  key={t.id}
                  className={`team-select-chip ${team === t.id ? 'active' : ''}`}
                  onClick={() => setTeam(t.id)}
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
                <button key={r} className={`seg-btn ${role === r ? 'active' : ''}`} onClick={() => setRole(r)} style={{ flex: 1 }}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <label className="row" style={{ gap: 10, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface-2)', cursor: 'pointer' }}>
            <input type="checkbox" className="cb" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>관리자 권한 부여</div>
              <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>회사 일정·식단표·사용자 관리 메뉴에 접근할 수 있습니다.</div>
            </div>
          </label>
        </div>
        <div className="modal-ft" style={{ justifyContent: 'space-between' }}>
          {mode === 'edit' ? (
            <button className="btn btn-ghost" style={{ color: 'var(--red)' }} onClick={onClose}>
              <Icon name="trash" size={13} /> 사용자 삭제
            </button>
          ) : <span />}
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>취소</button>
            <button className="btn btn-primary" onClick={onClose}>
              <Icon name="check" size={14} /> {mode === 'add' ? '추가' : '저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulkTeamSelect({ onSelect }: { onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button className="btn" onClick={() => setOpen(!open)}>
        <Icon name="folder" size={13} /> 팀 이동 <Icon name="chevron-down" size={12} />
      </button>
      {open && (
        <div className="popover">
          {TEAMS.map(t => (
            <button key={t.id} className="popover-item" onClick={() => { setOpen(false); onSelect(); }}>
              <span className="team-row-color" style={{ background: t.color }} />
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersAdmin() {
  const { members } = useAppContext();
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const filtered = members.filter(m => {
    if (search && !m.name.includes(search)) return false;
    if (teamFilter !== 'all' && m.teamId !== teamFilter) return false;
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    return true;
  });

  const allChecked = filtered.length > 0 && filtered.every(m => selectedIds.includes(m.id));
  const toggleAll = () => {
    if (allChecked) setSelectedIds(selectedIds.filter(id => !filtered.find(m => m.id === id)));
    else setSelectedIds(Array.from(new Set([...selectedIds, ...filtered.map(m => m.id)])));
  };
  const toggleOne = (id: string) => {
    setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
  };

  const teamCounts = TEAMS.map(t => ({ ...t, count: membersByTeam(t.id, members).length }));
  const leaves = todaysLeaves();

  return (
    <div className={styles.content}>
      <div className={styles.summaryStrip}>
        {teamCounts.map(t => (
          <button
            key={t.id}
            className={`${styles.summaryChip} ${teamFilter === t.id ? styles.summaryChipActive : ''}`}
            onClick={() => setTeamFilter(teamFilter === t.id ? 'all' : t.id)}
          >
            <span className="team-row-color" style={{ background: t.color }} />
            <span>{t.name}</span>
            <span className={`${styles.summaryNum} tnum`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-hd">
          <div>
            <h3 className="card-title">전체 사용자</h3>
            <div className="card-sub" style={{ marginTop: 2 }}>
              {filtered.length}명 / 총 {members.length}명
              {selectedIds.length > 0 && (
                <> · <span style={{ color: 'var(--brand-strong)', fontWeight: 600 }}>{selectedIds.length}명 선택됨</span></>
              )}
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <div className="search-box">
              <Icon name="search" size={13} />
              <input className="search-input" placeholder="이름으로 검색" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="select" style={{ width: 130, height: 32 }} value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
              <option value="all">모든 팀</option>
              {TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="select" style={{ width: 110, height: 32 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">모든 역할</option>
              <option value="팀장">팀장</option>
              <option value="매니저">매니저</option>
              <option value="사원">사원</option>
            </select>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              <Icon name="plus" size={14} /> 사용자 추가
            </button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-bar">
            <div className="row" style={{ gap: 6, fontSize: 12.5 }}>
              <Icon name="check" size={14} /> {selectedIds.length}명 선택됨
            </div>
            <div className="row" style={{ gap: 6 }}>
              <BulkTeamSelect onSelect={() => setSelectedIds([])} />
              <button className="btn" onClick={() => setSelectedIds([])}><Icon name="users" size={13} /> 역할 변경</button>
              <button className="btn" style={{ color: 'var(--red)' }} onClick={() => setSelectedIds([])}><Icon name="trash" size={13} /> 비활성화</button>
              <button className="btn btn-ghost" onClick={() => setSelectedIds([])}>해제</button>
            </div>
          </div>
        )}

        <table className="user-table">
          <thead>
            <tr>
              <th style={{ width: 38, paddingLeft: 18 }}>
                <input type="checkbox" className="cb" checked={allChecked} onChange={toggleAll} />
              </th>
              <th style={{ width: 38 }}></th>
              <th>이름</th>
              <th>팀</th>
              <th>역할</th>
              <th>오늘 상태</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const t = getTeam(m.teamId);
              const leave = leaves.find(e => e.userId === m.id);
              const checked = selectedIds.includes(m.id);
              return (
                <tr key={m.id} className={checked ? 'is-selected' : ''}>
                  <td style={{ paddingLeft: 18 }}>
                    <input type="checkbox" className="cb" checked={checked} onChange={() => toggleOne(m.id)} />
                  </td>
                  <td><Avatar member={m} /></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>{m.id}@mothertongue.kr</div>
                  </td>
                  <td>
                    <span className="team-tag">
                      <span className="team-row-color" style={{ background: t.color }} />
                      {t.name}
                    </span>
                  </td>
                  <td>
                    <span className={`role-pill role-${m.role === '팀장' ? 'lead' : m.role === '매니저' ? 'mgr' : 'staff'}`}>
                      {m.role}
                    </span>
                  </td>
                  <td>
                    {leave ? (
                      <span className={`chip ${leave.type === 'half' ? 'chip-half' : 'chip-leave'}`}>
                        {leave.type === 'half' ? (leave.half === 'AM' ? '오전 반차' : '오후 반차') : '연차'}
                      </span>
                    ) : (
                      <span className="muted" style={{ fontSize: 12 }}>출근</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: 18 }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => setEditing(m)}>
                      <Icon name="edit" size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="empty" style={{ padding: 40 }}>검색 결과가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && <UserEditModal onClose={() => setShowAdd(false)} mode="add" />}
      {editing && <UserEditModal member={editing} onClose={() => setEditing(null)} mode="edit" />}
    </div>
  );
}

export default UsersAdmin;
