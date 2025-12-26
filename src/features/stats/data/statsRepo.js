import { getDb } from '../../../core/db/database';
import { HabitStatus } from '../../../core/utils/constants';

export const getGlobalStats = async () => {
  const db = await getDb();

  const habitsActive = await db.getFirstAsync(
    `SELECT COUNT(*) as c FROM habits WHERE status != ?;`,
    [HabitStatus.archived]
  );

  const habitsArchived = await db.getFirstAsync(`SELECT COUNT(*) as c FROM habits WHERE status = ?;`, [HabitStatus.archived]);

  const rows = await db.getFirstAsync(
    `
    SELECT
      SUM(CASE WHEN l.state IS NOT NULL THEN 1 ELSE 0 END) AS total_validated,
      SUM(CASE WHEN l.state = 'success' THEN 1 ELSE 0 END) AS success,
      SUM(CASE WHEN l.state = 'resisted' THEN 1 ELSE 0 END) AS resisted,
      SUM(CASE WHEN l.state = 'fail' THEN 1 ELSE 0 END) AS fail
    FROM daily_logs l
    INNER JOIN habits h ON h.id = l.habit_id
    WHERE h.status != ?;
  `,
    [HabitStatus.archived]
  );

  const sos = await db.getFirstAsync(
    `
    SELECT COUNT(*) as c
    FROM sos_events s
    INNER JOIN habits h ON h.id = s.habit_id
    WHERE h.status != ?;
  `,
    [HabitStatus.archived]
  );

  const totalValidated = Number(rows?.total_validated || 0);
  const success = Number(rows?.success || 0);
  const resisted = Number(rows?.resisted || 0);
  const fail = Number(rows?.fail || 0);

  const successRate = totalValidated === 0 ? 0 : (success + resisted) / totalValidated;

  return {
    habitsActive: Number(habitsActive?.c || 0),
    habitsArchived: Number(habitsArchived?.c || 0),
    totalValidated,
    success,
    resisted,
    fail,
    successRate,
    savedLives: Number(sos?.c || 0),
  };
};
