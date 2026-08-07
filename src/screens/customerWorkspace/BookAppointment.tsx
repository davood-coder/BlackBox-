import { useEffect, useRef } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, Card, FadeInView, Field, Pill, PrimaryButton, Rating, Screen, SectionTitle } from "../../components/ui";
import { barbers, dates, groomingPreferences, serviceAddOns, services, times } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, spacing } from "../../theme";

export default function BookAppointment({ navigation }: any) {
  const { width } = useWindowDimensions();
  const {
    selectedShop,
    selectedService,
    setSelectedService,
    selectedBarber,
    setSelectedBarber,
    selectedAddOns,
    toggleAddOn,
    selectedPreference,
    setSelectedPreference,
    appointmentNote,
    setAppointmentNote,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    bookingTotal,
    currency
  } = useBooking();
  const shopBarbers = selectedShop.bestBarbers?.length ? selectedShop.bestBarbers : barbers;
  const compact = width < 360;
  const totalPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(totalPulse, {
        toValue: 1.025,
        duration: 120,
        useNativeDriver: true
      }),
      Animated.spring(totalPulse, {
        toValue: 1,
        friction: 5,
        tension: 95,
        useNativeDriver: true
      })
    ]).start();
  }, [bookingTotal, totalPulse]);

  return (
    <Screen scroll>
      <AppHeader title="Book Appointment" onBack={() => goBackOrNavigate(navigation, "Home")} />
      <Card style={styles.shopSummary}>
        <Text style={styles.shopTitle}>{selectedShop.name}</Text>
        <Text style={styles.shopAddress} numberOfLines={2}>{selectedShop.address}</Text>
      </Card>
      <Text style={styles.label}>Choose a Service</Text>
      <View style={styles.serviceRow}>
        {(selectedShop.services || services).map((service) => (
          <Pill
            key={service.id}
            label={service.shortLabel || service.label}
            icon={service.icon}
            active={selectedService.id === service.id}
            onPress={() => setSelectedService(service)}
            compact
          />
        ))}
      </View>

      <SectionTitle title="Enhance Your Visit" />
      <View style={styles.addOnGrid}>
        {serviceAddOns.map((addOn, index) => {
          const selected = selectedAddOns.some((item) => item.id === addOn.id);
          return (
            <FadeInView key={addOn.id} delay={index * 45} style={styles.addOnWrap}>
              <Pressable onPress={() => toggleAddOn(addOn)} style={({ pressed }) => pressed && styles.pressed}>
                <Card style={[styles.addOnCard, selected && styles.selectedCard]}>
                  <View style={styles.addOnTop}>
                    <View style={[styles.addOnIcon, selected && styles.addOnIconActive]}>
                      <Feather name={addOn.icon as any} size={15} color={selected ? colors.black : colors.primary} />
                    </View>
                    <Text style={styles.addOnPrice}>+{currency.symbol}{addOn.price}</Text>
                  </View>
                  <Text style={styles.addOnTitle}>{addOn.label}</Text>
                  <Text style={styles.addOnDescription} numberOfLines={2}>{addOn.description}</Text>
                </Card>
              </Pressable>
            </FadeInView>
          );
        })}
      </View>

      <SectionTitle title="Choose Your Barber" action="View all" onAction={() => navigation.navigate("Barbers")} />
      <View style={styles.list}>
        {shopBarbers.slice(0, 3).map((barber) => (
          <Pressable key={barber.name} onPress={() => setSelectedBarber(barber)}>
            <Card style={[styles.barberCard, selectedBarber.name === barber.name && styles.selectedCard]}>
              <Image source={barber.image} style={styles.barberImage} />
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>{barber.name}</Text>
                <Rating value={barber.rating} count={barber.reviews} small />
                <Text style={styles.role}>{barber.role}</Text>
                <Text style={styles.nextSlot}>Next slot {barber.nextSlot}</Text>
              </View>
              <Pressable
                onPress={() => {
                  setSelectedBarber(barber);
                  navigation.navigate("BarberProfile");
                }}
                style={[styles.bookMini, selectedBarber.name === barber.name && styles.bookMiniActive]}
              >
                <Text style={[styles.bookMiniText, selectedBarber.name === barber.name && styles.bookMiniTextActive]}>
                  {selectedBarber.name === barber.name ? "Selected" : "Book"}
                </Text>
              </Pressable>
            </Card>
          </Pressable>
        ))}
      </View>

      <SectionTitle title="Visit Preferences" />
      <View style={styles.preferenceGrid}>
        {groomingPreferences.map((preference) => {
          const selected = selectedPreference.id === preference.id;
          return (
            <Pressable key={preference.id} onPress={() => setSelectedPreference(preference)} style={({ pressed }) => pressed && styles.pressed}>
              <Card style={[styles.preferenceCard, selected && styles.preferenceActive]}>
                <Feather name={preference.icon as any} size={16} color={selected ? colors.black : colors.primary} />
                <View style={styles.preferenceTextWrap}>
                  <Text style={[styles.preferenceTitle, selected && styles.preferenceTitleActive]}>{preference.label}</Text>
                  <Text style={[styles.preferenceDescription, selected && styles.preferenceDescriptionActive]} numberOfLines={2}>{preference.description}</Text>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
      <Field icon="edit-3" placeholder="Notes for your barber (optional)" value={appointmentNote} onChangeText={setAppointmentNote} style={styles.noteField} />

      <Text style={[styles.label, styles.dateLabel]}>Select Date & Time</Text>
      <View style={styles.dateRow}>
        {dates.map((date) => (
          <Pressable key={date.day} onPress={() => setSelectedDate(date)} style={[styles.datePill, compact && styles.datePillCompact, selectedDate.day === date.day && styles.activeDate]}>
            <Text style={[styles.dateDay, selectedDate.day === date.day && styles.activeDateText]}>{date.day}</Text>
            <Text style={[styles.dateMeta, selectedDate.day === date.day && styles.activeDateText]}>{date.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.timeRow}>
        {times.map((time) => (
          <Pressable key={time} onPress={() => setSelectedTime(time)} style={[styles.timePill, selectedTime === time && styles.activeTime]}>
            <Text style={[styles.timeText, selectedTime === time && styles.activeTimeText]}>{time}</Text>
          </Pressable>
        ))}
      </View>
      <Animated.View style={{ transform: [{ scale: totalPulse }] }}>
        <Card style={styles.totalBar}>
          <View>
            <Text style={styles.totalLabel}>Estimated total</Text>
            <Text style={styles.totalMeta}>{selectedService.duration} service{selectedAddOns.length ? ` + ${selectedAddOns.length} add-on${selectedAddOns.length > 1 ? "s" : ""}` : ""}</Text>
          </View>
          <Text style={styles.totalPrice}>{currency.symbol}{bookingTotal}</Text>
        </Card>
      </Animated.View>
      <PrimaryButton label="Continue Booking" icon={null} onPress={() => navigation.navigate("BookingSummary")} style={styles.continueButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 15,
    marginBottom: 12
  },
  shopSummary: {
    gap: 4,
    marginBottom: 18
  },
  shopTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16
  },
  shopAddress: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22
  },
  serviceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22
  },
  addOnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22
  },
  addOnWrap: {
    width: "48%"
  },
  addOnCard: {
    minHeight: 126,
    justifyContent: "space-between",
    borderRadius: radius.md
  },
  addOnTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
  },
  addOnIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212,168,90,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,168,90,0.22)"
  },
  addOnIconActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  addOnPrice: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13
  },
  addOnTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13
  },
  addOnDescription: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6
  },
  list: {
    gap: 10,
    marginBottom: 22
  },
  barberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: radius.md
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: "rgba(212,168,90,0.08)"
  },
  barberImage: {
    width: 48,
    height: 48,
    borderRadius: 15,
    marginRight: 12
  },
  barberInfo: {
    flex: 1
  },
  barberName: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  role: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2
  },
  nextSlot: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 5
  },
  bookMini: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 8
  },
  bookMiniActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  bookMiniText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  bookMiniTextActive: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  preferenceGrid: {
    gap: 10,
    marginBottom: 12
  },
  preferenceCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: radius.md
  },
  preferenceActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  preferenceTextWrap: {
    flex: 1,
    minWidth: 0
  },
  preferenceTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13
  },
  preferenceTitleActive: {
    color: colors.black
  },
  preferenceDescription: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 3
  },
  preferenceDescriptionActive: {
    color: "rgba(17,17,17,0.72)"
  },
  noteField: {
    marginBottom: 20
  },
  dateLabel: {
    marginTop: 2
  },
  dateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14
  },
  datePill: {
    width: 58,
    height: 64,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  datePillCompact: {
    width: 52
  },
  activeDate: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary
  },
  dateDay: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 19
  },
  dateMeta: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 16,
    marginTop: 2
  },
  activeDateText: {
    color: colors.text
  },
  timeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.lg
  },
  timePill: {
    minWidth: 76,
    height: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  activeTime: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary
  },
  timeText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  activeTimeText: {
    color: colors.text
  },
  totalBar: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    borderColor: "rgba(212,168,90,0.3)",
    backgroundColor: "rgba(212,168,90,0.1)"
  },
  totalLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  totalMeta: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    marginTop: 4
  },
  totalPrice: {
    color: colors.primaryLight,
    fontFamily: fonts.heading,
    fontSize: 22
  },
  continueButton: {
    marginTop: "auto",
    marginBottom: 28
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }]
  }
});
