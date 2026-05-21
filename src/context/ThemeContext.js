import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyColorMode, colors } from '../constants/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState('dark');

  useEffect(() => {
    async function loadTheme() {
      const savedMode = await AsyncStorage.getItem('themeMode');
      const nextMode = savedMode === 'light' ? 'light' : 'dark';

      applyColorMode(nextMode);
      setModeState(nextMode);
    }

    loadTheme();
  }, []);

  async function setMode(nextMode) {
    const resolvedMode = nextMode === 'light' ? 'light' : 'dark';
    applyColorMode(resolvedMode);
    setModeState(resolvedMode);
    await AsyncStorage.setItem('themeMode', resolvedMode);
  }

  const value = useMemo(
    () => ({
      mode,
      colors,
      isDark: mode === 'dark',
      setMode,
      toggleMode: () => setMode(mode === 'dark' ? 'light' : 'dark'),
    }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
