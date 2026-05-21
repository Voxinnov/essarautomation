export const COLORS = {
  primary: '#8a0303',         // Deep corporate red
  primaryDark: '#5a0000',     // Darker shade for accents/headers
  primaryLight: '#b23b3b',    // Lighter red for buttons or hovers
  primaryTint: '#ffebee',     // Light pink/red background tint
  
  secondary: '#455a64',       // Slate grey
  secondaryLight: '#90a4ae',  // Light grey
  
  background: '#f4f6f9',      // App-wide screen background
  card: '#ffffff',            // Container card backgrounds
  border: '#e0e0e0',          // Borders and dividers
  
  text: '#1a1a2e',            // Primary content text
  textSecondary: '#607d8b',   // Secondary metadata label text
  textLight: '#90a4ae',       // Hint or helper text
  textWhite: '#ffffff',       // White text
  
  success: '#2e7d32',         // Completed / Active status green
  successTint: '#e8f5e9',     // Light green tint
  
  warning: '#f57c00',         // Pending / Alert orange
  warningTint: '#fff3e0',     // Light orange tint
  
  info: '#0288d1',            // Info blue
  infoTint: '#e1f5fe',        // Light blue tint
  
  shadowColor: '#000000',
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  dark: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
