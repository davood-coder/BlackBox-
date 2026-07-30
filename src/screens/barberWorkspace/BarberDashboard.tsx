import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BarberBottomNav, Screen } from "../../components/ui";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, shadows } from "../../theme";

export default function BarberDashboard({ navigation }: any) {
  const { bookings, updateBookingStatus, setWorkspace, unreadNotificationCount } = useBooking();
  const [acceptingBookings, setAcceptingBookings] = useState(true);
  const pending = bookings.filter((booking) => booking.status === "Pending");
  const confirmed = bookings.filter((booking) => booking.status === "Confirmed");
  const completed = bookings.filter((booking) => booking.status === "Completed");
  const revenue = completed.reduce((total, booking) => total + (booking.total || 0), 0) + 680;

  useEffect(() => setWorkspace("Barber"), [setWorkspace]);

  function switchToCustomer() {
    setWorkspace("Customer");
    navigation.replace("Home");
  }

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <View style={styles.header}>
          <View>
            <View style={styles.proRow}>
              <Text style={styles.brand}>Cutzix</Text>
              <View style={styles.proBadge}><Text style={styles.proText}>PRO</Text></View>
            </View>
            <Text style={styles.shop}>Black Box Barbershop</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Notifications" onPress={() => navigation.navigate("Notifications")} style={styles.iconButton}>
              <Feather name="bell" size={19} color={colors.text} />
              {unreadNotificationCount ? <View style={styles.notificationDot}><Text style={styles.notificationCount}>{unreadNotificationCount}</Text></View> : null}
            </Pressable>
            <Pressable accessibilityLabel="Customer workspace" onPress={switchToCustomer} style={styles.iconButton}>
              <Feather name="repeat" size={19} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.welcomeRow}>
          <View style={styles.welcomeCopy}>
            <Text style={styles.eyebrow}>Monday, July 27</Text>
            <Text style={styles.title}>Good afternoon, Daniel</Text>
            <Text style={styles.subtitle}>Your floor is moving smoothly today.</Text>
          </View>
          <View style={styles.availability}>
            <Switch
              value={acceptingBookings}
              onValueChange={setAcceptingBookings}
              trackColor={{ false: "#DADCD7", true: "#E7CE9B" }}
              thumbColor={acceptingBookings ? colors.primaryDark : colors.muted}
            />
            <Text style={styles.availabilityText}>{acceptingBookings ? "Open" : "Paused"}</Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <MetricCard label="Today's revenue" value={`$${revenue}`} change="+12%" icon="trending-up" tone="gold" />
          <MetricCard label="Bookings" value={String(pending.length + confirmed.length + completed.length)} change={`${pending.length} pending`} icon="calendar" tone="black" />
          <MetricCard label="Live queue" value={String(confirmed.length + 2)} change="18 min avg" icon="users" tone="blue" />
          <MetricCard label="Rating" value="4.9" change="179 reviews" icon="star" tone="green" />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Needs attention</Text>
            <Text style={styles.sectionTitle}>Booking requests</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("BarberBookings")}><Text style={styles.viewAll}>View all</Text></Pressable>
        </View>

        <View style={styles.requestList}>
          {pending.slice(0, 2).map((booking) => (
            <View key={booking.id} style={styles.requestRow}>
              <View style={styles.requestTop}>
                <View style={styles.customerAvatar}><Text style={styles.customerInitial}>{(booking.customer || "C").charAt(0)}</Text></View>
                <View style={styles.requestCopy}>
                  <Text style={styles.customerName}>{booking.customer || "Cutzix customer"}</Text>
                  <Text style={styles.requestMeta}>{booking.service} with {booking.barber}</Text>
                  <View style={styles.timeRow}>
                    <Feather name="clock" size={12} color={colors.primaryDark} />
                    <Text style={styles.timeText}>{booking.date}</Text>
                  </View>
                </View>
                <Text style={styles.requestPrice}>${booking.total || 0}</Text>
              </View>
              {booking.note ? <Text style={styles.note}>{booking.note}</Text> : null}
              <View style={styles.requestActions}>
                <Pressable onPress={() => updateBookingStatus(booking.id || "", "Rejected")} style={({ pressed }) => [styles.declineButton, pressed && styles.pressed]}>
                  <Feather name="x" size={16} color={colors.error} />
                  <Text style={styles.declineText}>Decline</Text>
                </Pressable>
                <Pressable onPress={() => updateBookingStatus(booking.id || "", "Confirmed")} style={({ pressed }) => [styles.acceptButton, pressed && styles.pressed]}>
                  <Feather name="check" size={16} color={colors.black} />
                  <Text style={styles.acceptText}>Accept</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {!pending.length ? (
            <View style={styles.emptyRequests}>
              <View style={styles.emptyIcon}><Feather name="check-circle" size={22} color={colors.success} /></View>
              <View>
                <Text style={styles.emptyTitle}>Requests are cleared</Text>
                <Text style={styles.emptyCopy}>New customer requests will appear here.</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Floor view</Text>
            <Text style={styles.sectionTitle}>Today's schedule</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("BarberBookings")}><Text style={styles.viewAll}>Timeline</Text></Pressable>
        </View>

        <View style={styles.schedule}>
          {[
            { time: "10:00", name: "Michael Johnson", service: "Haircut & Beard Trim", status: "In chair" },
            { time: "11:30", name: "Ethan Brown", service: "Classic Shave", status: "Confirmed" },
            { time: "01:00", name: "Walk-in window", service: "2 chairs available", status: "Open" }
          ].map((item, index) => (
            <View key={item.time} style={styles.scheduleRow}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <View style={styles.scheduleRail}>
                <View style={[styles.scheduleDot, index === 0 && styles.scheduleDotActive]} />
                {index < 2 ? <View style={styles.scheduleLine} /> : null}
              </View>
              <View style={styles.scheduleCopy}>
                <Text style={styles.scheduleName}>{item.name}</Text>
                <Text style={styles.scheduleService}>{item.service}</Text>
              </View>
              <Text style={[styles.scheduleStatus, index === 0 && styles.scheduleStatusActive]}>{item.status}</Text>
            </View>
          ))}
        </View>

        <View style={styles.insight}>
          <View style={styles.insightIcon}><Ionicons name="sparkles" size={20} color={colors.black} /></View>
          <View style={styles.insightCopy}>
            <Text style={styles.insightTitle}>Peak window: 5:00 - 7:00 PM</Text>
            <Text style={styles.insightBody}>Keep one chair flexible. Fridays run 22% busier in this window.</Text>
          </View>
        </View>
      </Screen>
      <BarberBottomNav active="Dashboard" navigation={navigation} />
    </View>
  );
}

function MetricCard({ label, value, change, icon, tone }: { label: string; value: string; change: string; icon: string; tone: "gold" | "black" | "blue" | "green" }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, metricTone(tone)]}><Feather name={icon as any} size={16} color={metricIconColor(tone)} /></View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricChange}>{change}</Text>
    </View>
  );
}

function metricTone(tone: "gold" | "black" | "blue" | "green") {
  if (tone === "black") return styles.metricBlack;
  if (tone === "blue") return styles.metricBlue;
  if (tone === "green") return styles.metricGreen;
  return styles.metricGold;
}

function metricIconColor(tone: "gold" | "black" | "blue" | "green") {
  if (tone === "black") return colors.white;
  if (tone === "blue") return colors.info;
  if (tone === "green") return colors.success;
  return colors.primaryDark;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 },
  proRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  brand: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 22 },
  proBadge: { borderRadius: 5, backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 3 },
  proText: { color: colors.black, fontFamily: fonts.bold, fontSize: 8 },
  shop: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  notificationDot: { position: "absolute", top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.error, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  notificationCount: { color: colors.white, fontFamily: fonts.bold, fontSize: 8 },
  welcomeRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12, paddingVertical: 22 },
  welcomeCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 10, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 25, lineHeight: 32, marginTop: 6 },
  subtitle: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 5 },
  availability: { alignItems: "center" },
  availabilityText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 9, marginTop: 2 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { flexGrow: 1, flexBasis: "46%", minWidth: 132, minHeight: 138, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14, ...shadows.card },
  metricIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  metricGold: { backgroundColor: colors.primarySoft },
  metricBlack: { backgroundColor: colors.black },
  metricBlue: { backgroundColor: "rgba(40,116,189,0.1)" },
  metricGreen: { backgroundColor: "rgba(30,141,91,0.1)" },
  metricValue: { color: colors.text, fontFamily: fonts.heading, fontSize: 24, marginTop: 12 },
  metricLabel: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 10, marginTop: 2 },
  metricChange: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 9, marginTop: 7 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 28, marginBottom: 12 },
  sectionEyebrow: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 9, textTransform: "uppercase" },
  sectionTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 18, marginTop: 3 },
  viewAll: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 11 },
  requestList: { gap: 10 },
  requestRow: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14 },
  requestTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  customerAvatar: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  customerInitial: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 16 },
  requestCopy: { flex: 1, minWidth: 0 },
  customerName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  requestMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, marginTop: 4 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  timeText: { color: colors.primaryDark, fontFamily: fonts.medium, fontSize: 9 },
  requestPrice: { color: colors.text, fontFamily: fonts.bold, fontSize: 14 },
  note: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, lineHeight: 16, backgroundColor: colors.background, borderRadius: radius.sm, padding: 10, marginTop: 12 },
  requestActions: { flexDirection: "row", gap: 8, marginTop: 14 },
  declineButton: { flex: 1, minHeight: 42, borderRadius: radius.full, borderWidth: 1, borderColor: "#E5BFC1", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  declineText: { color: colors.error, fontFamily: fonts.semibold, fontSize: 11 },
  acceptButton: { flex: 1, minHeight: 42, borderRadius: radius.full, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  acceptText: { color: colors.black, fontFamily: fonts.bold, fontSize: 11 },
  emptyRequests: { minHeight: 88, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  emptyIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "rgba(30,141,91,0.1)", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  emptyCopy: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, marginTop: 3 },
  schedule: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 4 },
  scheduleRow: { minHeight: 74, flexDirection: "row", alignItems: "flex-start", paddingTop: 14 },
  scheduleTime: { width: 46, color: colors.text, fontFamily: fonts.semibold, fontSize: 11 },
  scheduleRail: { width: 24, alignItems: "center", alignSelf: "stretch" },
  scheduleDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.elevated, borderWidth: 2, borderColor: colors.muted },
  scheduleDotActive: { backgroundColor: colors.primary, borderColor: colors.primaryDark },
  scheduleLine: { width: 1, flex: 1, backgroundColor: colors.border, marginTop: 4 },
  scheduleCopy: { flex: 1, minWidth: 0 },
  scheduleName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  scheduleService: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, marginTop: 4 },
  scheduleStatus: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 9 },
  scheduleStatusActive: { color: colors.success },
  insight: { minHeight: 96, borderRadius: radius.md, backgroundColor: colors.primarySoft, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 24 },
  insightIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  insightCopy: { flex: 1 },
  insightTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  insightBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, lineHeight: 16, marginTop: 4 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
