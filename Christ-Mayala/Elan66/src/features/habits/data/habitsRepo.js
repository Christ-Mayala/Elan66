import { getDb } from '../../../core/db/database';
import { createId } from '../../../core/utils/id';
import { DisciplineMode, GOLD_STANDARD_DAYS, HabitStatus } from '../../../core/utils/constants';
import { toLocalDateId } from '../../../core/utils/dateUtils';

export const getHabitById = async (habitId) => {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM habits WHERE id = ?;', [habitId]);
};

export const listHabitsWithSummary = async ({ includeArchived = false } = {}) => {
  const db = await getDb();
  const where = includeArchived ? '' : `WHERE h.status != '${HabitStatus.archived}'`;
  const rows = await db.getAllAsync(
    `
    SELECT
      h.*,
      (SELECT COUNT(*) FROM daily_logs l WHERE l.habit_id = h.id AND l.state IS NOT NULL) AS days_validated,
      (SELECT COUNT(*) FROM daily_logs l WHERE l.habit_id = h.id AND l.state = 'success') AS days_success,
      (SELECT COUNT(*) FROM daily_logs l WHERE l.habit_id = h.id AND l.state = 'resisted') AS days_resisted,
      (SELECT COUNT(*) FROM daily_logs l WHERE l.habit_id = h.id AND l.state = 'fail') AS days_fail,
      (SELECT COUNT(*) FROM sos_events s WHERE s.habit_id = h.id) AS sos_total
    FROM habits h
    ${where}
    ORDER BY h.created_at DESC;
  `
  );
  return rows;
};

export const createHabit = async ({
  name,
  description = '',
  replacement = '',
  commitment = '',
  disciplineMode = DisciplineMode.soft,
  durationDays = GOLD_STANDARD_DAYS,
  startDate = toLocalDateId(new Date()),
} = {}) => {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = createId();

  await db.runAsync(
    `
    INSERT INTO habits(
      id, name, description, replacement, commitment,
      discipline_mode, duration_days, start_date,
      status, created_at, updated_at
    ) VALUES(?,?,?,?,?,?,?,?,?,?,?);
  `,
    [
      id,
      name?.trim() || 'Habitude',
      description?.trim() || '',
      replacement?.trim() || '',
      commitment?.trim() || '',
      disciplineMode,
      Number(durationDays) || GOLD_STANDARD_DAYS,
      startDate,
      HabitStatus.active,
      now,
      now,
    ]
  );

  return getHabitById(id);
};

export const archiveHabit = async (habitId) => {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE habits SET status = ?, archived_at = ?, updated_at = ? WHERE id = ?;`,
    [HabitStatus.archived, now, now, habitId]
  );
};

export const deleteHabit = async (habitId) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM habits WHERE id = ?;', [habitId]);
};

export const markHabitCompleted = async (habitId) => {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE habits SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?;`,
    [HabitStatus.completed, now, now, habitId]
  );
};
