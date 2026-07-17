/**
 * Qar brand color system.
 * Primary palette: dark olive green (#082926) with medium olive (#16433B) accents.
 * Always dark theme — matches the brand identity.
 */

const brandDark = {
  text: '#FFFFFF',
  tint: '#16433B',

  background: '#082926',
  foreground: '#FFFFFF',

  card: '#0e3b33',
  cardForeground: '#FFFFFF',

  primary: '#16433B',
  primaryForeground: '#FFFFFF',

  secondary: '#0a3028',
  secondaryForeground: '#FFFFFF',

  muted: '#0d3530',
  mutedForeground: '#7fb5ae',

  accent: '#1e6b60',
  accentForeground: '#FFFFFF',

  destructive: '#ef4444',
  destructiveForeground: '#FFFFFF',

  border: '#1a5048',
  input: '#124038',
};

const colors = {
  light: brandDark,
  dark: brandDark,
  radius: 14,
};

export default colors;
