import { ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader, Card, FadeInView, PrimaryButton, Screen } from "../../components/ui";
import { MapPreview } from "../../components/MapPreview";
import { services } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, spacing } from "../../theme";

export default function BarberProfile({ navigation }: any) {
  const { height } = useWindowDimensions();
  const { selectedBarber, selectedShop, selectedService, setSelectedService, currency } = useBooking();
  const isShort = height < 720;
  const shopServices = selectedShop.services?.length ? selectedShop.services : services;

  return (
    <Screen scroll padded={false} contentStyle={styles.screenContent}>
      <ImageBackground source={selectedBarber.image} resizeMode="cover" style={[styles.hero, { height: isShort ? 282 : 332 }]}>
        <LinearGradient colors={["rgba(15,17,21,0.2)", "rgba(15,17,21,0.38)", colors.background]} style={styles.heroOverlay}>
          <View style={styles.headerWrap}>
            <AppHeader title="Barber Profile" onBack={() => goBackOrNavigate(navigation, "Barbers")} />
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
            <View style={styles.languageRow}>
              {selectedBarber.languages.map((language) => (
                <Text key={language} style={styles.languageChip}>{language}</Text>
              ))}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.body}>
        <FadeInView delay={60}>
          <Card style={styles.shopCard}>
            <Text style={styles.shopName}>{selectedShop.name}</Text>
            <Text style={styles.shopAddress}>{selectedShop.address}</Text>
            <MapPreview shops={[selectedShop]} selectedShop={selectedShop} height={132} compact />
            <View style={styles.shopMetaRow}>
              <Text style={styles.shopMeta}>{selectedShop.distance}</Text>
              <Text style={styles.shopMeta}>Rating {selectedShop.rating}</Text>
              <Text style={styles.shopMeta}>{selectedShop.queue || "Walk-ins open"}</Text>
              {selectedShop.phone ? <Text style={styles.shopMeta}>{selectedShop.phone}</Text> : null}
            </View>
          </Card>
        </FadeInView>

        <FadeInView delay={110}>
          <Card style={styles.actionPanel}>
            {[
              { label: "Call", icon: "phone" },
              { label: "Message", icon: "message-circle" },
              { label: "Directions", icon: "navigation" }
            ].map((action) => (
              <Pressable key={action.label} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
                <Feather name={action.icon as any} size={18} color={colors.primary} />
                <Text style={styles.actionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </Card>
        </FadeInView>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.about}>{selectedBarber.bio}</Text>
        <Text style={styles.specialty}>{selectedBarber.specialty}</Text>

        <Text style={styles.sectionTitle}>Availability</Text>
        <View style={styles.availabilityRow}>
          {selectedBarber.availability.map((slot) => (
            <Pressable key={slot} style={({ pressed }) => [styles.availabilityChip, pressed && styles.pressed]}>
              <Text style={styles.availabilityText}>{slot}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Portfolio</Text>
        <View style={styles.portfolioGrid}>
          {selectedBarber.portfolio.map((item, index) => (
            <ImageBackground key={item} source={index % 2 ? selectedShop.image : selectedBarber.image} resizeMode="cover" style={styles.portfolioCard} imageStyle={styles.portfolioImage}>
              <LinearGradient colors={["rgba(15,17,21,0.05)", "rgba(15,17,21,0.82)"]} style={styles.portfolioOverlay}>
                <Text style={styles.portfolioText}>{item}</Text>
              </LinearGradient>
            </ImageBackground>
          ))}
        </View>

        <Text style={styles.sectionTitle}>All Services</Text>
        {shopServices.map((service, index) => {
          const selected = selectedService.id === service.id;
          return (
            <FadeInView key={service.id} delay={index * 35}>
              <Pressable onPress={() => setSelectedService(service)} style={({ pressed }) => pressed && styles.pressed}>
                <Card style={[styles.serviceCard, selected && styles.selectedService]}>
                  <View style={styles.serviceTextWrap}>
                    <Text style={styles.serviceText}>{service.profileLabel || service.label}</Text>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                    <Text style={styles.serviceDuration}>{service.duration}</Text>
                  </View>
                  <Text style={styles.price}>{currency.symbol}{service.price}</Text>
                </Card>
              </Pressable>
            </FadeInView>
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
    fontSize: 16,
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
  languageRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap"
  },
  languageChip: {
    color: colors.cream,
    fontFamily: fonts.medium,
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden"
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
    fontSize: 16,
    lineHeight: 22
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
  actionPanel: {
    minHeight: 78,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  actionLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 16
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
    fontSize: 16,
    lineHeight: 23
  },
  specialty: {
    color: colors.primaryDark,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8
  },
  availabilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4
  },
  availabilityChip: {
    minHeight: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "rgba(212,168,90,0.34)",
    backgroundColor: "rgba(212,168,90,0.09)",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  availabilityText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  portfolioGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4
  },
  portfolioCard: {
    flex: 1,
    height: 116,
    overflow: "hidden",
    borderRadius: radius.md,
    backgroundColor: colors.card
  },
  portfolioImage: {
    borderRadius: radius.md
  },
  portfolioOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 10
  },
  portfolioText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16
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
    fontSize: 16,
    lineHeight: 22,
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
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }]
  }
});
