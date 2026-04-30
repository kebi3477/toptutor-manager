import React from 'react';
import { PageId } from '../../types';
import { getTeam, ME, ADMIN } from '../../data';
import { todaysLeaves } from '../../utils/date';
import Icon from '../../components/Icon/Icon';
import styles from './Sidebar.module.scss';

interface NavItem {
  id: PageId;
  label: string;
  icon: 'home' | 'calendar' | 'meal' | 'folder' | 'users' | 'edit';
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: '대시보드', icon: 'home' },
  { id: 'calendar', label: '캘린더', icon: 'calendar' },
  { id: 'meals', label: '식단표', icon: 'meal' },
];

const ADMIN_ITEMS: NavItem[] = [
  { id: 'teams', label: '팀 관리', icon: 'folder' },
  { id: 'users', label: '사용자 관리', icon: 'users' },
  { id: 'meals-edit', label: '식단표 등록', icon: 'edit' },
];

interface SidebarProps {
  page: PageId;
  setPage: (page: PageId) => void;
  isAdmin: boolean;
}

function Sidebar({ page, setPage, isAdmin }: SidebarProps) {
  const me = isAdmin ? ADMIN : ME;
  const myTeam = getTeam(me.team);
  const leaveCount = todaysLeaves().length;

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
        <div
          key={item.id}
          className={`${styles.item} ${page === item.id ? styles.active : ''}`}
          onClick={() => setPage(item.id)}
        >
          <span className={styles.itemIcon}><Icon name={item.icon} size={17} /></span>
          {item.label}
          {item.id === 'dashboard' && leaveCount > 0 && (
            <span className={styles.badge}>{leaveCount}</span>
          )}
        </div>
      ))}

      {isAdmin && (
        <>
          <div className={styles.sectionLabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            관리자
            <span className="admin-pill">ADMIN</span>
          </div>
          {ADMIN_ITEMS.map(item => (
            <div
              key={item.id}
              className={`${styles.item} ${page === item.id ? styles.active : ''}`}
              onClick={() => setPage(item.id)}
            >
              <span className={styles.itemIcon}><Icon name={item.icon} size={17} /></span>
              {item.label}
            </div>
          ))}
        </>
      )}

      <div className={styles.spacer} />

      <div className={styles.user}>
        <div className={styles.userAvatar} style={{ background: myTeam.color }}>
          {me.name.slice(-2)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className={`${styles.userName} truncate`}>
            {me.name}
            {isAdmin && <span className={styles.adminMark}>&nbsp;·관리자</span>}
          </div>
          <div className={styles.userRole}>{myTeam.name} · {me.role}</div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
