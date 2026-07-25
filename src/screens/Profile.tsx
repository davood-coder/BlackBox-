import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentType } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppHeader, BottomNav, Card, Screen } from "../components/ui";
import { images } from "../assets/images";
import { useBooking } from "../state/BookingContext";
import { colors, fonts, radius } from "../theme";

const MenuIcon = Feather as ComponentType<any>;

const menu = [
  { label: "My Bookings", icon: "calendar", route: "MyBookings" },
  { label: "Favorite Barbers", icon: "heart", route: "Barbers" },
  { label: "Saved Style Photos", icon: "image", route: "Profile" },
  { label: "Payment Methods", icon: "credit-card", route: "BookingSummary" },
  { label: "Notifications", icon: "bell", route: "Profile" },
  { label: "Shop Dashboard", icon: "briefcase", route: "Profile" },
  { label: "Help & Support", icon: "help-circle", route: "Profile" },
  { label: "Logout", icon: "log-out", route: "Login" }
];

export default function Profile({ navigation }) {
  const [mode, setMode] = useState("Client");
  const { bookings, selectedBarber, selectedPreference } = useBooking();
  const confirmedCount = bookings.filter((booking) => booking.status === "Confirmed" || booking.status === "Pending").length;

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <AppHeader title="Profile" onBack={() => navigation.navigate("Home")} right={<Feather name="settings" size={20} color={colors.text} />} />
        <View style={styles.identity}>
          <Image source={images.masterBarber} style={styles.avatar} />
          <View>
            <Text style={styles.name}>Michael Johnson</Text>
            <Text style={styles.email}>michael@email.com</Text>
          </View>
        </View>
        <View style={styles.modeSwitch}>
          {["Client", "Barber"].map((item) => (
            <Pressable key={item} onPress={() => setMode(item)} style={[styles.modeButton, mode === item && styles.modeActive]}>
              <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{confirmedCount}</Text>
            <Text style={styles.statLabel}>Active Bookings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>420</Text>
            <Text style={styles.statLabel}>Reward Points</Text>
          </Card>
        </View>
        <Card style={styles.preferenceCard}>
          <View style={styles.preferenceHeader}>
            <Text style={styles.preferenceTitle}>{mode === "Client" ? "Grooming Profile" : "Barber Tools"}</Text>
            <Text style={styles.preferenceStatus}>{mode === "Client" ? selectedPreference.label : "Accepting bookings"}</Text>
          </View>
          <View style={styles.preferenceRow}>
            <ProfileMetric label={mode === "Client" ? "Favorite barber" : "Today queue"} value={mode === "Client" ? selectedBarber.name : "6 clients"} />
            <ProfileMetric label={mode === "Client" ? "Cadence" : "Payout"} value={mode === "Client" ? "Every 3 weeks" : "$680"} />
          </View>
        </Card>
        <Card style={styles.menuCard}>
          {menu.map((item, index) => (
            <Pressable key={item.label} onPress={() => navigation.navigate(item.route)} style={({ pressed }) => [styles.menuRow, index === menu.length - 1 && styles.lastRow, pressed && styles.pressed]}>
              <MenuIcon name={item.icon} size={18} color={colors.text} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>
          ))}
        </Card>
      </Screen>
      <BottomNav active="Profile" navigation={navigation} />
    </View>
  );
}

function ProfileMetric({ label, value }) {
  return (
    <View style={styles.profileMetric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 14,
    marginBottom: 28
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.primary
  },
  name: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 20
  },
  email: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    marginTop: 4
  },
  modeSwitch: {
    height: 48,
    flexDirection: "row",
    padding: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 16
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full
  },
  modeActive: {
    backgroundColor: colors.primary
  },
  modeText: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 13
  },
  modeTextActive: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  statCard: {
    flex: 1,
    minHeight: 82,
    justifyContent: "center"
  },
  statValue: {
    color: colors.primaryLight,
    fontFamily: fonts.heading,
    fontSize: 24
  },
  statLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 4
  },
  preferenceCard: {
    gap: 14,
    marginBottom: 16,
    borderColor: "rgba(212,168,90,0.26)",
    backgroundColor: "rgba(212,168,90,0.08)"
  },
  preferenceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10
  },
  preferenceTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 15
  },
  preferenceStatus: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11
  },
  preferenceRow: {
    flexDirection: "row",
    gap: 10
  },
  profileMetric: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.sm,
    backgroundColor: "rgba(15,17,21,0.38)",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10
  },
  metricValue: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
    marginTop: 4
  },
  menuCard: {
    padding: 0,
    borderRadius: radius.md,
    overflow: "hidden"
  },
  menuRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)"
  },
  lastRow: {
    borderBottomWidth: 0
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: "rgba(255,255,255,0.04)"
  }
});
