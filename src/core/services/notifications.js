import { Platform } from 'react-native';
import { getSetting, setSetting, SettingsKeys } from '../db/settingsRepo';
import { isExpoGo } from '../utils/runtime';
import { DisciplineMode } from '../utils/constants';

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

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'Rappels',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  await Notifications.setNotificationCategoryAsync(NOTIF_CATEGORY_DAILY, [
    {
      identifier: 'checkin_success',
      buttonTitle: '✅',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'checkin_resisted',
      buttonTitle: '⚠️',
      options: { opensAppToForeground: true },
    },
    {
      identifier: 'checkin_fail',
      buttonTitle: '❌',
      options: { opensAppToForeground: true },
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

export const getNotifPermissions = async () => {
  const Notifications = await getNotifications();
  if (!Notifications) return { granted: false };
  return Notifications.getPermissionsAsync();
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

export const scheduleDailyCheckinForHabit = async ({ habitId, habitName, hour, minute, disciplineMode }) => {
  const Notifications = await getNotifications();
  if (!Notifications) return null;

  const trigger = { hour, minute, repeats: true };
  const mode = disciplineMode === DisciplineMode.strict ? DisciplineMode.strict : DisciplineMode.soft;
  const body =
    mode === DisciplineMode.strict
      ? "Check-in : valide ta journée ✅ / ⚠️ / ❌"
      : "Valide ta journée : ✅ / ⚠️ / ❌";

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: habitName || 'Check-in',
      body,
      categoryIdentifier: NOTIF_CATEGORY_DAILY,
      channelId: Platform.OS === 'android' ? 'daily' : undefined,
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
    await scheduleDailyCheckinForHabit({ habitId: h.id, habitName: h.name, hour, minute, disciplineMode: h.discipline_mode });
  }
};

export const cancelAllForHabit = async (habitId) => {
  const daily = await getSetting(keyDaily(habitId));
  await cancelScheduledById(daily);
  await setSetting(keyDaily(habitId), null);
};

export const scheduleNoTwoDaysNotification = async ({ habitId, habitName, date, hour, minute, disciplineMode }) => {
  const Notifications = await getNotifications();
  if (!Notifications) return null;

  const fire = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0);
  const mode = disciplineMode === DisciplineMode.strict ? DisciplineMode.strict : DisciplineMode.soft;
  const body =
    mode === DisciplineMode.strict
      ? "Ne manque jamais deux jours de suite. Aujourd'hui, tu tiens."
      : "Ne manque jamais deux jours de suite. C'est aujourd'hui que se joue ta victoire.";

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: habitName || 'Ne manque jamais deux jours',
      body,
      channelId: Platform.OS === 'android' ? 'daily' : undefined,
      data: { kind: 'noTwoDays', habitId },
    },
    trigger: fire,
  });
  return id;
};

export const scheduleNoTwoDaysForTomorrow = async ({ habitId, habitName, tomorrowDateId, disciplineMode }) => {
  const { hour, minute } = await getDailyReminderTime();
  const [y, m, d] = tomorrowDateId.split('-').map((x) => Number(x));
  const fireDate = new Date(y, m - 1, d);
  const id = await scheduleNoTwoDaysNotification({ habitId, habitName, date: fireDate, hour, minute, disciplineMode });
  await setSetting(keyNoTwoDays(habitId, tomorrowDateId), id);
  return id;
};

export const addNotificationResponseReceivedListener = async (handler) => {
  const Notifications = await getNotifications();
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener(handler);
};
