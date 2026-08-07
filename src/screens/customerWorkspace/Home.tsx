import { useEffect } from "react";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BottomNav, Rating, Screen } from "../../components/ui";
import { images } from "../../assets/images";
import { homeQuickActions, services, type Barbershop, temporaryProfiles, getKolkataTimeInfo } from "../../data";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, shadows, spacing } from "../../theme";

export default function Home({ navigation }: any) {
  const { width } = useWindowDimensions();
  const {
    availableShops,
    selectedShop,
    setSelectedShop,
    setSelectedBarber,
    setSelectedService,
    bookings,
    unreadNotificationCount,
    setWorkspace,
    currency
  } = useBooking();
  const cardWidth = Math.min(292, Math.max(250, width * 0.76));
  const visibleShops = availableShops.slice(0, 4);
  const activeBookings = bookings.filter((booking) => booking.status === "Confirmed" || booking.status === "Pending");
  const customerName = temporaryProfiles["Customer"].name;
  const { greeting } = getKolkataTimeInfo();

  useEffect(() => setWorkspace("Customer"), [setWorkspace]);

  function openShop(shop: Barbershop) {
    setSelectedShop(shop);
    setSelectedBarber((current) => shop.bestBarbers?.[0] || current);
    navigation.navigate("ShopProfile");
  }

  function openQuickAction(action: (typeof homeQuickActions)[number]) {
    navigation.navigate(action.route, "params" in action ? action.params : undefined);
  }

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset contentStyle={styles.screenContent}>
        <View style={styles.topbar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Feather name="scissors" size={16} color={colors.black} /></View>
            <View>
              <Text style={styles.brand}>Cutzix</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={10} color={colors.primaryDark} />
                <Text style={styles.location} numberOfLines={1}>{selectedShop.distance} away · {selectedShop.address.split(",")[0]}</Text>
              </View>
            </View>
          </View>
          <View style={styles.topActions}>
            <Pressable accessibilityLabel="Notifications" onPress={() => navigation.navigate("Notifications")} style={styles.iconButton}>
              <Feather name="bell" size={19} color={colors.text} />
              {unreadNotificationCount ? <View style={styles.notificationDot}><Text style={styles.notificationCount}>{unreadNotificationCount}</Text></View> : null}
            </Pressable>
            <Pressable accessibilityLabel="Profile" onPress={() => navigation.navigate("Profile")}>
              <Image source={images.masterBarber} style={styles.avatar} />
            </Pressable>
          </View>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.eyebrow}>{greeting}, {customerName}</Text>
          <Text style={styles.title}>Find your next great cut</Text>
          <Text style={styles.subtitle}>{activeBookings.length ? `${activeBookings.length} active appointment${activeBookings.length > 1 ? "s" : ""} on your schedule.` : "Fresh chairs are available near you today."}</Text>
        </View>

        <Pressable onPress={() => navigation.navigate("SelectLocation", { nextScreen: "ShopProfile" })} style={({ pressed }) => [styles.search, pressed && styles.pressed]}>
          <Feather name="search" size={19} color={colors.muted} />
          <Text style={styles.searchText}>Search shops, services, or locations</Text>
          <View style={styles.searchFilter}><Feather name="sliders" size={16} color={colors.text} /></View>
        </Pressable>

        <View style={styles.quickGrid}>
          {homeQuickActions.map((action) => (
            <Pressable key={action.label} onPress={() => openQuickAction(action)} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
              <View style={styles.quickIcon}><Feather name={action.icon as any} size={19} color={colors.primaryDark} /></View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <SectionHeader title="Available today" action="See nearby" onPress={() => navigation.navigate("SelectLocation", { nextScreen: "ShopProfile" })} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {visibleShops.map((shop) => (
            <Pressable key={shop.id} onPress={() => openShop(shop)} style={({ pressed }) => [styles.shopCard, { width: cardWidth }, pressed && styles.pressed]}>
              <Image source={shop.image} style={styles.shopImage} />
              <View style={styles.shopCardBody}>
                <View style={styles.shopTitleRow}>
                  <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                  <View style={[styles.openBadge, shop.status === "Busy" && styles.busyBadge]}>
                    <Text style={[styles.openText, shop.status === "Busy" && styles.busyText]}>{shop.status || "Open"}</Text>
                  </View>
                </View>
                <Text style={styles.shopAddress} numberOfLines={1}>{shop.address}</Text>
                <View style={styles.shopMeta}>
                  <Rating value={shop.rating} count={shop.reviews} small />
                  <Text style={styles.metaDivider}>·</Text>
                  <Text style={styles.distance}>{shop.distance}</Text>
                  <Text style={styles.nextSlot}>{shop.averageWait || "15 min"} wait</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <SectionHeader title="Popular services" action="View all" onPress={() => navigation.navigate("ShopProfile")} />
        <View style={styles.serviceGrid}>
          {services.slice(0, 4).map((service) => (
            <Pressable
              key={service.id}
              onPress={() => {
                setSelectedService(service);
                navigation.navigate("BookAppointment");
              }}
              style={({ pressed }) => [styles.serviceTile, pressed && styles.pressed]}
            >
              <View style={styles.serviceTileIcon}><Feather name={service.icon as any} size={20} color={colors.primaryDark} /></View>
              <View style={styles.serviceTileCopy}>
                <Text style={styles.serviceName} numberOfLines={1}>{service.shortLabel || service.label}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
              </View>
              <Text style={styles.servicePrice}>{currency.symbol}{service.price}</Text>
            </Pressable>
          ))}
        </View>

        <ImageBackground source={images.luxuryBarbershop} resizeMode="cover" style={styles.offer}>
          <LinearGradient colors={["rgba(15,17,21,0.24)", "rgba(15,17,21,0.88)"]} style={styles.offerOverlay}>
            <View style={styles.offerBadge}><Text style={styles.offerBadgeText}>WEEKEND EDIT</Text></View>
            <Text style={styles.offerTitle}>15% off deluxe grooming</Text>
            <Text style={styles.offerCopy}>Available at selected Cutzix shops through Sunday.</Text>
            <Pressable onPress={() => navigation.navigate("SelectLocation", { nextScreen: "BookAppointment" })} style={styles.offerButton}>
              <Text style={styles.offerButtonText}>Find an offer</Text>
              <Feather name="arrow-right" size={15} color={colors.black} />
            </Pressable>
          </LinearGradient>
        </ImageBackground>

        <SectionHeader title="Best rated near you" action="Explore" onPress={() => navigation.navigate("SelectLocation", { nextScreen: "ShopProfile" })} />
        <View style={styles.ratedList}>
          {[...visibleShops].sort((a, b) => Number(b.rating) - Number(a.rating)).slice(0, 3).map((shop) => (
            <Pressable key={shop.id} onPress={() => openShop(shop)} style={({ pressed }) => [styles.ratedRow, pressed && styles.pressed]}>
              <Image source={shop.image} style={styles.ratedImage} />
              <View style={styles.ratedCopy}>
                <Text style={styles.ratedName} numberOfLines={1}>{shop.name}</Text>
                <Text style={styles.ratedAddress} numberOfLines={1}>{shop.address}</Text>
                <View style={styles.ratedMeta}>
                  <Ionicons name="star" size={12} color={colors.primary} />
                  <Text style={styles.ratedRating}>{shop.rating}</Text>
                  <Text style={styles.ratedReviews}>{shop.reviews} reviews</Text>
                </View>
              </View>
              <View style={styles.chevron}><Feather name="chevron-right" size={17} color={colors.secondaryText} /></View>
            </Pressable>
          ))}
        </View>
      </Screen>
      <BottomNav active="Home" navigation={navigation} />
    </View>
  );
}

function SectionHeader({ title, action, onPress }: { title: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  screenContent: { paddingTop: 4 },
  topbar: { minHeight: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 },
  brandMark: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  brand: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 20 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2, maxWidth: 210 },
  location: { flex: 1, color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16 },
  topActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconButton: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  notificationDot: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.error, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  notificationCount: { color: colors.white, fontFamily: fonts.bold, fontSize: 8 },
  avatar: { width: 40, height: 40, borderRadius: 14 },
  welcome: { paddingTop: 22 },
  eyebrow: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 10, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 29, lineHeight: 36, marginTop: 6, maxWidth: 340 },
  subtitle: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, marginTop: 6 },
  search: { minHeight: 56, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 15, paddingRight: 7, marginTop: 22, ...shadows.card },
  searchText: { flex: 1, color: colors.muted, fontFamily: fonts.body, fontSize: 12 },
  searchFilter: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated },
  quickGrid: { flexDirection: "row", gap: 8, marginTop: 18 },
  quickAction: { flex: 1, minWidth: 0, minHeight: 72, alignItems: "center", justifyContent: "center", gap: 7 },
  quickIcon: { width: 45, height: 45, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  quickLabel: { color: colors.text, fontFamily: fonts.medium, fontSize: 10 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 18 },
  sectionAction: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 11 },
  horizontalList: { gap: 12, paddingRight: spacing.screen },
  shopCard: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, overflow: "hidden", ...shadows.card },
  shopImage: { width: "100%", height: 120 },
  shopCardBody: { padding: 12 },
  shopTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  shopName: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  openBadge: { borderRadius: radius.full, backgroundColor: "rgba(30,141,91,0.1)", paddingHorizontal: 8, paddingVertical: 5 },
  busyBadge: { backgroundColor: "rgba(169,105,0,0.1)" },
  openText: { color: colors.success, fontFamily: fonts.semibold, fontSize: 8 },
  busyText: { color: colors.warning },
  shopAddress: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 5 },
  shopMeta: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 9 },
  metaDivider: { color: colors.muted, fontFamily: fonts.body, fontSize: 10 },
  distance: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 16 },
  nextSlot: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 9, marginLeft: "auto" },
  serviceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  serviceTile: { flexGrow: 1, flexBasis: "46%", minWidth: 140, minHeight: 86, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 12, flexDirection: "row", alignItems: "center", gap: 9 },
  serviceTileIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  serviceTileCopy: { flex: 1, minWidth: 0 },
  serviceName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 11 },
  serviceDuration: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 4 },
  servicePrice: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 11 },
  offer: { minHeight: 230, borderRadius: radius.lg, overflow: "hidden", marginTop: 28 },
  offerOverlay: { flex: 1, justifyContent: "flex-end", padding: 18 },
  offerBadge: { alignSelf: "flex-start", borderRadius: radius.full, backgroundColor: colors.primary, paddingHorizontal: 9, paddingVertical: 5 },
  offerBadgeText: { color: colors.black, fontFamily: fonts.bold, fontSize: 8 },
  offerTitle: { color: colors.white, fontFamily: fonts.heading, fontSize: 22, marginTop: 10 },
  offerCopy: { color: "#D2D4D0", fontFamily: fonts.body, fontSize: 11, marginTop: 5 },
  offerButton: { alignSelf: "flex-start", minHeight: 40, borderRadius: radius.full, backgroundColor: colors.primary, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 7, marginTop: 14 },
  offerButtonText: { color: colors.black, fontFamily: fonts.bold, fontSize: 10 },
  ratedList: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  ratedRow: { minHeight: 84, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  ratedImage: { width: 58, height: 58, borderRadius: 13 },
  ratedCopy: { flex: 1, minWidth: 0 },
  ratedName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 13 },
  ratedAddress: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 4 },
  ratedMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 7 },
  ratedRating: { color: colors.text, fontFamily: fonts.bold, fontSize: 9 },
  ratedReviews: { color: colors.muted, fontFamily: fonts.body, fontSize: 8 },
  chevron: { width: 32, height: 32, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
