import React, { useState } from 'react';
import Icon from '../../components/Icon/Icon';
import styles from './LoginPage.module.scss';

interface LoginPageProps {
  onLogin: () => void;
  onGoSignup: () => void;
}

function LoginPage({ onLogin, onGoSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (!password) { setError('비밀번호를 입력해주세요.'); return; }

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);

    // mock: any valid-looking email + pw length >= 6 succeeds
    if (!email.includes('@')) { setError('올바른 이메일 형식이 아닙니다.'); return; }
    if (password.length < 6) { setError('비밀번호가 올바르지 않습니다.'); return; }

    onLogin();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity=".9" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className={styles.brandName}>마더텅 매니저</span>
        </div>

        <div className={styles.head}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.sub}>계정 정보를 입력해 시작하세요</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">이메일</label>
            <input
              className="input"
              type="email"
              placeholder="example@mothertongue.co.kr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label">비밀번호</label>
            <div className={styles.pwWrap}>
              <input
                className={`input ${styles.pwInput}`}
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호 입력"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.pwToggle}
                onClick={() => setShowPw(v => !v)}
                tabIndex={-1}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && <div className={styles.error}><Icon name="x" size={13} /> {error}</div>}

          <button
            type="submit"
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} /> : null}
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.footer}>
          계정이 없으신가요?{' '}
          <button className={styles.link} onClick={onGoSignup}>회원가입</button>
        </div>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default LoginPage;
