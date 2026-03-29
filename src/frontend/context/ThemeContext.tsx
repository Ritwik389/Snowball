'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

type Theme = 'light' | 'synthwave';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'snowball-theme';
const DEFAULT_THEME: Theme = 'synthwave';

const themeStore = {
  listeners: new Set<() => void>(),
  getSnapshot(): Theme {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    return saved ?? DEFAULT_THEME;
  },
  getServerSnapshot(): Theme {
    return DEFAULT_THEME;
  },
  setTheme(next: Theme) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, next);
    }
    this.listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useSyncExternalStore(
    themeStore.subscribe.bind(themeStore),
    themeStore.getSnapshot.bind(themeStore),
    themeStore.getServerSnapshot.bind(themeStore)
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.className = theme; // Also set class for Tailwind dark variant
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'synthwave' : 'light';
    themeStore.setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
