import React, { createContext, useContext, useState } from 'react';
import { Member, CompanyEvent, PersonalEvent } from '../types';

interface AppContextType {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  showCreateEvent: boolean;
  setShowCreateEvent: (v: boolean) => void;
  members: Member[];
  setMembers: (v: Member[]) => void;
  companyEvents: CompanyEvent[];
  setCompanyEvents: (v: CompanyEvent[]) => void;
  personalEvents: PersonalEvent[];
  setPersonalEvents: (v: PersonalEvent[]) => void;
}

const AppContext = createContext<AppContextType>(null!);

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>([]);
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);

  return (
    <AppContext.Provider value={{
      isAdmin, setIsAdmin,
      showCreateEvent, setShowCreateEvent,
      members, setMembers,
      companyEvents, setCompanyEvents,
      personalEvents, setPersonalEvents,
    }}>
      {children}
    </AppContext.Provider>
  );
}
