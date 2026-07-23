import { ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader, Card, PrimaryButton, Screen } from "../../components/ui";
import { MapPreview } from "../../components/MapPreview";
import { services } from "../../data";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, spacing } from "../../theme";

export default function BarberProfile({ navigation }: any) {
  const { height } = useWindowDimensions();
  const { selectedBarber, selectedShop, selectedService, setSelectedService } = useBooking();
  const isShort = height < 720;
  const shopServices = selectedShop.services?.length ? selectedShop.services : services;

  return (
    <Screen scroll padded={false} contentStyle={styles.screenContent}>
      <ImageBackground source={selectedBarber.image} resizeMode="cover" style={[styles.hero, { height: isShort ? 282 : 332 }]}>
        <LinearGradient colors={["rgba(15,17,21,0.2)", "rgba(15,17,21,0.38)", colors.background]} style={styles.heroOverlay}>
          <View style={styles.headerWrap}>
            <AppHeader title="Barber Profile" onBack={() => navigation.goBack()} />
          </View>
          <View style={styles.identity}>
            <Text style={styles.name}>{selectedBarber.name}</Text>
            <Text style={styles.role}>{selectedBarber.role}</Text>
            <View style={styles.stats}>
              <Pressable onPress={() => navigation.navigate("Reviews")} style={styles.statItem}>
                <Ionicons name="star" color={colors.primaryLight} size={15} />
                <Text style={styles.statText}>{selectedBarber.rating} ({selectedBarber.reviews})</Text>
              </Pressable>
              <View style={styles.statItem}>
                <Text style={styles.statText}>{selectedBarber.experience}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.body}>
        <Card style={styles.shopCard}>
          <Text style={styles.shopName}>{selectedShop.name}</Text>
          <Text style={styles.shopAddress}>{selectedShop.address}</Text>
          <MapPreview shops={[selectedShop]} selectedShop={selectedShop} height={132} compact />
          <View style={styles.shopMetaRow}>
            <Text style={styles.shopMeta}>{selectedShop.distance}</Text>
            <Text style={styles.shopMeta}>Rating {selectedShop.rating}</Text>
            {selectedShop.phone ? <Text style={styles.shopMeta}>{selectedShop.phone}</Text> : null}
          </View>
        </Card>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.about}>{selectedBarber.bio}</Text>
        <Text style={styles.specialty}>{selectedBarber.specialty}</Text>

        <Text style={styles.sectionTitle}>All Services</Text>
        {shopServices.map((service) => {
          const selected = selectedService.id === service.id;
          return (
            <Pressable key={service.id} onPress={() => setSelectedService(service)}>
              <Card style={[styles.serviceCard, selected && styles.selectedService]}>
                <View style={styles.serviceTextWrap}>
                  <Text style={styles.serviceText}>{service.profileLabel || service.label}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                  <Text style={styles.serviceDuration}>{service.duration}</Text>
                </View>
                <Text style={styles.price}>${service.price}</Text>
              </Card>
            </Pressable>
          );
        })}
        <PrimaryButton label={`Book with ${selectedBarber.name.split(" ")[0]}`} icon={null} onPress={() => navigation.navigate("BookAppointment")} style={styles.button} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 32
  },
  hero: {
    backgroundColor: colors.background
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "space-between"
  },
  headerWrap: {
    paddingHorizontal: spacing.screen,
    paddingTop: 46
  },
  identity: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 28
  },
  name: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 27
  },
  role: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 15,
    marginTop: 4
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginTop: 18,
    flexWrap: "wrap"
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  statText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  body: {
    paddingHorizontal: spacing.screen,
    paddingTop: 6
  },
  shopCard: {
    gap: 12,
    marginBottom: 16
  },
  shopName: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16
  },
  shopAddress: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19
  },
  shopMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  shopMeta: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    marginTop: 14,
    marginBottom: 9
  },
  about: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23
  },
  specialty: {
    color: colors.cream,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8
  },
  serviceCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.md,
    marginBottom: 10,
    gap: 12
  },
  selectedService: {
    borderColor: colors.primary,
    backgroundColor: "rgba(212,168,90,0.08)"
  },
  serviceTextWrap: {
    flex: 1,
    minWidth: 0
  },
  serviceText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  serviceDescription: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4
  },
  serviceDuration: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 4
  },
  price: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15
  },
  button: {
    marginTop: 8,
    marginBottom: 28
  }
});
