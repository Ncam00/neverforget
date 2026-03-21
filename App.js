import React, { createContext, useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import WeeklyScreen from './src/screens/WeeklyScreen';
import ArchiveScreen from './src/screens/ArchiveScreen';
import ThemeScreen from './src/screens/ThemeScreen';
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
  const theme = THEMES[themeId] || THEMES[DEFAULT_THEME];

  useEffect(() => {
    loadTheme().then((id) => setThemeId(id));
    const sub = Notifications.addNotificationResponseReceivedListener(() => {});
    return () => sub.remove();
  }, []);

  async function updateTheme(id) {
    setThemeId(id);
    await saveTheme(id);
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
