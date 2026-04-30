import React from 'react';
import { Member } from '../../types';
import { getTeam } from '../../data';

interface AvatarProps {
  member: Member;
  size?: 'sm' | 'md' | 'lg';
}

function Avatar({ member, size }: AvatarProps) {
  const team = getTeam(member.team);
  const initial = member.name.slice(-2);
  const cls = ['avatar', size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : ''].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      style={{ background: team.color }}
      title={`${member.name} · ${team.name}`}
    >
      {initial}
    </div>
  );
}

export default Avatar;
