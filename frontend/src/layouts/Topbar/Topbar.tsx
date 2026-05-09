import React from 'react';
import Icon from '../../components/Icon/Icon';
import styles from './Topbar.module.scss';

interface TopbarProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  onMenuClick?: () => void;
}

function Topbar({ title, sub, actions, onMenuClick }: TopbarProps) {
  return (
    <div className={styles.topbar}>
      {onMenuClick && (
        <button className={`btn btn-icon btn-ghost ${styles.menuBtn}`} onClick={onMenuClick} aria-label="메뉴">
          <Icon name="menu" size={18} />
        </button>
      )}
      <div>
        <h1 className={styles.title}>{title}</h1>
        {sub && <div className={styles.sub}>{sub}</div>}
      </div>
      <div className={styles.spacer} />
      <div className={styles.actions}>
        {actions}
        {/* <button className="btn btn-icon btn-ghost" title="검색">
          <Icon name="search" size={16} />
        </button>
        <button className="btn btn-icon btn-ghost" title="알림">
          <Icon name="bell" size={16} />
        </button> */}
      </div>
    </div>
  );
}

export default Topbar;
