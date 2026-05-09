import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon/Icon';
import { authApi, teamsApi } from '../../api';
import type { AuthUser, Team } from '../../types';
import styles from './SignupPage.module.scss';

interface SignupPageProps {
  onSignup: (token: string, user: AuthUser) => void;
  onGoLogin: () => void;
}

type Step = 1 | 2 | 3;

function SignupPage({ onSignup, onGoLogin }: SignupPageProps) {
  const [step, setStep] = useState<Step>(1);
  const [teams, setTeams] = useState<Team[]>([]);

  // Step 1
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Step 2
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    teamsApi.getAll().then(setTeams).catch(() => {});
  }, []);

  // ── Step 1 ──────────────────────────────────
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('이메일을 입력해주세요.'); return; }
    if (!email.includes('@')) { setError('올바른 이메일 형식이 아닙니다.'); return; }
    if (password.length < 8) { setError('비밀번호는 8자 이상이어야 합니다.'); return; }
    if (password !== confirmPw) { setError('비밀번호가 일치하지 않습니다.'); return; }

    setLoading(true);
    try {
      await authApi.signup(email.trim(), password);
      startResendCooldown();
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '메일 발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 ──────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(v => {
        if (v <= 1) { clearInterval(timer); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await authApi.signup(email.trim(), password);
      setCodeError('');
      startResendCooldown();
    } catch (err: unknown) {
      setCodeError(err instanceof Error ? err.message : '재발송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    if (code.length !== 6) { setCodeError('6자리 코드를 입력해주세요.'); return; }

    setLoading(true);
    try {
      await authApi.verifyEmail(email.trim(), code);
      setStep(3);
    } catch (err: unknown) {
      setCodeError(err instanceof Error ? err.message : '인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 ──────────────────────────────────
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('이름을 입력해주세요.'); return; }
    if (!teamId) { setError('소속 팀을 선택해주세요.'); return; }

    setLoading(true);
    try {
      const res = await authApi.completeSignup(email.trim(), name.trim(), teamId);
      onSignup(res.accessToken, res.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandLogo}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity=".9" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className={styles.brandName}>마더텅 매니저</span>
        </div>

        {/* Step indicator */}
        <div className={styles.steps}>
          {([1, 2, 3] as Step[]).map(s => (
            <React.Fragment key={s}>
              <div className={`${styles.stepDot} ${step === s ? styles.stepDotActive : ''} ${step > s ? styles.stepDotDone : ''}`}>
                {step > s ? <Icon name="check" size={11} /> : s}
              </div>
              {s < 3 && <div className={`${styles.stepLine} ${step > s ? styles.stepLineDone : ''}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className={styles.stepLabel}>
          {step === 1 && '계정 정보 입력'}
          {step === 2 && '이메일 인증'}
          {step === 3 && '프로필 설정'}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <div className={styles.head}>
              <h1 className={styles.title}>회원가입</h1>
              <p className={styles.sub}>이메일과 비밀번호를 입력해주세요</p>
            </div>
            <form className={styles.form} onSubmit={handleStep1}>
              <div className="field">
                <label className="field-label">이메일</label>
                <input
                  className="input"
                  type="email"
                  placeholder="example@mothertongue.co.kr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="field">
                <label className="field-label">비밀번호</label>
                <div className={styles.pwWrap}>
                  <input
                    className={`input ${styles.pwInput}`}
                    type={showPw ? 'text' : 'password'}
                    placeholder="8자 이상 입력"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                    {showPw ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="field">
                <label className="field-label">비밀번호 확인</label>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="비밀번호 재입력"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                />
              </div>

              {error && <div className={styles.error}><Icon name="x" size={13} /> {error}</div>}

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : null}
                {loading ? '발송 중...' : '인증 메일 발송'}
              </button>
            </form>
          </>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <>
            <div className={styles.head}>
              <h1 className={styles.title}>이메일 인증</h1>
              <p className={styles.sub}>
                <strong>{email}</strong>로 발송된<br />6자리 인증 코드를 입력해주세요
              </p>
            </div>
            <form className={styles.form} onSubmit={handleStep2}>
              <div className="field">
                <label className="field-label">인증 코드</label>
                <input
                  className={`input ${styles.codeInput}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setCodeError(''); }}
                  autoFocus
                />
              </div>

              {codeError && <div className={styles.error}><Icon name="x" size={13} /> {codeError}</div>}

              <div className={styles.resendRow}>
                <span className="muted" style={{ fontSize: 12.5 }}>코드를 받지 못하셨나요?</span>
                <button
                  type="button"
                  className={styles.resendBtn}
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                >
                  {resendCooldown > 0 ? `재발송 (${resendCooldown}s)` : '재발송'}
                </button>
              </div>

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading || code.length !== 6}>
                {loading ? <span className={styles.spinner} /> : null}
                {loading ? '확인 중...' : '인증 확인'}
              </button>

              <button type="button" className={`btn ${styles.backBtn}`} onClick={() => { setStep(1); setCode(''); setCodeError(''); }}>
                이전으로
              </button>
            </form>
          </>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <>
            <div className={styles.head}>
              <h1 className={styles.title}>프로필 설정</h1>
              <p className={styles.sub}>이름과 소속 팀을 설정해주세요</p>
            </div>
            <form className={styles.form} onSubmit={handleStep3}>
              <div className="field">
                <label className="field-label">이름</label>
                <input
                  className="input"
                  type="text"
                  placeholder="홍길동"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="field">
                <label className="field-label">소속 팀</label>
                <div className={styles.teamGrid}>
                  {teams.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      className={`${styles.teamChip} ${teamId === t.id ? styles.teamChipActive : ''}`}
                      onClick={() => setTeamId(t.id)}
                      style={{ '--team-color': t.color } as React.CSSProperties}
                    >
                      <span className={styles.teamDot} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className={styles.error}><Icon name="x" size={13} /> {error}</div>}

              <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : null}
                {loading ? '처리 중...' : '가입 완료'}
              </button>
            </form>
          </>
        )}

        <div className={styles.footer}>
          이미 계정이 있으신가요?{' '}
          <button className={styles.link} onClick={onGoLogin}>로그인</button>
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

export default SignupPage;
