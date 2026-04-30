// 마더텅 매니저 - 팀 관리 페이지 (관리자)

function TeamsAdmin() {
  const [selectedId, setSelectedId] = useState(TEAMS[0].id);
  const [search, setSearch] = useState('');
  const [showAddTeam, setShowAddTeam] = useState(false);

  const team = getTeam(selectedId);
  const allMembers = membersByTeam(selectedId);
  const filtered = search
    ? allMembers.filter(m => m.name.includes(search))
    : allMembers;

  return (
    <div className="content">
      <div className="teams-layout">
        {/* 팀 리스트 */}
        <div className="card teams-list-card">
          <div className="card-hd" style={{ padding: '14px 16px 10px' }}>
            <div>
              <h3 className="card-title">팀 목록</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>{TEAMS.length}개 팀 · {MEMBERS.length}명</div>
            </div>
            <button className="btn btn-icon" title="팀 추가" onClick={() => setShowAddTeam(true)}>
              <Icon name="plus" size={14} />
            </button>
          </div>
          <div className="teams-list">
            {TEAMS.map(t => {
              const count = membersByTeam(t.id).length;
              const active = selectedId === t.id;
              return (
                <div key={t.id}
                  className={`team-row ${active ? 'active' : ''}`}
                  onClick={() => setSelectedId(t.id)}>
                  <span className="team-row-color" style={{ background: t.color }} />
                  <span className="team-row-name truncate">{t.name}</span>
                  <span className="team-row-count tnum">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 팀 디테일 */}
        <div className="teams-detail">
          <div className="card team-detail-head">
            <div className="row" style={{ gap: 14 }}>
              <div className="team-detail-avatar" style={{ background: team.color }}>
                {team.name.slice(0, 1)}
              </div>
              <div style={{ flex: 1 }}>
                <div className="row" style={{ gap: 8 }}>
                  <h2 className="team-detail-name">{team.name}</h2>
                  <button className="btn btn-ghost btn-icon" title="이름 수정"><Icon name="edit" size={14} /></button>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                  소속 인원 {allMembers.length}명 · 팀장 {allMembers.find(m => m.role === '팀장')?.name || '-'}
                </div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn"><Icon name="palette" size={14} /> 컬러 변경</button>
                <button className="btn" style={{ color: 'var(--red)' }}>
                  <Icon name="trash" size={14} /> 팀 삭제
                </button>
              </div>
            </div>

            <div className="team-stats">
              <div className="team-stat">
                <div className="team-stat-label">총원</div>
                <div className="team-stat-value tnum">{allMembers.length}명</div>
              </div>
              <div className="team-stat">
                <div className="team-stat-label">팀장</div>
                <div className="team-stat-value">{allMembers.filter(m => m.role === '팀장').length}명</div>
              </div>
              <div className="team-stat">
                <div className="team-stat-label">매니저</div>
                <div className="team-stat-value">{allMembers.filter(m => m.role === '매니저').length}명</div>
              </div>
              <div className="team-stat">
                <div className="team-stat-label">사원</div>
                <div className="team-stat-value">{allMembers.filter(m => m.role === '사원').length}명</div>
              </div>
              <div className="team-stat">
                <div className="team-stat-label">오늘 부재</div>
                <div className="team-stat-value tnum">
                  {todaysLeaves().filter(e => getMember(e.userId).team === team.id).length}명
                </div>
              </div>
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
                  <input className="search-input" placeholder="이름으로 검색"
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary"><Icon name="plus" size={14} /> 팀원 배정</button>
              </div>
            </div>
            <div style={{ padding: 0 }}>
              <table className="user-table">
                <thead>
                  <tr>
                    <th style={{ width: 38 }}></th>
                    <th>이름</th>
                    <th>역할</th>
                    <th>입사년도</th>
                    <th>오늘 상태</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => {
                    const leave = todaysLeaves().find(e => e.userId === m.id);
                    return (
                      <tr key={m.id}>
                        <td><Avatar member={m} /></td>
                        <td><span style={{ fontWeight: 600 }}>{m.name}</span></td>
                        <td>
                          <span className={`role-pill role-${m.role === '팀장' ? 'lead' : m.role === '매니저' ? 'mgr' : 'staff'}`}>
                            {m.role}
                          </span>
                        </td>
                        <td className="muted tnum">{m.joinedYear}</td>
                        <td>
                          {leave ? (
                            <span className={`chip ${leave.type === 'half' ? 'chip-half' : 'chip-leave'}`}>
                              {leave.type === 'half' ? (leave.half === 'AM' ? '오전 반차' : '오후 반차') : '연차'}
                            </span>
                          ) : (
                            <span className="muted" style={{ fontSize: 12 }}>출근</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-ghost btn-icon" title="편집"><Icon name="edit" size={14} /></button>
                          <button className="btn btn-ghost btn-icon" title="이동" style={{ color: 'var(--text-3)' }}>
                            <Icon name="chevron-right" size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="empty" style={{ padding: 30 }}>검색 결과가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showAddTeam && <AddTeamModal onClose={() => setShowAddTeam(false)} />}
    </div>
  );
}

function AddTeamModal({ onClose }) {
  const [name, setName] = useState('');
  const colors = ['#7C8DB5', '#C28B8B', '#5B8DA8', '#6FA890', '#B89260', '#8B7BAB', '#A87B9D', '#5F95A8', '#7BA08A', '#9C8E7E', '#C2854A', '#FEA32B'];
  const [color, setColor] = useState(colors[0]);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <h2>새 팀 추가</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-bd">
          <div className="field">
            <label className="field-label">팀 이름</label>
            <input className="input" placeholder="예: 영어독해팀" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">팀 컬러</label>
            <div className="color-grid">
              {colors.map(c => (
                <button key={c}
                  className={`color-chip ${color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}>
                  {color === c && <Icon name="check" size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-ghost" onClick={onClose}>취소</button>
          <button className="btn btn-primary" onClick={onClose}><Icon name="check" size={14} /> 추가</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TeamsAdmin });
