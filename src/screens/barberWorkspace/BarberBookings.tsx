import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BarberBottomNav, IOSSegmentedControl, Screen } from "../../components/ui";
import type { Booking, BookingStatus } from "../../data";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

const tabs: Array<{ key: string; label: string; status: BookingStatus[] }> = [
  { key: "Pending", label: "Pending", status: ["Pending"] },
  { key: "Accepted", label: "Accepted", status: ["Confirmed"] },
  { key: "Completed", label: "Completed", status: ["Completed"] },
  { key: "Cancelled", label: "Cancelled", status: ["Cancelled", "Rejected"] }
];

export default function BarberBookings({ navigation }: any) {
  const [tab, setTab] = useState("Pending");
  const { bookings, updateBookingStatus, setWorkspace, currency, themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const activeTab = tabs.find((item) => item.key === tab) || tabs[0];
  const visibleBookings = useMemo(
    () => bookings.filter((booking) => activeTab.status.includes(booking.status)),
    [activeTab.status, bookings]
  );

  useEffect(() => setWorkspace("Barber"), [setWorkspace]);

  const segmentedValues = tabs.map((item) => ({
    key: item.key,
    label: item.label,
    count: bookings.filter((booking) => item.status.includes(booking.status)).length
  }));

  return (
    <View style={[styles.root, isDark && { backgroundColor: "#121214" }]}>
      <Screen scroll bottomInset>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>OPERATIONS</Text>
            <Text style={[styles.title, isDark && { color: "#FFFFFF" }]}>Requests</Text>
          </View>
        </View>

        <View style={styles.summaryBand}>
          <View>
            <Text style={styles.summaryLabel}>TODAY'S FLOOR</Text>
            <Text style={styles.summaryValue}>{bookings.filter((item) => item.status === "Confirmed").length + 3} Appointments</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={styles.summaryLabel}>PENDING</Text>
            <Text style={styles.summaryValue}>{bookings.filter((item) => item.status === "Pending").length} Requests</Text>
          </View>
        </View>

        <IOSSegmentedControl
          values={segmentedValues}
          selectedValue={tab}
          onChange={(newTab) => setTab(newTab)}
        />

        <View style={styles.list}>
          {visibleBookings.map((booking) => (
            <BookingRequest key={booking.id || booking.date} booking={booking} onUpdate={updateBookingStatus} />
          ))}
        </View>

        {!visibleBookings.length ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}><Feather name="inbox" size={24} color="#946B22" /></View>
            <Text style={[styles.emptyTitle, isDark && { color: "#FFFFFF" }]}>No {tab} Bookings</Text>
            <Text style={[styles.emptyCopy, isDark && { color: "#8E8E93" }]}>Bookings will move here as their status changes.</Text>
          </View>
        ) : null}
      </Screen>
      <BarberBottomNav active="Requests" navigation={navigation} />
    </View>
  );
}

function BookingRequest({ booking, onUpdate }: { booking: Booking; onUpdate: (bookingId: string, status: BookingStatus) => void }) {
  const { currency, themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const canAccept = booking.status === "Pending";
  const canComplete = booking.status === "Confirmed";

  function callCustomer() {
    if (booking.customerPhone) Linking.openURL(`tel:${booking.customerPhone}`);
  }

  return (
    <View style={[styles.card, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }]}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{(booking.customer || "C").charAt(0)}</Text></View>
        <View style={styles.customerCopy}>
          <Text style={[styles.customer, isDark && { color: "#FFFFFF" }]}>{booking.customer || "Cutzix Customer"}</Text>
          <Text style={[styles.phone, isDark && { color: "#8E8E93" }]}>{booking.customerPhone || "Phone Not Provided"}</Text>
        </View>
        <View style={[styles.statusBadge, statusBadgeStyle(booking.status)]}>
          <Text style={[styles.statusText, { color: statusColor(booking.status) }]}>{booking.status}</Text>
        </View>
      </View>

      <View style={[styles.serviceBlock, isDark && { borderColor: "rgba(255,255,255,0.08)" }]}>
        <View style={styles.serviceIcon}><Feather name="scissors" size={16} color="#946B22" /></View>
        <View style={styles.serviceCopy}>
          <Text style={[styles.service, isDark && { color: "#FFFFFF" }]}>{booking.service}</Text>
          <Text style={[styles.barber, isDark && { color: "#8E8E93" }]}>{booking.barber || "Any Barber"} · {booking.date}</Text>
        </View>
        <Text style={[styles.price, isDark && { color: "#FFFFFF" }]}>{currency.symbol}{booking.total || 0}</Text>
      </View>

      {booking.note ? (
        <View style={[styles.notes, isDark && { backgroundColor: "#252528" }]}>
          <Text style={styles.notesLabel}>SPECIAL NOTES</Text>
          <Text style={[styles.notesText, isDark && { color: "#E5E5EA" }]}>{booking.note}</Text>
        </View>
      ) : null}

      <View style={styles.metaRow}>
        <Meta icon="clock" value={booking.estimatedWait || "15 Min Wait"} isDark={isDark} />
        <Meta icon="credit-card" value={booking.paymentStatus || "Pending"} isDark={isDark} />
        <Meta icon="hash" value={booking.appointmentNumber || "New"} isDark={isDark} />
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityLabel="Call customer" onPress={callCustomer} style={({ pressed }) => [styles.iconAction, isDark && { backgroundColor: "rgba(255,255,255,0.12)" }, pressed && styles.pressed]}>
          <Feather name="phone" size={16} color={isDark ? "#FFFFFF" : colors.text} />
        </Pressable>
        {canAccept ? (
          <>
            <Pressable onPress={() => onUpdate(booking.id || "", "Rejected")} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
              <Text style={styles.rejectText}>Decline</Text>
            </Pressable>
            <Pressable onPress={() => onUpdate(booking.id || "", "Confirmed")} style={({ pressed }) => [styles.primaryAction, isDark && { backgroundColor: "#C89A43" }, pressed && styles.pressed]}>
              <Text style={[styles.primaryActionText, isDark && { color: "#000000" }]}>Accept Request</Text>
            </Pressable>
          </>
        ) : null}
        {canComplete ? (
          <>
            <Pressable onPress={() => onUpdate(booking.id || "", "Cancelled")} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
              <Text style={styles.rejectText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={() => onUpdate(booking.id || "", "Completed")} style={({ pressed }) => [styles.primaryAction, isDark && { backgroundColor: "#C89A43" }, pressed && styles.pressed]}>
              <Text style={[styles.primaryActionText, isDark && { color: "#000000" }]}>Complete Service</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

function Meta({ icon, value, isDark }: { icon: string; value: string; isDark?: boolean }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon as any} size={11} color={isDark ? "#8E8E93" : colors.muted} />
      <Text style={[styles.metaText, isDark && { color: "#8E8E93" }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function statusColor(status: BookingStatus) {
  if (status === "Pending") return "#FF9500";
  if (status === "Confirmed") return "#34C759";
  if (status === "Completed") return "#007AFF";
  return "#FF3B30";
}

function statusBadgeStyle(status: BookingStatus) {
  if (status === "Pending") return styles.pendingBadge;
  if (status === "Confirmed") return styles.confirmedBadge;
  if (status === "Completed") return styles.completedBadge;
  return styles.cancelledBadge;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16, marginBottom: 16 },
  eyebrow: { color: "#3C3C43", fontFamily: fonts.bold, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  title: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 32, letterSpacing: -0.5, marginTop: 2 },
  summaryBand: { minHeight: 76, borderRadius: 16, backgroundColor: colors.black, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginBottom: 6 },
  summaryLabel: { color: "#BFC1BD", fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 0.5 },
  summaryValue: { color: colors.white, fontFamily: fonts.headingSemi, fontSize: 20, marginTop: 4 },
  summaryDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.18)" },
  list: { gap: 12, marginTop: 4 },
  card: { borderRadius: 16, backgroundColor: colors.white, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)", padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  avatarText: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 16 },
  customerCopy: { flex: 1, minWidth: 0 },
  customer: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 16, letterSpacing: -0.3 },
  phone: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pendingBadge: { backgroundColor: "rgba(255,149,0,0.12)" },
  confirmedBadge: { backgroundColor: "rgba(52,199,89,0.12)" },
  completedBadge: { backgroundColor: "rgba(0,122,255,0.12)" },
  cancelledBadge: { backgroundColor: "rgba(255,59,48,0.12)" },
  statusText: { fontFamily: fonts.semibold, fontSize: 11 },
  serviceBlock: { minHeight: 60, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: "#E5E5EA", flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, marginVertical: 10, paddingVertical: 8 },
  serviceIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  serviceCopy: { flex: 1, minWidth: 0 },
  service: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  barber: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  price: { color: colors.text, fontFamily: fonts.bold, fontSize: 17 },
  notes: { borderRadius: 10, backgroundColor: "#F2F2F7", padding: 10, marginTop: 8 },
  notesLabel: { color: "#6C6C70", fontFamily: fonts.semibold, fontSize: 10, letterSpacing: 0.5 },
  notesText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, marginTop: 2 },
  metaRow: { flexDirection: "row", gap: 6, marginTop: 10 },
  metaItem: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { flex: 1, color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
  actions: { flexDirection: "row", gap: 8, marginTop: 14 },
  iconAction: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(118,118,128,0.12)", alignItems: "center", justifyContent: "center" },
  secondaryAction: { flex: 1, minHeight: 40, borderRadius: 20, backgroundColor: "rgba(255,59,48,0.1)", alignItems: "center", justifyContent: "center" },
  rejectText: { color: "#FF3B30", fontFamily: fonts.semibold, fontSize: 13 },
  primaryAction: { flex: 1.5, minHeight: 40, borderRadius: 20, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" },
  primaryActionText: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 },
  empty: { minHeight: 260, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyIcon: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  emptyTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 17, marginTop: 14 },
  emptyCopy: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, textAlign: "center", marginTop: 4 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] }
});

