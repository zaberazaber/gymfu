import { StyleSheet } from 'react-native';

// Light Theme Color Palette
export const lightColors = {
  bgPrimary: '#e0e5ec',
  bgSecondary: '#f0f4f8',
  textPrimary: '#2d3748',
  textSecondary: '#718096',
  accentPrimary: '#667eea',
  accentSecondary: '#764ba2',
  success: '#48bb78',
  error: '#f56565',
  warning: '#ed8936',
  shadowLight: '#ffffff',
  shadowDark: '#a3b1c6',
};

// Dark Theme Color Palette
export const darkColors = {
  bgPrimary: '#2d3748',
  bgSecondary: '#1a202c',
  textPrimary: '#f7fafc',
  textSecondary: '#a0aec0',
  accentPrimary: '#667eea',
  accentSecondary: '#764ba2',
  success: '#48bb78',
  error: '#f56565',
  warning: '#ed8936',
  shadowLight: '#3a4556',
  shadowDark: '#1a1f2e',
};

// Default to dark theme
export const colors = darkColors;

// Neumorphic Shadow Styles
export const shadows = {
  small: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  medium: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  large: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
};

// Neumorphic Component Styles
export const neuStyles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    padding: 20,
  },

  // Card
  card: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 20,
    padding: 24,
    ...shadows.medium,
  },

  cardLarge: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 30,
    padding: 32,
    ...shadows.large,
  },

  // Button
  button: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },

  buttonPrimary: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },

  buttonDanger: {
    backgroundColor: colors.error,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },

  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },

  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Input
  input: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.shadowDark,
  },

  inputFocused: {
    borderColor: colors.accentPrimary,
    borderWidth: 2,
  },

  // Avatar
  avatar: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },

  avatarSmall: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 40,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },

  avatarText: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
  },

  avatarTextSmall: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },

  // Badge
  badge: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...shadows.small,
  },

  badgePrimary: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    ...shadows.small,
  },

  badgeText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },

  badgeTextPrimary: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Text Styles
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 12,
  },

  body: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
  },

  bodySecondary: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Section
  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.shadowDark,
    marginVertical: 16,
    opacity: 0.2,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  // Center
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Spacing
  mt8: { marginTop: 8 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mt32: { marginTop: 32 },
  mb8: { marginBottom: 8 },
  mb16: { marginBottom: 16 },
  mb24: { marginBottom: 24 },
  mb32: { marginBottom: 32 },
  mx8: { marginHorizontal: 8 },
  mx16: { marginHorizontal: 16 },
  my8: { marginVertical: 8 },
  my16: { marginVertical: 16 },
  p8: { padding: 8 },
  p16: { padding: 16 },
  p24: { padding: 24 },
  px16: { paddingHorizontal: 16 },
  py16: { paddingVertical: 16 },
});

// Helper function to create gradient effect (for LinearGradient)
export const gradients = {
  primary: [colors.accentPrimary, colors.accentSecondary],
  success: ['#48bb78', '#38a169'],
  error: ['#f56565', '#e53e3e'],
  warning: ['#ed8936', '#dd6b20'],
};
