import React, { createContext, useContext, useState } from 'react';
import { Member, CompanyEvent, PersonalEvent, AuthUser } from '../types';

export type EditingEvent =
  | { kind: 'company'; event: CompanyEvent }
  | { kind: 'personal'; event: PersonalEvent };

interface AppContextType {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  showCreateEvent: boolean;
  setShowCreateEvent: (v: boolean) => void;
  createEventInitialDate: string | null;
  setCreateEventInitialDate: (d: string | null) => void;
  editingEvent: EditingEvent | null;
  setEditingEvent: (v: EditingEvent | null) => void;
  members: Member[];
  setMembers: (v: Member[]) => void;
  companyEvents: CompanyEvent[];
  setCompanyEvents: (v: CompanyEvent[]) => void;
  personalEvents: PersonalEvent[];
  setPersonalEvents: (v: PersonalEvent[]) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (v: AuthUser | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType>(null!);

export function useAppContext() {
  return useContext(AppContext);
}

function loadStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [createEventInitialDate, setCreateEventInitialDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EditingEvent | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>([]);
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadStoredUser);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    window.location.replace('/');
  };

  return (
    <AppContext.Provider value={{
      isAdmin, setIsAdmin,
      showCreateEvent, setShowCreateEvent,
      createEventInitialDate, setCreateEventInitialDate,
      editingEvent, setEditingEvent,
      members, setMembers,
      companyEvents, setCompanyEvents,
      personalEvents, setPersonalEvents,
      currentUser, setCurrentUser, logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}
