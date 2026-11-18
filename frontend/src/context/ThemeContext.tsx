import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type TextSize = 'normal' | 'large' | 'xlarge';
export type ContrastMode = 'auto' | 'high' | 'normal';

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  highContrast: boolean;
  contrastMode: ContrastMode;
  setContrastMode: (mode: ContrastMode) => void;
  setHighContrast: (val: boolean) => void;
  isSystemHighContrast: boolean;
  textSize: TextSize;
  setTextSize: (val: TextSize) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const checkSystemHighContrast = (): boolean => {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  try {
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    return contrastQuery.matches || forcedColorsQuery.matches;
  } catch {
    return false;
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('bb_theme') === 'dark';
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem('bb_reduced_motion');
    if (saved !== null) return saved === 'true';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [isSystemHighContrast, setIsSystemHighContrast] = useState<boolean>(checkSystemHighContrast);

  // Default contrast preference is 'auto' (automatic system detection)
  const [contrastMode, setContrastModeState] = useState<ContrastMode>(() => {
    const saved = localStorage.getItem('bb_contrast_mode') as ContrastMode;
    if (saved && ['auto', 'high', 'normal'].includes(saved)) {
      return saved;
    }
    const legacy = localStorage.getItem('bb_high_contrast');
    if (legacy === 'true') return 'high';
    if (legacy === 'false') return 'normal';
    return 'auto'; // Default: automatic
  });

  const [textSize, setTextSize] = useState<TextSize>(() => {
    return (localStorage.getItem('bb_text_size') as TextSize) || 'normal';
  });

  // Calculate effective high contrast
  const effectiveHighContrast =
    contrastMode === 'high' ? true : contrastMode === 'normal' ? false : isSystemHighContrast;

  // Listen to OS high contrast / forced colors media queries
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    const updateSystemContrast = () => {
      setIsSystemHighContrast(contrastQuery.matches || forcedColorsQuery.matches);
    };

    updateSystemContrast();

    try {
      contrastQuery.addEventListener('change', updateSystemContrast);
      forcedColorsQuery.addEventListener('change', updateSystemContrast);
    } catch {
      // Fallback for older browsers
      contrastQuery.addListener?.(updateSystemContrast);
      forcedColorsQuery.addListener?.(updateSystemContrast);
    }

    return () => {
      try {
        contrastQuery.removeEventListener('change', updateSystemContrast);
        forcedColorsQuery.removeEventListener('change', updateSystemContrast);
      } catch {
        contrastQuery.removeListener?.(updateSystemContrast);
        forcedColorsQuery.removeListener?.(updateSystemContrast);
      }
    };
  }, []);

  // Set contrast mode and persist
  const setContrastMode = useCallback((mode: ContrastMode) => {
    setContrastModeState(mode);
    localStorage.setItem('bb_contrast_mode', mode);
    localStorage.setItem('bb_high_contrast', mode === 'high' ? 'true' : mode === 'normal' ? 'false' : 'auto');
  }, []);

  // Backwards compatibility toggle
  const setHighContrast = useCallback((val: boolean) => {
    setContrastMode(val ? 'high' : 'normal');
  }, [setContrastMode]);

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

  // Apply high contrast to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveHighContrast) {
      root.classList.add('high-contrast');
      root.classList.remove('standard-contrast');
    } else {
      root.classList.remove('high-contrast');
      if (contrastMode === 'normal') {
        root.classList.add('standard-contrast');
      } else {
        root.classList.remove('standard-contrast');
      }
    }
  }, [effectiveHighContrast, contrastMode]);

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
        highContrast: effectiveHighContrast,
        contrastMode,
        setContrastMode,
        setHighContrast,
        isSystemHighContrast,
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
