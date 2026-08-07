import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { ActivityIndicator, Image, Linking, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View, LayoutAnimation, Platform, UIManager } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import { images } from "../../assets/images";
import { BarberBottomNav, Screen } from "../../components/ui";
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
      {showForm ? (
        <View style={styles.form}>
          <Text style={{ fontFamily: fonts.headingSemi, fontSize: 16, color: colors.text, marginBottom: 4 }}>
            {editingServiceId ? "Edit Service" : "New Service"}
          </Text>
          <TextInput value={name} onChangeText={setName} placeholder="Service name" placeholderTextColor={colors.muted} style={styles.input} />
          <View style={styles.formRow}>
            <TextInput value={price} onChangeText={setPrice} placeholder="Price" placeholderTextColor={colors.muted} keyboardType="numeric" style={[styles.input, styles.halfInput]} />
            <TextInput value={duration} onChangeText={setDuration} placeholder="Duration" placeholderTextColor={colors.muted} style={[styles.input, styles.halfInput]} />
          </View>
          <Pressable onPress={handleAddOrEditService} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
            <Text style={styles.saveText}>{editingServiceId ? "Save changes" : "Save service"}</Text>
          </Pressable>
        </View>
      ) : null}
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

type ShopSubView = "main" | "manage-locations" | "add-address" | "working-hours";

function ShopPanel({ navigation }: { navigation: any }) {
  const { setCurrency } = useBooking();
  const [subView, setSubView] = useState<ShopSubView>("main");
  const [open, setOpen] = useState(true);
  const [qrVisible, setQrVisible] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
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
    setSubView("add-address");
  }

  function handleEditLocation(loc: typeof savedLocations[number]) {
    setEditingLocId(loc.id);
    setLocName(loc.name);
    setLocAddress(loc.address);
    setLocCoords(loc.coordinates);
    setSubView("add-address");
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

    setSubView("manage-locations");
  }

  function handleOpenInGoogleMaps() {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locAddress || "Gudluru, Andhra Pradesh, India")}`;
    Linking.openURL(url);
  }

  if (subView === "manage-locations") {
    return (
      <View>
        <View style={styles.subviewHeader}>
          <Pressable onPress={() => setSubView("main")} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.subviewTitle}>Manage Locations</Text>
        </View>

        {showBanner ? (
          <View style={styles.banner}>
            <Feather name="info" size={16} color={colors.primaryDark} style={styles.bannerIcon} />
            <Text style={styles.bannerText}>
              Nearby bookings and job opportunities are prioritized based on your Default Location.
            </Text>
            <Pressable onPress={() => setShowBanner(false)} style={styles.bannerClose}>
              <Feather name="x" size={16} color={colors.muted} />
            </Pressable>
          </View>
        ) : null}

        <Pressable onPress={handleAddLocation} style={({ pressed }) => [styles.addLocButton, pressed && styles.pressed]}>
          <Feather name="plus" size={16} color={colors.white} />
          <Text style={styles.addLocButtonText}>Add New Location</Text>
        </Pressable>

        <Text style={styles.sectionHeading}>Saved Locations</Text>

        {savedLocations.map((loc) => (
          <View key={loc.id} style={styles.locCard}>
            <View style={styles.locCardHeader}>
              <Text style={styles.locCardTitle}>{loc.name}</Text>
              {loc.isDefault ? (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.locCardAddressRow}>
              <Text style={styles.locCardAddressLabel}>ADDRESS</Text>
              <Text style={styles.locCardAddress}>{loc.address}</Text>
            </View>
            <View style={styles.locCardActions}>
              <Pressable onPress={() => handleSetDefault(loc.id)} style={styles.locActionBtn}>
                <Feather name="star" size={14} color={loc.isDefault ? colors.primary : colors.muted} />
                <Text style={[styles.locActionBtnText, loc.isDefault && { color: colors.primaryDark }]}>
                  Default Location
                </Text>
              </Pressable>

              <View style={styles.locActionRight}>
                <Pressable onPress={() => handleEditLocation(loc)} style={styles.locEditBtn}>
                  <Feather name="edit-3" size={14} color={colors.secondaryText} />
                  <Text style={styles.locEditBtnText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => handleDeleteLocation(loc.id)} style={styles.locDeleteBtn}>
                  <Feather name="trash-2" size={14} color={colors.error} />
                </Pressable>
              </View>
            </View>
          </View>
        ))}


      </View>
    );
  }

  if (subView === "add-address") {
    return (
      <View>
        <View style={styles.subviewHeader}>
          <Pressable onPress={() => setSubView("manage-locations")} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.subviewTitle}>Add Address</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapPreview shops={[]} origin={locCoords} height={200} />
          <View style={styles.mapPinOverlay}>
            <Text style={styles.mapPinText}>Pinpoint your service area</Text>
          </View>
          <View style={styles.mapZoomControls}>
            <Pressable style={styles.zoomBtn}><Text style={styles.zoomBtnText}>+</Text></Pressable>
            <Pressable style={styles.zoomBtn}><Text style={styles.zoomBtnText}>-</Text></Pressable>
          </View>
        </View>

        <Pressable onPress={handleUseLiveLocation} style={({ pressed }) => [styles.liveLocationBtn, pressed && styles.pressed]}>
          <Feather name="navigation" size={14} color={colors.primaryDark} />
          <Text style={styles.liveLocationText}>Use live location</Text>
        </Pressable>

        <View style={styles.addressForm}>
          <Text style={styles.inputLabel}>Location Name</Text>
          <TextInput
            value={locName}
            onChangeText={setLocName}
            placeholder="e.g. Current Base"
            placeholderTextColor={colors.muted}
            style={styles.formInput}
          />

          <Text style={styles.inputLabel}>Address</Text>
          <View style={styles.addressInputRow}>
            <TextInput
              value={locAddress}
              onChangeText={setLocAddress}
              placeholder="Search address or location"
              placeholderTextColor={colors.muted}
              style={[styles.formInput, { flex: 1, marginBottom: 0 }]}
            />
            <Pressable onPress={handleGeocodeSearch} style={styles.searchAddrBtn}>
              {resolvingLocation ? (
                <ActivityIndicator size="small" color={colors.primaryDark} />
              ) : (
                <Feather name="search" size={16} color={colors.primaryDark} />
              )}
            </Pressable>
          </View>

          <Pressable onPress={handleOpenInGoogleMaps} style={styles.googleMapsBtn}>
            <Feather name="map" size={14} color={colors.info} />
            <Text style={styles.googleMapsBtnText}>Open / Search in Google Maps</Text>
          </Pressable>

          <Text style={styles.helperText}>Pick a suggestion for a cleaner saved location.</Text>
        </View>

        <Pressable onPress={handleSaveLocation} style={({ pressed }) => [styles.saveLocationBtn, pressed && styles.pressed]}>
          <Text style={styles.saveLocationBtnText}>Save Location</Text>
        </Pressable>
      </View>
    );
  }

  if (subView === "working-hours") {
    return (
      <View>
        <View style={styles.subviewHeader}>
          <Pressable onPress={() => setSubView("main")} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.subviewTitle}>Working Hours</Text>
        </View>

        <View style={styles.banner}>
          <Feather name="clock" size={16} color={colors.primaryDark} style={styles.bannerIcon} />
          <Text style={styles.bannerText}>
            Configure working hour schedules and availability for all shop employees.
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Employee Rosters</Text>

        {employeeHours.map((emp) => (
          <View key={emp.id} style={styles.empCard}>
            <View style={styles.empRow}>
              <Image source={emp.avatar} style={styles.empAvatar} />
              <View style={styles.empDetails}>
                <Text style={styles.empName}>{emp.name}</Text>
                <Text style={styles.empRole}>{emp.role}</Text>
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
              <View style={styles.hoursEditor}>
                <View style={styles.hourInputGroup}>
                  <Text style={styles.hourInputLabel}>Start Time</Text>
                  <TextInput
                    value={emp.start}
                    onChangeText={(val) => {
                      setEmployeeHours((current) =>
                        current.map((item) => (item.id === emp.id ? { ...item, start: val } : item))
                      );
                    }}
                    placeholder="e.g. 09:00 AM"
                    placeholderTextColor={colors.muted}
                    style={styles.hourInput}
                  />
                </View>

                <View style={styles.hourSeparator}>
                  <Text style={styles.hourSeparatorText}>to</Text>
                </View>

                <View style={styles.hourInputGroup}>
                  <Text style={styles.hourInputLabel}>End Time</Text>
                  <TextInput
                    value={emp.end}
                    onChangeText={(val) => {
                      setEmployeeHours((current) =>
                        current.map((item) => (item.id === emp.id ? { ...item, end: val } : item))
                      );
                    }}
                    placeholder="e.g. 06:00 PM"
                    placeholderTextColor={colors.muted}
                    style={styles.hourInput}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.offDutyBanner}>
                <Text style={styles.offDutyText}>Employee is off-duty (Unavailable for bookings)</Text>
              </View>
            )}
          </View>
        ))}

        <Pressable onPress={() => setSubView("main")} style={({ pressed }) => [styles.saveHoursBtn, pressed && styles.pressed]}>
          <Text style={styles.saveHoursBtnText}>Save Schedule</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View>
      <PanelHeader title="Shop profile" copy="Availability and public details" />
      <View style={styles.shopHero}>
        <View style={styles.shopHeroCopy}>
          <Text style={styles.shopEyebrow}>Public profile</Text>
          <Text style={styles.shopName} numberOfLines={1}>Black Box Barbershop</Text>
          <Text style={styles.shopAddress} numberOfLines={1}>123 Main Street, New York</Text>
        </View>
        <View style={[styles.shopStatus, !open && styles.shopStatusClosed]}>
          <Text style={[styles.shopStatusText, !open && styles.shopStatusTextClosed]}>{open ? "Open" : "Closed"}</Text>
        </View>
      </View>
      <SettingRow icon="power" title="Accepting bookings" copy="Customers can request open slots" value={open} onChange={setOpen} />
      <View style={styles.shopActions}>
        <Pressable onPress={() => setQrVisible(true)} style={({ pressed }) => [styles.shopAction, pressed && styles.pressed]}>
          <Feather name="maximize" size={19} color={colors.primaryDark} />
          <Text style={styles.shopActionText}>Shop QR code</Text>
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </Pressable>

        <Pressable onPress={() => setSubView("manage-locations")} style={({ pressed }) => [styles.shopAction, pressed && styles.pressed]}>
          <Feather name="map-pin" size={19} color={colors.primaryDark} />
          <Text style={styles.shopActionText}>Address & map</Text>
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </Pressable>

        <Pressable onPress={() => setSubView("working-hours")} style={({ pressed }) => [styles.shopAction, pressed && styles.pressed]}>
          <Feather name="clock" size={19} color={colors.primaryDark} />
          <Text style={styles.shopActionText}>Working hours</Text>
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </Pressable>
      </View>

      <Modal visible={qrVisible} transparent animationType="fade" onRequestClose={() => setQrVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setQrVisible(false)} />
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Shop QR Code</Text>
            <Text style={styles.qrSubtitle}>Share this code for quick profile checkout & payments</Text>
            <Image source={images.shopQrCode} style={styles.qrImage} />
            <Text style={styles.qrShopName}>Black Box Barbershop</Text>
            <Pressable onPress={() => setQrVisible(false)} style={({ pressed }) => [styles.qrCloseButton, pressed && styles.pressed]}>
              <Text style={styles.qrCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  saveHoursBtnText: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 }
});
