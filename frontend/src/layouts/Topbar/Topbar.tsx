import React from 'react';
import Icon from '../../components/Icon/Icon';
import styles from './Topbar.module.scss';

interface TopbarProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}

function Topbar({ title, sub, actions }: TopbarProps) {
  return (
    <div className={styles.topbar}>
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
