import React from 'react';
import { User } from '../../types';
import { getTeam } from '../../data';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

function Avatar({ user, size }: AvatarProps) {
  const team = user.teamId ? getTeam(user.teamId) : null;
  const initial = user.name.slice(-2);
  const cls = ['avatar', size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : ''].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      style={{ background: team?.color ?? 'var(--text-3)' }}
      title={`${user.name}${team ? ` · ${team.name}` : ''}`}
    >
      {initial}
    </div>
  );
}

export default Avatar;
