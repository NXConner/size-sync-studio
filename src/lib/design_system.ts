export type ThemeName = 'light' | 'dark' | 'highContrast' | 'sunset' | 'forest' | 'ocean';

export const themes: Record<ThemeName, Record<string, string>> = {
  light: {
    '--background': '0 0% 100%',
    '--foreground': '222 47% 11%'
  },
  dark: {
    '--background': '222 47% 11%',
    '--foreground': '210 40% 98%'
  },
  highContrast: {
    '--background': '0 0% 0%',
    '--foreground': '0 0% 100%'
  },
  sunset: {
    '--background': '23 92% 5%',
    '--foreground': '25 95% 96%'
  },
  forest: {
    '--background': '150 20% 8%',
    '--foreground': '150 25% 94%'
  },
  ocean: {
    '--background': '215 32% 9%',
    '--foreground': '200 25% 94%'
  }
};

export function applyTheme(theme: ThemeName) {
  const vars = themes[theme];
  if (!vars) return;
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }
}
