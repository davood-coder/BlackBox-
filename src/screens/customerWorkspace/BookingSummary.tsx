import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, Card, PrimaryButton, Screen } from "../../components/ui";
import { paymentMethods, timeRanges } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, spacing } from "../../theme";

export default function BookingSummary({ navigation }) {
  const {
    selectedShop,
    selectedService,
    selectedBarber,
    selectedAddOns,
    selectedPreference,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    appointmentNote,
    selectedDate,
    selectedTime,
    bookingTotal,
    confirmBooking,
    currency
  } = useBooking();

  function handleConfirm() {
    confirmBooking();
    navigation.replace("BookingConfirmed");
  }

  return (
    <Screen scroll>
      <AppHeader title="Booking Summary" onBack={() => goBackOrNavigate(navigation, "BookAppointment")} />
      <Card style={styles.shopCard}>
        <Image source={selectedShop.image} style={styles.shopImage} />
        <View style={styles.shopText}>
          <Text style={styles.shopTitle}>{selectedShop.name}</Text>
          <Text style={styles.meta}>{selectedShop.address}</Text>
        </View>
      </Card>

      <SummarySection title="Selected Service">
        <RowCard icon={selectedService.icon} title={selectedService.label} subtitle={selectedService.duration} price={`${currency.symbol}${selectedService.price}`} />
      </SummarySection>

      {selectedAddOns.length ? (
        <SummarySection title="Add-Ons">
          <View style={styles.stackedRows}>
            {selectedAddOns.map((addOn) => (
              <RowCard key={addOn.id} icon={addOn.icon} title={addOn.label} subtitle={addOn.duration} price={`${currency.symbol}${addOn.price}`} />
            ))}
          </View>
        </SummarySection>
      ) : null}

      <SummarySection title="Barber">
        <Card style={styles.rowCard}>
          <Image source={selectedBarber.image} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{selectedBarber.name}</Text>
            <Text style={styles.meta}>{selectedBarber.role} - Next slot {selectedBarber.nextSlot}</Text>
          </View>
        </Card>
      </SummarySection>

      <SummarySection title="Date & Time">
        <Card style={styles.textOnlyCard}>
          <Text style={styles.rowTitle}>{selectedDate.full}</Text>
          <Text style={styles.meta}>{timeRanges[selectedTime] || selectedTime}</Text>
        </Card>
      </SummarySection>

      <SummarySection title="Visit Preferences">
        <Card style={styles.textOnlyCard}>
          <Text style={styles.rowTitle}>{selectedPreference.label}</Text>
          <Text style={styles.meta}>{selectedPreference.description}</Text>
          {appointmentNote.trim() ? <Text style={styles.noteText}>{appointmentNote.trim()}</Text> : null}
        </Card>
      </SummarySection>

      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalPrice}>{currency.symbol}{bookingTotal}</Text>
      </Card>

      <SummarySection title="Payment Method">
        <View style={styles.paymentList}>
          {paymentMethods.map((method) => {
            const selected = selectedPaymentMethod.id === method.id;
            return (
              <Pressable key={method.id} onPress={() => setSelectedPaymentMethod(method)} style={({ pressed }) => pressed && styles.pressed}>
                <Card style={[styles.paymentCard, selected && styles.paymentSelected]}>
                  <View style={[styles.paymentIcon, selected && styles.paymentIconSelected]}>
                    <Feather name={method.icon as any} size={17} color={selected ? colors.black : colors.primary} />
                  </View>
                  <View style={styles.paymentCopy}>
                    <Text style={styles.paymentTitle}>{method.label}</Text>
                    <Text style={styles.paymentText}>{method.detail}</Text>
                  </View>
                  {selected ? <Feather name="check" size={18} color={colors.primary} /> : null}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </SummarySection>
      <PrimaryButton label="Send Booking Request" icon={null} onPress={handleConfirm} style={styles.confirm} />
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
    fontSize: 16,
    lineHeight: 22,
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
  stackedRows: {
    gap: 10
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
  noteText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8
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
    fontSize: 16
  },
  totalPrice: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16
  },
  paymentList: {
    gap: 10
  },
  paymentCard: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  paymentSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(212,168,90,0.08)"
  },
  paymentIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,168,90,0.1)"
  },
  paymentIconSelected: {
    backgroundColor: colors.primary
  },
  paymentCopy: {
    flex: 1,
    minWidth: 0
  },
  paymentTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13
  },
  paymentText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16
  },
  confirm: {
    marginTop: spacing.sm,
    marginBottom: 26
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }]
  }
});
