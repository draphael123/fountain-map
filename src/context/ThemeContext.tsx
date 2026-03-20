import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colorblindMode: boolean;
  toggleColorblindMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('fountain-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  const [colorblindMode, setColorblindMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('fountain-colorblind');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('fountain-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('fountain-colorblind', colorblindMode.toString());
    if (colorblindMode) {
      document.documentElement.classList.add('colorblind');
    } else {
      document.documentElement.classList.remove('colorblind');
    }
  }, [colorblindMode]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleColorblindMode = () => {
    setColorblindMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorblindMode, toggleColorblindMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}




