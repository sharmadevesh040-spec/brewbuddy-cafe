import React, { createContext, useContext, useEffect, useState } from 'react';

type TextSize = 'normal' | 'large' | 'xlarge';

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  textSize: TextSize;
  setTextSize: (val: TextSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('bb_theme') === 'dark';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('bb_reduced_motion');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('bb_high_contrast') === 'true';
  });

  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('bb_text_size') as TextSize) || 'normal';
  });

  // Apply dark mode
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('bb_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('bb_theme', 'light');
    }
  }, [isDark]);

  // Apply reduced motion
  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.classList.add('reduce-motion');
      localStorage.setItem('bb_reduced_motion', 'true');
    } else {
      root.classList.remove('reduce-motion');
      localStorage.setItem('bb_reduced_motion', 'false');
    }
  }, [reducedMotion]);

  // Apply high contrast
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add('high-contrast');
      localStorage.setItem('bb_high_contrast', 'true');
    } else {
      root.classList.remove('high-contrast');
      localStorage.setItem('bb_high_contrast', 'false');
    }
  }, [highContrast]);

  // Apply text size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('text-size-lg', 'text-size-xl');
    if (textSize === 'large') {
      root.classList.add('text-size-lg');
    } else if (textSize === 'xlarge') {
      root.classList.add('text-size-xl');
    }
    localStorage.setItem('bb_text_size', textSize);
  }, [textSize]);

  const toggleDark = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleDark,
        reducedMotion,
        setReducedMotion,
        highContrast,
        setHighContrast,
        textSize,
        setTextSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
