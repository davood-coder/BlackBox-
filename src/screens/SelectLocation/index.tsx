import { useEffect, useMemo, useRef, useState } from "react";
import type { ImageStyle } from "react-native";
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { AppHeader, BottomNav, Field, GhostButton, Rating, Screen } from "../../components/ui";
import { MapPreview } from "../../components/MapPreview";
import type { Barbershop, Coordinates } from "../../data";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, spacing } from "../../theme";
import { fetchNearbyBarbershops, geocodeArea, reverseGeocodeAreaLabel, searchBarbershopsByAreaName } from "../../services/nearbyBarbers";

type LookupState = "loading" | "ready" | "permission-denied" | "unavailable" | "empty" | "place-not-found" | "area-empty" | "error";

export default function SelectLocation({ navigation, route }: any) {
  const { height, width } = useWindowDimensions();
  const mounted = useRef(true);
  const searchRequestId = useRef(0);
  const { availableShops, setAvailableShops, selectedShop, setSelectedShop, setSelectedBarber } = useBooking();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupState, setLookupState] = useState<LookupState>("loading");
  const [locationLabel, setLocationLabel] = useState("Current location");
  const [activeAreaQuery, setActiveAreaQuery] = useState("");
  const mapHeight = Math.min(300, Math.max(190, height * (height < 700 ? 0.28 : 0.31)));
  const isNarrow = width < 360;
  const nextScreen = route?.params?.nextScreen === "Barbers" ? "Barbers" : "BookAppointment";

  useEffect(() => {
    mounted.current = true;
    loadNearby();

    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 3) {
      if (!term) setActiveAreaQuery("");
      return;
    }

    const debounce = setTimeout(() => {
      searchArea(term);
    }, 850);

    return () => clearTimeout(debounce);
  }, [query]);

  async function loadNearby() {
    const requestId = ++searchRequestId.current;
    setQuery("");
    setActiveAreaQuery("");
    setLoading(true);
    setLookupState("loading");
    setAvailableShops([]);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        commitLatest(requestId, () => {
          setLookupState("permission-denied");
          setLocationLabel("Location off");
        });
        return;
      }

      const position = await getCurrentPosition();
      if (!position) {
        commitLatest(requestId, () => {
          setLookupState("unavailable");
          setLocationLabel("Current location");
        });
        return;
      }

      const origin = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      const resolvedLabel = await resolveLocationLabel(origin);
      const nearbyShops = await fetchNearbyBarbershops(origin).catch(() => []);
      const widerNearbyShops = nearbyShops.length ? nearbyShops : await fetchNearbyBarbershops(origin, 15000).catch(() => []);
      const shops = widerNearbyShops.length || resolvedLabel === "Current location" ? widerNearbyShops : await searchBarbershopsByAreaName(resolvedLabel, origin);

      commitLatest(requestId, () => {
        setLocationLabel(resolvedLabel);
        setAvailableShops(shops);

        if (!shops.length) {
          setLookupState("empty");
          return;
        }

        setLookupState("ready");
        const nextSelectedShop = shops.find((shop) => shop.id === selectedShop.id) || shops[0];
        setSelectedShop(nextSelectedShop);
        setSelectedBarber((current) => nextSelectedShop.bestBarbers?.[0] || current);
      });
    } catch {
      commitLatest(requestId, () => {
        setLookupState("error");
        setAvailableShops([]);
      });
    } finally {
      commitLatest(requestId, () => setLoading(false));
    }
  }

  async function searchArea(rawTerm = query) {
    const term = rawTerm.trim();
    if (term.length < 3) return;

    const requestId = ++searchRequestId.current;
    setActiveAreaQuery(term);
    setLoading(true);
    setLookupState("loading");

    try {
      const place = await geocodeArea(term);

      if (!place) {
        commitLatest(requestId, () => {
          setLocationLabel(term);
          setAvailableShops([]);
          setLookupState("place-not-found");
        });
        return;
      }

      const namedShops = await searchBarbershopsByAreaName(term, place.coordinates);
      const nearbyShops = namedShops.length ? namedShops : await fetchNearbyBarbershops(place.coordinates, 12000).catch(() => []);
      const shops = nearbyShops.length ? nearbyShops : await fetchNearbyBarbershops(place.coordinates, 30000).catch(() => []);

      commitLatest(requestId, () => {
        setLocationLabel(place.label);
        setAvailableShops(shops);

        if (!shops.length) {
          setLookupState("area-empty");
          return;
        }

        setLookupState("ready");
        const nextSelectedShop = shops.find((shop) => shop.id === selectedShop.id) || shops[0];
        setSelectedShop(nextSelectedShop);
        setSelectedBarber((current) => nextSelectedShop.bestBarbers?.[0] || current);
      });
    } catch {
      commitLatest(requestId, () => {
        setLocationLabel(term);
        setAvailableShops([]);
        setLookupState("error");
      });
    } finally {
      commitLatest(requestId, () => setLoading(false));
    }
  }

  function commitLatest(requestId: number, update: () => void) {
    if (mounted.current && searchRequestId.current === requestId) update();
  }

  const realShops = useMemo(() => availableShops.filter((shop) => shop.source !== "fallback"), [availableShops]);

  const filteredShops = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return realShops;
    if (term.length >= 3) return realShops;
    return realShops.filter((shop) => {
      return [shop.name, shop.address, shop.distance].join(" ").toLowerCase().includes(term);
    });
  }, [realShops, query, activeAreaQuery]);

  const activeShop = useMemo(() => {
    return realShops.find((shop) => shop.id === selectedShop.id);
  }, [realShops, selectedShop.id]);

  function openShop(shop: Barbershop) {
    setSelectedShop(shop);
    setSelectedBarber((current) => shop.bestBarbers?.[0] || current);
    navigation.navigate(nextScreen);
  }

  const emptyCopy = getEmptyCopy(lookupState);

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset contentStyle={styles.screenContent}>
        <AppHeader title="Nearby Barbers" onBack={() => navigation.goBack()} />
        <View style={styles.locationRow}>
          <View style={styles.locationTextWrap}>
            <Feather name="map-pin" size={15} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              Near {locationLabel}
            </Text>
          </View>
          <Pressable onPress={loadNearby} style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}>
            <Feather name="refresh-cw" size={15} color={colors.text} />
          </Pressable>
        </View>
        <Field
          icon="search"
          placeholder="Search city, state, or area"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => searchArea(query)}
          returnKeyType="search"
          autoCapitalize="words"
          style={styles.search}
        />
        <View style={styles.mapWrap}>
          <MapPreview shops={filteredShops.length ? filteredShops : realShops} selectedShop={activeShop} height={mapHeight} onMarkerPress={setSelectedShop} />
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Barbershops</Text>
          <Text style={styles.countText}>{loading ? "Searching" : `${filteredShops.length} found`}</Text>
        </View>
        <View style={styles.list}>
          {filteredShops.map((shop) => (
            <Pressable
              key={shop.id}
              onPress={() => openShop(shop)}
              style={({ pressed }) => [styles.shopCard, selectedShop.id === shop.id && styles.selectedShopCard, pressed && styles.pressed]}
            >
              <Image source={shop.image} style={[styles.shopImage, isNarrow && styles.shopImageSmall] as ImageStyle} />
              <View style={styles.shopInfo}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {shop.name}
                </Text>
                <Text style={styles.address} numberOfLines={1}>{shop.address}</Text>
                <View style={styles.metaRow}>
                  <Feather name="navigation" size={11} color={colors.muted} />
                  <Text style={styles.meta}>{shop.distance}</Text>
                  <Rating value={shop.rating} count={shop.reviews} small />
                </View>
              </View>
              <View style={[styles.selectButton, selectedShop.id === shop.id && styles.selectedButton]}>
                <Text style={[styles.selectText, selectedShop.id === shop.id && styles.selectedButtonText]}>
                  {nextScreen === "BookAppointment" ? "Book" : "View"}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        {!filteredShops.length && !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{emptyCopy.title}</Text>
            <Text style={styles.emptyCopy}>{emptyCopy.copy}</Text>
            <GhostButton label="Use current location" icon="navigation" onPress={loadNearby} style={styles.retryButton} />
          </View>
        ) : null}
      </Screen>
      <BottomNav active="Barbers" navigation={navigation} />
    </View>
  );
}

async function getCurrentPosition() {
  try {
    return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  } catch {
    return await Location.getLastKnownPositionAsync({ maxAge: 300000 });
  }
}

async function resolveLocationLabel(origin: Coordinates) {
  if (Platform.OS === "web") {
    return reverseGeocodeAreaLabel(origin);
  }

  try {
    const [place] = await Location.reverseGeocodeAsync(origin);
    return [place?.district, place?.city, place?.region].filter(Boolean).join(", ") || "Current location";
  } catch {
    return reverseGeocodeAreaLabel(origin);
  }
}

function getEmptyCopy(state: LookupState) {
  if (state === "permission-denied") {
    return {
      title: "Location permission needed",
      copy: "Turn on location access so nearby barber shops can be found from map data."
    };
  }

  if (state === "unavailable") {
    return {
      title: "Location unavailable",
      copy: "Move to an area with a stronger signal and try again."
    };
  }

  if (state === "error") {
    return {
      title: "Map search failed",
      copy: "The live map lookup could not be reached. Try again in a moment."
    };
  }

  if (state === "place-not-found") {
    return {
      title: "Area not found",
      copy: "Enter a city, state, or nearby area with a little more detail."
    };
  }

  if (state === "area-empty") {
    return {
      title: "No mapped shops found",
      copy: "Try a nearby city, state, or a larger area name."
    };
  }

  return {
    title: "No nearby shops found",
    copy: "Try again from your current residence or search by city, state, or area."
  };
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  screenContent: {
    paddingBottom: 118
  },
  locationRow: {
    minHeight: 42,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: "rgba(30,34,43,0.76)",
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  locationTextWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  locationText: {
    flex: 1,
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)"
  },
  search: {
    marginBottom: spacing.md
  },
  mapWrap: {
    marginBottom: spacing.lg
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,17,21,0.45)",
    borderRadius: radius.lg
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16
  },
  countText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  list: {
    gap: 12
  },
  shopCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12
  },
  selectedShopCard: {
    borderColor: colors.primary,
    backgroundColor: "rgba(212,168,90,0.08)"
  },
  shopImage: {
    width: 58,
    height: 58,
    borderRadius: 14
  },
  shopImageSmall: {
    width: 50,
    height: 50
  },
  shopInfo: {
    flex: 1,
    minWidth: 0
  },
  shopName: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  address: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 3
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    flexWrap: "wrap"
  },
  meta: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginRight: 8
  },
  selectButton: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  selectedButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  selectText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  selectedButtonText: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  emptyState: {
    minHeight: 156,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    textAlign: "center"
  },
  emptyCopy: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    textAlign: "center"
  },
  retryButton: {
    minHeight: 44,
    marginTop: 16,
    paddingHorizontal: 18
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.99 }]
  }
});
