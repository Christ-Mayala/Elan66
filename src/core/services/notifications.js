import { getSetting, setSetting, SettingsKeys } from '../db/settingsRepo';
import { isExpoGo } from '../utils/runtime';

export const NOTIF_CATEGORY_DAILY = 'daily_checkin';

let notifModPromise;
const getNotifications = async () => {
  if (isExpoGo()) return null;
  if (!notifModPromise) notifModPromise = import('expo-notifications');
  return notifModPromise;
};

const keyDaily = (habitId) => `notif:daily:${habitId}`;
const keyNoTwoDays = (habitId, dateId) => `notif:noTwoDays:${habitId}:${dateId}`;

export const configureNotifications = async () => {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await Notifications.setNotificationCategoryAsync(NOTIF_CATEGORY_DAILY, [
    {
      identifier: 'checkin_success',
      buttonTitle: '✅',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'checkin_resisted',
      buttonTitle: '⚠️',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'checkin_fail',
      buttonTitle: '❌',
      options: { opensAppToForeground: false },
    },
  ]);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
};

export const requestNotifPermissions = async () => {
  const Notifications = await getNotifications();
  if (!Notifications) return { granted: false };

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return settings;
  }
  return Notifications.requestPermissionsAsync();
};

export const getDailyReminderTime = async () => {
  const v = await getSetting(SettingsKeys.dailyReminderTime);
  if (v && typeof v.hour === 'number' && typeof v.minute === 'number') return v;
  const def = { hour: 20, minute: 30 };
  await setSetting(SettingsKeys.dailyReminderTime, def);
  return def;
};

export const setDailyReminderTime = async (time) => {
  const hour = Math.max(0, Math.min(23, Number(time.hour)));
  const minute = Math.max(0, Math.min(59, Number(time.minute)));
  await setSetting(SettingsKeys.dailyReminderTime, { hour, minute });
  return { hour, minute };
};

export const cancelScheduledById = async (id) => {
  if (!id) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {}
};

export const scheduleDailyCheckinForHabit = async ({ habitId, habitName, hour, minute }) => {
  const Notifications = await getNotifications();
  if (!Notifications) return null;

  const trigger = { hour, minute, repeats: true };
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: habitName || 'Check-in',
      body: "Valide ta journée : ✅ / ⚠️ / ❌",
      categoryIdentifier: NOTIF_CATEGORY_DAILY,
      data: { kind: 'dailyCheckin', habitId },
    },
    trigger,
  });
  await setSetting(keyDaily(habitId), id);
  return id;
};

export const syncDailyCheckinsForHabits = async (habits) => {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const { hour, minute } = await getDailyReminderTime();

  for (const h of habits) {
    const existing = await getSetting(keyDaily(h.id));
    if (existing) {
      await cancelScheduledById(existing);
    }
    await scheduleDailyCheckinForHabit({ habitId: h.id, habitName: h.name, hour, minute });
  }
};

export const cancelAllForHabit = async (habitId) => {
  const daily = await getSetting(keyDaily(habitId));
  await cancelScheduledById(daily);
  await setSetting(keyDaily(habitId), null);
};

export const scheduleNoTwoDaysNotification = async ({ habitId, habitName, date, hour, minute }) => {
  const Notifications = await getNotifications();
  if (!Notifications) return null;

  const fire = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: habitName || 'Ne manque jamais deux jours',
      body: "Ne manque jamais deux jours de suite. C'est aujourd'hui que se joue ta victoire.",
      data: { kind: 'noTwoDays', habitId },
    },
    trigger: fire,
  });
  return id;
};

export const scheduleNoTwoDaysForTomorrow = async ({ habitId, habitName, tomorrowDateId }) => {
  const { hour, minute } = await getDailyReminderTime();
  const [y, m, d] = tomorrowDateId.split('-').map((x) => Number(x));
  const fireDate = new Date(y, m - 1, d);
  const id = await scheduleNoTwoDaysNotification({ habitId, habitName, date: fireDate, hour, minute });
  await setSetting(keyNoTwoDays(habitId, tomorrowDateId), id);
  return id;
};

export const addNotificationResponseReceivedListener = async (handler) => {
  const Notifications = await getNotifications();
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener(handler);
};
