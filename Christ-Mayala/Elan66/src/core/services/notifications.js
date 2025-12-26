import * as Notifications from 'expo-notifications';

export const NOTIF_CATEGORY_DAILY = 'daily_checkin';

export const configureNotifications = async () => {
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
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return settings;
  }
  return Notifications.requestPermissionsAsync();
};
