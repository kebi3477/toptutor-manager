import React from 'react';
import { CompanyEvent, PersonalEvent } from '../../types';
import { getMember, getTeam } from '../../data';
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
  const { members } = useAppContext();

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
  const member = getMember(event.userId, members);
  if (!member) return null;
  const team = member.teamId ? getTeam(member.teamId) : null;
  const cls = event.type === 'half' ? 'chip-half' : event.type === 'trip' ? 'chip-trip' : 'chip-leave';
  const label = event.type === 'half'
    ? (event.half === 'AM' ? '오전반차' : '오후반차')
    : event.type === 'trip' ? event.label
    : '연차';

  return (
    <div className={`cal-chip ${cls}`} title={`${member.name} · ${event.label}`}>
      <span className="cal-chip-dot" style={{ background: team?.color ?? 'var(--text-3)' }} />
      <span className="truncate">{member.name} {label}</span>
    </div>
  );
}

export default EventChip;
