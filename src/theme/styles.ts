export const theme = {
  colors: {
    background: '#121212', // Deep Charcoal
    primary: '#00d1b9',    // Primary Cyan/Teal - for UI elements, buttons, borders
    primaryNeon: '#00FF94', // Neon Green - for performance indicators, score display
    surface: '#1E1E1E',
    surfaceLight: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#AAAAAA',
    textDim: '#666666',
    error: '#FF1744',
    success: '#00E676',
    warning: '#FFD700',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      letterSpacing: 0.5,
    },
  },
  shadows: {
    glow: {
      shadowColor: '#00d1b9',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 15,
      elevation: 5,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
  },
} as const;
