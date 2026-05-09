import React, { createContext, useContext, useState } from 'react';
import { User, CompanyEvent, PersonalEvent, AuthUser } from '../types';

export type EditingEvent =
  | { kind: 'company'; event: CompanyEvent }
  | { kind: 'personal'; event: PersonalEvent };

interface AppContextType {
  isAdmin: boolean;
  showCreateEvent: boolean;
  setShowCreateEvent: (v: boolean) => void;
  createEventInitialDate: string | null;
  setCreateEventInitialDate: (d: string | null) => void;
  editingEvent: EditingEvent | null;
  setEditingEvent: (v: EditingEvent | null) => void;
  users: User[];
  setUsers: (v: User[]) => void;
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
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [createEventInitialDate, setCreateEventInitialDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EditingEvent | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>([]);
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadStoredUser);

  const isAdmin = currentUser?.isAdmin ?? false;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    window.location.replace('/');
  };

  return (
    <AppContext.Provider value={{
      isAdmin,
      showCreateEvent, setShowCreateEvent,
      createEventInitialDate, setCreateEventInitialDate,
      editingEvent, setEditingEvent,
      users, setUsers,
      companyEvents, setCompanyEvents,
      personalEvents, setPersonalEvents,
      currentUser, setCurrentUser,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}
