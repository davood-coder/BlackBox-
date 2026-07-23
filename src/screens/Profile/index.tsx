import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentType } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppHeader, BottomNav, Card, Screen } from "../../components/ui";
import { images } from "../../assets/images";
import { colors, fonts, radius } from "../../theme";

const MenuIcon = Feather as ComponentType<any>;

const menu = [
  { label: "My Bookings", icon: "calendar", route: "MyBookings" },
  { label: "My Favorites", icon: "heart", route: "Barbers" },
  { label: "Payment Methods", icon: "credit-card", route: "BookingSummary" },
  { label: "Notifications", icon: "bell", route: "Profile" },
  { label: "Settings", icon: "settings", route: "Profile" },
  { label: "Help & Support", icon: "help-circle", route: "Profile" },
  { label: "Logout", icon: "log-out", route: "Login" }
];

export default function Profile({ navigation }) {
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
