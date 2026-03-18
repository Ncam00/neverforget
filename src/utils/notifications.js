import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForNotifications() {
  if (!Device.isDevice) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C4A000',
      sound: true,
    });
    await Notifications.setNotificationChannelAsync('carryover', {
      name: 'Carry-Over Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 400, 200, 400],
      lightColor: '#C4A000',
      sound: true,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function scheduleTaskNotification(task) {
  if (!task.reminderTime) return null;

  if (task.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(task.notificationId).catch(() => {});
  }

  const [hours, minutes] = task.reminderTime.split(':').map(Number);

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ NeverForget Reminder',
        body: `Don't forget: "${task.title}"`,
        data: { taskId: task.id },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      },
    });
    return id;
  } catch (e) {
    console.warn('Could not schedule notification:', e);
    return null;
  }
}

export async function scheduleCarryOverNotification(pendingCount) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content?.data?.type === 'carryover') {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }

    if (pendingCount === 0) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🐘 NeverForget — Tasks Pending',
        body: `You have ${pendingCount} task${pendingCount > 1 ? 's' : ''} that still need${pendingCount === 1 ? 's' : ''} to be done!`,
        data: { type: 'carryover' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  } catch (e) {
    console.warn('Could not schedule carry-over notification:', e);
  }
}

export async function cancelTaskNotification(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}
