import { Image, ImageBackground, Linking, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PrimaryButton, Rating } from "../../components/ui";
import { reviews, services } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, shadows, spacing } from "../../theme";

export default function ShopProfile({ navigation }: any) {
  const { width } = useWindowDimensions();
  const {
    selectedShop,
    selectedService,
    setSelectedService,
    selectedBarber,
    setSelectedBarber,
    favoriteShopIds,
    toggleFavoriteShop,
    currency,
    themeMode
  } = useBooking();
  const isDark = themeMode === "dark";
  const isFavorite = favoriteShopIds.includes(selectedShop.id);
  const shopServices = selectedShop.services || services;
  const shopBarbers = selectedShop.bestBarbers || [];
  const heroHeight = Math.min(350, Math.max(280, width * 0.78));

  async function shareShop() {
    await Share.share({
      title: selectedShop.name,
      message: `View ${selectedShop.name} on Cutzix: cutzix://shop/${selectedShop.id}`
    });
  }

  function openDirections() {
    const query = encodeURIComponent(selectedShop.address);
    Linking.openURL(`https://maps.google.com/?q=${query}`);
  }

  function callShop() {
    if (selectedShop.phone) Linking.openURL(`tel:${selectedShop.phone}`);
  }

  function whatsAppShop() {
    if (!selectedShop.phone) return;
    const phone = selectedShop.phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${phone}`);
  }

  return (
    <SafeAreaView style={[styles.safe, isDark && { backgroundColor: "#121214" }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ImageBackground source={selectedShop.image} resizeMode="cover" style={[styles.hero, { height: heroHeight }]}>
          <LinearGradient colors={["rgba(15,17,21,0.18)", "rgba(15,17,21,0.76)"]} style={styles.heroOverlay}>
            <View style={styles.heroTop}>
              <RoundButton icon="arrow-left" label="Go back" onPress={() => goBackOrNavigate(navigation, "Home")} />
              <View style={styles.heroActions}>
                <RoundButton icon="share-2" label="Share shop" onPress={shareShop} />
                <RoundButton
                  icon="heart"
                  label={isFavorite ? "Remove favorite" : "Add favorite"}
                  active={isFavorite}
                  onPress={() => toggleFavoriteShop(selectedShop.id)}
                />
              </View>
            </View>
            <View style={styles.heroCopy}>
              <View style={styles.statusPill}>
                <View style={[styles.statusDot, selectedShop.status === "Busy" && styles.busyDot]} />
                <Text style={styles.statusPillText}>{selectedShop.status || "Open"}</Text>
              </View>
              <Text style={styles.shopName}>{selectedShop.name}</Text>
              <Text style={styles.owner}>Owned by {selectedShop.owner || "Cutzix Partner"}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.heroRating}>
                  <Ionicons name="star" size={14} color={colors.primaryLight} />
                  <Text style={styles.heroRatingText}>{selectedShop.rating} ({selectedShop.reviews})</Text>
                </View>
                <Text style={styles.heroMetaText}>{selectedShop.distance}</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.addressRow}>
            <View style={styles.addressIcon}>
              <Feather name="map-pin" size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.addressCopy}>
              <Text style={styles.address}>{selectedShop.address}</Text>
              <Text style={styles.hours}>{selectedShop.openingHours || `Open until ${selectedShop.openUntil}`}</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <QuickAction icon="navigation" label="Directions" onPress={openDirections} />
            <QuickAction icon="phone" label="Call" onPress={callShop} />
            <QuickAction icon="message-circle" label="WhatsApp" onPress={whatsAppShop} />
            <QuickAction icon="maximize" label="Shop QR" onPress={() => navigation.navigate("QRScanner")} />
          </View>

          <View style={styles.queueBand}>
            <View>
              <Text style={styles.queueEyebrow}>Live queue</Text>
              <Text style={styles.queueTitle}>{selectedShop.queue || "Walk-ins open"}</Text>
            </View>
            <View style={styles.waitBlock}>
              <Text style={styles.waitValue}>{selectedShop.averageWait || "15 min"}</Text>
              <Text style={styles.waitLabel}>average wait</Text>
            </View>
          </View>

          <SectionHeader title="Services" action={`${shopServices.length} available`} />
          <View style={styles.serviceList}>
            {shopServices.map((service) => {
              const active = selectedService.id === service.id;
              return (
                <Pressable
                  key={service.id}
                  onPress={() => setSelectedService(service)}
                  style={({ pressed }) => [styles.serviceRow, active && styles.serviceActive, pressed && styles.pressed]}
                >
                  <View style={[styles.serviceIcon, active && styles.serviceIconActive]}>
                    <Feather name={service.icon as any} size={18} color={active ? colors.black : colors.primaryDark} />
                  </View>
                  <View style={styles.serviceCopy}>
                    <Text style={styles.serviceName}>{service.profileLabel || service.label}</Text>
                    <Text style={styles.serviceDescription} numberOfLines={1}>{service.description}</Text>
                    <Text style={styles.serviceDuration}>{service.duration}</Text>
                  </View>
                  <Text style={styles.servicePrice}>{currency.symbol}{service.price}</Text>
                </Pressable>
              );
            })}
          </View>

          <SectionHeader title="Available barbers" action={`${shopBarbers.length} professionals`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barberList}>
            {shopBarbers.map((barber) => {
              const active = selectedBarber.id === barber.id;
              return (
                <Pressable
                  key={barber.id}
                  onPress={() => setSelectedBarber(barber)}
                  style={({ pressed }) => [styles.barberCard, active && styles.barberActive, pressed && styles.pressed]}
                >
                  <Image source={barber.image} style={styles.barberImage} />
                  <Text style={styles.barberName} numberOfLines={1}>{barber.name}</Text>
                  <Text style={styles.barberRole} numberOfLines={1}>{barber.role}</Text>
                  <View style={styles.barberFooter}>
                    <Ionicons name="star" size={12} color={colors.primary} />
                    <Text style={styles.barberRating}>{barber.rating}</Text>
                    <Text style={styles.barberSlot}>{barber.nextSlot}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <SectionHeader title="Recent reviews" action="View all" onAction={() => navigation.navigate("Reviews")} />
          <View style={styles.reviewPanel}>
            <View style={styles.reviewTop}>
              <View style={styles.reviewAvatar}>
                <Text style={styles.reviewInitial}>{reviews[0].name.charAt(0)}</Text>
              </View>
              <View style={styles.reviewIdentity}>
                <Text style={styles.reviewName}>{reviews[0].name}</Text>
                <Text style={styles.reviewAge}>{reviews[0].age}</Text>
              </View>
              <Rating value={String(reviews[0].rating)} small />
            </View>
            <Text style={styles.reviewText}>{reviews[0].text}</Text>
          </View>

          <PrimaryButton
            label={`Request ${selectedService.shortLabel || selectedService.label}`}
            icon="calendar-outline"
            dark
            onPress={() => navigation.navigate("BookAppointment")}
            style={styles.bookButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RoundButton({ icon, label, onPress, active = false }: { icon: string; label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.roundButton, active && styles.roundButtonActive, pressed && styles.pressed]}>
      <Feather name={icon as any} size={20} color={active ? colors.black : colors.white} />
    </Pressable>
  );
}

function QuickAction({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <View style={styles.quickIcon}>
        <Feather name={icon as any} size={18} color={colors.text} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

function SectionHeader({ title, action, onAction }: { title: string; action: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable disabled={!onAction} onPress={onAction}>
        <Text style={[styles.sectionAction, onAction && styles.sectionActionLink]}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 28 },
  hero: { width: "100%", minHeight: 280 },
  heroOverlay: { flex: 1, justifyContent: "space-between", padding: spacing.screen },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroActions: { flexDirection: "row", gap: 8 },
  roundButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,17,21,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)"
  },
  roundButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  heroCopy: { paddingBottom: 8 },
  statusPill: {
    alignSelf: "flex-start",
    minHeight: 28,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(15,17,21,0.56)"
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#66D39B" },
  busyDot: { backgroundColor: "#F0B04F" },
  statusPillText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 11 },
  shopName: { color: colors.white, fontFamily: fonts.headingHeavy, fontSize: 31, lineHeight: 38, marginTop: 12 },
  owner: { color: "#E8E8E3", fontFamily: fonts.body, fontSize: 13, marginTop: 4 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 },
  heroRating: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroRatingText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 12 },
  heroMetaText: { color: colors.white, fontFamily: fonts.medium, fontSize: 13 },
  content: { paddingHorizontal: spacing.screen, paddingTop: 20 },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  addressIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  addressCopy: { flex: 1, minWidth: 0 },
  address: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  hours: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 4 },
  actionRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginTop: 22 },
  quickAction: { flex: 1, minWidth: 0, alignItems: "center", gap: 7 },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  quickLabel: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 16 },
  queueBand: {
    minHeight: 92,
    borderRadius: radius.md,
    backgroundColor: colors.black,
    marginTop: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  queueEyebrow: { color: colors.primarySoft, fontFamily: fonts.semibold, fontSize: 10, textTransform: "uppercase" },
  queueTitle: { color: colors.white, fontFamily: fonts.headingSemi, fontSize: 17, marginTop: 6 },
  waitBlock: { alignItems: "flex-end" },
  waitValue: { color: colors.primaryLight, fontFamily: fonts.heading, fontSize: 21 },
  waitLabel: { color: "#BFC1BC", fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 18 },
  sectionAction: { color: colors.muted, fontFamily: fonts.medium, fontSize: 11 },
  sectionActionLink: { color: colors.primaryDark },
  serviceList: { gap: 10 },
  serviceRow: {
    minHeight: 78,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  serviceActive: { borderColor: colors.primary, backgroundColor: "#FFFBF3" },
  serviceIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated },
  serviceIconActive: { backgroundColor: colors.primary },
  serviceCopy: { flex: 1, minWidth: 0 },
  serviceName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  serviceDescription: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 3 },
  serviceDuration: { color: colors.primaryDark, fontFamily: fonts.medium, fontSize: 10, marginTop: 4 },
  servicePrice: { color: colors.text, fontFamily: fonts.bold, fontSize: 15 },
  barberList: { gap: 10, paddingRight: spacing.screen },
  barberCard: {
    width: 158,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10
  },
  barberActive: { borderColor: colors.primary, backgroundColor: "#FFFBF3" },
  barberImage: { width: "100%", height: 104, borderRadius: 11 },
  barberName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13, marginTop: 10 },
  barberRole: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 3 },
  barberFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 9 },
  barberRating: { color: colors.text, fontFamily: fonts.bold, fontSize: 10 },
  barberSlot: { color: colors.primaryDark, fontFamily: fonts.medium, fontSize: 9, marginLeft: "auto" },
  reviewPanel: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 16 },
  reviewTop: { flexDirection: "row", alignItems: "center" },
  reviewAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  reviewInitial: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 15 },
  reviewIdentity: { flex: 1, marginLeft: 10 },
  reviewName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  reviewAge: { color: colors.muted, fontFamily: fonts.body, fontSize: 10, marginTop: 2 },
  reviewText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, marginTop: 12 },
  bookButton: { marginTop: 26 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
