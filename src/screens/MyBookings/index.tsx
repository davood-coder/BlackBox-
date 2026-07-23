import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, BottomNav, Card, Screen } from "../../components/ui";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

export default function MyBookings({ navigation }) {
  const [tab, setTab] = useState("Upcoming");
  const { bookings } = useBooking();

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <AppHeader title="My Bookings" onBack={() => navigation.navigate("Home")} right={<Feather name="search" size={20} color={colors.text} />} />
        <View style={styles.segment}>
          {["Upcoming", "Past"].map((item) => (
            <Pressable key={item} onPress={() => setTab(item)} style={[styles.segmentButton, tab === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, tab === item && styles.segmentTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.list}>
          {(tab === "Upcoming" ? bookings : bookings.slice(1)).map((booking, index) => (
            <Card key={`${booking.id || index}-${booking.date}-${booking.shop}`} style={styles.bookingCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.date}>{booking.date}</Text>
                <Text style={styles.shop}>{booking.shop}</Text>
                <Text style={styles.service}>{booking.service}</Text>
              </View>
              <View style={[styles.badge, booking.status === "Pending" && styles.pendingBadge]}>
                <Text style={[styles.badgeText, booking.status === "Pending" && styles.pendingText]}>{booking.status}</Text>
              </View>
            </Card>
          ))}
        </View>
      </Screen>
      <BottomNav active="Bookings" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  segment: {
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    flexDirection: "row",
    marginBottom: 18
  },
  segmentButton: {
    flex: 1,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentActive: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(212,168,90,0.08)"
  },
  segmentText: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 13
  },
  segmentTextActive: {
    color: colors.primary
  },
  list: {
    gap: 13
  },
  bookingCard: {
    minHeight: 108,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  date: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12
  },
  shop: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16,
    marginTop: 8
  },
  service: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 8
  },
  badge: {
    borderRadius: radius.full,
    backgroundColor: "rgba(48,209,88,0.13)",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  pendingBadge: {
    backgroundColor: "rgba(255,176,32,0.15)"
  },
  badgeText: {
    color: colors.success,
    fontFamily: fonts.medium,
    fontSize: 11
  },
  pendingText: {
    color: colors.warning
  }
});
