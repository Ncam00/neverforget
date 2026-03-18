import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

export async function registerForNotifications() {
  if (Platform.OS === 'web') return false;
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

// Returns { id, followUpId } — primary reminder + smart follow-up 1hr later
export async function scheduleTaskNotification(task) {
  if (!task.reminderTime || Platform.OS === 'web') return null;

  // Cancel previous notifications
  if (task.notificationId) {
    const prev = task.notificationId;
    if (typeof prev === 'string') {
      await Notifications.cancelScheduledNotificationAsync(prev).catch(() => {});
    } else if (prev?.id) {
      await Notifications.cancelScheduledNotificationAsync(prev.id).catch(() => {});
      if (prev.followUpId) await Notifications.cancelScheduledNotificationAsync(prev.followUpId).catch(() => {});
    }
  }

  const [hours, minutes] = task.reminderTime.split(':').map(Number);

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '⏰ NeverForget',
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

    // Smart follow-up 1 hour later
    let followUpId = null;
    const followUpHour = hours + 1;
    if (followUpHour < 24) {
      followUpId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🐘 Still pending!',
          body: `"${task.title}" still needs to be completed!`,
          data: { taskId: task.id, type: 'followup' },
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: followUpHour,
          minute: minutes,
        },
      });
    }

    return { id, followUpId };
  } catch (e) {
    console.warn('Could not schedule notification:', e);
    return null;
  }
}

export async function scheduleCarryOverNotification(pendingCount) {
  if (Platform.OS === 'web') return;
  if (!Notifications.getAllScheduledNotificationsAsync) return;
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
        body: `You still have ${pendingCount} task${pendingCount > 1 ? 's' : ''} to complete today!`,
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
  if (Platform.OS === 'web' || !notificationId) return;
  if (typeof notificationId === 'string') {
    await Notifications.cancelScheduledNotificationAsync(notificationId).catch(() => {});
  } else if (typeof notificationId === 'object') {
    if (notificationId.id) await Notifications.cancelScheduledNotificationAsync(notificationId.id).catch(() => {});
    if (notificationId.followUpId) await Notifications.cancelScheduledNotificationAsync(notificationId.followUpId).catch(() => {});
  }
}
