import { useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, BottomNav, Card, Field, GhostButton, Rating, Screen } from "../../components/ui";
import { MapPreview } from "../../components/MapPreview";
import { barbers } from "../../data";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

export default function Barbers({ navigation }: any) {
  const { selectedShop, selectedBarber, setSelectedBarber } = useBooking();
  const [query, setQuery] = useState("");
  const shopBarbers = selectedShop.bestBarbers?.length ? selectedShop.bestBarbers : barbers;

  const filteredBarbers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return shopBarbers;
    return shopBarbers.filter((barber) => [barber.name, barber.role, barber.specialty].join(" ").toLowerCase().includes(term));
  }, [query, shopBarbers]);

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <AppHeader title="Best Barbers" onBack={() => navigation.navigate("Home")} />
        <Card style={styles.shopCard}>
          <View style={styles.shopHeader}>
            <View style={styles.shopText}>
              <Text style={styles.shopName} numberOfLines={1}>{selectedShop.name}</Text>
              <Text style={styles.shopAddress} numberOfLines={1}>{selectedShop.address}</Text>
            </View>
            <GhostButton label="Change" onPress={() => navigation.navigate("SelectLocation", { nextScreen: "Barbers" })} style={styles.changeButton} />
          </View>
          <MapPreview shops={[selectedShop]} selectedShop={selectedShop} height={132} compact />
        </Card>
        <Field icon="search" placeholder="Search barber or service" value={query} onChangeText={setQuery} style={styles.search} />
        <View style={styles.list}>
          {filteredBarbers.map((barber, index) => (
            <Pressable
              key={barber.id}
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
                </View>
                {index === 0 ? (
                  <View style={styles.bestBadge}>
                    <Feather name="award" size={12} color={colors.black} />
                  </View>
                ) : null}
              </Card>
            </Pressable>
          ))}
        </View>
      </Screen>
      <BottomNav active="Barbers" navigation={navigation} />
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
  changeButton: {
    minHeight: 38,
    paddingHorizontal: 14
  },
  search: {
    marginBottom: 18
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
