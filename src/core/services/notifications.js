import { Platform } from 'react-native';
import { getSetting, setSetting, SettingsKeys } from '../db/settingsRepo';
import { isExpoGo } from '../utils/runtime';
import { DisciplineMode } from '../utils/constants';
import { quotesCount, randomQuote } from './quotesData';

export const NOTIF_CATEGORY_DAILY = 'daily_checkin';

let notifModPromise;
const getNotifications = async () => {
  if (isExpoGo()) return null;
  if (!notifModPromise) notifModPromise = import('expo-notifications');
  return notifModPromise;
};

const keyDaily = (habitId) => `notif:daily:${habitId}`;
const keyNoTwoDays = (habitId, dateId) => `notif:noTwoDays:${habitId}:${dateId}`;
const keyQuoteIds = (slot) => `notif:quote:${slot}`;

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

    await Notifications.setNotificationChannelAsync('repere', {
      name: 'Répère',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 120],
      enableVibrate: false,
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

export const getQuoteSchedule = async () => {
  const v = await getSetting(SettingsKeys.quoteSchedule);
  if (v && typeof v === 'object') {
    const mode = ['morning', 'evening', 'both', 'off'].includes(v.mode) ? v.mode : 'morning';
    const mh = Math.max(0, Math.min(23, Number(v?.morning?.hour)));
    const mm = Math.max(0, Math.min(59, Number(v?.morning?.minute)));
    const eh = Math.max(0, Math.min(23, Number(v?.evening?.hour)));
    const em = Math.max(0, Math.min(59, Number(v?.evening?.minute)));
    const daysAhead = Math.max(3, Math.min(30, Number(v?.daysAhead || 14)));
    return {
      mode,
      morning: { hour: Number.isFinite(mh) ? mh : 9, minute: Number.isFinite(mm) ? mm : 0 },
      evening: { hour: Number.isFinite(eh) ? eh : 21, minute: Number.isFinite(em) ? em : 0 },
      daysAhead,
    };
  }
  const def = { mode: 'morning', morning: { hour: 9, minute: 0 }, evening: { hour: 21, minute: 0 }, daysAhead: 14 };
  await setSetting(SettingsKeys.quoteSchedule, def);
  return def;
};

export const setQuoteSchedule = async (schedule) => {
  const mode = ['morning', 'evening', 'both', 'off'].includes(schedule?.mode) ? schedule.mode : 'morning';
  const hourM = Math.max(0, Math.min(23, Number(schedule?.morning?.hour)));
  const minM = Math.max(0, Math.min(59, Number(schedule?.morning?.minute)));
  const hourE = Math.max(0, Math.min(23, Number(schedule?.evening?.hour)));
  const minE = Math.max(0, Math.min(59, Number(schedule?.evening?.minute)));
  const daysAhead = Math.max(3, Math.min(30, Number(schedule?.daysAhead || 14)));

  const next = {
    mode,
    morning: { hour: Number.isFinite(hourM) ? hourM : 9, minute: Number.isFinite(minM) ? minM : 0 },
    evening: { hour: Number.isFinite(hourE) ? hourE : 21, minute: Number.isFinite(minE) ? minE : 0 },
    daysAhead,
  };

  await setSetting(SettingsKeys.quoteSchedule, next);
  return next;
};

const cancelQuoteSlot = async (slot) => {
  const ids = await getSetting(keyQuoteIds(slot));
  if (Array.isArray(ids)) {
    for (const id of ids) {
      await cancelScheduledById(id);
    }
  }
  await setSetting(keyQuoteIds(slot), []);
};

const scheduleQuoteSlot = async ({ slot, hour, minute, daysAhead }) => {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await cancelQuoteSlot(slot);

  if (!quotesCount()) {
    await setSetting(keyQuoteIds(slot), []);
    return;
  }

  const now = new Date();
  const ids = [];

  for (let i = 0; i < Number(daysAhead || 14); i++) {
    const fire = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, minute, 0, 0);
    if (fire.getTime() <= now.getTime() + 30 * 1000) continue;

    const q = randomQuote();
    const body = q?.text && q?.author ? `${q.text} — ${q.author}` : q?.text || 'Ouvre Répère pour une citation.';

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Répère',
        body,
        channelId: Platform.OS === 'android' ? 'repere' : undefined,
        data: { kind: 'quote', slot, author: q?.author || '', text: q?.text || '' },
      },
      trigger: fire,
    });

    ids.push(id);
  }

  await setSetting(keyQuoteIds(slot), ids);
};

export const syncQuoteNotifications = async () => {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const schedule = await getQuoteSchedule();

  if (schedule.mode === 'off') {
    await cancelQuoteSlot('morning');
    await cancelQuoteSlot('evening');
    return;
  }

  if (schedule.mode === 'morning' || schedule.mode === 'both') {
    await scheduleQuoteSlot({
      slot: 'morning',
      hour: schedule.morning.hour,
      minute: schedule.morning.minute,
      daysAhead: schedule.daysAhead,
    });
  } else {
    await cancelQuoteSlot('morning');
  }

  if (schedule.mode === 'evening' || schedule.mode === 'both') {
    await scheduleQuoteSlot({
      slot: 'evening',
      hour: schedule.evening.hour,
      minute: schedule.evening.minute,
      daysAhead: schedule.daysAhead,
    });
  } else {
    await cancelQuoteSlot('evening');
  }
};

export const addNotificationResponseReceivedListener = async (handler) => {
  const Notifications = await getNotifications();
  if (!Notifications) return { remove: () => {} };
  return Notifications.addNotificationResponseReceivedListener(handler);
};
