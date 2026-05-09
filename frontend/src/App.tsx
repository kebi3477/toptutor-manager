import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
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
import CreateEventModal from './components/CreateEventModal/CreateEventModal';
import { AppProvider, useAppContext } from './context/AppContext';
import { membersApi, eventsApi } from './api';
import type { AuthUser } from './types';
import styles from './App.module.scss';

// ── Page metadata keyed by pathname ─────────────────────────────────────────

const PAGE_META: Record<string, { title: string; sub?: string }> = {
  '/dashboard': { title: '대시보드', sub: '오늘의 현황을 한눈에' },
  '/calendar':  { title: '캘린더',   sub: '회사 일정 & 개인 휴가' },
  '/meals':     { title: '식단표',   sub: '4층 구내식당' },
  '/teams':     { title: '팀 관리',  sub: '팀 구성 및 팀원 관리' },
  '/users':     { title: '사용자 관리', sub: '전체 임직원 관리' },
  '/meals-edit':{ title: '식단표 등록', sub: '주간 식단 등록 및 편집' },
};

// ── Auth guard ───────────────────────────────────────────────────────────────

function PrivateRoute({ isLoggedIn }: { isLoggedIn: boolean }) {
  return isLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
}

function PublicRoute({ isLoggedIn }: { isLoggedIn: boolean }) {
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

// ── App shell (sidebar + topbar + page) ─────────────────────────────────────

function AppShell() {
  const location = useLocation();
  const { isAdmin, showCreateEvent, setShowCreateEvent, setCreateEventInitialDate, setMembers, setCompanyEvents, setPersonalEvents } = useAppContext();

  useEffect(() => {
    membersApi.getAll().then(setMembers).catch(() => {});
    eventsApi.getAllCompany().then(setCompanyEvents).catch(() => {});
    eventsApi.getAllPersonal().then(setPersonalEvents).catch(() => {});
  }, [setMembers, setCompanyEvents, setPersonalEvents]);

  const meta = PAGE_META[location.pathname] ?? { title: '' };
  const isCalendarish = location.pathname === '/dashboard' || location.pathname === '/calendar';

  const topbarActions = isCalendarish ? (
    <button className="btn btn-primary" onClick={() => { setCreateEventInitialDate(null); setShowCreateEvent(true); }}>
      <Icon name="plus" size={14} /> 일정 등록
    </button>
  ) : null;

  return (
    <div className={styles.app}>
      <Sidebar isAdmin={isAdmin} />
      <div className={styles.main}>
        <Topbar title={meta.title} sub={meta.sub} actions={topbarActions} />
        <div className={styles.pageWrapper}>
          <Outlet context={{ isAdmin, showCreateEvent, setShowCreateEvent }} />
        </div>
      </div>
      <CreateEventModal
        open={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        isAdmin={isAdmin}
      />
    </div>
  );
}

// ── Placeholder for unauthorized pages ───────────────────────────────────────

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

// ── Page wrappers (pulls context from Outlet) ─────────────────────────────────

type ShellContext = { isAdmin: boolean; showCreateEvent: boolean; setShowCreateEvent: (v: boolean) => void };

function DashboardPage() {
  const { isAdmin } = useOutletContext<ShellContext>();
  return <Dashboard isAdmin={isAdmin} />;
}

function CalendarRoutePage() {
  const { isAdmin } = useOutletContext<ShellContext>();
  return <CalendarPage isAdmin={isAdmin} />;
}

function MealsRoutePage() {
  const { isAdmin } = useOutletContext<ShellContext>();
  return <MealsPage isAdmin={isAdmin} />;
}

function TeamsRoutePage() {
  const { isAdmin } = useOutletContext<ShellContext>();
  return isAdmin
    ? <TeamsAdmin />
    : <PlaceholderPage title="팀 관리" sub="관리자만 접근할 수 있습니다." icon="folder" />;
}

function UsersRoutePage() {
  const { isAdmin } = useOutletContext<ShellContext>();
  return isAdmin
    ? <UsersAdmin />
    : <PlaceholderPage title="사용자 관리" sub="관리자만 접근할 수 있습니다." icon="users" />;
}

function MealsEditRoutePage() {
  const { isAdmin } = useOutletContext<ShellContext>();
  return isAdmin
    ? <MealsEdit />
    : <PlaceholderPage title="식단표 등록" sub="관리자만 접근할 수 있습니다." icon="edit" />;
}

// ── Root ─────────────────────────────────────────────────────────────────────

function AppRoutes() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const navigate = useNavigate();
  const { setCurrentUser } = useAppContext();

  const handleLogin = (token: string, user: AuthUser) => {
    localStorage.setItem('token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setCurrentUser(user);
    setIsLoggedIn(true);
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    setCurrentUser(null);
    setIsLoggedIn(false);
    navigate('/', { replace: true });
  };

  return (
    <Routes>
      {/* Public routes — redirect to /dashboard if already logged in */}
      <Route element={<PublicRoute isLoggedIn={isLoggedIn} />}>
        <Route path="/" element={<LoginPage onLogin={handleLogin} onGoSignup={() => navigate('/signup')} />} />
        <Route path="/signup" element={<SignupPage onSignup={handleLogin} onGoLogin={() => navigate('/')} />} />
      </Route>

      {/* Protected routes */}
      <Route element={<PrivateRoute isLoggedIn={isLoggedIn} />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/calendar"   element={<CalendarRoutePage />} />
          <Route path="/meals"      element={<MealsRoutePage />} />
          <Route path="/teams"      element={<TeamsRoutePage />} />
          <Route path="/users"      element={<UsersRoutePage />} />
          <Route path="/meals-edit" element={<MealsEditRoutePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
