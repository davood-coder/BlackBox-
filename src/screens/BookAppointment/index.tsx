import { Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { AppHeader, Card, Pill, PrimaryButton, Rating, Screen, SectionTitle } from "../../components/ui";
import { barbers, dates, services, times } from "../../data";
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
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime
  } = useBooking();
  const shopBarbers = selectedShop.bestBarbers?.length ? selectedShop.bestBarbers : barbers;
  const compact = width < 360;

  return (
    <Screen scroll>
      <AppHeader title="Book Appointment" onBack={() => navigation.goBack()} />
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
    fontSize: 12,
    lineHeight: 18
  },
  serviceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 22
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
    fontSize: 10,
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
  continueButton: {
    marginTop: "auto",
    marginBottom: 28
  }
});
