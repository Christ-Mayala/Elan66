import { getDb } from '../../../core/db/database';
import { createId } from '../../../core/utils/id';
import { HabitStatus } from '../../../core/utils/constants';
import { dayIndexFromStart, isFutureLocal, toLocalDateId } from '../../../core/utils/dateUtils';

export const hasSosForDate = async (habitId, dateId) => {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT id FROM sos_events WHERE habit_id = ? AND date = ?;', [habitId, dateId]);
  return Boolean(row?.id);
};

export const recordSosOncePerDay = async ({ habit, dateId = toLocalDateId(new Date()) }) => {
  if (!habit) throw new Error('HABIT_NOT_FOUND');
  if (habit.status === HabitStatus.archived) throw new Error('HABIT_ARCHIVED');
  if (habit.status === HabitStatus.completed) throw new Error('HABIT_COMPLETED');
  if (isFutureLocal(dateId)) throw new Error('FUTURE_DAY');

  const dayIndex = dayIndexFromStart(habit.start_date, dateId);
  if (dayIndex < 1) throw new Error('BEFORE_START');
  if (dayIndex > Number(habit.duration_days)) throw new Error('AFTER_END');

  const db = await getDb();
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      'INSERT INTO sos_events(id, habit_id, date, created_at) VALUES(?,?,?,?);',
      [createId(), habit.id, dateId, now]
    );
    return { didCount: true };
  } catch {
    return { didCount: false };
  }
};

export const countSosForHabit = async (habitId) => {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT COUNT(*) as c FROM sos_events WHERE habit_id = ?;', [habitId]);
  return Number(row?.c || 0);
};
