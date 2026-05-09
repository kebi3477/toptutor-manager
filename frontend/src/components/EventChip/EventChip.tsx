import React from 'react';
import { CompanyEvent, PersonalEvent } from '../../types';
import { getUser, getTeam } from '../../data';
import { useAppContext } from '../../context/AppContext';

interface CompanyChipProps {
  kind: 'company';
  event: CompanyEvent;
}

interface PersonalChipProps {
  kind: 'personal';
  event: PersonalEvent;
}

type EventChipProps = CompanyChipProps | PersonalChipProps;

function EventChip(props: EventChipProps) {
  const { users } = useAppContext();

  if (props.kind === 'company') {
    const { event } = props;
    const cls = event.type === 'holiday' ? 'chip-holiday'
      : event.type === 'meeting' ? 'chip-meeting'
      : 'chip-event';
    return (
      <div className={`cal-chip ${cls}`} title={event.title}>
        <span className="cal-chip-dot" />
        <span className="truncate">{event.title}</span>
      </div>
    );
  }

  const { event } = props;
  const user = getUser(event.userId, users);
  if (!user) return null;
  const team = user.teamId ? getTeam(user.teamId) : null;
  const cls = event.type === 'half' ? 'chip-half' : event.type === 'trip' ? 'chip-trip' : 'chip-leave';
  const label = event.type === 'half'
    ? (event.half === 'AM' ? '오전반차' : '오후반차')
    : event.type === 'trip' ? event.label
    : '연차';

  return (
    <div className={`cal-chip ${cls}`} title={`${user.name} · ${event.label}`}>
      <span className="cal-chip-dot" style={{ background: team?.color ?? 'var(--text-3)' }} />
      <span className="truncate">{user.name} {label}</span>
    </div>
  );
}

export default EventChip;
