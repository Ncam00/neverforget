import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@neverforget_tasks';

export async function loadTasks() {
  try {
    const json = await AsyncStorage.getItem(TASKS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks) {
  try {
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function carryOverTasks(tasks) {
  const today = new Date().toDateString();
  return tasks
    .filter((t) => !t.completed)
    .map((t) => {
      if (t.date !== today) {
        return { ...t, date: today, carriedOver: true };
      }
      return t;
    });
}
