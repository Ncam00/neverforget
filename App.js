import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';

import HomeScreen from './src/screens/HomeScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const GOLD = '#C4A000';

export default function App() {
  // Handle notification taps
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      // Navigate to home when user taps a notification
      // (NavigationContainer ref can be added for deep linking)
    });
    return () => sub.remove();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: GOLD,
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
            letterSpacing: 1,
          },
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: '#000' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddTask"
          component={AddTaskScreen}
          options={{ title: 'New Task' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
