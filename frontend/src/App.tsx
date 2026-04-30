import React, { useState } from 'react';
import { PageId } from './types';
import Sidebar from './layouts/Sidebar/Sidebar';
import Topbar from './layouts/Topbar/Topbar';
import Dashboard from './pages/Dashboard/Dashboard';
import CalendarPage from './pages/Calendar/CalendarPage';
import MealsPage from './pages/Meals/MealsPage';
import TeamsAdmin from './pages/TeamsAdmin/TeamsAdmin';
import UsersAdmin from './pages/UsersAdmin/UsersAdmin';
import MealsEdit from './pages/MealsEdit/MealsEdit';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import Icon from './components/Icon/Icon';
import styles from './App.module.scss';

const PAGE_META: Record<PageId, { title: string; sub?: string }> = {
  dashboard: { title: '대시보드', sub: '오늘의 현황을 한눈에' },
  calendar: { title: '캘린더', sub: '회사 일정 & 개인 휴가' },
  meals: { title: '식단표', sub: '4층 구내식당' },
  teams: { title: '팀 관리', sub: '팀 구성 및 팀원 관리' },
  users: { title: '사용자 관리', sub: '전체 임직원 관리' },
  'meals-edit': { title: '식단표 등록', sub: '주간 식단 등록 및 편집' },
};

type AuthState = 'login' | 'signup' | 'app';

function App() {
  const [auth, setAuth] = useState<AuthState>('login');
  const [page, setPage] = useState<PageId>('dashboard');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  if (auth === 'login') {
    return <LoginPage onLogin={() => setAuth('app')} onGoSignup={() => setAuth('signup')} />;
  }
  if (auth === 'signup') {
    return <SignupPage onSignup={() => setAuth('app')} onGoLogin={() => setAuth('login')} />;
  }

  const meta = PAGE_META[page];

  const topbarActions = page === 'dashboard' || page === 'calendar' ? (
    <button className="btn btn-primary" onClick={() => setShowCreateEvent(true)}>
      <Icon name="plus" size={14} /> 일정 등록
    </button>
  ) : undefined;

  const adminToggle = (
    <button
      className={`btn ${isAdmin ? 'btn-primary' : ''}`}
      onClick={() => setIsAdmin(v => !v)}
      style={{ fontSize: 12 }}
    >
      {isAdmin ? '관리자 모드 ON' : '관리자 모드 OFF'}
    </button>
  );

  function renderPage() {
    switch (page) {
      case 'dashboard':
        return <Dashboard isAdmin={isAdmin} onCreateEvent={() => setShowCreateEvent(true)} />;
      case 'calendar':
        return <CalendarPage isAdmin={isAdmin} onCreateEvent={() => setShowCreateEvent(true)} />;
      case 'meals':
        return <MealsPage isAdmin={isAdmin} />;
      case 'teams':
        return isAdmin ? <TeamsAdmin /> : <PlaceholderPage title="팀 관리" sub="관리자만 접근할 수 있습니다." icon="folder" />;
      case 'users':
        return isAdmin ? <UsersAdmin /> : <PlaceholderPage title="사용자 관리" sub="관리자만 접근할 수 있습니다." icon="users" />;
      case 'meals-edit':
        return isAdmin ? <MealsEdit /> : <PlaceholderPage title="식단표 등록" sub="관리자만 접근할 수 있습니다." icon="edit" />;
      default:
        return null;
    }
  }

  return (
    <div className={styles.app}>
      <Sidebar page={page} setPage={setPage} isAdmin={isAdmin} />
      <div className={styles.main}>
        <Topbar
          title={meta.title}
          sub={meta.sub}
          actions={
            <div className="row" style={{ gap: 8 }}>
              {adminToggle}
              {topbarActions}
            </div>
          }
        />
        <div className={styles.pageWrapper}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, sub, icon }: { title: string; sub: string; icon: 'folder' | 'users' | 'edit' }) {
  return (
    <div className={styles.placeholder}>
      <div className={styles.placeholderIcon}>
        <Icon name={icon} size={26} />
      </div>
      <div className={styles.placeholderTitle}>{title}</div>
      <div className={styles.placeholderSub}>{sub}</div>
    </div>
  );
}

export default App;
