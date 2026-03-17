import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForNotifications() {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C4A000',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('carryover', {
      name: 'Carry-Over Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 400, 200, 400],
      lightColor: '#C4A000',
      sound: 'default',
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

  // Cancel any existing notification for this task
  if (task.notificationId) {
    await Notifications.cancelScheduledNotificationAsync(task.notificationId).catch(() => {});
  }

  const [hours, minutes] = task.reminderTime.split(':').map(Number);
  const trigger = new Date();
  trigger.setHours(hours, minutes, 0, 0);

  // If the time has already passed today, schedule for tomorrow
  if (trigger <= new Date()) {
    trigger.setDate(trigger.getDate() + 1);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "⏰ NeverForget Reminder",
      body: `Don't forget: "${task.title}"`,
      data: { taskId: task.id },
      sound: 'default',
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });

  return id;
}

export async function scheduleCarryOverNotification(pendingCount) {
  // Cancel previous carry-over notification
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    if (n.content?.data?.type === 'carryover') {
      await Notifications.cancelScheduledNotificationAsync(n.identifier);
    }
  }

  if (pendingCount === 0) return;

  // Fire at 8 PM every day
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🐘 NeverForget — Tasks Pending',
      body: `You have ${pendingCount} task${pendingCount > 1 ? 's' : ''} that still need${pendingCount === 1 ? 's' : ''} to be done!`,
      data: { type: 'carryover' },
      sound: 'default',
    },
    trigger: {
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}

export async function cancelTaskNotification(notificationId) {
  if (!notificationId) return;
  await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
}
