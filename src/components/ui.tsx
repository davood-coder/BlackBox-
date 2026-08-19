import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";
import { Animated, LayoutAnimation, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { colors, fonts, radius, shadows, spacing } from "../theme";
import { useBooking } from "../state/BookingContext";

export function useSafeThemeMode(): "light" | "dark" {
  try {
    const booking = useBooking();
    return booking?.themeMode || "light";
  } catch {
    return "light";
  }
}

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  bottomInset?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  animated?: boolean;
};

type AppHeaderProps = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
  center?: boolean;
  backVariant?: "plain" | "circle";
};

type ButtonProps = {
  label: string;
  icon?: string | null;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

type PrimaryButtonProps = ButtonProps & {
  dark?: boolean;
};

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

type FadeInViewProps = {
  children: ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
};

type PillProps = {
  label: string;
  active?: boolean;
  icon?: string;
  onPress?: () => void;
  compact?: boolean;
};

type FieldProps = {
  icon?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  returnKeyType?: TextInputProps["returnKeyType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  style?: StyleProp<ViewStyle>;
};

type BottomNavProps = {
  active: string;
  navigation: {
    navigate: (route: string, params?: unknown) => void;
  };
};

type RatingProps = {
  value?: string;
  count?: string;
  small?: boolean;
};

type SectionTitleProps = {
  title: string;
  action?: string;
  onAction?: () => void;
};

const AnyIonicon = Ionicons as ComponentType<any>;
const AnyFeather = Feather as ComponentType<any>;
const AnyMaterialCommunityIcon = MaterialCommunityIcons as ComponentType<any>;

export function Screen({ children, scroll = false, padded = true, bottomInset = false, style, contentStyle, animated = true }: ScreenProps) {
  const entry = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";

  useEffect(() => {
    if (!animated) return;
    Animated.timing(entry, {
      toValue: 1,
      duration: 360,
      useNativeDriver: true
    }).start();
  }, [animated, entry]);

  const entryStyle = {
    opacity: entry,
    transform: [
      {
        translateY: entry.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0]
        })
      }
    ]
  };

  const darkBgStyle = isDark ? { backgroundColor: "#121214" } : undefined;

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safe, darkBgStyle]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, padded && styles.padded, bottomInset && styles.bottomInset, contentStyle]}
          style={[styles.flex, style]}
        >
          <Animated.View style={[styles.scrollInner, entryStyle]}>{children}</Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, darkBgStyle]}>
      <Animated.View style={[styles.flex, padded && styles.padded, bottomInset && styles.bottomInset, style, entryStyle]}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
}

export function AppHeader({ title, onBack, right, center = true, backVariant = "plain" }: AppHeaderProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        onPress={onBack}
        style={({ pressed }) => [
          styles.headerBack,
          backVariant === "circle" && styles.headerBackCircle,
          isDark && { backgroundColor: "rgba(255, 255, 255, 0.12)" },
          pressed && styles.pressed
        ]}
      >
        <AnyFeather name="arrow-left" size={24} color={isDark ? "#FFFFFF" : colors.text} />
      </Pressable>
      <Text style={[styles.headerTitle, center && styles.headerCenter, isDark && { color: "#FFFFFF" }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function IconButton({ icon, onPress, active = false, family = "Feather", label }: { icon: string; onPress?: () => void; active?: boolean; family?: "Feather" | "Ionicons" | "MaterialCommunityIcons"; label?: string }) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  const Icon = family === "Ionicons" ? AnyIonicon : family === "MaterialCommunityIcons" ? AnyMaterialCommunityIcon : AnyFeather;
  return (
    <Pressable
      accessibilityLabel={label || icon}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        isDark && { backgroundColor: "rgba(255, 255, 255, 0.12)" },
        active && styles.iconButtonActive,
        pressed && styles.pressed
      ]}
    >
      <Icon name={icon} size={20} color={active ? colors.black : (isDark ? "#FFFFFF" : colors.text)} />
    </Pressable>
  );
}

export function PrimaryButton({ label, icon = "arrow-forward", onPress, dark = false, style }: PrimaryButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, dark && styles.goldButton, pressed && styles.pressed, style]}>
      <Text style={[styles.primaryButtonText, dark && styles.goldButtonText]}>{label}</Text>
      {icon ? <AnyIonicon name={icon} size={18} color={dark ? colors.black : colors.background} /> : null}
    </Pressable>
  );
}

export function GhostButton({ label, icon, onPress, style }: ButtonProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghostButton,
        isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255, 255, 255, 0.1)" },
        pressed && styles.pressed,
        style
      ]}
    >
      {icon ? <AnyFeather name={icon} size={16} color={isDark ? "#FFFFFF" : colors.text} /> : null}
      <Text style={[styles.ghostButtonText, isDark && { color: "#FFFFFF" }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: CardProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  return (
    <View style={[styles.card, isDark && styles.cardDark, style]}>
      {children}
    </View>
  );
}

export function FadeInView({ children, delay = 0, style }: FadeInViewProps) {
  const entry = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entry, {
      toValue: 1,
      duration: 420,
      delay,
      useNativeDriver: true
    }).start();
  }, [delay, entry]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: entry,
          transform: [
            {
              translateY: entry.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0]
              })
            }
          ]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

export function Pill({ label, active, icon, onPress, compact = false }: PillProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" },
        active && styles.pillActive,
        compact && styles.pillCompact,
        pressed && styles.pressed
      ]}
    >
      {icon ? <AnyFeather name={icon} size={compact ? 14 : 18} color={active ? colors.black : (isDark ? "#FFFFFF" : colors.text)} /> : null}
      <Text style={[styles.pillText, isDark && { color: "#E5E5EA" }, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ icon, placeholder, value, onChangeText, onSubmitEditing, secureTextEntry, keyboardType, returnKeyType, autoCapitalize, style }: FieldProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  return (
    <View style={[styles.field, isDark && styles.fieldDark, style]}>
      {icon ? <AnyFeather name={icon} size={18} color={isDark ? "#8E8E93" : colors.muted} /> : null}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#8E8E93" : colors.muted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        autoCapitalize={autoCapitalize}
        style={[styles.input, isDark && { color: "#FFFFFF" }]}
      />
    </View>
  );
}

export function BottomNav({ active, navigation }: BottomNavProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  const items = [
    { key: "Home", label: "Home", icon: "home-outline", activeIcon: "home", route: "Home" },
    { key: "Explore", label: "Explore", icon: "compass-outline", activeIcon: "compass", route: "SelectLocation", params: { nextScreen: "ShopProfile" } },
    { key: "Bookings", label: "Bookings", icon: "calendar-outline", activeIcon: "calendar", route: "MyBookings" },
    { key: "Profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "Profile" }
  ];

  return (
    <View style={styles.bottomNavWrap} pointerEvents="box-none">
      <View style={[styles.glassDockContainer, isDark && styles.glassDockContainerDark]}>
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                try {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                } catch {}
                navigation.navigate(item.route, "params" in item ? item.params : undefined);
              }}
              style={({ pressed }) => [
                styles.glassDockItem,
                isActive && (isDark ? styles.glassDockItemActiveDark : styles.glassDockItemActive),
                pressed && styles.pressed
              ]}
            >
              <AnyIonicon
                name={isActive ? item.activeIcon : item.icon}
                size={19}
                color={isActive ? (isDark ? "#FFFFFF" : colors.primaryDark) : (isDark ? "#8E8E93" : "#757575")}
              />
              <Text
                style={[
                  styles.glassNavLabel,
                  isActive ? (isDark ? { color: "#FFFFFF", fontFamily: fonts.bold } : styles.glassNavLabelActive) : (isDark ? { color: "#8E8E93" } : { color: "#757575" })
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function BarberBottomNav({ active, navigation }: BottomNavProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  const items = [
    { key: "Dashboard", label: "Dashboard", icon: "grid-outline", activeIcon: "grid", route: "BarberDashboard" },
    { key: "Requests", label: "Requests", icon: "calendar-outline", activeIcon: "calendar", route: "BarberBookings" },
    { key: "Business", label: "Business", icon: "briefcase-outline", activeIcon: "briefcase", route: "BusinessHub" },
    { key: "Profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "Profile" }
  ];

  return (
    <View style={styles.bottomNavWrap} pointerEvents="box-none">
      <View style={[styles.glassDockContainer, isDark && styles.glassDockContainerDark]}>
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                try {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                } catch {}
                navigation.navigate(item.route);
              }}
              style={({ pressed }) => [
                styles.glassDockItem,
                isActive && (isDark ? styles.glassDockItemActiveDark : styles.glassDockItemActive),
                pressed && styles.pressed
              ]}
            >
              <AnyIonicon
                name={isActive ? item.activeIcon : item.icon}
                size={19}
                color={isActive ? (isDark ? "#FFFFFF" : colors.primaryDark) : (isDark ? "#8E8E93" : "#757575")}
              />
              <Text
                style={[
                  styles.glassNavLabel,
                  isActive ? (isDark ? { color: "#FFFFFF", fontFamily: fonts.bold } : styles.glassNavLabelActive) : (isDark ? { color: "#8E8E93" } : { color: "#757575" })
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function IOSSegmentedControl<T extends string>({
  values,
  selectedValue,
  onChange
}: {
  values: { key: T; label: string; count?: number }[];
  selectedValue: T;
  onChange: (key: T) => void;
}) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  return (
    <View style={[styles.iosSegmentedTrack, isDark && { backgroundColor: "rgba(255, 255, 255, 0.08)" }]}>
      {values.map((item) => {
        const isSelected = selectedValue === item.key;
        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            style={({ pressed }) => [
              styles.iosSegmentedItem,
              isSelected && (isDark ? styles.iosSegmentedItemActiveDark : styles.iosSegmentedItemActive),
              pressed && styles.pressed
            ]}
          >
            <Text
              style={[
                styles.iosSegmentedText,
                isDark && { color: "#8E8E93" },
                isSelected && (isDark ? { color: "#FFFFFF", fontFamily: fonts.bold } : styles.iosSegmentedTextActive)
              ]}
            >
              {item.label}
            </Text>
            {item.count !== undefined ? (
              <View style={[styles.iosBadge, isDark && { backgroundColor: "rgba(255,255,255,0.12)" }, isSelected && (isDark ? { backgroundColor: "#C89A43" } : styles.iosBadgeActive)]}>
                <Text style={[styles.iosBadgeText, isDark && { color: "#FFFFFF" }, isSelected && (isDark ? { color: "#000000" } : styles.iosBadgeTextActive)]}>
                  {item.count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export function UniqueThemeToggle({
  selectedValue,
  onChange
}: {
  selectedValue: "light" | "dark";
  onChange: (mode: "light" | "dark") => void;
}) {
  const isDark = selectedValue === "dark";
  const animValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: isDark ? 1 : 0,
      friction: 7,
      tension: 55,
      useNativeDriver: false
    }).start();
  }, [isDark, animValue]);

  const trackBg = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FFEAB6", "#0B1D2D"]
  });

  const trackBorder = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#FAD7A0", "#1A3650"]
  });

  const thumbBg = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F5B041", "#38BDF8"]
  });

  const thumbLeft = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 43]
  });

  const textOpacityLight = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0]
  });

  const textOpacityDark = animValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1]
  });

  const handleToggle = () => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // fallback
    }
    onChange(isDark ? "light" : "dark");
  };

  return (
    <View style={[styles.dayNightCard, isDark && styles.dayNightCardDark]}>
      <View style={styles.dayNightRow}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={[styles.dayNightHeaderIcon, isDark ? styles.dayNightHeaderIconDark : styles.dayNightHeaderIconLight]}>
            <AnyFeather name={isDark ? "moon" : "sun"} size={18} color={isDark ? "#38BDF8" : "#F5B041"} />
          </View>
          <View>
            <Text style={[styles.dayNightTitle, isDark && { color: "#FFFFFF" }]}>
              {isDark ? "Dark Mode" : "Light Mode"}
            </Text>
            <Text style={[styles.dayNightSubtitle, isDark && { color: "#8E8E93" }]}>
              {isDark ? "Cosmic Night Theme" : "Solar Day Theme"}
            </Text>
          </View>
        </View>

        {/* Custom Animated Day/Night Solar & Lunar Switch */}
        <Pressable
          accessibilityLabel="Toggle Theme Mode"
          onPress={handleToggle}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Animated.View
            style={[
              styles.dayNightSwitchTrack,
              { backgroundColor: trackBg, borderColor: trackBorder }
            ]}
          >
            {/* Internal Track Labels with Fade Interpolation */}
            <Animated.Text style={[styles.dayNightTrackLabel, styles.dayNightTrackLabelLight, { opacity: textOpacityLight }]}>
              Light
            </Animated.Text>
            <Animated.Text style={[styles.dayNightTrackLabel, styles.dayNightTrackLabelDark, { opacity: textOpacityDark }]}>
              Dark
            </Animated.Text>

            {/* Glowing Solar/Lunar Thumb Orb with Spring Movement */}
            <Animated.View
              style={[
                styles.dayNightThumb,
                {
                  left: thumbLeft,
                  backgroundColor: thumbBg
                }
              ]}
            >
              <AnyFeather name={isDark ? "moon" : "sun"} size={17} color="#FFFFFF" />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}

export function Rating({ value = "4.9", count, small = false }: RatingProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  return (
    <View style={styles.ratingRow}>
      <AnyIonicon name="star" size={small ? 12 : 16} color={colors.primaryLight} />
      <Text style={[styles.ratingText, small && styles.smallText, isDark && { color: "#FFFFFF" }]}>{value}</Text>
      {count ? <Text style={[styles.mutedText, small && styles.smallText, isDark && { color: "#8E8E93" }]}>({count})</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: SectionTitleProps) {
  const themeMode = useSafeThemeMode();
  const isDark = themeMode === "dark";
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, isDark && { color: "#FFFFFF" }]}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  flex: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  scrollInner: {
    flexGrow: 1
  },
  padded: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12
  },
  bottomInset: {
    paddingBottom: 96
  },
  header: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 14
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(118, 118, 128, 0.12)"
  },
  headerBackCircle: {
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "rgba(118, 118, 128, 0.12)"
  },
  headerTitle: {
    flex: 1,
    color: "#000000",
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    letterSpacing: -0.4
  },
  headerCenter: {
    textAlign: "center"
  },
  headerRight: {
    width: 36,
    alignItems: "flex-end"
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(118, 118, 128, 0.12)"
  },
  iconButtonActive: {
    backgroundColor: colors.primary
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    ...shadows.card
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16
  },
  goldButton: {
    backgroundColor: colors.primary
  },
  goldButtonText: {
    color: colors.black
  },
  ghostButton: {
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.white
  },
  ghostButtonText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 15
  },
  card: {
    backgroundColor: colors.card,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderWidth: 0.5,
    borderRadius: 16,
    padding: 16,
    ...shadows.card
  },
  cardDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  pill: {
    minHeight: 52,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: colors.border
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  pillCompact: {
    minHeight: 40,
    minWidth: 64
  },
  pillText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 13
  },
  pillTextActive: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  field: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10
  },
  fieldDark: {
    backgroundColor: "#252528",
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    paddingVertical: 0
  },
  bottomNavWrap: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 22,
    zIndex: 99
  },
  glassDockContainer: {
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.95)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10
  },
  glassDockContainerDark: {
    backgroundColor: "#161719",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  glassDockItem: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 6
  },
  glassDockItemActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  glassDockItemActiveDark: {
    backgroundColor: "#343538",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5
  },
  glassNavLabel: {
    color: "#8E8E93",
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: -0.1
  },
  glassNavLabelActive: {
    color: "#000000",
    fontFamily: fonts.bold,
    fontSize: 12
  },
  quickActionSub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2
  },
  iosSegmentedTrack: {
    flexDirection: "row",
    backgroundColor: "rgba(118, 118, 128, 0.12)",
    borderRadius: 10,
    padding: 3,
    marginVertical: 10
  },
  iosSegmentedItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5
  },
  iosSegmentedItemActive: {
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  iosSegmentedItemActiveDark: {
    backgroundColor: "#2C2C2E",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3
  },
  iosSegmentedText: {
    color: "#3C3C43",
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: -0.2
  },
  iosSegmentedTextActive: {
    color: "#000000",
    fontFamily: fonts.bold
  },
  iosBadge: {
    backgroundColor: "rgba(118, 118, 128, 0.16)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1
  },
  iosBadgeActive: {
    backgroundColor: colors.primarySoft
  },
  iosBadgeText: {
    color: colors.secondaryText,
    fontFamily: fonts.bold,
    fontSize: 11
  },
  iosBadgeTextActive: {
    color: colors.primaryDark
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  ratingText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  mutedText: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13
  },
  smallText: {
    fontSize: 12
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 6
  },
  sectionTitle: {
    color: "#000000",
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    letterSpacing: -0.4
  },
  sectionAction: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  },
  dayNightCard: {
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  dayNightCardDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  dayNightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dayNightHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  dayNightHeaderIconLight: {
    backgroundColor: "rgba(245, 176, 65, 0.14)",
    borderColor: "rgba(245, 176, 65, 0.28)"
  },
  dayNightHeaderIconDark: {
    backgroundColor: "rgba(56, 189, 248, 0.14)",
    borderColor: "rgba(56, 189, 248, 0.28)"
  },
  dayNightTitle: {
    color: "#000000",
    fontFamily: fonts.bold,
    fontSize: 15
  },
  dayNightSubtitle: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 1
  },
  dayNightSwitchTrack: {
    width: 86,
    height: 42,
    borderRadius: 21,
    position: "relative",
    justifyContent: "center",
    paddingHorizontal: 3
  },
  dayNightSwitchTrackLight: {
    backgroundColor: "#FFEAB6",
    borderWidth: 1,
    borderColor: "#FAD7A0"
  },
  dayNightSwitchTrackDark: {
    backgroundColor: "#0B1D2D",
    borderWidth: 1,
    borderColor: "#1A3650"
  },
  dayNightThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  dayNightThumbLight: {
    backgroundColor: "#F5B041",
    alignSelf: "flex-start"
  },
  dayNightThumbDark: {
    backgroundColor: "#38BDF8",
    alignSelf: "flex-end"
  },
  dayNightTrackLabel: {
    position: "absolute",
    fontFamily: fonts.bold,
    fontSize: 12
  },
  dayNightTrackLabelLight: {
    right: 12,
    color: "#7D5A29"
  },
  dayNightTrackLabelDark: {
    left: 12,
    color: "#94A3B8"
  }
});


