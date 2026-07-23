import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import type { ComponentType, ReactNode } from "react";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";
import { Animated, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, fonts, radius, shadows, spacing } from "../theme";

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

  if (scroll) {
    return (
      <SafeAreaView style={styles.safe}>
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
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.flex, padded && styles.padded, bottomInset && styles.bottomInset, style, entryStyle]}>
        {children}
      </Animated.View>
    </SafeAreaView>
  );
}

export function AppHeader({ title, onBack, right, center = true, backVariant = "plain" }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Go back"
        onPress={onBack}
        style={({ pressed }) => [styles.headerBack, backVariant === "circle" && styles.headerBackCircle, pressed && styles.pressed]}
      >
        <AnyFeather name="arrow-left" size={24} color={colors.text} />
      </Pressable>
      <Text style={[styles.headerTitle, center && styles.headerCenter]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function IconButton({ icon, onPress, active = false, family = "Feather", label }: { icon: string; onPress?: () => void; active?: boolean; family?: "Feather" | "Ionicons" | "MaterialCommunityIcons"; label?: string }) {
  const Icon = family === "Ionicons" ? AnyIonicon : family === "MaterialCommunityIcons" ? AnyMaterialCommunityIcon : AnyFeather;
  return (
    <Pressable accessibilityLabel={label || icon} onPress={onPress} style={({ pressed }) => [styles.iconButton, active && styles.iconButtonActive, pressed && styles.pressed]}>
      <Icon name={icon} size={20} color={active ? colors.black : colors.text} />
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
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostButton, pressed && styles.pressed, style]}>
      {icon ? <AnyFeather name={icon} size={16} color={colors.text} /> : null}
      <Text style={styles.ghostButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Pill({ label, active, icon, onPress, compact = false }: PillProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.pill, active && styles.pillActive, compact && styles.pillCompact, pressed && styles.pressed]}>
      {icon ? <AnyFeather name={icon} size={compact ? 14 : 18} color={active ? colors.black : colors.text} /> : null}
      <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ icon, placeholder, value, onChangeText, onSubmitEditing, secureTextEntry, keyboardType, returnKeyType, autoCapitalize, style }: FieldProps) {
  return (
    <View style={[styles.field, style]}>
      {icon ? <AnyFeather name={icon} size={18} color={colors.muted} /> : null}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

export function BottomNav({ active, navigation }: BottomNavProps) {
  const items = [
    { key: "Home", label: "Home", icon: "home-outline", activeIcon: "home", route: "Home" },
    { key: "Bookings", label: "Bookings", icon: "calendar-outline", activeIcon: "calendar", route: "MyBookings" },
    { key: "Barbers", label: "Barbers", icon: "people-outline", activeIcon: "people", route: "SelectLocation", params: { nextScreen: "Barbers" } },
    { key: "Profile", label: "Profile", icon: "person-outline", activeIcon: "person", route: "Profile" }
  ];

  return (
    <View style={styles.bottomNavWrap} pointerEvents="box-none">
      <LinearGradient colors={["rgba(17,21,28,0.92)", "rgba(17,21,28,0.98)"]} style={styles.bottomNav}>
        {items.map((item) => {
          const isActive = active === item.key;
          return (
            <Pressable key={item.key} onPress={() => navigation.navigate(item.route, "params" in item ? item.params : undefined)} style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
              <AnyIonicon name={isActive ? item.activeIcon : item.icon} size={21} color={isActive ? colors.primary : colors.muted} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
              {isActive ? <View style={styles.navDot} /> : null}
            </Pressable>
          );
        })}
      </LinearGradient>
    </View>
  );
}

export function Rating({ value = "4.9", count, small = false }: RatingProps) {
  return (
    <View style={styles.ratingRow}>
      <AnyIonicon name="star" size={small ? 12 : 16} color={colors.primaryLight} />
      <Text style={[styles.ratingText, small && styles.smallText]}>{value}</Text>
      {count ? <Text style={[styles.mutedText, small && styles.smallText]}>({count})</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, action, onAction }: SectionTitleProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
    paddingHorizontal: spacing.screen
  },
  bottomInset: {
    paddingBottom: 102
  },
  header: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
  },
  headerBack: {
    width: 42,
    height: 42,
    alignItems: "flex-start",
    justifyContent: "center"
  },
  headerBackCircle: {
    alignItems: "center",
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.05)"
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 16
  },
  headerCenter: {
    textAlign: "center"
  },
  headerRight: {
    width: 42,
    alignItems: "flex-end"
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)"
  },
  iconButtonActive: {
    backgroundColor: colors.primary
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.full,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    ...shadows.card
  },
  primaryButtonText: {
    color: colors.background,
    fontFamily: fonts.bold,
    fontSize: 15
  },
  goldButton: {
    backgroundColor: colors.primary
  },
  goldButtonText: {
    color: colors.black
  },
  ghostButton: {
    minHeight: 52,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#4A5363",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.02)"
  },
  ghostButtonText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  card: {
    backgroundColor: "rgba(30,34,43,0.9)",
    borderColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: 14,
    ...shadows.card
  },
  pill: {
    minHeight: 58,
    minWidth: 74,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  pillCompact: {
    minHeight: 42,
    minWidth: 66
  },
  pillText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  pillTextActive: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  field: {
    minHeight: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingVertical: 0
  },
  bottomNavWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 0,
    paddingBottom: 0
  },
  bottomNav: {
    height: 88,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    overflow: "hidden",
    ...shadows.floating
  },
  navItem: {
    width: 82,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  navLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11
  },
  navLabelActive: {
    color: colors.primary
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    position: "absolute",
    bottom: 4
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
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16
  },
  sectionAction: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  }
});
