import React, { useContext } from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import AuthNavigator from './AuthNavigator';
import MainTabs from './MainTabs';

export default function AppNavigator() {
  const { session } = useContext(AuthContext);
  const { mode, colors } = useTheme();
  const baseTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer
      theme={{
        ...baseTheme,
        dark: mode === 'dark',
        colors: {
          ...baseTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.card,
          text: colors.text,
          border: colors.border,
          notification: colors.danger,
        },
      }}
    >
      {session ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
