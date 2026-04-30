// 마더텅 매니저 - 사이드바 + 토픽바 + 페이지 라우팅
const { useState: _us } = React;

function Sidebar({ page, setPage, isAdmin }) {
  const navItems = [
    { id: 'dashboard', label: '대시보드', icon: 'home' },
    { id: 'calendar', label: '캘린더', icon: 'calendar' },
    { id: 'meals', label: '식단표', icon: 'meal' },
  ];
  const adminItems = [
    { id: 'teams', label: '팀 관리', icon: 'folder' },
    { id: 'users', label: '사용자 관리', icon: 'users' },
    { id: 'meals-edit', label: '식단표 등록', icon: 'edit' },
  ];
  const me = isAdmin ? ADMIN : ME;
  const myTeam = getTeam(me.team);
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">M</div>
        <div>
          <div className="sb-brand-name">마더텅 매니저</div>
          <div className="sb-brand-sub">사내 관리</div>
        </div>
      </div>

      <div className="sb-section-label">메뉴</div>
      {navItems.map(item => (
        <div key={item.id}
          className={`sb-item ${page === item.id ? 'active' : ''}`}
          onClick={() => setPage(item.id)}>
          <span className="sb-item-icon"><Icon name={item.icon} size={17} /></span>
          {item.label}
          {item.id === 'dashboard' && (
            <span className="sb-item-badge">{todaysLeaves().length}</span>
          )}
        </div>
      ))}

      {isAdmin && (
        <>
          <div className="sb-section-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            관리자
            <span className="admin-pill">ADMIN</span>
          </div>
          {adminItems.map(item => (
            <div key={item.id}
              className={`sb-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}>
              <span className="sb-item-icon"><Icon name={item.icon} size={17} /></span>
              {item.label}
            </div>
          ))}
        </>
      )}

      <div className="sb-spacer" />

      <div className="sb-user">
        <div className="sb-user-avatar" style={{ background: myTeam.color, color: '#fff' }}>
          {me.name.slice(-2)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="sb-user-name truncate">{me.name} {isAdmin && <span style={{ color: 'var(--brand-strong)', fontSize: 10, marginLeft: 2 }}>·관리자</span>}</div>
          <div className="sb-user-role">{myTeam.name} · {me.role}</div>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ title, sub, actions }) {
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {sub && <div className="topbar-sub" style={{ marginTop: 1 }}>{sub}</div>}
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        {actions}
        <button className="btn btn-icon btn-ghost" title="검색"><Icon name="search" size={16} /></button>
        <button className="btn btn-icon btn-ghost" title="알림"><Icon name="bell" size={16} /></button>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar });
