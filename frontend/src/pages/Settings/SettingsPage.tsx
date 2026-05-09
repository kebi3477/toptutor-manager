import React, { useState } from 'react';
import Icon from '../../components/Icon/Icon';
import { authApi } from '../../api';
import styles from './SettingsPage.module.scss';

function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) { setError('현재 비밀번호를 입력해주세요.'); return; }
    if (newPassword.length < 8) { setError('새 비밀번호는 8자 이상이어야 합니다.'); return; }
    if (newPassword !== confirmPassword) { setError('새 비밀번호가 일치하지 않습니다.'); return; }
    if (currentPassword === newPassword) { setError('현재 비밀번호와 동일한 비밀번호는 사용할 수 없습니다.'); return; }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>비밀번호 변경</h2>
        <p className={styles.sectionDesc}>현재 비밀번호를 확인한 후 새 비밀번호로 변경합니다.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">현재 비밀번호</label>
            <div className={styles.pwWrap}>
              <input
                className={`input ${styles.pwInput}`}
                type={showCurrent ? 'text' : 'password'}
                placeholder="현재 비밀번호 입력"
                value={currentPassword}
                onChange={e => { setCurrentPassword(e.target.value); setError(''); setSuccess(''); }}
                autoComplete="current-password"
              />
              <button type="button" className={styles.pwToggle} onClick={() => setShowCurrent(v => !v)} tabIndex={-1}>
                {showCurrent ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="field">
            <label className="field-label">새 비밀번호</label>
            <div className={styles.pwWrap}>
              <input
                className={`input ${styles.pwInput}`}
                type={showNew ? 'text' : 'password'}
                placeholder="8자 이상 입력"
                value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); setSuccess(''); }}
                autoComplete="new-password"
              />
              <button type="button" className={styles.pwToggle} onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                {showNew ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <div className="field">
            <label className="field-label">새 비밀번호 확인</label>
            <input
              className="input"
              type={showNew ? 'text' : 'password'}
              placeholder="새 비밀번호 재입력"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(''); setSuccess(''); }}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className={styles.error}>
              <Icon name="x" size={13} /> {error}
            </div>
          )}
          {success && (
            <div className={styles.successMsg}>
              <Icon name="check" size={13} /> {success}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading && <span className={styles.spinner} />}
              {loading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>
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

export default SettingsPage;
