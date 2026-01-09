import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { listHabitsWithSummary, createHabit, getHabitById, archiveHabit, deleteHabit, setHabitImportant } from '../data/habitsRepo';
import { listLogsForHabit, setDayState, upsertNote } from '../data/logsRepo';
import { recordSosOncePerDay, hasSosForDate } from '../data/sosRepo';
import { DayState } from '../../../core/utils/constants';
import { addDaysLocal, dayIndexFromStart, toLocalDateId } from '../../../core/utils/dateUtils';
import { addNotificationResponseReceivedListener, cancelAllForHabit, scheduleNoTwoDaysForTomorrow, syncDailyCheckinsForHabits } from '../../../core/services/notifications';
import { isExpoGo } from '../../../core/utils/runtime';

const HabitsContext = createContext(null);

const actionToDayState = (actionIdentifier) => {
  switch (actionIdentifier) {
    case 'checkin_success':
      return DayState.success;
    case 'checkin_resisted':
      return DayState.resisted;
    case 'checkin_fail':
      return DayState.fail;
    default:
      return null;
  }
};

export function HabitsProvider({ children }) {
  const [state, setState] = useState({
    isReady: false,
    isBusy: false,
    habits: [],
  });

  const notifSyncRef = useRef({ key: null });

  const refreshHabits = useCallback(async () => {
    const habits = await listHabitsWithSummary({ includeArchived: false });
    setState((s) => ({ ...s, isReady: true, habits }));
    return habits;
  }, []);

  useEffect(() => {
    refreshHabits();
  }, [refreshHabits]);

  useEffect(() => {
    if (!state.isReady) return;
    if (isExpoGo()) return;
    const key = state.habits.map((h) => h.id).join('|');
    if (notifSyncRef.current.key === key) return;
    notifSyncRef.current.key = key;

    (async () => {
      try {
        await syncDailyCheckinsForHabits(state.habits);
      } catch {}
    })();
  }, [state.habits, state.isReady]);

  const createNewHabit = useCallback(
    async (payload) => {
      setState((s) => ({ ...s, isBusy: true }));
      try {
        const habit = await createHabit(payload);
        const habits = await refreshHabits();
        if (!isExpoGo()) {
          try {
            await syncDailyCheckinsForHabits(habits);
          } catch {}
        }
        return habit;
      } finally {
        setState((s) => ({ ...s, isBusy: false }));
      }
    },
    [refreshHabits]
  );

  const getHabitDetail = useCallback(async (habitId) => {
    const habit = await getHabitById(habitId);
    const logs = await listLogsForHabit(habitId);
    return { habit, logs };
  }, []);

  const setStateForDay = useCallback(
    async ({ habitId, dateId = toLocalDateId(new Date()), state: dayState }) => {
      const habit = await getHabitById(habitId);
      const log = await setDayState({ habit, dateId, state: dayState });

      const todayId = toLocalDateId(new Date());
      if (!isExpoGo() && dayState === DayState.fail && dateId === todayId) {
        const tomorrowId = addDaysLocal(dateId, 1);
        const tomorrowIndex = dayIndexFromStart(habit.start_date, tomorrowId);
        if (tomorrowIndex >= 1 && tomorrowIndex <= Number(habit.duration_days)) {
          await scheduleNoTwoDaysForTomorrow({
            habitId: habit.id,
            habitName: habit.name,
            tomorrowDateId: tomorrowId,
            disciplineMode: habit.discipline_mode,
          });
        }
      }

      await refreshHabits();
      return log;
    },
    [refreshHabits]
  );

  const saveNoteForDay = useCallback(async ({ habitId, dateId, note }) => {
    const habit = await getHabitById(habitId);
    const log = await upsertNote({ habit, dateId, note });
    return log;
  }, []);

  const recordSosToday = useCallback(
    async ({ habitId, dateId = toLocalDateId(new Date()) }) => {
      const habit = await getHabitById(habitId);
      const res = await recordSosOncePerDay({ habit, dateId });
      await refreshHabits();
      return res;
    },
    [refreshHabits]
  );

  const getSosEligibility = useCallback(async ({ habitId, dateId = toLocalDateId(new Date()) }) => {
    const already = await hasSosForDate(habitId, dateId);
    return { already };
  }, []);

  const archive = useCallback(
    async (habitId) => {
      await archiveHabit(habitId);
      await cancelAllForHabit(habitId);
      await refreshHabits();
    },
    [refreshHabits]
  );

  const setImportant = useCallback(
    async ({ habitId, important }) => {
      const h = await setHabitImportant(habitId, important);
      await refreshHabits();
      return h;
    },
    [refreshHabits]
  );

  const remove = useCallback(
    async (habitId) => {
      await deleteHabit(habitId);
      await cancelAllForHabit(habitId);
      await refreshHabits();
    },
    [refreshHabits]
  );

  useEffect(() => {
    if (isExpoGo()) return;

    let sub;
    (async () => {
      sub = await addNotificationResponseReceivedListener(async (response) => {
        const action = response?.actionIdentifier;
        const notif = response?.notification;
        const habitId = notif?.request?.content?.data?.habitId;

        const dayState = actionToDayState(action);
        if (!habitId || !dayState) return;

        try {
          await setStateForDay({ habitId, state: dayState });
        } catch {}
      });
    })();

    return () => sub?.remove?.();
  }, [setStateForDay]);

  const value = useMemo(
    () => ({
      state,
      refreshHabits,
      createNewHabit,
      getHabitDetail,
      setStateForDay,
      saveNoteForDay,
      recordSosToday,
      getSosEligibility,
      archive,
      setImportant,
      remove,
    }),
    [
      state,
      refreshHabits,
      createNewHabit,
      getHabitDetail,
      setStateForDay,
      saveNoteForDay,
      recordSosToday,
      getSosEligibility,
      archive,
      setImportant,
      remove,
    ]
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
