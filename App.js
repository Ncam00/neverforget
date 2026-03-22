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
import ProScreen from './src/screens/ProScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { THEMES, DEFAULT_THEME } from './src/utils/themes';
import { loadTheme, saveTheme } from './src/utils/storage';
import { getProStatus } from './src/utils/purchase';

export const ThemeContext = createContext(THEMES[DEFAULT_THEME]);
export const ThemeUpdateContext = createContext(async () => {});
export const ProContext = createContext(false);
export const ProUpdateContext = createContext(() => {});

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
  const [onboardingDone, setOnboardingDone] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];

  useEffect(() => {
    (async () => {
      const [savedTheme, onboardingFlag, proStatus] = await Promise.all([
        loadTheme(),
        AsyncStorage.getItem('onboarding_done'),
        getProStatus(),
      ]);
      if (savedTheme) setThemeId(savedTheme);
      setOnboardingDone(!!onboardingFlag);
      setIsPro(proStatus);
    })();
    const sub = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => sub.remove();
  }, []);

  async function updateTheme(id) {
    setThemeId(id);
    await saveTheme(id);
  }

  if (onboardingDone === null) return null;

  if (!onboardingDone) {
    return (
      <ThemeContext.Provider value={theme}>
        <ProContext.Provider value={isPro}>
          <StatusBar style="light" />
          <OnboardingScreen onDone={() => setOnboardingDone(true)} />
        </ProContext.Provider>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeUpdateContext.Provider value={updateTheme}>
        <ProContext.Provider value={isPro}>
          <ProUpdateContext.Provider value={setIsPro}>
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
                <Stack.Screen
                  name="Pro"
                  options={{ title: '', headerTransparent: true }}
                >
                  {(props) => <ProScreen {...props} onPurchase={() => setIsPro(true)} />}
                </Stack.Screen>
              </Stack.Navigator>
            </NavigationContainer>
          </ProUpdateContext.Provider>
        </ProContext.Provider>
      </ThemeUpdateContext.Provider>
    </ThemeContext.Provider>
  );
}
