import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, Card, PrimaryButton, Screen } from "../../components/ui";
import { timeRanges } from "../../data";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, spacing } from "../../theme";

export default function BookingSummary({ navigation }) {
  const {
    selectedShop,
    selectedService,
    selectedBarber,
    selectedDate,
    selectedTime,
    bookingTotal,
    confirmBooking
  } = useBooking();

  function handleConfirm() {
    confirmBooking();
    navigation.replace("BookingConfirmed");
  }

  return (
    <Screen scroll>
      <AppHeader title="Booking Summary" onBack={() => navigation.goBack()} />
      <Card style={styles.shopCard}>
        <Image source={selectedShop.image} style={styles.shopImage} />
        <View style={styles.shopText}>
          <Text style={styles.shopTitle}>{selectedShop.name}</Text>
          <Text style={styles.meta}>{selectedShop.address}</Text>
        </View>
      </Card>

      <SummarySection title="Selected Service">
        <RowCard icon={selectedService.icon} title={selectedService.label} subtitle={selectedService.duration} price={`$${selectedService.price}`} />
      </SummarySection>

      <SummarySection title="Barber">
        <Card style={styles.rowCard}>
          <Image source={selectedBarber.image} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{selectedBarber.name}</Text>
            <Text style={styles.meta}>{selectedBarber.role}</Text>
          </View>
        </Card>
      </SummarySection>

      <SummarySection title="Date & Time">
        <Card style={styles.textOnlyCard}>
          <Text style={styles.rowTitle}>{selectedDate.full}</Text>
          <Text style={styles.meta}>{timeRanges[selectedTime] || selectedTime}</Text>
        </Card>
      </SummarySection>

      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalPrice}>${bookingTotal}</Text>
      </Card>

      <SummarySection title="Payment Method">
        <Card style={styles.paymentCard}>
          <View style={styles.visa}>
            <Text style={styles.visaText}>Visa</Text>
          </View>
          <Text style={styles.paymentText}>Visa **** 4242</Text>
          <Pressable style={styles.changeButton}>
            <Text style={styles.changeText}>Change</Text>
          </Pressable>
        </Card>
      </SummarySection>
      <PrimaryButton label="Confirm Booking" icon={null} onPress={handleConfirm} style={styles.confirm} />
    </Screen>
  );
}

function SummarySection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function RowCard({ icon, title, subtitle, price }) {
  return (
    <Card style={styles.rowCard}>
      <View style={styles.iconBox}>
        <Feather name={icon} size={18} color={colors.secondaryText} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.meta}>{subtitle}</Text>
      </View>
      <Text style={styles.price}>{price}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  shopCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 20
  },
  shopImage: {
    width: 74,
    height: 74,
    borderRadius: 13
  },
  shopText: {
    flex: 1,
    minWidth: 0
  },
  shopTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 15
  },
  meta: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 15,
    marginBottom: 9
  },
  rowCard: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    alignItems: "center",
    justifyContent: "center"
  },
  rowTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  price: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  textOnlyCard: {
    gap: 2
  },
  totalCard: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  totalLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  totalPrice: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16
  },
  paymentCard: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  visa: {
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: colors.white
  },
  visaText: {
    color: "#1F4DB8",
    fontFamily: fonts.bold,
    fontSize: 11
  },
  paymentText: {
    flex: 1,
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 13
  },
  changeButton: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  changeText: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 11
  },
  confirm: {
    marginTop: spacing.sm,
    marginBottom: 26
  }
});
