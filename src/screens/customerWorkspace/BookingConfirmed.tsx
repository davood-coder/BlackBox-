import { StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppHeader, Card, GhostButton, PrimaryButton, Screen } from "../../components/ui";
import { timeRanges } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

export default function BookingConfirmed({ navigation }) {
  const { selectedShop, selectedDate, selectedTime, selectedBarber, selectedPreference, bookingTotal, bookingId, lastConfirmation } = useBooking();
  const confirmation = lastConfirmation || {
    id: bookingId,
    date: `${selectedDate.full} ${timeRanges[selectedTime] || selectedTime}`,
    shop: selectedShop.name,
    address: selectedShop.address,
    barber: selectedBarber.name,
    preference: selectedPreference.label,
    total: bookingTotal,
    status: "Pending" as const
  };
  const isPending = confirmation.status === "Pending";

  return (
    <Screen>
      <AppHeader title={isPending ? "Request Sent" : "Booking Confirmed"} onBack={() => goBackOrNavigate(navigation, "Home")} />
      <View style={styles.content}>
        <Card style={styles.confirmCard}>
          <View style={[styles.checkCircle, isPending && styles.pendingCircle]}>
            <Feather name={isPending ? "clock" : "check"} size={34} color={isPending ? colors.warning : colors.success} />
          </View>
          <Text style={styles.title}>{isPending ? "Your request is with the shop" : "Your booking is confirmed"}</Text>
          <Text style={styles.requestCopy}>
            {isPending ? "You will receive a notification when the barber accepts or suggests another time." : "Your chair is reserved. Show your ticket when you arrive."}
          </Text>
          <Text style={styles.date}>{confirmation.date}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={23} color={colors.text} />
            <View style={styles.locationText}>
              <Text style={styles.shop}>{confirmation.shop}</Text>
              <Text style={styles.address}>{confirmation.address}</Text>
            </View>
          </View>
          <View style={styles.detailGrid}>
            <DetailItem label="Barber" value={confirmation.barber || selectedBarber.name} />
            <DetailItem label="Preference" value={confirmation.preference || selectedPreference.label} />
            <DetailItem label="Total" value={`$${confirmation.total || bookingTotal}`} />
          </View>
          <View style={styles.divider} />
          <View style={styles.idBlock}>
            <Text style={styles.idLabel}>Booking ID</Text>
            <Text style={styles.id}>{confirmation.id}</Text>
          </View>
          <GhostButton label={isPending ? "View Request" : "Add to Calendar"} icon={isPending ? "clock" : "calendar"} onPress={() => navigation.navigate("BookingDetails", { bookingId: confirmation.id })} style={styles.calendarButton} />
        </Card>
      </View>
      <PrimaryButton label="View My Bookings" icon={null} onPress={() => navigation.replace("MyBookings")} style={styles.bottomButton} />
    </Screen>
  );
}

function DetailItem({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 74
  },
  confirmCard: {
    padding: 24,
    alignItems: "center",
    borderRadius: radius.lg
  },
  checkCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24
  },
  pendingCircle: {
    borderColor: colors.warning,
    backgroundColor: "rgba(169,105,0,0.08)"
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 31,
    textAlign: "center",
    maxWidth: 260
  },
  requestCopy: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 290,
    marginTop: 8
  },
  date: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 20
  },
  locationRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 24
  },
  locationText: {
    flex: 1
  },
  shop: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  address: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2
  },
  detailGrid: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: 8,
    marginTop: 22
  },
  detailItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: 10
  },
  detailLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10
  },
  detailValue: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
    marginTop: 4
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 22
  },
  idBlock: {
    alignSelf: "stretch"
  },
  idLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12
  },
  id: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    marginTop: 2
  },
  calendarButton: {
    alignSelf: "stretch",
    marginTop: 24,
    minHeight: 48
  },
  bottomButton: {
    marginBottom: 28
  }
});
