import { useEffect, useMemo, useRef, useState } from "react";
import type { ImageStyle } from "react-native";
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { AppHeader, BottomNav, Field, GhostButton, Rating, Screen } from "../../components/ui";
import { MapPreview } from "../../components/MapPreview";
import type { Barbershop, Coordinates } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, spacing } from "../../theme";
import { DEFAULT_COORDS, fallbackShops, fetchNearbyBarbershops, geocodeArea, reverseGeocodeAreaLabel, searchBarbershopsByAreaName, fetchIPGeolocation } from "../../services/nearbyBarbers";
import { getCurrencyFromAddress } from "../../utils/currency";

type LookupState = "loading" | "ready" | "permission-denied" | "unavailable" | "empty" | "place-not-found" | "area-empty" | "error";

export default function SelectLocation({ navigation, route }: any) {
  const { height, width } = useWindowDimensions();
  const mounted = useRef(true);
  const searchRequestId = useRef(0);
  const { availableShops, setAvailableShops, selectedShop, setSelectedShop, setSelectedBarber, setCurrency } = useBooking();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupState, setLookupState] = useState<LookupState>("loading");
  const [locationLabel, setLocationLabel] = useState("Current location");
  const [mapOrigin, setMapOrigin] = useState<Coordinates>(DEFAULT_COORDS);
  const [activeAreaQuery, setActiveAreaQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Closest");
  const mapHeight = Math.min(300, Math.max(190, height * (height < 700 ? 0.28 : 0.31)));
  const isNarrow = width < 360;
  const requestedScreen = route?.params?.nextScreen;
  const nextScreen = requestedScreen === "Barbers" || requestedScreen === "ShopProfile" ? requestedScreen : "BookAppointment";

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

    const handleIPFallback = async (originalErr?: string) => {
      console.log(`Main geolocation failed: ${originalErr || "Access denied"}. Trying IP Geolocation fallback...`);
      try {
        const ipLoc = await fetchIPGeolocation();
        const origin = { latitude: ipLoc.latitude, longitude: ipLoc.longitude };
        const nearbyShops = await fetchNearbyBarbershops(origin).catch(() => []);
        const widerNearbyShops = nearbyShops.length ? nearbyShops : await fetchNearbyBarbershops(origin, 25000).catch(() => []);
        const shops = widerNearbyShops.length ? widerNearbyShops : fallbackShops(origin, true);
        
        commitLatest(requestId, () => {
          setMapOrigin(origin);
          setLocationLabel(ipLoc.label);
          setAvailableShops(shops);
          setCurrency(getCurrencyFromAddress(ipLoc.label));
          setLookupState(widerNearbyShops.length ? "ready" : "empty");

          const nextSelectedShop = shops.find((shop) => shop.id === selectedShop.id) || shops[0];
          setSelectedShop(nextSelectedShop);
          setSelectedBarber((current) => nextSelectedShop.bestBarbers?.[0] || current);
        });
      } catch (ipErr) {
        console.log("IP Geolocation fallback also failed", ipErr);
        commitLatest(requestId, () => {
          setLookupState("permission-denied");
          useFallbackResults("Location off", DEFAULT_COORDS);
        });
      }
    };

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        await handleIPFallback("Permission not granted");
        return;
      }

      const position = await getCurrentPosition();
      if (!position) {
        await handleIPFallback("Position unavailable");
        return;
      }

      const origin = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setMapOrigin(origin);

      const resolvedLabel = await resolveLocationLabel(origin);
      const nearbyShops = await fetchNearbyBarbershops(origin).catch(() => []);
      const widerNearbyShops = nearbyShops.length ? nearbyShops : await fetchNearbyBarbershops(origin, 15000).catch(() => []);
      const areaShops = widerNearbyShops.length || resolvedLabel === "Current location" ? widerNearbyShops : await searchBarbershopsByAreaName(resolvedLabel, origin).catch(() => []);
      const shops = areaShops.length ? areaShops : fallbackShops(origin, true);

      commitLatest(requestId, () => {
        setLocationLabel(resolvedLabel);
        setAvailableShops(shops);
        setCurrency(getCurrencyFromAddress(resolvedLabel));

        if (!areaShops.length) {
          setLookupState("empty");
        } else {
          setLookupState("ready");
        }

        const nextSelectedShop = shops.find((shop) => shop.id === selectedShop.id) || shops[0];
        setSelectedShop(nextSelectedShop);
        setSelectedBarber((current) => nextSelectedShop.bestBarbers?.[0] || current);
      });
    } catch (e: any) {
      await handleIPFallback(e?.message);
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
      const widerShops = nearbyShops.length ? nearbyShops : await fetchNearbyBarbershops(place.coordinates, 30000).catch(() => []);
      const shops = widerShops.length ? widerShops : fallbackShops(place.coordinates, true);

      commitLatest(requestId, () => {
        setLocationLabel(place.label);
        setMapOrigin(place.coordinates);
        setAvailableShops(shops);
        setCurrency(getCurrencyFromAddress(place.label));

        if (!widerShops.length) {
          setLookupState("area-empty");
        } else {
          setLookupState("ready");
        }

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

  function useFallbackResults(label: string, origin: Coordinates) {
    const shops = fallbackShops(origin, origin !== DEFAULT_COORDS);
    setLocationLabel(label);
    setMapOrigin(origin);
    setAvailableShops(shops);

    const nextSelectedShop = shops.find((shop) => shop.id === selectedShop.id) || shops[0];
    if (nextSelectedShop) {
      setSelectedShop(nextSelectedShop);
      setSelectedBarber((current) => nextSelectedShop.bestBarbers?.[0] || current);
    }
  }

  const displayShops = useMemo(() => {
    if (availableShops.length) return availableShops;
    if (lookupState === "place-not-found") return [];
    return fallbackShops(mapOrigin, mapOrigin !== DEFAULT_COORDS);
  }, [availableShops, lookupState, mapOrigin]);

  const filteredShops = useMemo(() => {
    const term = query.trim().toLowerCase();
    const visibleShops = !term || term.length >= 3
      ? displayShops
      : displayShops.filter((shop) => [shop.name, shop.address, shop.distance, shop.queue].join(" ").toLowerCase().includes(term));

    const filtered = visibleShops.filter((shop) => {
      if (selectedFilter === "Walk-ins") return /walk|chair|slot/i.test(shop.queue || "");
      if (selectedFilter === "Open Now") return Boolean(shop.openUntil);
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (selectedFilter === "Top Rated") return Number(b.rating) - Number(a.rating);
      return (a.distanceMeters || 0) - (b.distanceMeters || 0);
    });
  }, [displayShops, query, activeAreaQuery, selectedFilter]);

  const activeShop = useMemo(() => {
    return displayShops.find((shop) => shop.id === selectedShop.id) || filteredShops[0];
  }, [displayShops, filteredShops, selectedShop.id]);

  const isUsingFallback = displayShops.some((shop) => shop.source === "fallback") && lookupState !== "ready";

  function openShop(shop: Barbershop) {
    setSelectedShop(shop);
    setSelectedBarber((current) => shop.bestBarbers?.[0] || current);
    navigation.navigate(nextScreen);
  }

  function selectMapShop(shop: Barbershop) {
    setSelectedShop(shop);
    setSelectedBarber((current) => shop.bestBarbers?.[0] || current);
  }

  const emptyCopy = getEmptyCopy(lookupState);

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset contentStyle={styles.screenContent}>
        <AppHeader title="Nearby Barbers" onBack={() => goBackOrNavigate(navigation, "Home")} />
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
        <View style={styles.filterRow}>
          {["Closest", "Top Rated", "Open Now", "Walk-ins"].map((item) => (
            <Pressable key={item} onPress={() => setSelectedFilter(item)} style={[styles.filterChip, selectedFilter === item && styles.filterChipActive]}>
              <Text style={[styles.filterText, selectedFilter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.mapWrap}>
          <MapPreview shops={filteredShops.length ? filteredShops : displayShops} selectedShop={activeShop} origin={mapOrigin} height={mapHeight} onMarkerPress={selectMapShop} />
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null}
        </View>
        {isUsingFallback && !loading ? (
          <View style={styles.fallbackNotice}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={styles.fallbackText}>Showing sample nearby shops while live map data is unavailable.</Text>
          </View>
        ) : null}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Barbershops</Text>
          <Text style={styles.countText}>{loading ? "Searching" : `${filteredShops.length} ${isUsingFallback ? "sample" : "found"}`}</Text>
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
                <View style={styles.statusRow}>
                  <Text style={styles.statusText}>Open until {shop.openUntil || "8:00 PM"}</Text>
                  <Text style={styles.statusDot}>-</Text>
                  <Text style={styles.statusText}>{shop.queue || "Walk-ins open"}</Text>
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
      <BottomNav active="Explore" navigation={navigation} />
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
    backgroundColor: colors.white,
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
    fontSize: 16
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.elevated
  },
  search: {
    marginBottom: 10
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.md
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
    fontSize: 16
  },
  filterTextActive: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  mapWrap: {
    marginBottom: spacing.lg
  },
  fallbackNotice: {
    minHeight: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(212,168,90,0.24)",
    backgroundColor: "rgba(212,168,90,0.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    marginTop: -10,
    marginBottom: 16
  },
  fallbackText: {
    flex: 1,
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22
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
    fontSize: 16,
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    flexWrap: "wrap"
  },
  statusText: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11
  },
  statusDot: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 11
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
    fontSize: 16,
    lineHeight: 22,
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
