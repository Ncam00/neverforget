import React, { createContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import WeeklyScreen from './src/screens/WeeklyScreen';
import ArchiveScreen from './src/screens/ArchiveScreen';
import ThemeScreen from './src/screens/ThemeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { THEMES, DEFAULT_THEME } from './src/utils/themes';
import { loadTheme, saveTheme } from './src/utils/storage';

export const ThemeContext = createContext(THEMES[DEFAULT_THEME]);
export const ThemeUpdateContext = createContext(async () => {});

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [themeId, setThemeId] = useState(DEFAULT_THEME);
  const [onboardingDone, setOnboardingDone] = useState(null); // null = loading
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];

  useEffect(() => {
    (async () => {
      const [savedTheme, onboardingFlag] = await Promise.all([
        loadTheme(),
        AsyncStorage.getItem('onboarding_done'),
      ]);
      if (savedTheme) setThemeId(savedTheme);
      setOnboardingDone(!!onboardingFlag);
    })();
    const sub = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => sub.remove();
  }, []);

  async function updateTheme(id) {
    setThemeId(id);
    await saveTheme(id);
  }

  // Still loading — render nothing to avoid flash
  if (onboardingDone === null) return null;

  // First-time user — show onboarding
  if (!onboardingDone) {
    return (
      <ThemeContext.Provider value={theme}>
        <StatusBar style="light" />
        <OnboardingScreen onDone={() => setOnboardingDone(true)} />
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeUpdateContext.Provider value={updateTheme}>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: theme.bg },
              headerTintColor: theme.primary,
              headerTitleStyle: { fontWeight: '800', fontSize: 18, letterSpacing: 1 },
              headerBackTitleVisible: false,
              contentStyle: { backgroundColor: theme.bg },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="AddTask"
              component={AddTaskScreen}
              options={({ route }) => ({ title: route.params?.task ? 'Edit Task' : 'New Task' })}
            />
            <Stack.Screen name="Weekly" component={WeeklyScreen} options={{ title: 'Weekly Summary' }} />
            <Stack.Screen name="Archive" component={ArchiveScreen} options={{ title: 'Archive' }} />
            <Stack.Screen name="Themes" component={ThemeScreen} options={{ title: 'Choose Theme' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeUpdateContext.Provider>
    </ThemeContext.Provider>
  );
}
