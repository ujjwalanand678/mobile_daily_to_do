import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { HomeScreen } from '../screens/HomeScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PomodoroScreen } from '../screens/PomodoroScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { AnimatedTabBar } from '../components/AnimatedTabBar';
import { useTheme } from '../theme/theme';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  const theme = useTheme();

  const navTheme = theme.isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.tabBar,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
          notification: theme.colors.error,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.tabBar,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.primary,
          notification: theme.colors.error,
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Pomodoro" component={PomodoroScreen} />
        <Tab.Screen name="Calendar" component={CalendarScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
