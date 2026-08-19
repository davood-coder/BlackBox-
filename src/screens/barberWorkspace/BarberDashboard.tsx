import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { BarberBottomNav, Screen } from "../../components/ui";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, shadows } from "../../theme";
import { temporaryProfiles, getKolkataTimeInfo } from "../../data";

export default function BarberDashboard({ navigation }: any) {
  const { bookings, updateBookingStatus, setWorkspace, unreadNotificationCount, currency, themeMode, shopOpen, setShopOpen } = useBooking();
  const isDark = themeMode === "dark";
  const pending = bookings.filter((booking) => booking.status === "Pending");
  const confirmed = bookings.filter((booking) => booking.status === "Confirmed");
  const completed = bookings.filter((booking) => booking.status === "Completed");
  const revenue = completed.reduce((total, booking) => total + (booking.total || 0), 0) + 680;

  const barberName = temporaryProfiles["Barber"].name;
  const { greeting, formattedDate } = getKolkataTimeInfo();

  useEffect(() => setWorkspace("Barber"), [setWorkspace]);

  function switchToCustomer() {
    setWorkspace("Customer");
    navigation.replace("Home");
  }

  return (
    <View style={[styles.root, isDark && { backgroundColor: "#121214" }]}>
      <Screen scroll bottomInset>
        <View style={styles.header}>
          <View>
            <Text style={[styles.brand, isDark && { color: "#FFFFFF" }]}>Dashboard</Text>
            <Text style={[styles.shop, isDark && { color: "#8E8E93" }]}>Black Box Barbershop</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Notifications" onPress={() => navigation.navigate("Notifications")} style={[styles.iconButton, isDark && { backgroundColor: "rgba(255,255,255,0.12)" }]}>
              <Feather name="bell" size={18} color={isDark ? "#FFFFFF" : colors.text} />
              {unreadNotificationCount ? <View style={styles.notificationDot}><Text style={styles.notificationCount}>{unreadNotificationCount}</Text></View> : null}
            </Pressable>
            <Pressable accessibilityLabel="Profile" onPress={() => navigation.navigate("Profile")} style={[styles.iconButton, isDark && { backgroundColor: "rgba(255,255,255,0.12)" }]}>
              <Feather name="user" size={18} color={isDark ? "#FFFFFF" : colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.welcomeCard, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }]}>
          <View style={styles.welcomeCopy}>
            <Text style={styles.eyebrow}>{formattedDate}</Text>
            <Text style={[styles.title, isDark && { color: "#FFFFFF" }]}>{greeting}, {barberName}</Text>
            <Text style={[styles.subtitle, isDark && { color: "#8E8E93" }]}>Your floor is moving smoothly today.</Text>
          </View>
          <View style={styles.availability}>
            <Switch
              value={shopOpen}
              onValueChange={setShopOpen}
              trackColor={{ false: isDark ? "#3A3A3C" : "#E0E0E0", true: "#00A896" }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={isDark ? "#3A3A3C" : "#E0E0E0"}
            />
            <Text style={[styles.availabilityText, !shopOpen && styles.availabilityTextClosed]}>
              {shopOpen ? "Open" : "Closed"}
            </Text>
          </View>
        </View>

        <View style={styles.metrics}>
          <MetricCard label="Today's Revenue" value={`${currency.symbol}${revenue}`} change="+12%" icon="trending-up" tone="gold" isDark={isDark} />
          <MetricCard label="Bookings" value={String(pending.length + confirmed.length + completed.length)} change={`${pending.length} Pending`} icon="calendar" tone="black" isDark={isDark} />
          <MetricCard label="Live Queue" value={String(confirmed.length + 2)} change="18 Min Avg" icon="users" tone="blue" isDark={isDark} />
          <MetricCard label="Rating" value="4.9" change="179 Reviews" icon="star" tone="green" isDark={isDark} />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionEyebrow, isDark && { color: "#8E8E93" }]}>NEEDS ATTENTION</Text>
            <Text style={[styles.sectionTitle, isDark && { color: "#FFFFFF" }]}>Booking Requests</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("BarberBookings")}><Text style={styles.viewAll}>View All</Text></Pressable>
        </View>

        <View style={styles.requestList}>
          {pending.slice(0, 2).map((booking) => (
            <View key={booking.id} style={[styles.requestRow, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }]}>
              <View style={styles.requestTop}>
                <View style={styles.customerAvatar}><Text style={styles.customerInitial}>{(booking.customer || "C").charAt(0)}</Text></View>
                <View style={styles.requestCopy}>
                  <Text style={[styles.customerName, isDark && { color: "#FFFFFF" }]}>{booking.customer || "Cutzix Customer"}</Text>
                  <Text style={[styles.requestMeta, isDark && { color: "#8E8E93" }]}>{booking.service} with {booking.barber}</Text>
                  <View style={styles.timeRow}>
                    <Feather name="clock" size={12} color="#946B22" />
                    <Text style={styles.timeText}>{booking.date}</Text>
                  </View>
                </View>
                <Text style={[styles.requestPrice, isDark && { color: "#FFFFFF" }]}>{currency.symbol}{booking.total || 0}</Text>
              </View>
              {booking.note ? <Text style={[styles.note, isDark && { backgroundColor: "#252528", color: "#E5E5EA" }]}>{booking.note}</Text> : null}
              <View style={styles.requestActions}>
                <Pressable onPress={() => updateBookingStatus(booking.id || "", "Rejected")} style={({ pressed }) => [styles.declineButton, pressed && styles.pressed]}>
                  <Feather name="x" size={15} color="#FF3B30" />
                  <Text style={styles.declineText}>Decline</Text>
                </Pressable>
                <Pressable onPress={() => updateBookingStatus(booking.id || "", "Confirmed")} style={({ pressed }) => [styles.acceptButton, isDark && { backgroundColor: "#C89A43" }, pressed && styles.pressed]}>
                  <Feather name="check" size={15} color={isDark ? "#000000" : colors.white} />
                  <Text style={[styles.acceptText, isDark && { color: "#000000" }]}>Accept</Text>
                </Pressable>
              </View>
            </View>
          ))}
          {!pending.length ? (
            <View style={[styles.emptyRequests, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }]}>
              <View style={styles.emptyIcon}><Feather name="check-circle" size={20} color={colors.success} /></View>
              <View>
                <Text style={[styles.emptyTitle, isDark && { color: "#FFFFFF" }]}>Requests Are Cleared</Text>
                <Text style={[styles.emptyCopy, isDark && { color: "#8E8E93" }]}>New customer requests will appear here.</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={[styles.sectionEyebrow, isDark && { color: "#8E8E93" }]}>FLOOR VIEW</Text>
            <Text style={[styles.sectionTitle, isDark && { color: "#FFFFFF" }]}>Today's Schedule</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("BarberBookings")}><Text style={styles.viewAll}>Timeline</Text></Pressable>
        </View>

        <View style={[styles.scheduleCard, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }]}>
          {[
            { time: "10:00 AM", name: "Michael Johnson", service: "Haircut & Beard Trim", status: "In chair" },
            { time: "11:30 AM", name: "Ethan Brown", service: "Classic Shave", status: "Confirmed" },
            { time: "01:00 PM", name: "Walk-In Window", service: "2 Chairs Available", status: "Open" }
          ].map((item, index) => (
            <View key={item.time} style={[styles.scheduleRow, isDark && { borderBottomColor: "rgba(255,255,255,0.08)" }, index === 2 && styles.lastScheduleRow]}>
              <Text style={[styles.scheduleTime, isDark && { color: "#FFFFFF" }]}>{item.time}</Text>
              <View style={styles.scheduleRail}>
                <View style={[styles.scheduleDot, index === 0 && styles.scheduleDotActive]} />
                {index < 2 ? <View style={[styles.scheduleLine, isDark && { backgroundColor: "rgba(255,255,255,0.12)" }]} /> : null}
              </View>
              <View style={styles.scheduleCopy}>
                <Text style={[styles.scheduleName, isDark && { color: "#FFFFFF" }]}>{item.name}</Text>
                <Text style={[styles.scheduleService, isDark && { color: "#8E8E93" }]}>{item.service}</Text>
              </View>
              <Text style={[styles.scheduleStatus, index === 0 && styles.scheduleStatusActive]}>{item.status}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.insight, isDark && { backgroundColor: "#252528" }]}>
          <View style={styles.insightIcon}><Ionicons name="sparkles" size={18} color="#946B22" /></View>
          <View style={styles.insightCopy}>
            <Text style={[styles.insightTitle, isDark && { color: "#FFFFFF" }]}>Peak Window: 5:00 - 7:00 PM</Text>
            <Text style={[styles.insightBody, isDark && { color: "#8E8E93" }]}>Keep one chair flexible. Fridays run 22% busier in this window.</Text>
          </View>
        </View>
      </Screen>
      <BarberBottomNav active="Dashboard" navigation={navigation} />
    </View>
  );
}

function MetricCard({ label, value, change, icon, tone, isDark }: { label: string; value: string; change: string; icon: string; tone: "gold" | "black" | "blue" | "green"; isDark?: boolean }) {
  return (
    <View style={[styles.metricCard, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }]}>
      <View style={[styles.metricIcon, metricTone(tone)]}><Feather name={icon as any} size={15} color={metricIconColor(tone)} /></View>
      <Text style={[styles.metricValue, isDark && { color: "#FFFFFF" }]}>{value}</Text>
      <Text style={[styles.metricLabel, isDark && { color: "#8E8E93" }]}>{label}</Text>
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
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 16, marginBottom: 16 },
  proRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  brand: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 26, letterSpacing: -0.5 },
  proBadge: { borderRadius: 5, backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2 },
  proText: { color: colors.black, fontFamily: fonts.bold, fontSize: 8 },
  shop: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14, marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(118, 118, 128, 0.12)" },
  notificationDot: { position: "absolute", top: -2, right: -2, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.error, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  notificationCount: { color: colors.white, fontFamily: fonts.bold, fontSize: 8 },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  welcomeCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  eyebrow: { color: "#946B22", fontFamily: fonts.bold, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  title: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 22, lineHeight: 28, marginTop: 4 },
  subtitle: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14, marginTop: 3 },
  availability: { alignItems: "center", gap: 2 },
  availabilityText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 11 },
  availabilityTextClosed: { color: "#FF3B30", fontFamily: fonts.bold },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  metricCard: { flexGrow: 1, flexBasis: "46%", minWidth: 132, borderRadius: 16, backgroundColor: colors.white, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)", padding: 14, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  metricIcon: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  metricGold: { backgroundColor: colors.primarySoft },
  metricBlack: { backgroundColor: colors.black },
  metricBlue: { backgroundColor: "rgba(0,122,255,0.1)" },
  metricGreen: { backgroundColor: "rgba(52,199,89,0.1)" },
  metricValue: { color: colors.text, fontFamily: fonts.heading, fontSize: 22, marginTop: 10 },
  metricLabel: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 13, marginTop: 2 },
  metricChange: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 11, marginTop: 4 },
  sectionHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 14, marginBottom: 8 },
  sectionEyebrow: { color: "#3C3C43", fontFamily: fonts.bold, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  sectionTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 20, letterSpacing: -0.4, marginTop: 2 },
  viewAll: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 13 },
  requestList: { gap: 10, marginBottom: 16 },
  requestRow: { borderRadius: 16, backgroundColor: colors.white, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)", padding: 14, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  requestTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  customerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  customerInitial: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 16 },
  requestCopy: { flex: 1, minWidth: 0 },
  customerName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  requestMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  timeText: { color: "#946B22", fontFamily: fonts.medium, fontSize: 11 },
  requestPrice: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  note: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, backgroundColor: "#F2F2F7", borderRadius: 10, padding: 10, marginTop: 10 },
  requestActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  declineButton: { flex: 1, minHeight: 40, borderRadius: 20, backgroundColor: "rgba(255,59,48,0.1)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  declineText: { color: "#FF3B30", fontFamily: fonts.semibold, fontSize: 13 },
  acceptButton: { flex: 1, minHeight: 40, borderRadius: 20, backgroundColor: colors.black, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  acceptText: { color: colors.white, fontFamily: fonts.bold, fontSize: 13 },
  emptyRequests: { minHeight: 80, borderRadius: 16, backgroundColor: colors.white, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)", padding: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  emptyIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(52,199,89,0.1)", alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  emptyCopy: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  scheduleCard: { borderRadius: 16, backgroundColor: colors.white, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.08)", paddingHorizontal: 14, paddingVertical: 8, marginBottom: 16 },
  scheduleRow: { minHeight: 64, flexDirection: "row", alignItems: "flex-start", paddingTop: 10, borderBottomWidth: 0.5, borderBottomColor: "#E5E5EA" },
  lastScheduleRow: { borderBottomWidth: 0 },
  scheduleTime: { width: 64, color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  scheduleRail: { width: 20, alignItems: "center", alignSelf: "stretch" },
  scheduleDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#E5E5EA" },
  scheduleDotActive: { backgroundColor: colors.success },
  scheduleLine: { width: 1, flex: 1, backgroundColor: "#E5E5EA", marginTop: 4 },
  scheduleCopy: { flex: 1, minWidth: 0 },
  scheduleName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  scheduleService: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  scheduleStatus: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 12 },
  scheduleStatusActive: { color: colors.success, fontFamily: fonts.bold },
  insight: { minHeight: 84, borderRadius: 16, backgroundColor: colors.primarySoft, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4, marginBottom: 16 },
  insightIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  insightCopy: { flex: 1 },
  insightTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  insightBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 18, marginTop: 2 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});

