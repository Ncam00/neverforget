import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@neverforget_tasks';
const ARCHIVE_KEY = '@neverforget_archive';
const THEME_KEY = '@neverforget_theme';
const WEEKLY_KEY = '@neverforget_weekly';

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

export async function loadArchive() {
  try {
    const json = await AsyncStorage.getItem(ARCHIVE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function saveArchive(tasks) {
  try {
    await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save archive', e);
  }
}

export async function loadTheme() {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return theme || 'gold';
  } catch {
    return 'gold';
  }
}

export async function saveTheme(themeId) {
  try {
    await AsyncStorage.setItem(THEME_KEY, themeId);
  } catch {}
}

export async function loadWeeklyData() {
  try {
    const json = await AsyncStorage.getItem(WEEKLY_KEY);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

export async function recordCompletion() {
  try {
    const data = await loadWeeklyData();
    const today = new Date().toDateString();
    data[today] = (data[today] || 0) + 1;
    const keys = Object.keys(data).sort((a, b) => new Date(b) - new Date(a));
    const trimmed = {};
    keys.slice(0, 30).forEach((k) => (trimmed[k] = data[k]));
    await AsyncStorage.setItem(WEEKLY_KEY, JSON.stringify(trimmed));
  } catch {}
}

export function carryOverTasks(tasks) {
  const today = new Date().toDateString();
  return tasks
    .filter((t) => !t.completed && !t.archived)
    .map((t) => {
      if (t.date !== today) {
        return { ...t, date: today, carriedOver: true };
      }
      return t;
    });
}
