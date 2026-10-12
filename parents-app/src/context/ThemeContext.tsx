import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  themePreference: ThemeMode;
  setThemePreference: (theme: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}

const THEME_STORAGE_KEY = '@app_theme_preference';

const ThemeContext = createContext<ThemeContextType>({
  themePreference: 'system',
  setThemePreference: () => {},
  resolvedTheme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);
  const deviceColorScheme = useDeviceColorScheme();

  // Load saved theme preference on app startup
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setThemePreferenceState(savedTheme);
      }
      setIsLoaded(true);
    });
  }, []);

  // Custom setter that saves to AsyncStorage whenever preference changes
  const setThemePreference = async (newTheme: ThemeMode) => {
    setThemePreferenceState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const resolvedTheme: 'light' | 'dark' = 
    themePreference === 'system' 
      ? (deviceColorScheme === 'dark' ? 'dark' : 'light') 
      : themePreference;

  // Prevent rendering children with default 'system' flash before storage finishes loading
  if (!isLoaded) {
    return null; 
  }

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
