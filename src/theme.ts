export const colors = {
  background: "#F2F2F7", // iOS System Grouped Background
  backgroundWarm: "#F8F8FA",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  elevated: "#F2F2F7",
  modal: "#FFFFFF",
  navigation: "#FFFFFF",
  mediaBackground: "#0F1115",
  primary: "#C89A43",
  primaryLight: "#D7A84F",
  primarySoft: "#F4EBD9",
  primaryDark: "#946B22",
  text: "#000000",
  textWarm: "#1C1C1E",
  secondaryText: "#6C6C70",
  muted: "#8E8E93",
  disabled: "#C7C7CC",
  border: "#E5E5EA",
  divider: "#E5E5EA",
  input: "#FFFFFF",
  cream: "#F2E8DE",
  creamMuted: "#D8CDBF",
  success: "#34C759", // iOS Success Green
  warning: "#FF9500", // iOS Warning Orange
  error: "#FF3B30", // iOS Destructive Red
  info: "#007AFF", // iOS System Blue
  black: "#000000",
  white: "#FFFFFF"
};

export function getThemeColors(isDark: boolean) {
  if (isDark) {
    return {
      background: "#121214",
      backgroundWarm: "#18181B",
      surface: "#1C1C1E",
      card: "#1C1C1E",
      elevated: "#252528",
      modal: "#1C1C1E",
      navigation: "#1C1C1E",
      text: "#FFFFFF",
      textWarm: "#FFFFFF",
      secondaryText: "#8E8E93",
      muted: "#8E8E93",
      disabled: "#3A3A3C",
      border: "rgba(255,255,255,0.08)",
      divider: "rgba(255,255,255,0.08)",
      input: "#252528",
      primary: "#C89A43",
      primarySoft: "rgba(200,154,67,0.18)",
      primaryDark: "#C89A43",
      success: "#34C759",
      warning: "#FF9500",
      error: "#FF3B30",
      info: "#007AFF",
      white: "#FFFFFF",
      black: "#000000"
    };
  }
  return {
    background: "#F2F2F7",
    backgroundWarm: "#F8F8FA",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    elevated: "#F2F2F7",
    modal: "#FFFFFF",
    navigation: "#FFFFFF",
    text: "#000000",
    textWarm: "#1C1C1E",
    secondaryText: "#6C6C70",
    muted: "#8E8E93",
    disabled: "#C7C7CC",
    border: "#E5E5EA",
    divider: "#E5E5EA",
    input: "#FFFFFF",
    primary: "#C89A43",
    primarySoft: "#F4EBD9",
    primaryDark: "#946B22",
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#007AFF",
    white: "#FFFFFF",
    black: "#000000"
  };
}

export const fonts = {
  heading: "PlusJakartaSans_700Bold",
  headingHeavy: "PlusJakartaSans_800ExtraBold",
  headingSemi: "PlusJakartaSans_600SemiBold",
  body: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: 16
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  sheet: 28,
  full: 999
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  segmented: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  }
};

