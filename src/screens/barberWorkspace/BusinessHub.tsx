import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { ActivityIndicator, Image, Linking, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View, LayoutAnimation, Platform, UIManager, ScrollView } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import { images } from "../../assets/images";
import { BarberBottomNav, Card, Screen } from "../../components/ui";
import { services } from "../../data";
import { MapPreview } from "../../components/MapPreview";
import { geocodeArea, reverseGeocodeAreaLabel, fetchIPGeolocation } from "../../services/nearbyBarbers";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";
import { getCurrencyFromAddress } from "../../utils/currency";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type HubTab = "Services" | "Payments" | "Shop";
type FeatherName = ComponentProps<typeof Feather>["name"];

const hubTabs: Array<{ key: HubTab; label: string; icon: FeatherName; summary: string }> = [
  { key: "Services", label: "Services", icon: "scissors", summary: "Menu" },
  { key: "Payments", label: "Payments", icon: "credit-card", summary: "Payouts" },
  { key: "Shop", label: "Shop", icon: "home", summary: "Profile" }
];

export default function BusinessHub({ navigation }: any) {
  const [tab, setTab] = useState<HubTab>("Services");
  const { setWorkspace, currency, setCurrency } = useBooking();

  useEffect(() => {
    setWorkspace("Barber");
    setCurrency(getCurrencyFromAddress("Thettu, Gudluru, Andhra Pradesh, India"));
  }, [setWorkspace, setCurrency]);

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Business workspace</Text>
            <Text style={styles.title}>Manage your shop</Text>
          </View>
        </View>

        <View accessibilityRole="tablist" style={styles.tabRail}>
          {hubTabs.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={item.key}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setTab(item.key);
                }}
                style={({ pressed }) => [styles.tabOption, active && styles.tabOptionActive, pressed && styles.pressed]}
              >
                <View style={[styles.tabIcon, active && styles.tabIconActive]}>
                  <Feather name={item.icon} size={16} color={active ? colors.black : colors.primaryDark} />
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>{item.label}</Text>
                <Text style={[styles.tabSummary, active && styles.tabSummaryActive]} numberOfLines={1}>{item.summary}</Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "Services" ? <ServicesPanel /> : null}
        {tab === "Payments" ? <PaymentsPanel /> : null}
        {tab === "Shop" ? <ShopPanel navigation={navigation} /> : null}
      </Screen>
      <BarberBottomNav active="Business" navigation={navigation} />
    </View>
  );
}

function ServicesPanel() {
  const { currency } = useBooking();
  const [serviceList, setServiceList] = useState(() =>
    services.map((s) => ({ ...s, enabled: true }))
  );
  const [showForm, setShowForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  function handleAddOrEditService() {
    if (!name.trim() || !price.trim()) return;

    animateLayout();
    if (editingServiceId) {
      setServiceList((current) =>
        current.map((item) =>
          item.id === editingServiceId
            ? { ...item, label: name.trim(), price: Number(price) || 0, duration: duration.trim() || "30 min" }
            : item
        )
      );
      setEditingServiceId(null);
    } else {
      setServiceList((current) => [
        ...current,
        {
          id: `custom-${Date.now()}`,
          label: name.trim(),
          price: Number(price) || 0,
          duration: duration.trim() || "30 min",
          icon: "scissors",
          description: "Custom shop service",
          enabled: true
        }
      ]);
    }

    setName("");
    setPrice("");
    setDuration("");
    setShowForm(false);
  }

  function startEdit(service: typeof serviceList[number]) {
    animateLayout();
    if (editingServiceId === service.id) {
      setEditingServiceId(null);
      setName("");
      setPrice("");
      setDuration("");
      setShowForm(false);
    } else {
      setEditingServiceId(service.id);
      setName(service.label);
      setPrice(String(service.price));
      setDuration(service.duration);
      setShowForm(true);
    }
  }

  function handleDeleteClick(id: string) {
    animateLayout();
    setConfirmDeleteId(id);
  }

  function confirmDelete(id: string) {
    animateLayout();
    if (editingServiceId === id) {
      setEditingServiceId(null);
      setName("");
      setPrice("");
      setDuration("");
      setShowForm(false);
    }
    setConfirmDeleteId(null);
    setServiceList((current) => current.filter((item) => item.id !== id));
  }

  const liveServicesCount = serviceList.filter((s) => s.enabled).length;

  return (
    <View>
      <PanelHeader
        action={showForm ? "Close" : "Add service"}
        copy={`${liveServicesCount} services live`}
        onAction={() => {
          animateLayout();
          if (showForm) {
            setEditingServiceId(null);
            setName("");
            setPrice("");
            setDuration("");
          }
          setShowForm((value) => !value);
        }}
        title="Service menu"
      />
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => {
        setEditingServiceId(null);
        setName("");
        setPrice("");
        setDuration("");
        setShowForm(false);
      }}>
        <View style={styles.modalOverlayBottom}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => {
            setEditingServiceId(null);
            setName("");
            setPrice("");
            setDuration("");
            setShowForm(false);
          }} />
          <View style={styles.editContainer}>
            <View style={styles.modalHandle} />
            
            <Pressable onPress={() => {
              setEditingServiceId(null);
              setName("");
              setPrice("");
              setDuration("");
              setShowForm(false);
            }} style={styles.modalCloseBtn}>
              <Feather name="x" size={18} color="#111" />
            </Pressable>

            <Text style={styles.editTitle}>{editingServiceId ? "Edit Service" : "New Service"}</Text>
            <View style={styles.goldDivider} />

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.editScrollContent}>
              <View style={styles.editForm}>
                <Text style={styles.editInputLabel}>Service Name</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={styles.inputIconBox}>
                    <Feather name="tag" size={18} color="#555" />
                  </View>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.editTextInputWithIcon}
                    placeholder="Enter service name"
                    placeholderTextColor={colors.muted}
                  />
                </View>

                <Text style={styles.editInputLabel}>Price</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={styles.inputIconBox}>
                    <Text style={{ color: "#555", fontSize: 16, fontFamily: fonts.bold }}>{currency.symbol}</Text>
                  </View>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    style={styles.editTextInputWithIcon}
                    placeholder="Enter price"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={styles.editInputLabel}>Duration</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={styles.inputIconBox}>
                    <Feather name="clock" size={18} color="#555" />
                  </View>
                  <TextInput
                    value={duration}
                    onChangeText={setDuration}
                    style={styles.editTextInputWithIcon}
                    placeholder="e.g. 30 min"
                    placeholderTextColor={colors.muted}
                  />
                </View>
              </View>

              <View style={styles.editActionRow}>
                <Pressable
                  onPress={() => {
                    setEditingServiceId(null);
                    setName("");
                    setPrice("");
                    setDuration("");
                    setShowForm(false);
                  }}
                  style={({ pressed }) => [styles.editCancelBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.editCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleAddOrEditService}
                  style={({ pressed }) => [styles.editSaveBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.editSaveText}>
                    {editingServiceId ? "Save Changes" : "Save Service"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <View style={styles.serviceList}>
        {serviceList.map((service) => {
          const custom = service.id.startsWith("custom-");
          return (
            <View key={service.id} style={styles.serviceRow}>
              {confirmDeleteId === service.id ? (
                <View style={styles.confirmDeleteContainer}>
                  <Text style={styles.confirmDeleteText} numberOfLines={1}>Delete "{service.label}"?</Text>
                  <View style={styles.confirmActions}>
                    <Pressable
                      onPress={() => {
                        animateLayout();
                        setConfirmDeleteId(null);
                      }}
                      style={({ pressed }) => [styles.confirmCancelBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.confirmCancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => confirmDelete(service.id)}
                      style={({ pressed }) => [styles.confirmDeleteBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.confirmDeleteTextBtn}>Delete</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.serviceIcon}><Feather name={service.icon as FeatherName} size={17} color={colors.primaryDark} /></View>
                  <View style={styles.serviceCopy}>
                    <Text style={styles.serviceName} numberOfLines={1}>{service.label}</Text>
                    <Text style={styles.serviceMeta}>{currency.symbol}{service.price} - {service.duration}</Text>
                  </View>
                  <View style={styles.serviceActions}>
                    <Pressable
                      accessibilityLabel={`Edit ${service.label}`}
                      onPress={() => startEdit(service)}
                      style={({ pressed }) => [styles.editButton, editingServiceId === service.id && { backgroundColor: colors.primarySoft }, pressed && styles.pressed]}
                    >
                      <Feather name="edit-2" size={15} color={editingServiceId === service.id ? colors.primaryDark : colors.secondaryText} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Delete ${service.label}`}
                      onPress={() => handleDeleteClick(service.id)}
                      style={({ pressed }) => [styles.deleteButton, pressed && { backgroundColor: "rgba(198,64,70,0.12)" }, pressed && styles.pressed]}
                    >
                      <Feather name="trash-2" size={15} color={colors.error} />
                    </Pressable>
                    <Switch
                      value={service.enabled}
                      disabled={custom}
                      onValueChange={() => {
                        animateLayout();
                        setServiceList((current) =>
                          current.map((item) =>
                            item.id === service.id ? { ...item, enabled: !item.enabled } : item
                          )
                        );
                      }}
                      trackColor={{ false: "#DADCD7", true: "#E7CE9B" }}
                      thumbColor={service.enabled ? colors.primaryDark : colors.muted}
                    />
                  </View>
                </>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PaymentsPanel() {
  const { currency } = useBooking();
  const [message, setMessage] = useState("");
  return (
    <View>
      <PanelHeader title="Payments" copy="Payouts and collected revenue" />
      <View style={styles.payoutHero}>
        <View style={styles.payoutCopy}>
          <Text style={styles.payoutLabel}>Available balance</Text>
          <Text style={styles.payoutValue}>{currency.symbol}9,420</Text>
          <Text style={styles.payoutMeta}>Today collected {currency.symbol}680</Text>
        </View>
        <View style={styles.readyBadge}>
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={styles.readyText}>Ready</Text>
        </View>
      </View>
      <View style={styles.metricGrid}>
        <BusinessMetric label="This week" value={`${currency.symbol}4,240`} change="+8%" />
        <BusinessMetric label="Avg ticket" value={`${currency.symbol}48`} change={`+${currency.symbol}4`} />
      </View>
      <Pressable onPress={() => setMessage("Withdrawal request sent to your verified account.")} style={({ pressed }) => [styles.withdrawButton, pressed && styles.pressed]}>
        <Feather name="arrow-down-circle" size={18} color={colors.black} />
        <Text style={styles.withdrawText}>Withdraw earnings</Text>
      </Pressable>
      {message ? <Text style={styles.successMessage}>{message}</Text> : null}
    </View>
  );
}

type ShopSubView = "main" | "manage-locations" | "add-address" | "working-hours" | "qr-code";

function ShopPanel({ navigation }: { navigation: any }) {
  const { setCurrency, currency } = useBooking();
  const [open, setOpen] = useState(true);
  const [showBanner, setShowBanner] = useState(true);
  const [focusedTile, setFocusedTile] = useState<"locations" | "qr" | "hours" | null>(null);
  const [locFormVisible, setLocFormVisible] = useState(false);
  const [employeeHours, setEmployeeHours] = useState([
    { id: "richard-anderson", name: "Richard Anderson", role: "Expert Barber", start: "09:00 AM", end: "06:00 PM", active: true, avatar: images.masterBarber },
    { id: "marco-rossi", name: "Marco Rossi", role: "Fade Specialist", start: "10:00 AM", end: "07:00 PM", active: true, avatar: images.luxuryBarbershop },
    { id: "jayden-malik", name: "Jayden Malik", role: "Styling Expert", start: "09:00 AM", end: "05:00 PM", active: false, avatar: images.masterBarber },
    { id: "alex-carter", name: "Alex Carter", role: "Beard Specialist", start: "11:00 AM", end: "08:00 PM", active: true, avatar: images.luxuryBarbershop }
  ]);

  const [savedLocations, setSavedLocations] = useState([
    {
      id: "loc-1",
      name: "Thettu",
      address: "Thettu, Gudluru, Andhra Pradesh, India",
      isDefault: true,
      coordinates: { latitude: 14.91342, longitude: 79.9855 }
    }
  ]);

  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [locName, setLocName] = useState("");
  const [locAddress, setLocAddress] = useState("");
  const [locCoords, setLocCoords] = useState({ latitude: 14.91342, longitude: 79.9855 });
  const [resolvingLocation, setResolvingLocation] = useState(false);

  function handleAddLocation() {
    setEditingLocId(null);
    setLocName("");
    setLocAddress("");
    setLocCoords({ latitude: 14.91342, longitude: 79.9855 });
    setLocFormVisible(true);
  }

  function handleEditLocation(loc: typeof savedLocations[number]) {
    setEditingLocId(loc.id);
    setLocName(loc.name);
    setLocAddress(loc.address);
    setLocCoords(loc.coordinates);
    setLocFormVisible(true);
  }

  function handleDeleteLocation(id: string) {
    setSavedLocations((current) => current.filter((item) => item.id !== id));
  }

  function handleSetDefault(id: string) {
    setSavedLocations((current) => {
      const next = current.map((item) => ({ ...item, isDefault: item.id === id }));
      const defaultLoc = next.find((item) => item.isDefault);
      if (defaultLoc) {
        setCurrency(getCurrencyFromAddress(defaultLoc.address));
      }
      return next;
    });
  }

  async function handleUseLiveLocation() {
    setResolvingLocation(true);

    const onSuccess = async (lat: number, lon: number, customLabel?: string) => {
      const coords = { latitude: lat, longitude: lon };
      setLocCoords(coords);
      try {
        const label = customLabel || await reverseGeocodeAreaLabel(coords);
        setLocAddress(label);

        // Auto-populate location name from first section of address
        if (label) {
          const autoName = label.split(",")[0]?.trim();
          if (autoName) setLocName(autoName);
        }
      } catch (err) {
        const fbLabel = customLabel || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setLocAddress(fbLabel);
        setLocName("My Location");
      }
      setResolvingLocation(false);
    };

    const onError = async (errorMsg: string) => {
      console.log(`Geolocation lookup error: ${errorMsg}. Trying IP geolocation fallback...`);
      try {
        const ipLoc = await fetchIPGeolocation();
        await onSuccess(ipLoc.latitude, ipLoc.longitude, ipLoc.label);
      } catch (ipErr: any) {
        alert(`Location access failed: ${errorMsg}. Fallback search also failed: ${ipErr?.message || ipErr}. Please enter your address manually.`);
        setResolvingLocation(false);
      }
    };

    // Use native web browser geolocation if on web for maximum compatibility
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onSuccess(pos.coords.latitude, pos.coords.longitude),
        (err) => onError(err.message),
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
      return;
    }

    // Expo Location for Native apps
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        await onError("Location permission denied");
        return;
      }
      const pos = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.Balanced });
      onSuccess(pos.coords.latitude, pos.coords.longitude);
    } catch (e: any) {
      try {
        const lastPos = await ExpoLocation.getLastKnownPositionAsync({ maxAge: 300000 });
        if (lastPos) {
          onSuccess(lastPos.coords.latitude, lastPos.coords.longitude);
        } else {
          await onError(e?.message || "Location coordinates lookup failed");
        }
      } catch {
        await onError(e?.message || "Location coordinates lookup failed");
      }
    }
  }

  async function handleGeocodeSearch() {
    if (!locAddress.trim()) {
      alert("Please type an address to search.");
      return;
    }
    setResolvingLocation(true);
    try {
      const res = await geocodeArea(locAddress);
      if (res) {
        setLocCoords(res.coordinates);
        setLocAddress(res.label);

        // Auto-populate location name from search result
        const autoName = res.label.split(",")[0]?.trim();
        if (autoName) setLocName(autoName);
      } else {
        alert("Address not found. Please try a cleaner address query.");
      }
    } catch (e) {
      console.log(e);
      alert("Geocoding service failed. Please check your internet connection.");
    } finally {
      setResolvingLocation(false);
    }
  }

  function handleSaveLocation() {
    const nameVal = locName.trim();
    const addrVal = locAddress.trim();
    
    if (!nameVal) {
      alert("Please enter a Location Name (e.g., 'Primary Shop').");
      return;
    }
    if (!addrVal) {
      alert("Please enter or search for an Address.");
      return;
    }

    if (editingLocId) {
      setSavedLocations((current) => {
        const next = current.map((item) =>
          item.id === editingLocId
            ? { ...item, name: nameVal, address: addrVal, coordinates: locCoords }
            : item
        );
        const defaultLoc = next.find((item) => item.isDefault);
        if (defaultLoc) {
          setCurrency(getCurrencyFromAddress(defaultLoc.address));
        }
        return next;
      });
    } else {
      const newLoc = {
        id: `loc-${Date.now()}`,
        name: nameVal,
        address: addrVal,
        isDefault: savedLocations.length === 0,
        coordinates: locCoords
      };
      setSavedLocations((current) => {
        const next = [...current, newLoc];
        const defaultLoc = next.find((item) => item.isDefault);
        if (defaultLoc) {
          setCurrency(getCurrencyFromAddress(defaultLoc.address));
        }
        return next;
      });
    }

    setLocFormVisible(false);
  }

  function handleOpenInGoogleMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locAddress || "Gudluru, Andhra Pradesh, India")}`;
    Linking.openURL(url);
  }

  function renderQrCodeImmersive() {
    return (
      <View>
        <Card style={styles.qrCard}>
          <View style={styles.cardPatternDark} />
          <View style={styles.cardPatternGold} />
          
          <View style={styles.qrCardHeader}>
            <Text style={styles.qrShopName}>Black Box Barbershop</Text>
            <Text style={styles.qrShopAddress}>123 Main Street, New York</Text>
          </View>

          <View style={styles.qrFrame}>
            <Image source={images.shopQrCode} style={styles.qrCodeImage} />
          </View>

          <Text style={styles.qrDescription}>
            Scan this code for quick checkout, profile view & payments at Black Box Barbershop.
          </Text>
        </Card>

        <View style={styles.qrActions}>
          <Pressable onPress={() => alert("QR Code shared successfully!")} style={({ pressed }) => [styles.shareQrBtn, pressed && styles.pressed]}>
            <Feather name="share-2" size={16} color={colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.shareQrText}>Share QR Code</Text>
          </Pressable>
          
          <Pressable onPress={() => alert("QR Code saved to gallery!")} style={({ pressed }) => [styles.downloadQrBtn, pressed && styles.pressed]}>
            <Feather name="download" size={16} color="#946B22" style={{ marginRight: 8 }} />
            <Text style={styles.downloadQrText}>Download QR</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderLocationsImmersive() {
    if (locFormVisible) {
      return (
        <View>
          <Card style={styles.mapCard}>
            <MapPreview shops={[]} origin={locCoords} height={200} />
            <View style={styles.mapPinOverlay}>
              <Text style={styles.mapPinText}>Pinpoint your service area</Text>
            </View>
            <View style={styles.mapZoomControls}>
              <Pressable style={styles.zoomBtn}><Text style={styles.zoomBtnText}>+</Text></Pressable>
              <Pressable style={styles.zoomBtn}><Text style={styles.zoomBtnText}>-</Text></Pressable>
            </View>
          </Card>

          <Pressable onPress={handleUseLiveLocation} style={({ pressed }) => [styles.useLiveLocationBtn, pressed && styles.pressed]}>
            <Feather name="navigation" size={16} color="#946B22" style={{ marginRight: 8 }} />
            <Text style={styles.useLiveLocationText}>Use Current Live Location</Text>
          </Pressable>

          <Card style={styles.addressFormCard}>
            <Text style={styles.editInputLabel}>Location Name</Text>
            <View style={styles.inputWithIconRow}>
              <View style={styles.inputIconBox}>
                <Feather name="bookmark" size={18} color="#555" />
              </View>
              <TextInput
                value={locName}
                onChangeText={setLocName}
                placeholder="e.g. Current Base"
                placeholderTextColor={colors.muted}
                style={styles.editTextInputWithIcon}
              />
            </View>

            <Text style={styles.editInputLabel}>Address</Text>
            <View style={styles.inputWithIconRow}>
              <View style={styles.inputIconBox}>
                <Feather name="map-pin" size={18} color="#555" />
              </View>
              <TextInput
                value={locAddress}
                onChangeText={setLocAddress}
                placeholder="Search address or location"
                placeholderTextColor={colors.muted}
                style={[styles.editTextInputWithIcon, { flex: 1 }]}
              />
              <Pressable onPress={handleGeocodeSearch} style={styles.searchLocationBtnInner}>
                {resolvingLocation ? (
                  <ActivityIndicator size="small" color="#946B22" />
                ) : (
                  <Feather name="search" size={18} color="#946B22" />
                )}
              </Pressable>
            </View>

            <Pressable onPress={handleOpenInGoogleMaps} style={styles.googleMapsBtn}>
              <Feather name="map" size={14} color={colors.info} />
              <Text style={styles.googleMapsBtnText}>Open / Search in Google Maps</Text>
            </Pressable>
          </Card>

          <View style={styles.locSaveActionRow}>
            <Pressable onPress={() => setLocFormVisible(false)} style={({ pressed }) => [styles.locCancelBtn, pressed && styles.pressed]}>
              <Text style={styles.locCancelText}>Cancel</Text>
            </Pressable>
            
            <Pressable onPress={handleSaveLocation} style={({ pressed }) => [styles.locSaveBtn, pressed && styles.pressed]}>
              <Text style={styles.locSaveText}>Save Location</Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <View>
        {showBanner ? (
          <View style={styles.banner}>
            <Feather name="info" size={16} color="#946B22" style={styles.bannerIcon} />
            <Text style={styles.bannerText}>
              Nearby bookings and job opportunities are prioritized based on your Default Location.
            </Text>
            <Pressable onPress={() => setShowBanner(false)} style={styles.bannerClose}>
              <Feather name="x" size={16} color={colors.muted} />
            </Pressable>
          </View>
        ) : null}

        <Pressable onPress={handleAddLocation} style={({ pressed }) => [styles.addLocationCard, pressed && styles.pressed]}>
          <View style={styles.addLocationIconCircle}>
            <Feather name="plus" size={20} color="#946B22" />
          </View>
          <Text style={styles.addLocationCardText}>Add New Location</Text>
        </Pressable>

        <Text style={styles.sectionHeading}>Saved Locations</Text>

        {savedLocations.map((loc) => (
          <Card key={loc.id} style={styles.locationCard}>
            <View style={styles.locHeaderRow}>
              <View style={styles.locIconBox}>
                <Feather name="map-pin" size={18} color="#946B22" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={styles.locTitleText}>{loc.name}</Text>
                  {loc.isDefault && (
                    <View style={styles.defaultBadgeGold}>
                      <Feather name="star" size={8} color="#FFF" style={{ marginRight: 2 }} />
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.locAddressText}>{loc.address}</Text>
              </View>
            </View>

            <View style={styles.locDivider} />

            <View style={styles.locActionsRow}>
              <Pressable onPress={() => handleSetDefault(loc.id)} style={styles.setDefaultPressable}>
                <Feather name="star" size={16} color={loc.isDefault ? "#946B22" : colors.muted} style={{ marginRight: 6 }} />
                <Text style={[styles.setDefaultText, loc.isDefault && { color: "#946B22", fontFamily: fonts.bold }]}>
                  {loc.isDefault ? "Default Location" : "Set as Default"}
                </Text>
              </Pressable>

              <View style={styles.locActionButtons}>
                <Pressable onPress={() => handleEditLocation(loc)} style={styles.locRoundBtn}>
                  <Feather name="edit-3" size={14} color={colors.secondaryText} />
                </Pressable>
                
                <Pressable onPress={() => handleDeleteLocation(loc.id)} style={[styles.locRoundBtn, { borderColor: "rgba(198,64,70,0.12)" }]}>
                  <Feather name="trash-2" size={14} color={colors.error} />
                </Pressable>
              </View>
            </View>
          </Card>
        ))}
      </View>
    );
  }

  function renderHoursImmersive() {
    return (
      <View>
        <View style={styles.banner}>
          <Feather name="clock" size={16} color="#946B22" style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            Configure working hour schedules and availability for all shop employees.
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Employee Rosters</Text>

        {employeeHours.map((emp) => (
          <Card key={emp.id} style={styles.employeeCard}>
            <View style={styles.empRow}>
              <View style={styles.empAvatarWrapper}>
                <Image source={emp.avatar} style={styles.empAvatarImg} />
              </View>
              <View style={styles.empDetails}>
                <Text style={styles.empNameText}>{emp.name}</Text>
                <Text style={styles.empRoleText}>{emp.role}</Text>
              </View>
              <Switch
                value={emp.active}
                onValueChange={(val) => {
                  setEmployeeHours((current) =>
                    current.map((item) => (item.id === emp.id ? { ...item, active: val } : item))
                  );
                }}
                trackColor={{ false: "#DADCD7", true: "#E7CE9B" }}
                thumbColor={emp.active ? colors.primaryDark : colors.muted}
              />
            </View>

            {emp.active ? (
              <View style={styles.hoursEditorRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hourInputLabel}>Start Time</Text>
                  <View style={styles.inputWithIconRow}>
                    <View style={styles.inputIconBox}>
                      <Feather name="clock" size={16} color="#555" />
                    </View>
                    <TextInput
                      value={emp.start}
                      onChangeText={(val) => {
                        setEmployeeHours((current) =>
                          current.map((item) => (item.id === emp.id ? { ...item, start: val } : item))
                        );
                      }}
                      placeholder="e.g. 09:00 AM"
                      placeholderTextColor={colors.muted}
                      style={styles.editTextInputWithIcon}
                    />
                  </View>
                </View>

                <View style={styles.toSeparatorBox}>
                  <Text style={styles.toSeparatorText}>to</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.hourInputLabel}>End Time</Text>
                  <View style={styles.inputWithIconRow}>
                    <View style={styles.inputIconBox}>
                      <Feather name="clock" size={16} color="#555" />
                    </View>
                    <TextInput
                      value={emp.end}
                      onChangeText={(val) => {
                        setEmployeeHours((current) =>
                          current.map((item) => (item.id === emp.id ? { ...item, end: val } : item))
                        );
                      }}
                      placeholder="e.g. 06:00 PM"
                      placeholderTextColor={colors.muted}
                      style={styles.editTextInputWithIcon}
                    />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.offDutyBannerBox}>
                <Feather name="slash" size={12} color={colors.muted} style={{ marginRight: 6 }} />
                <Text style={styles.offDutyText}>Employee is off-duty (Unavailable for bookings)</Text>
              </View>
            )}
          </Card>
        ))}

        <Pressable onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
          setFocusedTile(null);
        }} style={({ pressed }) => [styles.saveHoursBtn, pressed && styles.pressed]}>
          <Text style={styles.saveHoursBtnText}>Save Schedule & Roster</Text>
        </Pressable>
      </View>
    );
  }

  if (focusedTile !== null) {
    return (
      <View style={styles.immersiveContainer}>
        <View style={styles.immersiveHeader}>
          <Pressable 
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              if (focusedTile === "locations" && locFormVisible) {
                setLocFormVisible(false);
              } else {
                setFocusedTile(null);
              }
            }} 
            style={({ pressed }) => [styles.immersiveBackBtn, pressed && styles.pressed]}
          >
            <Feather name="arrow-left" size={20} color="#111" />
          </Pressable>
          <Text style={styles.immersiveHeaderTitle}>
            {focusedTile === "qr" && "Shop QR Code"}
            {focusedTile === "locations" && (locFormVisible ? (editingLocId ? "Edit Location" : "Add Location") : "Manage Locations")}
            {focusedTile === "hours" && "Working Hours"}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.immersiveContentContainer}>
          {focusedTile === "qr" && renderQrCodeImmersive()}
          {focusedTile === "locations" && renderLocationsImmersive()}
          {focusedTile === "hours" && renderHoursImmersive()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View>
      <PanelHeader title="Shop profile" copy="Availability and public details" />
      
      <Card style={styles.shopHeroCard}>
        <View style={styles.cardPatternDark} />
        <View style={styles.cardPatternGold} />
        <View style={styles.shopHeroInner}>
          <View style={styles.shopHeroCopy}>
            <Text style={styles.shopEyebrow}>PUBLIC PROFILE</Text>
            <Text style={styles.shopName} numberOfLines={1}>Black Box Barbershop</Text>
            <Text style={styles.shopAddress} numberOfLines={1}>123 Main Street, New York</Text>
          </View>
          <View style={[styles.shopStatus, !open && styles.shopStatusClosed]}>
            <Text style={[styles.shopStatusText, !open && styles.shopStatusTextClosed]}>{open ? "Open" : "Closed"}</Text>
          </View>
        </View>
      </Card>
      
      <SettingRow icon="power" title="Accepting bookings" copy="Customers can request open slots" value={open} onChange={setOpen} />
      
      <Text style={styles.sectionHeadingBento}>SHOP MANAGEMENT</Text>

      <View style={styles.bentoGridContainer}>
        {/* Row 1: Map Tile (Full Width) */}
        <Pressable 
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            setFocusedTile("locations");
          }} 
          style={({ pressed }) => [styles.bentoMapTile, pressed && styles.pressed]}
        >
          <View style={styles.tileMapBackground}>
            <MapPreview shops={[]} origin={locCoords} height={140} />
          </View>
          <View style={styles.tileGlassOverlay} />
          <View style={styles.tileContent}>
            <View style={styles.tileHeaderRow}>
              <View style={styles.tileIconContainer}>
                <Feather name="map-pin" size={18} color="#C89A43" />
              </View>
              <View style={styles.liveIndicatorCircle} />
            </View>
            <View>
              <Text style={styles.tileTitle}>Address & Maps</Text>
              <Text style={styles.tileSubtitle} numberOfLines={1}>{locAddress || "Configure primary shop address"}</Text>
            </View>
          </View>
        </Pressable>

        {/* Row 2: QR Code & Working Hours (50/50 Split) */}
        <View style={styles.bentoRow}>
          <Pressable 
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              setFocusedTile("qr");
            }} 
            style={({ pressed }) => [styles.bentoHalfTile, styles.bentoQrTile, pressed && styles.pressed]}
          >
            <View style={styles.cardPatternDark} />
            <View style={styles.cardPatternGold} />
            <View style={styles.tileContentHalf}>
              <View style={styles.tileIconContainer}>
                <Feather name="maximize" size={18} color="#C89A43" />
              </View>
              <View>
                <Text style={styles.tileTitleHalfLight}>Shop QR Code</Text>
                <Text style={styles.tileDescriptionHalfLight}>Tap to checkout</Text>
              </View>
            </View>
          </Pressable>

          <Pressable 
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              setFocusedTile("hours");
            }} 
            style={({ pressed }) => [styles.bentoHalfTile, styles.bentoHoursTile, pressed && styles.pressed]}
          >
            <View style={styles.tileContentHalf}>
              <View style={styles.tileHeaderRow}>
                <View style={styles.tileIconContainer}>
                  <Feather name="clock" size={18} color="#946B22" />
                </View>
                <View style={styles.activeRosterBadge}>
                  <Text style={styles.activeRosterBadgeText}>4 STAFF</Text>
                </View>
              </View>
              <View>
                <Text style={styles.tileTitleHalf}>Working Hours</Text>
                <Text style={styles.tileDescriptionHalf}>Configure schedules</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PanelHeader({ title, copy, action, onAction }: { title: string; copy: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.panelHeader}>
      <View style={styles.panelCopy}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelBody}>{copy}</Text>
      </View>
      {action ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.panelAction, pressed && styles.pressed]}>
          <Text style={styles.panelActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function BusinessMetric({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <View style={styles.businessMetric}>
      <Text style={styles.businessMetricLabel}>{label}</Text>
      <Text style={styles.businessMetricValue}>{value}</Text>
      <Text style={styles.businessMetricChange}>{change}</Text>
    </View>
  );
}

function SettingRow({ icon, title, copy, value, onChange }: { icon: FeatherName; title: string; copy: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}><Feather name={icon} size={17} color={colors.primaryDark} /></View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingBody}>{copy}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: "#DADCD7", true: "#E7CE9B" }} thumbColor={value ? colors.primaryDark : colors.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 9, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 24, marginTop: 4 },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabRail: { minHeight: 86, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 6, flexDirection: "row", gap: 6, marginBottom: 20 },
  tabOption: { flex: 1, minWidth: 0, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, paddingVertical: 8 },
  tabOptionActive: { backgroundColor: colors.black },
  tabIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft, marginBottom: 6 },
  tabIconActive: { backgroundColor: colors.primary },
  tabLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 11 },
  tabLabelActive: { color: colors.white },
  tabSummary: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 16, marginTop: 2 },
  tabSummaryActive: { color: "#C8CAC5" },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  panelCopy: { flex: 1, minWidth: 0 },
  panelTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 19 },
  panelBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 4 },
  panelAction: { minHeight: 38, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 13 },
  panelActionText: { color: colors.black, fontFamily: fonts.bold, fontSize: 10 },
  form: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary, padding: 14, gap: 10, marginBottom: 12 },
  input: { minHeight: 46, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, color: colors.text, fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 12 },
  formRow: { flexDirection: "row", gap: 10 },
  halfInput: { flex: 1 },
  saveButton: { minHeight: 44, borderRadius: radius.full, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" },
  saveText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 11 },
  serviceList: { gap: 10 },
  serviceRow: { minHeight: 70, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  serviceIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  serviceCopy: { flex: 1, minWidth: 0 },
  serviceName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  serviceMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 4 },
  serviceActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  editButton: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated },
  deleteButton: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated },
  confirmDeleteContainer: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  confirmDeleteText: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12, flex: 1, marginRight: 8 },
  confirmActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  confirmCancelBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.elevated },
  confirmCancelText: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 11 },
  confirmDeleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.sm, backgroundColor: colors.error },
  confirmDeleteTextBtn: { color: colors.white, fontFamily: fonts.bold, fontSize: 11 },
  payoutHero: { minHeight: 118, borderRadius: radius.md, backgroundColor: colors.black, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 12 },
  payoutCopy: { flex: 1, minWidth: 0 },
  payoutLabel: { color: "#C4C6C2", fontFamily: fonts.medium, fontSize: 10, textTransform: "uppercase" },
  payoutValue: { color: colors.white, fontFamily: fonts.headingHeavy, fontSize: 32, marginTop: 6 },
  payoutMeta: { color: "#D9DBD7", fontFamily: fonts.body, fontSize: 11, marginTop: 5 },
  readyBadge: { minHeight: 34, borderRadius: radius.full, backgroundColor: "rgba(30,141,91,0.14)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10 },
  readyText: { color: "#75D7A6", fontFamily: fonts.semibold, fontSize: 9 },
  metricGrid: { flexDirection: "row", gap: 10 },
  businessMetric: { flex: 1, minHeight: 96, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14 },
  businessMetricLabel: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 16 },
  businessMetricValue: { color: colors.text, fontFamily: fonts.heading, fontSize: 22, marginTop: 9 },
  businessMetricChange: { color: colors.success, fontFamily: fonts.semibold, fontSize: 9, marginTop: 5 },
  withdrawButton: { minHeight: 50, borderRadius: radius.full, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
  withdrawText: { color: colors.black, fontFamily: fonts.bold, fontSize: 12 },
  successMessage: { color: colors.success, fontFamily: fonts.medium, fontSize: 10, textAlign: "center", marginTop: 10 },
  shopHero: { minHeight: 104, borderRadius: radius.md, backgroundColor: colors.black, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  shopHeroCopy: { flex: 1, minWidth: 0 },
  shopEyebrow: { color: colors.primarySoft, fontFamily: fonts.semibold, fontSize: 9, textTransform: "uppercase" },
  shopName: { color: colors.white, fontFamily: fonts.headingSemi, fontSize: 17, marginTop: 6 },
  shopAddress: { color: "#C3C5C1", fontFamily: fonts.body, fontSize: 9, marginTop: 4 },
  shopStatus: { borderRadius: radius.full, backgroundColor: "rgba(30,141,91,0.18)", paddingHorizontal: 10, paddingVertical: 7 },
  shopStatusClosed: { backgroundColor: "rgba(198,64,70,0.18)" },
  shopStatusText: { color: "#75D7A6", fontFamily: fonts.semibold, fontSize: 9 },
  shopStatusTextClosed: { color: "#F28D91" },
  settingRow: { minHeight: 76, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  settingCopy: { flex: 1, minWidth: 0 },
  settingTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  settingBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 4 },
  shopActions: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginTop: 10 },
  shopAction: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12 },
  shopActionText: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 12 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15,17,21,0.76)", justifyContent: "center", alignItems: "center", padding: 24 },
  qrContainer: { width: "100%", maxWidth: 320, backgroundColor: colors.white, borderRadius: radius.lg, padding: 24, alignItems: "center" },
  qrTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 20, textAlign: "center" },
  qrSubtitle: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, textAlign: "center", marginTop: 6, lineHeight: 22 },
  qrImage: { width: 220, height: 220, marginTop: 20, borderRadius: radius.sm },
  qrShopName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15, marginTop: 16 },
  qrCloseButton: { width: "100%", minHeight: 46, borderRadius: radius.full, backgroundColor: colors.black, justifyContent: "center", alignItems: "center", marginTop: 24 },
  qrCloseText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 12 },
  subviewHeader: { height: 56, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  subviewTitle: { color: colors.text, fontFamily: fonts.heading, fontSize: 20 },
  banner: { minHeight: 64, borderRadius: radius.md, backgroundColor: "rgba(200,154,67,0.1)", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 18 },
  bannerIcon: { marginTop: 2 },
  bannerText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, flex: 1, marginRight: 8, lineHeight: 22 },
  bannerClose: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  addLocButton: { minHeight: 46, borderRadius: radius.full, backgroundColor: colors.primaryDark, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 },
  addLocButtonText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  sectionHeading: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 16, marginBottom: 12 },
  locCard: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 12, marginBottom: 12 },
  locCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  locCardTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 15 },
  defaultBadge: { borderRadius: radius.full, backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 4 },
  defaultBadgeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 8 },
  locCardAddressRow: { gap: 4 },
  locCardAddressLabel: { color: colors.primaryDark, fontFamily: fonts.bold, fontSize: 9 },
  locCardAddress: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, lineHeight: 22 },
  locCardActions: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  locActionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  locActionBtnText: { color: colors.secondaryText, fontFamily: fonts.semibold, fontSize: 11 },
  locActionRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  locEditBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  locEditBtnText: { color: colors.secondaryText, fontFamily: fonts.semibold, fontSize: 11 },
  locDeleteBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  fabContainer: { position: "absolute", bottom: 20, right: 14, zIndex: 10 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.success, alignItems: "center", justifyContent: "center", elevation: 4 },
  mapContainer: { height: 200, borderRadius: radius.md, overflow: "hidden", marginBottom: 18 },
  mapPinOverlay: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full },
  mapPinText: { color: colors.text, fontFamily: fonts.medium, fontSize: 10 },
  mapZoomControls: { position: "absolute", top: 12, right: 12, gap: 6 },
  zoomBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" },
  zoomBtnText: { color: colors.text, fontFamily: fonts.bold, fontSize: 16 },
  liveLocationBtn: { minHeight: 46, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 18 },
  liveLocationText: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 12 },
  addressForm: { gap: 12, marginBottom: 20 },
  inputLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  formInput: { minHeight: 46, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, color: colors.text, fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 12, marginBottom: 10 },
  addressInputRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 },
  searchAddrBtn: { width: 46, height: 46, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  googleMapsBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  googleMapsBtnText: { color: colors.info, fontFamily: fonts.semibold, fontSize: 12, textDecorationLine: "underline" },
  helperText: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, marginTop: 8, fontStyle: "italic", lineHeight: 22 },
  saveLocationBtn: { minHeight: 46, borderRadius: radius.full, backgroundColor: colors.primaryDark, justifyContent: "center", alignItems: "center" },
  saveLocationBtnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  empCard: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 12 },
  empRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  empAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.border },
  empDetails: { flex: 1, minWidth: 0 },
  empName: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 14 },
  empRole: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  hoursEditor: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  hourInputGroup: { flex: 1 },
  hourInputLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 10, marginBottom: 4 },
  hourInput: { minHeight: 40, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, color: colors.text, fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 10 },
  hourSeparator: { justifyContent: "center", alignItems: "center", marginTop: 14 },
  hourSeparatorText: { color: colors.muted, fontFamily: fonts.medium, fontSize: 12 },
  offDutyBanner: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  offDutyText: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, fontStyle: "italic" },
  saveHoursBtn: { minHeight: 46, borderRadius: radius.full, backgroundColor: colors.primaryDark, justifyContent: "center", alignItems: "center", marginTop: 10 },
  saveHoursBtnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  modalOverlayBottom: { flex: 1, backgroundColor: "rgba(15,17,21,0.5)", justifyContent: "flex-end" },
  editContainer: {
    width: "100%",
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 30,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -10 },
    elevation: 10
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ECECE6",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10
  },
  modalCloseBtn: {
    position: "absolute",
    top: 16,
    left: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  editTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20,
    textAlign: "center",
    marginVertical: 12
  },
  goldDivider: {
    width: 36,
    height: 3,
    backgroundColor: "#C89A43",
    borderRadius: 1.5,
    alignSelf: "center",
    marginBottom: 16
  },
  editScrollContent: {
    paddingBottom: 24
  },
  editForm: {
    gap: 14,
    marginBottom: 20
  },
  editInputLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginTop: 8
  },
  inputWithIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  inputIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center"
  },
  editTextInputWithIcon: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 16,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  editActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20
  },
  editCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#946B22",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  editCancelText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  editSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#946B22",
    alignItems: "center",
    justifyContent: "center"
  },
  editSaveText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  pageContainer: {
    paddingBottom: 20
  },
  backButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  shopHeroCard: {
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 24,
    overflow: "hidden",
    padding: 20,
    backgroundColor: colors.black,
    position: "relative"
  },
  shopHeroInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    zIndex: 2
  },
  shopActionsCard: {
    padding: 0,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.white,
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  shopActionRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  shopActionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#FDF7EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  shopActionLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  qrCard: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    padding: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: colors.border
  },
  qrCardHeader: {
    alignItems: "center",
    marginBottom: 20,
    zIndex: 2
  },
  qrShopAddress: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 4
  },
  qrFrame: {
    width: 220,
    height: 220,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "#C89A43",
    padding: 8,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    borderRadius: 8
  },
  qrDescription: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
    zIndex: 2,
    paddingHorizontal: 10
  },
  qrActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10
  },
  shareQrBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#946B22",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  shareQrText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  downloadQrBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#946B22",
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  downloadQrText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  addLocationCard: {
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#F3E2C3",
    borderStyle: "dashed",
    backgroundColor: "#FDF7EC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
    marginTop: 10
  },
  addLocationIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3E2C3"
  },
  addLocationCardText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  locationCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  locHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  locIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#FDF7EC",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  locTitleText: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 15
  },
  locAddressText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  },
  locDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14
  },
  locActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  setDefaultPressable: {
    flexDirection: "row",
    alignItems: "center"
  },
  setDefaultText: {
    color: colors.secondaryText,
    fontFamily: fonts.semibold,
    fontSize: 12
  },
  locActionButtons: {
    flexDirection: "row",
    gap: 8
  },
  locRoundBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  defaultBadgeGold: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#946B22",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  mapCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    height: 200,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 0
  },
  useLiveLocationBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FDF7EC",
    borderWidth: 1,
    borderColor: "#F3E2C3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  useLiveLocationText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  addressFormCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20
  },
  searchLocationBtnInner: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FDF7EC",
    borderWidth: 1,
    borderColor: "#F3E2C3",
    alignItems: "center",
    justifyContent: "center"
  },
  locSaveActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4
  },
  locCancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#946B22",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  locCancelText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  locSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#946B22",
    alignItems: "center",
    justifyContent: "center"
  },
  locSaveText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  employeeCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12
  },
  empAvatarWrapper: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#C89A43",
    padding: 2,
    backgroundColor: colors.white
  },
  empAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19
  },
  empNameText: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 14
  },
  empRoleText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2
  },
  hoursEditorRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    gap: 8
  },
  toSeparatorBox: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4
  },
  toSeparatorText: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  offDutyBannerBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14
  },
  cardPatternDark: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#28231E',
    opacity: 0.95
  },
  cardPatternGold: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 242,
    height: 242,
    borderRadius: 121,
    borderWidth: 2,
    borderColor: '#C89A43',
    backgroundColor: 'transparent'
  },
  lastRow: {
    borderBottomWidth: 0
  },
  sectionHeadingBento: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.secondaryText,
    letterSpacing: 1.2,
    marginTop: 24,
    marginBottom: 10
  },
  bentoGridContainer: {
    gap: 12,
    marginBottom: 20
  },
  bentoMapTile: {
    height: 140,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative"
  },
  tileMapBackground: {
    ...StyleSheet.absoluteFill,
    opacity: 0.8
  },
  tileGlassOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.3)"
  },
  tileContent: {
    ...StyleSheet.absoluteFill,
    padding: 16,
    justifyContent: "space-between"
  },
  tileHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  tileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  liveIndicatorCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981"
  },
  tileTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16
  },
  tileSubtitle: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
    height: 130
  },
  bentoHalfTile: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative",
    overflow: "hidden"
  },
  bentoQrTile: {
    backgroundColor: colors.black
  },
  bentoHoursTile: {
    backgroundColor: colors.white
  },
  tileContentHalf: {
    ...StyleSheet.absoluteFill,
    padding: 16,
    justifyContent: "space-between"
  },
  tileTitleHalf: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 14
  },
  tileDescriptionHalf: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2
  },
  tileTitleHalfLight: {
    color: colors.white,
    fontFamily: fonts.headingSemi,
    fontSize: 14
  },
  tileDescriptionHalfLight: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2
  },
  activeRosterBadge: {
    backgroundColor: "#946B22",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  activeRosterBadgeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 9
  },
  immersiveContainer: {
    flex: 1,
    backgroundColor: "#FBFBF9"
  },
  immersiveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  immersiveBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  immersiveHeaderTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  immersiveContentContainer: {
    padding: 20,
    paddingBottom: 40
  }
});
