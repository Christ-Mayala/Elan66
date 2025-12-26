import React, { createContext, useContext, useMemo, useState } from 'react';

const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const [state, setState] = useState({
    isReady: false,
    habits: [],
    selectedHabitId: null,
  });

  const value = useMemo(() => ({ state, setState }), [state]);

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
