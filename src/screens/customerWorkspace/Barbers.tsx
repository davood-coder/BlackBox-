import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, BottomNav, Card, FadeInView, Field, GhostButton, Rating, Screen } from "../../components/ui";
import { MapPreview } from "../../components/MapPreview";
import { barbers } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

export default function Barbers({ navigation }: any) {
  const { selectedShop, selectedBarber, setSelectedBarber } = useBooking();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const shopBarbers = selectedShop.bestBarbers?.length ? selectedShop.bestBarbers : barbers;

  const filteredBarbers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return shopBarbers.filter((barber) => {
      const haystack = [barber.name, barber.role, barber.specialty, barber.nextSlot].join(" ").toLowerCase();
      const matchesSearch = !term || haystack.includes(term);
      const matchesFilter =
        filter === "All" ||
        (filter === "Available" && Boolean(barber.nextSlot)) ||
        (filter === "Top Rated" && Number(barber.rating) >= 4.8) ||
        (filter === "Beards" && /beard|shave/i.test(barber.specialty)) ||
        (filter === "Fades" && /fade|taper/i.test(barber.specialty));

      return matchesSearch && matchesFilter;
    });
  }, [filter, query, shopBarbers]);

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <AppHeader title="Best Barbers" onBack={() => goBackOrNavigate(navigation, "Home")} />
        <Card style={styles.shopCard}>
          <View style={styles.shopHeader}>
            <View style={styles.shopText}>
              <Text style={styles.shopName} numberOfLines={1}>{selectedShop.name}</Text>
              <Text style={styles.shopAddress} numberOfLines={1}>{selectedShop.address}</Text>
              <Text style={styles.shopStatus}>{selectedShop.queue || "Walk-ins open"} - Open until {selectedShop.openUntil || "8:00 PM"}</Text>
            </View>
            <GhostButton label="Change" onPress={() => navigation.navigate("SelectLocation", { nextScreen: "Barbers" })} style={styles.changeButton} />
          </View>
          <MapPreview shops={[selectedShop]} selectedShop={selectedShop} height={132} compact />
        </Card>
        <Field icon="search" placeholder="Search barber or service" value={query} onChangeText={setQuery} style={styles.search} />
        <View style={styles.filterRow}>
          {["All", "Available", "Top Rated", "Beards", "Fades"].map((item) => (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.list}>
          {filteredBarbers.map((barber, index) => (
            <FadeInView key={barber.id} delay={index * 55}>
              <Pressable
                onPress={() => {
                  setSelectedBarber(barber);
                  navigation.navigate("BarberProfile");
                }}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Card style={[styles.barberCard, selectedBarber.id === barber.id && styles.selectedCard]}>
                  <Image source={barber.image} style={styles.avatar} />
                  <View style={styles.info}>
                    <Text style={styles.name}>{barber.name}</Text>
                    <View style={styles.meta}>
                      <Rating value={barber.rating} count={barber.reviews} small />
                      <Text style={styles.dot}>-</Text>
                      <Text style={styles.role}>{barber.role}</Text>
                    </View>
                    <Text style={styles.specialty} numberOfLines={1}>{barber.specialty}</Text>
                    <View style={styles.nextSlotRow}>
                      <Feather name="clock" size={11} color={colors.primary} />
                      <Text style={styles.nextSlot}>Next slot {barber.nextSlot}</Text>
                    </View>
                  </View>
                  {index === 0 ? (
                    <View style={styles.bestBadge}>
                      <Feather name="award" size={12} color={colors.black} />
                    </View>
                  ) : null}
                </Card>
              </Pressable>
            </FadeInView>
          ))}
        </View>
      </Screen>
      <BottomNav active="Explore" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  shopCard: {
    gap: 12,
    marginBottom: 14
  },
  shopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  shopText: {
    flex: 1,
    minWidth: 0
  },
  shopName: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16
  },
  shopAddress: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 4
  },
  shopStatus: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 5
  },
  changeButton: {
    minHeight: 38,
    paddingHorizontal: 14
  },
  search: {
    marginBottom: 10
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18
  },
  filterChip: {
    minHeight: 38,
    borderRadius: radius.full,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  filterText: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  filterTextActive: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  list: {
    gap: 13
  },
  barberCard: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: radius.md
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: "rgba(212,168,90,0.08)"
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 17
  },
  info: {
    flex: 1,
    minWidth: 0
  },
  name: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 16
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 7,
    flexWrap: "wrap"
  },
  dot: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12
  },
  role: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12
  },
  specialty: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 6
  },
  nextSlotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8
  },
  nextSlot: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11
  },
  bestBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }]
  }
});
