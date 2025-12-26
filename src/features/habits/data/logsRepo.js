import { getDb } from '../../../core/db/database';
import { createId } from '../../../core/utils/id';
import { DayState, HabitStatus } from '../../../core/utils/constants';
import { dayIndexFromStart, isFutureLocal, toLocalDateId } from '../../../core/utils/dateUtils';
import { markHabitCompleted } from './habitsRepo';

const ensureValidDayForHabit = ({ habit, dateId }) => {
  if (!habit) throw new Error('HABIT_NOT_FOUND');
  if (habit.status === HabitStatus.archived) throw new Error('HABIT_ARCHIVED');
  if (habit.status === HabitStatus.completed) throw new Error('HABIT_COMPLETED');
  if (isFutureLocal(dateId)) throw new Error('FUTURE_DAY');

  const dayIndex = dayIndexFromStart(habit.start_date, dateId);
  if (dayIndex < 1) throw new Error('BEFORE_START');
  if (dayIndex > Number(habit.duration_days)) throw new Error('AFTER_END');

  return dayIndex;
};

export const listLogsForHabit = async (habitId) => {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM daily_logs WHERE habit_id = ? ORDER BY date ASC;', [habitId]);
};

export const getLogForHabitDate = async (habitId, dateId) => {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM daily_logs WHERE habit_id = ? AND date = ?;', [habitId, dateId]);
};

export const upsertNote = async ({ habit, dateId, note }) => {
  if (!habit) throw new Error('HABIT_NOT_FOUND');
  if (isFutureLocal(dateId)) throw new Error('FUTURE_DAY');

  const db = await getDb();
  const now = new Date().toISOString();

  const existing = await getLogForHabitDate(habit.id, dateId);
  const dayIndex = dayIndexFromStart(habit.start_date, dateId);

  if (!existing) {
    const id = createId();
    await db.runAsync(
      `
      INSERT INTO daily_logs(id, habit_id, date, day_index, state, note, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?);
    `,
      [id, habit.id, dateId, dayIndex, null, note || '', now, now]
    );
    return getLogForHabitDate(habit.id, dateId);
  }

  await db.runAsync('UPDATE daily_logs SET note = ?, updated_at = ? WHERE id = ?;', [note || '', now, existing.id]);
  return getLogForHabitDate(habit.id, dateId);
};

export const setDayState = async ({ habit, dateId = toLocalDateId(new Date()), state }) => {
  const allowed = Object.values(DayState);
  if (!allowed.includes(state)) throw new Error('INVALID_STATE');

  const dayIndex = ensureValidDayForHabit({ habit, dateId });
  const db = await getDb();
  const now = new Date().toISOString();

  const existing = await getLogForHabitDate(habit.id, dateId);
  if (existing?.state) throw new Error('ALREADY_VALIDATED');

  if (!existing) {
    const id = createId();
    await db.runAsync(
      `
      INSERT INTO daily_logs(id, habit_id, date, day_index, state, note, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?);
    `,
      [id, habit.id, dateId, dayIndex, state, '', now, now]
    );
  } else {
    await db.runAsync('UPDATE daily_logs SET state = ?, updated_at = ? WHERE id = ?;', [state, now, existing.id]);
  }

  if (dayIndex === Number(habit.duration_days)) {
    await markHabitCompleted(habit.id);
  }

  return getLogForHabitDate(habit.id, dateId);
};
