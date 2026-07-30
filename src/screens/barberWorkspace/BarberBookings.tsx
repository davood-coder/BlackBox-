import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BarberBottomNav, Screen } from "../../components/ui";
import type { Booking, BookingStatus } from "../../data";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

const tabs: Array<{ label: string; status: BookingStatus[] }> = [
  { label: "Pending", status: ["Pending"] },
  { label: "Accepted", status: ["Confirmed"] },
  { label: "Completed", status: ["Completed"] },
  { label: "Cancelled", status: ["Cancelled", "Rejected"] }
];

export default function BarberBookings({ navigation }: any) {
  const [tab, setTab] = useState("Pending");
  const { bookings, updateBookingStatus, setWorkspace } = useBooking();
  const activeTab = tabs.find((item) => item.label === tab) || tabs[0];
  const visibleBookings = useMemo(
    () => bookings.filter((booking) => activeTab.status.includes(booking.status)),
    [activeTab.status, bookings]
  );

  useEffect(() => setWorkspace("Barber"), [setWorkspace]);

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Operations</Text>
            <Text style={styles.title}>Booking management</Text>
          </View>
          <Pressable accessibilityLabel="Calendar view" style={styles.iconButton}>
            <Feather name="calendar" size={19} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.summaryBand}>
          <View>
            <Text style={styles.summaryLabel}>Today's floor</Text>
            <Text style={styles.summaryValue}>{bookings.filter((item) => item.status === "Confirmed").length + 3} appointments</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryValue}>{bookings.filter((item) => item.status === "Pending").length} requests</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {tabs.map((item) => (
            <Pressable key={item.label} onPress={() => setTab(item.label)} style={[styles.tab, tab === item.label && styles.tabActive]}>
              <Text style={[styles.tabText, tab === item.label && styles.tabTextActive]}>{item.label}</Text>
              <Text style={[styles.tabCount, tab === item.label && styles.tabCountActive]}>
                {bookings.filter((booking) => item.status.includes(booking.status)).length}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.list}>
          {visibleBookings.map((booking) => (
            <BookingRequest key={booking.id || booking.date} booking={booking} onUpdate={updateBookingStatus} />
          ))}
        </View>

        {!visibleBookings.length ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Feather name="inbox" size={23} color={colors.primaryDark} /></View>
            <Text style={styles.emptyTitle}>No {tab.toLowerCase()} bookings</Text>
            <Text style={styles.emptyCopy}>Bookings will move here as their status changes.</Text>
          </View>
        ) : null}
      </Screen>
      <BarberBottomNav active="Requests" navigation={navigation} />
    </View>
  );
}

function BookingRequest({ booking, onUpdate }: { booking: Booking; onUpdate: (bookingId: string, status: BookingStatus) => void }) {
  const canAccept = booking.status === "Pending";
  const canComplete = booking.status === "Confirmed";

  function callCustomer() {
    if (booking.customerPhone) Linking.openURL(`tel:${booking.customerPhone}`);
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(booking.customer || "C").charAt(0)}</Text></View>
        <View style={styles.customerCopy}>
          <Text style={styles.customer}>{booking.customer || "Cutzix customer"}</Text>
          <Text style={styles.phone}>{booking.customerPhone || "Phone not provided"}</Text>
        </View>
        <View style={[styles.statusBadge, statusBadgeStyle(booking.status)]}>
          <Text style={[styles.statusText, { color: statusColor(booking.status) }]}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.serviceBlock}>
        <View style={styles.serviceIcon}><Feather name="scissors" size={17} color={colors.primaryDark} /></View>
        <View style={styles.serviceCopy}>
          <Text style={styles.service}>{booking.service}</Text>
          <Text style={styles.barber}>{booking.barber || "Any barber"} · {booking.date}</Text>
        </View>
        <Text style={styles.price}>${booking.total || 0}</Text>
      </View>

      {booking.note ? (
        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Special notes</Text>
          <Text style={styles.notesText}>{booking.note}</Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <Meta icon="clock" value={booking.estimatedWait || "15 min wait"} />
        <Meta icon="credit-card" value={booking.paymentStatus || "Pending"} />
        <Meta icon="hash" value={booking.appointmentNumber || "New"} />
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityLabel="Call customer" onPress={callCustomer} style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]}>
          <Feather name="phone" size={17} color={colors.text} />
        </Pressable>
        {canAccept ? (
          <>
            <Pressable onPress={() => onUpdate(booking.id || "", "Rejected")} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
              <Text style={styles.rejectText}>Decline</Text>
            </Pressable>
            <Pressable onPress={() => onUpdate(booking.id || "", "Confirmed")} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
              <Text style={styles.primaryActionText}>Accept request</Text>
            </Pressable>
          </>
        ) : null}
        {canComplete ? (
          <>
            <Pressable onPress={() => onUpdate(booking.id || "", "Cancelled")} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
              <Text style={styles.rejectText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={() => onUpdate(booking.id || "", "Completed")} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
              <Text style={styles.primaryActionText}>Complete service</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

function Meta({ icon, value }: { icon: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon as any} size={11} color={colors.muted} />
      <Text style={styles.metaText} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function statusColor(status: BookingStatus) {
  if (status === "Pending") return colors.warning;
  if (status === "Confirmed") return colors.success;
  if (status === "Completed") return colors.info;
  return colors.error;
}

function statusBadgeStyle(status: BookingStatus) {
  if (status === "Pending") return styles.pendingBadge;
  if (status === "Confirmed") return styles.confirmedBadge;
  if (status === "Completed") return styles.completedBadge;
  return styles.cancelledBadge;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 9, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 24, marginTop: 4 },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  summaryBand: { minHeight: 82, borderRadius: radius.md, backgroundColor: colors.black, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginBottom: 18 },
  summaryLabel: { color: "#BFC1BD", fontFamily: fonts.medium, fontSize: 9, textTransform: "uppercase" },
  summaryValue: { color: colors.white, fontFamily: fonts.headingSemi, fontSize: 16, marginTop: 5 },
  summaryDivider: { width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.18)" },
  tabs: { minHeight: 48, flexDirection: "row", backgroundColor: colors.elevated, borderRadius: radius.sm, padding: 4, marginBottom: 18 },
  tab: { flex: 1, minWidth: 0, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  tabActive: { backgroundColor: colors.white },
  tabText: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 10 },
  tabTextActive: { color: colors.text, fontFamily: fonts.semibold },
  tabCount: { color: colors.muted, fontFamily: fonts.bold, fontSize: 8, marginTop: 2 },
  tabCountActive: { color: colors.primaryDark },
  list: { gap: 12 },
  card: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  avatarText: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 16 },
  customerCopy: { flex: 1, minWidth: 0 },
  customer: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  phone: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, marginTop: 3 },
  statusBadge: { borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 6 },
  pendingBadge: { backgroundColor: "rgba(169,105,0,0.1)" },
  confirmedBadge: { backgroundColor: "rgba(30,141,91,0.1)" },
  completedBadge: { backgroundColor: "rgba(40,116,189,0.1)" },
  cancelledBadge: { backgroundColor: "rgba(198,64,70,0.1)" },
  statusText: { fontFamily: fonts.semibold, fontSize: 9 },
  serviceBlock: { minHeight: 68, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  serviceIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  serviceCopy: { flex: 1, minWidth: 0 },
  service: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  barber: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 9, marginTop: 4 },
  price: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  notes: { borderRadius: radius.sm, backgroundColor: colors.background, padding: 10, marginTop: 12 },
  notesLabel: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 9, textTransform: "uppercase" },
  notesText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 4 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: 12 },
  metaItem: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { flex: 1, color: colors.muted, fontFamily: fonts.medium, fontSize: 8 },
  actions: { flexDirection: "row", gap: 8, marginTop: 14 },
  iconAction: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  secondaryAction: { flex: 1, minHeight: 42, borderRadius: radius.full, borderWidth: 1, borderColor: "#E5BFC1", alignItems: "center", justifyContent: "center" },
  rejectText: { color: colors.error, fontFamily: fonts.semibold, fontSize: 10 },
  primaryAction: { flex: 1.5, minHeight: 42, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  primaryActionText: { color: colors.black, fontFamily: fonts.bold, fontSize: 10 },
  empty: { minHeight: 310, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyIcon: { width: 58, height: 58, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  emptyTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 17, marginTop: 16 },
  emptyCopy: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, textAlign: "center", marginTop: 6 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
