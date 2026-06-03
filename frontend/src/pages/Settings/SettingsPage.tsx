import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../../components/Icon/Icon';
import { authApi, teamsApi, usersApi } from '../../api';
import { useAppContext } from '../../context/AppContext';
import type { Team } from '../../types';
import styles from './SettingsPage.module.scss';

function SettingsPage() {
  const { currentUser, setCurrentUser } = useAppContext();

  // ── Profile ──────────────────────────────────────────────────────────────
  const [teams, setTeams] = useState<Team[]>([]);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileTeamId, setProfileTeamId] = useState('');
  const [profileRole, setProfileRole] = useState<'팀장' | '매니저' | '사원'>('사원');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  useEffect(() => {
    teamsApi.getAll().then(setTeams).catch(() => {});
  }, []);

  const startProfileEdit = () => {
    if (!currentUser) return;
    setProfileName(currentUser.name);
    setProfileTeamId(currentUser.teamId ?? '');
    setProfileRole((currentUser.role as '팀장' | '매니저' | '사원') ?? '사원');
    setProfileError('');
    setProfileSuccess('');
    setProfileEditing(true);
  };

  const handleProfileSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileError('');
    setProfileSuccess('');

    if (!profileName.trim()) { setProfileError('이름을 입력해주세요.'); return; }
    if (!profileTeamId) { setProfileError('소속 팀을 선택해주세요.'); return; }

    setProfileLoading(true);
    try {
      const updated = await usersApi.update(currentUser.id, {
        name: profileName.trim(),
        teamId: profileTeamId,
        role: profileRole,
      });
      const nextUser = { ...currentUser, name: updated.name, teamId: updated.teamId ?? currentUser.teamId, role: updated.role ?? currentUser.role };
      setCurrentUser(nextUser);
      localStorage.setItem('auth_user', JSON.stringify(nextUser));
      setProfileSuccess('프로필이 저장되었습니다.');
      setProfileEditing(false);
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setProfileLoading(false);
    }
  }, [currentUser, profileName, profileTeamId, profileRole, setCurrentUser]);

  const currentTeam = teams.find(t => t.id === (profileEditing ? profileTeamId : currentUser?.teamId));

  // ── Password ──────────────────────────────────────────────────────────────
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
      {/* ── 프로필 ── */}
      <div className={styles.section}>
        <div className={styles.sectionHd}>
          <div>
            <h2 className={styles.sectionTitle}>내 프로필</h2>
            <p className={styles.sectionDesc}>이름·소속 팀·역할을 확인하고 수정합니다.</p>
          </div>
          {!profileEditing && (
            <button className="btn btn-ghost" onClick={startProfileEdit}>
              <Icon name="edit" size={14} /> 수정
            </button>
          )}
        </div>

        {!profileEditing ? (
          <div className={styles.profileView}>
            <div
              className={styles.profileAvatar}
              style={{ background: currentTeam?.color ?? 'var(--text-3)' }}
            >
              {currentUser?.name?.slice(-2) ?? '?'}
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{currentUser?.name ?? '—'}</div>
              <div className={styles.profileMeta}>
                {currentTeam ? `${currentTeam.name} · ` : ''}{currentUser?.role ?? '—'}
              </div>
              <div className={styles.profileEmail}>{currentUser?.email ?? ''}</div>
            </div>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleProfileSave}>
            <div className="field">
              <label className="field-label">이름</label>
              <input
                className="input"
                type="text"
                placeholder="홍길동"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
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
                    className={`${styles.teamChip} ${profileTeamId === t.id ? styles.teamChipActive : ''}`}
                    onClick={() => setProfileTeamId(t.id)}
                    style={{ '--team-color': t.color } as React.CSSProperties}
                  >
                    <span className={styles.teamDot} />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">역할</label>
              <div className={styles.roleRow}>
                {(['사원', '매니저', '팀장'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    className={`${styles.roleChip} ${profileRole === r ? styles.roleChipActive : ''}`}
                    onClick={() => setProfileRole(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {profileError && (
              <div className={styles.error}><Icon name="x" size={13} /> {profileError}</div>
            )}
            {profileSuccess && (
              <div className={styles.successMsg}><Icon name="check" size={13} /> {profileSuccess}</div>
            )}

            <div className={styles.profileActions}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setProfileEditing(false)}
                disabled={profileLoading}
              >
                취소
              </button>
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                {profileLoading && <span className={styles.spinner} />}
                {profileLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── 비밀번호 변경 ── */}
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
