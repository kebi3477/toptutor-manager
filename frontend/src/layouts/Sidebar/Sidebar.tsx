import { NavLink } from 'react-router-dom';
import { getTeam } from '../../data';
import { TODAY, todaysLeaves } from '../../utils/date';
import Icon from '../../components/Icon/Icon';
import { useAppContext } from '../../context/AppContext';
import styles from './Sidebar.module.scss';

interface NavItem {
  path: string;
  label: string;
  icon: 'home' | 'calendar' | 'meal' | 'folder' | 'users' | 'edit';
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: '대시보드', icon: 'home' },
  { path: '/calendar',  label: '캘린더',   icon: 'calendar' },
  { path: '/meals',     label: '식단표',   icon: 'meal' },
];

const ADMIN_ITEMS: NavItem[] = [
  { path: '/teams',      label: '팀 관리',     icon: 'folder' },
  { path: '/users',      label: '사용자 관리', icon: 'users' },
  { path: '/meals-edit', label: '식단표 등록', icon: 'edit' },
];

interface SidebarProps {
  isAdmin: boolean;
}

function Sidebar({ isAdmin }: SidebarProps) {
  const { currentUser, personalEvents, logout } = useAppContext();
  const me = currentUser;
  const myTeam = me?.teamId ? getTeam(me.teamId) : null;
  const leaveCount = todaysLeaves(personalEvents, TODAY).length;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logo}>M</div>
        <div>
          <div className={styles.brandName}>마더텅 매니저</div>
          <div className={styles.brandSub}>사내 관리</div>
        </div>
      </div>

      <div className={styles.sectionLabel}>메뉴</div>

      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
        >
          <span className={styles.itemIcon}><Icon name={item.icon} size={17} /></span>
          {item.label}
          {item.path === '/dashboard' && leaveCount > 0 && (
            <span className={styles.badge}>{leaveCount}</span>
          )}
        </NavLink>
      ))}

      {isAdmin && (
        <>
          <div className={styles.sectionLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            관리자
            <span className="admin-pill">ADMIN</span>
          </div>
          {ADMIN_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.itemIcon}><Icon name={item.icon} size={17} /></span>
              {item.label}
            </NavLink>
          ))}
        </>
      )}

      <div className={styles.spacer} />

      <NavLink
        to="/settings"
        className={({ isActive }) => `${styles.item} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.itemIcon}><Icon name="settings" size={17} /></span>
        설정
      </NavLink>

      {me && (
        <div className={styles.user}>
          <div className={styles.userAvatar} style={{ background: myTeam?.color ?? 'var(--text-3)' }}>
            {me.name.slice(-2)}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className={`${styles.userName} truncate`}>
              {me.name}
              {isAdmin && <span className={styles.adminMark}>&nbsp;·관리자</span>}
            </div>
            <div className={styles.userRole}>
              {myTeam ? `${myTeam.name} · ` : ''}{me.role}
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout} title="로그아웃">
            <Icon name="logout" size={14} />
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
