import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, BottomNav, Card, FadeInView, Screen } from "../../components/ui";
import type { Booking } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

export default function MyBookings({ navigation }) {
  const [tab, setTab] = useState("Upcoming");
  const { bookings, currency } = useBooking();
  const upcomingBookings = bookings.filter((booking) => booking.status === "Confirmed" || booking.status === "Pending");
  const pastBookings = bookings.filter((booking) => booking.status === "Completed");
  const cancelledBookings = bookings.filter((booking) => booking.status === "Cancelled" || booking.status === "Rejected");
  const visibleBookings = tab === "Upcoming" ? upcomingBookings : tab === "Past" ? pastBookings : cancelledBookings;

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <AppHeader title="My Bookings" onBack={() => goBackOrNavigate(navigation, "Home")} right={<Feather name="search" size={20} color={colors.text} />} />
        <Card style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Next appointment</Text>
            <Text style={styles.summaryTitle}>{upcomingBookings[0]?.shop || "No upcoming visit"}</Text>
            <Text style={styles.summaryMeta}>{upcomingBookings[0]?.date || "Book a chair when you are ready"}</Text>
          </View>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryPillText}>{upcomingBookings.length} active</Text>
          </View>
        </Card>
        <View style={styles.segment}>
          {["Upcoming", "Past", "Cancelled"].map((item) => (
            <Pressable key={item} onPress={() => setTab(item)} style={[styles.segmentButton, tab === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, tab === item && styles.segmentTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.list}>
          {visibleBookings.map((booking, index) => (
            <FadeInView key={`${booking.id || index}-${booking.date}-${booking.shop}`} delay={index * 55}>
              <Card style={styles.bookingCard}>
                <View style={styles.bookingTop}>
                  <View style={styles.bookingCopy}>
                    <Text style={styles.date}>{booking.date}</Text>
                    <Text style={styles.shop}>{booking.shop}</Text>
                    <Text style={styles.service}>{booking.service}{booking.barber ? ` with ${booking.barber}` : ""}</Text>
                    {booking.addOns?.length ? <Text style={styles.addOns}>{booking.addOns.join(" + ")}</Text> : null}
                  </View>
                  <View style={[styles.badge, getStatusBadgeStyle(booking)]}>
                    <Text style={[styles.badgeText, getStatusTextStyle(booking)]}>{booking.status}</Text>
                  </View>
                </View>
                <View style={styles.bookingFooter}>
                  <Text style={styles.totalText}>{booking.total ? `${currency.symbol}${booking.total}` : "Total pending"}</Text>
                  <View style={styles.actionRow}>
                    <Pressable onPress={() => navigation.navigate("BookingDetails", { bookingId: booking.id })} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
                      <Text style={styles.actionText}>Details</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => booking.status === "Completed"
                        ? navigation.navigate("BookingDetails", { bookingId: booking.id })
                        : navigation.navigate("SelectLocation", { nextScreen: "BookAppointment" })}
                      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
                    >
                      <Text style={styles.actionText}>{booking.status === "Completed" ? "Receipt" : "Reschedule"}</Text>
                    </Pressable>
                  </View>
                </View>
              </Card>
            </FadeInView>
          ))}
        </View>
        {!visibleBookings.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No {tab.toLowerCase()} bookings</Text>
            <Text style={styles.emptyCopy}>Your appointments will appear here as soon as they are created.</Text>
          </View>
        ) : null}
      </Screen>
      <BottomNav active="Bookings" navigation={navigation} />
    </View>
  );
}

function getStatusBadgeStyle(booking: Booking) {
  if (booking.status === "Pending") return styles.pendingBadge;
  if (booking.status === "Completed") return styles.completedBadge;
  if (booking.status === "Cancelled" || booking.status === "Rejected") return styles.cancelledBadge;
  return styles.confirmedBadge;
}

function getStatusTextStyle(booking: Booking) {
  if (booking.status === "Pending") return styles.pendingText;
  if (booking.status === "Completed") return styles.completedText;
  if (booking.status === "Cancelled" || booking.status === "Rejected") return styles.cancelledText;
  return styles.confirmedText;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  summaryCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16
  },
  summaryLabel: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: "uppercase"
  },
  summaryTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    marginTop: 6
  },
  summaryMeta: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4
  },
  summaryPill: {
    minWidth: 70,
    minHeight: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(77,171,247,0.14)"
  },
  summaryPillText: {
    color: colors.info,
    fontFamily: fonts.semibold,
    fontSize: 11
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
    fontSize: 16
  },
  segmentTextActive: {
    color: colors.primary
  },
  list: {
    gap: 13
  },
  bookingCard: {
    minHeight: 108,
    gap: 12
  },
  bookingTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  bookingCopy: {
    flex: 1,
    minWidth: 0
  },
  date: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16
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
    fontSize: 16,
    marginTop: 8
  },
  addOns: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 7
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  confirmedBadge: {
    backgroundColor: "rgba(48,209,88,0.13)"
  },
  pendingBadge: {
    backgroundColor: "rgba(255,176,32,0.15)"
  },
  completedBadge: {
    backgroundColor: "rgba(77,171,247,0.15)"
  },
  cancelledBadge: {
    backgroundColor: "rgba(255,90,95,0.14)"
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11
  },
  confirmedText: {
    color: colors.success
  },
  pendingText: {
    color: colors.warning
  },
  completedText: {
    color: colors.info
  },
  cancelledText: {
    color: colors.error
  },
  bookingFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  totalText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15
  },
  actionRow: {
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    minHeight: 34,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.divider,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  actionText: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 16
  },
  emptyState: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    textAlign: "center"
  },
  emptyCopy: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6,
    textAlign: "center"
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }]
  }
});
