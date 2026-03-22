import AsyncStorage from '@react-native-async-storage/async-storage';

const PRO_KEY = 'neverforget_pro';
const PRO_PRICE = '$3.99';
const PRO_PRICE_LABEL = '$3.99 one-time';

export { PRO_PRICE, PRO_PRICE_LABEL };

export async function getProStatus() {
  const val = await AsyncStorage.getItem(PRO_KEY);
  return val === '1';
}

export async function purchasePro() {
  // TODO: replace with real expo-in-app-purchases call when publishing
  // For now this simulates a successful purchase
  await AsyncStorage.setItem(PRO_KEY, '1');
  return { success: true };
}

export async function restorePurchase() {
  // TODO: replace with real restore flow
  const existing = await AsyncStorage.getItem(PRO_KEY);
  return existing === '1';
}

export async function revokePro() {
  // Dev helper — remove before shipping
  await AsyncStorage.removeItem(PRO_KEY);
}

// Pro-gated features list (used on paywall screen)
export const PRO_FEATURES = [
  { emoji: '🎨', label: '3 extra themes', sub: 'Deep Focus, High Energy, Creative Flow' },
  { emoji: '📊', label: 'Weekly Summary', sub: 'Bar chart, streaks & completion rate' },
  { emoji: '📦', label: 'Archive & Restore', sub: 'Keep a record of completed tasks' },
  { emoji: '🔴', label: 'Priority Filters', sub: 'Filter tasks by High / Medium / Low' },
  { emoji: '🎯', label: 'Focus Mode', sub: 'Hide completed tasks instantly' },
  { emoji: '🐘', label: 'Elephant Celebration', sub: 'Celebrate finishing all your tasks' },
  { emoji: '🔔', label: 'Smart Follow-ups', sub: 'Auto-reminder 1hr after missed tasks' },
];
