import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<boolean> {
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return false;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "AquaTrack",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2E86AB",
    });
  }

  return true;
}

export async function scheduleWaterChangeReminder(
  aquariumName: string,
  intervalDays: number,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Changement d'eau",
      body: `Il est temps de faire un changement d'eau pour ${aquariumName} !`,
      data: { type: "water_change" },
    },
    trigger: {
      seconds: intervalDays * 24 * 60 * 60,
      repeats: true,
    } as any,
  });
}

export async function scheduleFilterCleaningReminder(
  aquariumName: string,
  intervalDays: number,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔧 Nettoyage filtre",
      body: `Pensez à nettoyer le filtre de ${aquariumName} !`,
      data: { type: "filter_cleaning" },
    },
    trigger: {
      seconds: intervalDays * 24 * 60 * 60,
      repeats: true,
    } as any,
  });
}

export async function scheduleMeasurementReminder(
  aquariumName: string,
  intervalDays: number,
) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📊 Mesure des paramètres",
      body: `N'oubliez pas de mesurer les paramètres de ${aquariumName} !`,
      data: { type: "measurement" },
    },
    trigger: {
      seconds: intervalDays * 24 * 60 * 60,
      repeats: true,
    } as any,
  });
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledReminders() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
