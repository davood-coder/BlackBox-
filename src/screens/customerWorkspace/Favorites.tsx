import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, Rating, Screen } from "../../components/ui";
import { barbershops } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

export default function Favorites({ navigation }: any) {
  const { availableShops, favoriteShopIds, toggleFavoriteShop, setSelectedShop, setSelectedBarber, themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const allShops = [...availableShops, ...barbershops].filter((shop, index, items) => items.findIndex((item) => item.id === shop.id) === index);
  const favorites = allShops.filter((shop) => favoriteShopIds.includes(shop.id));

  function openShop(shop: (typeof allShops)[number]) {
    setSelectedShop(shop);
    setSelectedBarber((current) => shop.bestBarbers?.[0] || current);
    navigation.navigate("ShopProfile");
  }

  return (
    <Screen scroll>
      <AppHeader title="Favorites" onBack={() => goBackOrNavigate(navigation, "Home")} />
      <Text style={[styles.intro, isDark && { color: "#8E8E93" }]}>Your saved shops and go-to professionals.</Text>
      <View style={styles.tabs}>
        <View style={styles.activeTab}><Text style={styles.activeTabText}>Shops</Text></View>
        <Pressable onPress={() => navigation.navigate("Barbers")} style={styles.tab}><Text style={[styles.tabText, isDark && { color: "#8E8E93" }]}>Barbers</Text></Pressable>
      </View>
      <View style={styles.list}>
        {favorites.map((shop) => (
          <Pressable key={shop.id} onPress={() => openShop(shop)} style={({ pressed }) => [styles.shopRow, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }, pressed && styles.pressed]}>
            <Image source={shop.image} style={styles.image} />
            <View style={styles.shopCopy}>
              <Text style={[styles.name, isDark && { color: "#FFFFFF" }]} numberOfLines={1}>{shop.name}</Text>
              <Text style={[styles.address, isDark && { color: "#8E8E93" }]} numberOfLines={1}>{shop.address}</Text>
              <View style={styles.meta}>
                <Rating value={shop.rating} count={shop.reviews} small />
                <Text style={styles.distance}>{shop.distance}</Text>
              </View>
              <Text style={styles.availability}>{shop.queue || "Appointments available"}</Text>
            </View>
            <Pressable accessibilityLabel="Remove favorite" onPress={() => toggleFavoriteShop(shop.id)} style={styles.heart}>
              <Feather name="heart" size={18} color={colors.primaryDark} />
            </Pressable>
          </Pressable>
        ))}
      </View>
      {!favorites.length ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Feather name="heart" size={25} color={colors.primaryDark} /></View>
          <Text style={styles.emptyTitle}>No saved shops yet</Text>
          <Text style={styles.emptyCopy}>Save a shop from its profile and it will stay close at hand.</Text>
          <Pressable onPress={() => navigation.navigate("SelectLocation", { nextScreen: "ShopProfile" })} style={styles.exploreButton}>
            <Text style={styles.exploreText}>Explore nearby shops</Text>
          </Pressable>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 2, marginBottom: 18 },
  tabs: { height: 44, borderRadius: radius.full, backgroundColor: colors.elevated, padding: 4, flexDirection: "row", marginBottom: 18 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  activeTab: { flex: 1, alignItems: "center", justifyContent: "center", borderRadius: radius.full, backgroundColor: colors.white },
  tabText: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 16 },
  activeTabText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  list: { gap: 12 },
  shopRow: {
    minHeight: 122,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  image: { width: 94, height: 98, borderRadius: 12 },
  shopCopy: { flex: 1, minWidth: 0 },
  name: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15 },
  address: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 5 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 9 },
  distance: { color: colors.muted, fontFamily: fonts.medium, fontSize: 10 },
  availability: { color: colors.success, fontFamily: fonts.semibold, fontSize: 10, marginTop: 8 },
  heart: { alignSelf: "flex-start", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  empty: { minHeight: 350, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  emptyTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 19, marginTop: 18 },
  emptyCopy: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, textAlign: "center", marginTop: 7 },
  exploreButton: { minHeight: 46, borderRadius: radius.full, backgroundColor: colors.black, justifyContent: "center", paddingHorizontal: 18, marginTop: 20 },
  exploreText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 12 },
  pressed: { opacity: 0.77, transform: [{ scale: 0.99 }] }
});
