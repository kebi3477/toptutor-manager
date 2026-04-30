import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
  showCreateEvent: boolean;
  setShowCreateEvent: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>(null!);

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  return (
    <AppContext.Provider value={{ isAdmin, setIsAdmin, showCreateEvent, setShowCreateEvent }}>
      {children}
    </AppContext.Provider>
  );
}
