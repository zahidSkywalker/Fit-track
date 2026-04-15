/* ===== Neumorphic Theme Tokens ===== */
export const THEME = {
  colors: {
    bg: '#E8E0D8',
    bgLight: '#F5EDE5',
    bgDark: '#C8BFB5',

    blue: '#7BA7CC',
    blueLight: '#A3C4DE',
    blueDark: '#5A8DB8',
    blueBg: 'rgba(123, 167, 204, 0.15)',

    peach: '#E8A87C',
    peachLight: '#F0C4A4',
    peachDark: '#D4906A',
    peachBg: 'rgba(232, 168, 124, 0.15)',

    green: '#8ECDA8',
    greenLight: '#B0DFC0',
    greenDark: '#6BB88A',
    greenBg: 'rgba(142, 205, 168, 0.15)',

    red: '#D4756B',
    redLight: '#E29E96',
    redDark: '#C05A50',
    redBg: 'rgba(212, 117, 107, 0.15)',

    text: '#4A4240',
    textSecondary: '#8A807A',
    textTertiary: '#B0A8A2',
    textInverse: '#FFFFFF',
  },

  shadows: {
    raised: '6px 6px 12px #C8BFB5, -6px -6px 12px #F5EDE5',
    raisedSm: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
    raisedLg: '8px 8px 16px #C8BFB5, -8px -8px 16px #F5EDE5',
    pressed: 'inset 4px 4px 8px #C8BFB5, inset -4px -4px 8px #F5EDE5',
    pressedSm: 'inset 2px 2px 4px #C8BFB5, inset -2px -2px 4px #F5EDE5',
    pressedLg: 'inset 6px 6px 12px #C8BFB5, inset -6px -6px 12px #F5EDE5',
    flat: '3px 3px 6px #C8BFB5, -3px -3px 6px #F5EDE5',
    none: 'none',
  },

  radii: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    full: '9999px',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  typography: {
    fontFamily: "'Nunito', system-ui, -apple-system, sans-serif",
    sizes: {
      xs: '11px',
      sm: '13px',
      base: '15px',
      lg: '17px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '38px',
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    overlay: 40,
    modal: 50,
    toast: 60,
  },
} as const;

/* ===== Accent Color Map (for dynamic theming by category) ===== */
export const ACCENT_MAP = {
  blue: {
    main: THEME.colors.blue,
    light: THEME.colors.blueLight,
    dark: THEME.colors.blueDark,
    bg: THEME.colors.blueBg,
  },
  peach: {
    main: THEME.colors.peach,
    light: THEME.colors.peachLight,
    dark: THEME.colors.peachDark,
    bg: THEME.colors.peachBg,
  },
  green: {
    main: THEME.colors.green,
    light: THEME.colors.greenLight,
    dark: THEME.colors.greenDark,
    bg: THEME.colors.greenBg,
  },
  red: {
    main: THEME.colors.red,
    light: THEME.colors.redLight,
    dark: THEME.colors.redDark,
    bg: THEME.colors.redBg,
  },
} as const;

export type AccentColor = keyof typeof ACCENT_MAP;

/* ===== Muscle Group Color Mapping ===== */
export const MUSCLE_COLORS: Record<string, AccentColor> = {
  chest: 'peach',
  back: 'blue',
  shoulders: 'blue',
  biceps: 'peach',
  triceps: 'peach',
  legs: 'green',
  core: 'red',
  glutes: 'green',
  full_body: 'blue',
};

/* ===== Category Color Mapping ===== */
export const CATEGORY_COLORS: Record<string, AccentColor> = {
  Strength: 'peach',
  Cardio: 'blue',
  HIIT: 'red',
  Calisthenics: 'green',
  Flexibility: 'green',
};

/* ===== Difficulty Color Mapping ===== */
export const DIFFICULTY_COLORS: Record<string, AccentColor> = {
  beginner: 'green',
  intermediate: 'blue',
  advanced: 'peach',
  expert: 'red',
};
