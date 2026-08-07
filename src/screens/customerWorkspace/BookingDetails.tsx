import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppHeader, PrimaryButton, Screen } from "../../components/ui";
import type { BookingStatus } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

export default function BookingDetails({ navigation, route }: any) {
  const { bookings, lastConfirmation, updateBookingStatus, currency } = useBooking();
  const bookingId = route?.params?.bookingId;
  const booking = bookings.find((item) => item.id === bookingId) || lastConfirmation || bookings[0];

  if (!booking) {
    return (
      <Screen>
        <AppHeader title="Booking details" onBack={() => goBackOrNavigate(navigation, "MyBookings")} />
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Booking not found</Text>
          <Text style={styles.emptyCopy}>This booking is no longer available.</Text>
        </View>
      </Screen>
    );
  }

  const canCancel = booking.status === "Pending" || booking.status === "Confirmed";
  const isConfirmed = booking.status === "Confirmed";

  function openDirections() {
    if (!booking.address) return;
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`);
  }

  return (
    <Screen scroll>
      <AppHeader title="Booking details" onBack={() => goBackOrNavigate(navigation, "MyBookings")} />
      <View style={styles.statusHeader}>
        <View style={[styles.statusIcon, statusIconStyle(booking.status)]}>
          <Feather name={statusIcon(booking.status) as any} size={22} color={statusColor(booking.status)} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>{statusTitle(booking.status)}</Text>
          <Text style={styles.statusBody}>{statusBody(booking.status)}</Text>
        </View>
      </View>

      {isConfirmed ? (
        <View style={styles.ticket}>
          <View style={styles.ticketTop}>
            <View>
              <Text style={styles.ticketEyebrow}>Cutzix ticket</Text>
              <Text style={styles.ticketNumber}>{booking.appointmentNumber || "A-104"}</Text>
            </View>
            <View style={styles.qr}>
              {buildQrPattern(booking.id || booking.date).map((filled, index) => (
                <View key={index} style={[styles.qrCell, filled && styles.qrCellFilled]} />
              ))}
            </View>
          </View>
          <View style={styles.ticketDivider} />
          <Text style={styles.ticketHint}>Show this ticket when you arrive at the shop.</Text>
        </View>
      ) : null}

      <View style={styles.details}>
        <DetailRow icon="scissors" label="Service" value={booking.service} />
        <DetailRow icon="user" label="Barber" value={booking.barber || "Any available barber"} />
        <DetailRow icon="calendar" label="Date & time" value={booking.date} />
        <DetailRow icon="map-pin" label="Shop" value={booking.shop} />
        <DetailRow icon="clock" label="Estimated wait" value={booking.estimatedWait || "15 min"} />
        <DetailRow icon="credit-card" label="Payment" value={booking.paymentStatus || "Pending"} />
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{currency.symbol}{booking.total || 0}</Text>
      </View>

      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>Appointment progress</Text>
        <TimelineStep title="Request sent" copy="The shop received your preferred service and time." complete />
        <TimelineStep
          title="Shop decision"
          copy={booking.status === "Pending" ? "Waiting for the shop to accept or suggest another time." : booking.status === "Rejected" ? "This time was unavailable." : "Your chair is reserved."}
          complete={booking.status !== "Pending"}
          active={booking.status === "Pending"}
        />
        <TimelineStep title="Service complete" copy="Payment and review become available after your visit." complete={booking.status === "Completed"} />
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Directions" icon="navigate-outline" onPress={openDirections} />
        {canCancel ? (
          <Pressable onPress={() => updateBookingStatus(booking.id || "", "Cancelled")} style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
            <Text style={styles.cancelText}>Cancel booking</Text>
          </Pressable>
        ) : null}
        {booking.status === "Rejected" || booking.status === "Cancelled" ? (
          <Pressable onPress={() => navigation.navigate("BookAppointment")} style={styles.rescheduleButton}>
            <Ionicons name="refresh" size={17} color={colors.primaryDark} />
            <Text style={styles.rescheduleText}>Choose another time</Text>
          </Pressable>
        ) : null}
      </View>
    </Screen>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}><Feather name={icon as any} size={16} color={colors.primaryDark} /></View>
      <View style={styles.detailCopy}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function TimelineStep({ title, copy, complete = false, active = false }: { title: string; copy: string; complete?: boolean; active?: boolean }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, complete && styles.timelineDotComplete, active && styles.timelineDotActive]}>
          {complete ? <Feather name="check" size={11} color={colors.white} /> : null}
        </View>
        <View style={styles.timelineLine} />
      </View>
      <View style={styles.timelineCopy}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineBody}>{copy}</Text>
      </View>
    </View>
  );
}

function statusColor(status: BookingStatus) {
  if (status === "Confirmed") return colors.success;
  if (status === "Pending") return colors.warning;
  if (status === "Completed") return colors.info;
  return colors.error;
}

function statusIcon(status: BookingStatus) {
  if (status === "Confirmed") return "check";
  if (status === "Pending") return "clock";
  if (status === "Completed") return "award";
  return "x";
}

function statusIconStyle(status: BookingStatus) {
  if (status === "Confirmed") return styles.confirmedIcon;
  if (status === "Pending") return styles.pendingIcon;
  if (status === "Completed") return styles.completedIcon;
  return styles.cancelledIcon;
}

function statusTitle(status: BookingStatus) {
  if (status === "Confirmed") return "Your chair is confirmed";
  if (status === "Pending") return "Waiting for shop approval";
  if (status === "Completed") return "Service completed";
  if (status === "Rejected") return "Time not available";
  return "Booking cancelled";
}

function statusBody(status: BookingStatus) {
  if (status === "Confirmed") return "Arrive a few minutes early and show your QR ticket.";
  if (status === "Pending") return "You will receive a notification as soon as the shop responds.";
  if (status === "Completed") return "Your receipt and service details are ready.";
  if (status === "Rejected") return "Pick another available time and resend your request.";
  return "This appointment is no longer active.";
}

function buildQrPattern(seed: string) {
  const total = seed.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return Array.from({ length: 64 }, (_, index) => {
    const row = Math.floor(index / 8);
    const column = index % 8;
    const finder = (row < 3 && column < 3) || (row < 3 && column > 4) || (row > 4 && column < 3);
    return finder || ((index * 17 + total) % 7 < 3);
  });
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 18 },
  emptyCopy: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 6 },
  statusHeader: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 18 },
  statusIcon: { width: 48, height: 48, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  confirmedIcon: { backgroundColor: "rgba(30,141,91,0.12)" },
  pendingIcon: { backgroundColor: "rgba(169,105,0,0.12)" },
  completedIcon: { backgroundColor: "rgba(40,116,189,0.12)" },
  cancelledIcon: { backgroundColor: "rgba(198,64,70,0.12)" },
  statusCopy: { flex: 1, minWidth: 0 },
  statusTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 18 },
  statusBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, marginTop: 4 },
  ticket: { borderRadius: radius.md, backgroundColor: colors.black, padding: 18, marginBottom: 18 },
  ticketTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ticketEyebrow: { color: colors.primarySoft, fontFamily: fonts.semibold, fontSize: 10, textTransform: "uppercase" },
  ticketNumber: { color: colors.white, fontFamily: fonts.headingHeavy, fontSize: 30, marginTop: 7 },
  qr: { width: 88, height: 88, borderRadius: 8, backgroundColor: colors.white, padding: 8, flexDirection: "row", flexWrap: "wrap" },
  qrCell: { width: 9, height: 9, backgroundColor: colors.white },
  qrCellFilled: { backgroundColor: colors.black },
  ticketDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.16)", marginVertical: 14 },
  ticketHint: { color: "#C8CAC6", fontFamily: fonts.body, fontSize: 11 },
  details: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  detailRow: { minHeight: 68, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  detailIcon: { width: 36, height: 36, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  detailCopy: { flex: 1, minWidth: 0 },
  detailLabel: { color: colors.muted, fontFamily: fonts.body, fontSize: 10 },
  detailValue: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18, marginTop: 3 },
  totalRow: { minHeight: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 16 },
  totalValue: { color: colors.text, fontFamily: fonts.heading, fontSize: 20 },
  timeline: { marginTop: 16 },
  sectionTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 17, marginBottom: 14 },
  timelineRow: { minHeight: 76, flexDirection: "row", gap: 12 },
  timelineRail: { width: 24, alignItems: "center" },
  timelineDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  timelineDotComplete: { backgroundColor: colors.success, borderColor: colors.success },
  timelineDotActive: { borderColor: colors.primary },
  timelineLine: { width: 1, flex: 1, backgroundColor: colors.border },
  timelineCopy: { flex: 1, paddingBottom: 18 },
  timelineTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  timelineBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, marginTop: 4 },
  actions: { gap: 10, paddingBottom: 28 },
  cancelButton: { minHeight: 50, borderRadius: radius.full, borderWidth: 1, borderColor: "#E1B7B9", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF8F8" },
  cancelText: { color: colors.error, fontFamily: fonts.semibold, fontSize: 13 },
  rescheduleButton: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  rescheduleText: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 12 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
