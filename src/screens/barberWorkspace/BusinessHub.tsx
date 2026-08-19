import { useEffect, useState, useRef } from "react";
import type { ComponentProps } from "react";
import { ActivityIndicator, Image, Linking, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View, LayoutAnimation, Platform, UIManager, ScrollView } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import { images } from "../../assets/images";
import { BarberBottomNav, Card, IOSSegmentedControl, Screen } from "../../components/ui";
import { services } from "../../data";
import { MapPreview } from "../../components/MapPreview";
import { geocodeArea, reverseGeocodeAreaLabel, fetchIPGeolocation } from "../../services/nearbyBarbers";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, getThemeColors } from "../../theme";
import { getCurrencyFromAddress, convertCurrencyAmount } from "../../utils/currency";

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
  const { setWorkspace, currency, setCurrency, themeMode } = useBooking();
  const isDark = themeMode === "dark";

  useEffect(() => {
    setWorkspace("Barber");
    setCurrency(getCurrencyFromAddress("Thettu, Gudluru, Andhra Pradesh, India"));
  }, [setWorkspace, setCurrency]);

  const theme = getThemeColors(isDark);

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Screen scroll bottomInset>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: theme.secondaryText }]}>BUSINESS WORKSPACE</Text>
            <Text style={[styles.title, { color: theme.text }]}>Business</Text>
          </View>
        </View>

        <IOSSegmentedControl
          values={[
            { key: "Services", label: "Services" },
            { key: "Payments", label: "Payments" },
            { key: "Shop", label: "Shop" }
          ]}
          selectedValue={tab}
          onChange={(newTab) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setTab(newTab);
          }}
        />

        {tab === "Services" ? <ServicesPanel /> : null}
        {tab === "Payments" ? <PaymentsPanel /> : null}
        {tab === "Shop" ? <ShopPanel navigation={navigation} /> : null}
      </Screen>
      <BarberBottomNav active="Business" navigation={navigation} />
    </View>
  );
}

function ServicesPanel() {
  const { currency, themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const theme = getThemeColors(isDark);
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
          <View style={[styles.floatingCardModal, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeaderRow, { borderBottomColor: theme.border }]}>
              <View style={styles.modalHeaderTitleBox}>
                <Feather name="scissors" size={18} color="#C89A43" />
                <Text style={[styles.modalTitleText, { color: theme.text }]}>{editingServiceId ? "Edit Service" : "New Service"}</Text>
              </View>
              <Pressable onPress={() => {
                setEditingServiceId(null);
                setName("");
                setPrice("");
                setDuration("");
                setShowForm(false);
              }} style={[styles.modalCloseCircleBtn, { backgroundColor: theme.input, borderColor: theme.border }]}>
                <Feather name="x" size={16} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.editScrollContent}>
              <View style={styles.editForm}>
                <Text style={[styles.editInputLabel, { color: theme.text }]}>Service Name</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={[styles.inputIconBox, { backgroundColor: theme.input }]}>
                    <Feather name="tag" size={18} color="#C89A43" />
                  </View>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    style={[styles.editTextInputWithIcon, { backgroundColor: theme.input, color: theme.text }]}
                    placeholder="Enter service name"
                    placeholderTextColor={theme.muted}
                  />
                </View>

                <Text style={[styles.editInputLabel, { color: theme.text }]}>Price</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={[styles.inputIconBox, { backgroundColor: theme.input }]}>
                    <Text style={{ color: "#C89A43", fontSize: 16, fontFamily: fonts.bold }}>{currency.symbol}</Text>
                  </View>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    style={[styles.editTextInputWithIcon, { backgroundColor: theme.input, color: theme.text }]}
                    placeholder="Enter price"
                    placeholderTextColor={theme.muted}
                    keyboardType="numeric"
                  />
                </View>

                <Text style={[styles.editInputLabel, { color: theme.text }]}>Duration</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={[styles.inputIconBox, { backgroundColor: theme.input }]}>
                    <Feather name="clock" size={18} color="#C89A43" />
                  </View>
                  <TextInput
                    value={duration}
                    onChangeText={setDuration}
                    style={[styles.editTextInputWithIcon, { backgroundColor: theme.input, color: theme.text }]}
                    placeholder="e.g. 30 min"
                    placeholderTextColor={theme.muted}
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
                  style={({ pressed }) => [styles.editCancelBtn, { backgroundColor: theme.input, borderColor: theme.border }, pressed && styles.pressed]}
                >
                  <Text style={[styles.editCancelText, { color: theme.secondaryText }]}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleAddOrEditService}
                  style={({ pressed }) => [styles.editSaveBtn, { backgroundColor: isDark ? "#C89A43" : "#000000" }, pressed && styles.pressed]}
                >
                  <Text style={[styles.editSaveText, { color: isDark ? "#000000" : "#FFFFFF" }]}>
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
            <View key={service.id} style={[styles.serviceRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {confirmDeleteId === service.id ? (
                <View style={styles.confirmDeleteContainer}>
                  <Text style={[styles.confirmDeleteText, { color: theme.text }]} numberOfLines={1}>Delete "{service.label}"?</Text>
                  <View style={styles.confirmActions}>
                    <Pressable
                      onPress={() => {
                        animateLayout();
                        setConfirmDeleteId(null);
                      }}
                      style={({ pressed }) => [styles.confirmCancelBtn, { backgroundColor: theme.input }, pressed && styles.pressed]}
                    >
                      <Text style={[styles.confirmCancelText, { color: theme.secondaryText }]}>Cancel</Text>
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
                  <View style={[styles.serviceIcon, { backgroundColor: theme.primarySoft }]}><Feather name={service.icon as FeatherName} size={17} color="#C89A43" /></View>
                  <View style={styles.serviceCopy}>
                    <Text style={[styles.serviceName, { color: theme.text }]} numberOfLines={1}>{service.label}</Text>
                    <Text style={[styles.serviceMeta, { color: theme.secondaryText }]}>{currency.symbol}{service.price} - {service.duration}</Text>
                  </View>
                  <View style={styles.serviceActions}>
                    <Pressable
                      accessibilityLabel={`Edit ${service.label}`}
                      onPress={() => startEdit(service)}
                      style={({ pressed }) => [
                        styles.editButton,
                        { backgroundColor: editingServiceId === service.id ? theme.primarySoft : (isDark ? "rgba(255,255,255,0.12)" : "#F2F2F7") },
                        pressed && styles.pressed
                      ]}
                    >
                      <Feather name="edit-2" size={15} color={editingServiceId === service.id ? "#C89A43" : theme.secondaryText} />
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Delete ${service.label}`}
                      onPress={() => handleDeleteClick(service.id)}
                      style={({ pressed }) => [styles.deleteButton, { backgroundColor: "rgba(255,59,48,0.12)" }, pressed && styles.pressed]}
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
                      trackColor={{ false: isDark ? "#3A3A3C" : "#E0E0E0", true: "#00A896" }}
                      thumbColor="#FFFFFF"
                      ios_backgroundColor={isDark ? "#3A3A3C" : "#E0E0E0"}
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
  const { currency, themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const theme = getThemeColors(isDark);
  const [message, setMessage] = useState("");

  // Base amounts in USD
  const baseBalance = 120;
  const baseToday = 15;
  const baseWeek = 75;
  const baseAvgTicket = 40;
  const baseAvgTicketChange = 4;

  const displayBalance = convertCurrencyAmount(baseBalance, currency.code);
  const displayToday = convertCurrencyAmount(baseToday, currency.code);
  const displayWeek = convertCurrencyAmount(baseWeek, currency.code);
  const displayAvgTicket = convertCurrencyAmount(baseAvgTicket, currency.code);
  const displayAvgTicketChange = convertCurrencyAmount(baseAvgTicketChange, currency.code);

  const formatValue = (val: number) => {
    return val.toLocaleString();
  };

  return (
    <View>
      <PanelHeader title="Payments" copy="Payouts and collected revenue" />
      <View style={[styles.payoutHero, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.payoutCopy}>
          <Text style={[styles.payoutLabel, { color: theme.secondaryText }]}>Available Balance</Text>
          <Text style={[styles.payoutValue, { color: theme.text }]}>{currency.symbol}{formatValue(displayBalance)}</Text>
          <Text style={[styles.payoutMeta, { color: theme.secondaryText }]}>Today Collected {currency.symbol}{formatValue(displayToday)}</Text>
        </View>
        <View style={[styles.readyBadge, !isDark && { backgroundColor: "#E8F5E9", borderWidth: 1, borderColor: "#C8E6C9" }]}>
          <Feather name="check-circle" size={14} color={isDark ? colors.success : "#2E7D32"} />
          <Text style={[styles.readyText, !isDark && { color: "#1B5E20", fontFamily: fonts.bold }]}>Ready</Text>
        </View>
      </View>
      <View style={styles.metricGrid}>
        <BusinessMetric label="This Week" value={`${currency.symbol}${formatValue(displayWeek)}`} change="+8%" />
        <BusinessMetric label="Avg Ticket" value={`${currency.symbol}${formatValue(displayAvgTicket)}`} change={`+${currency.symbol}${formatValue(displayAvgTicketChange)}`} />
      </View>
      <Pressable onPress={() => setMessage("Withdrawal request sent to your verified account.")} style={({ pressed }) => [styles.withdrawButton, { backgroundColor: isDark ? "#C89A43" : "#000000" }, pressed && styles.pressed]}>
        <Feather name="arrow-down-circle" size={18} color={isDark ? "#000000" : "#FFFFFF"} />
        <Text style={[styles.withdrawText, { color: isDark ? "#000000" : "#FFFFFF" }]}>Withdraw Earnings</Text>
      </Pressable>
      {message ? <Text style={styles.successMessage}>{message}</Text> : null}
    </View>
  );
}

type ShopSubView = "main" | "manage-locations" | "add-address" | "working-hours" | "qr-code";

function ShopPanel({ navigation }: { navigation: any }) {
  const { setCurrency, currency, themeMode, shopOpen, setShopOpen } = useBooking();
  const isDark = themeMode === "dark";
  const theme = getThemeColors(isDark);
  const [showBanner, setShowBanner] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [locationsModalVisible, setLocationsModalVisible] = useState(false);
  const [hoursModalVisible, setHoursModalVisible] = useState(false);
  const [locFormVisible, setLocFormVisible] = useState(false);
  const [employeeHours, setEmployeeHours] = useState([
    { id: "richard-anderson", name: "Richard Anderson", role: "Expert Barber", start: "09:00 AM", end: "06:00 PM", active: true, avatar: images.masterBarber },
    { id: "marco-rossi", name: "Marco Rossi", role: "Fade Specialist", start: "10:00 AM", end: "07:00 PM", active: true, avatar: images.luxuryBarbershop },
    { id: "jayden-malik", name: "Jayden Malik", role: "Styling Expert", start: "09:00 AM", end: "05:00 PM", active: false, avatar: images.masterBarber },
    { id: "alex-carter", name: "Alex Carter", role: "Beard Specialist", start: "11:00 AM", end: "08:00 PM", active: true, avatar: images.luxuryBarbershop }
  ]);

  const [workerFormVisible, setWorkerFormVisible] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [workerStart, setWorkerStart] = useState("");
  const [workerEnd, setWorkerEnd] = useState("");

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
  const [locZoom, setLocZoom] = useState(14);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [autoDetectedBadge, setAutoDetectedBadge] = useState(false);
  const locNameDebounceRef = useRef<any>(null);

  async function handleAutoDetectAddressFromName(nameText: string) {
    const term = nameText.trim();
    if (term.length < 3) return;

    setResolvingLocation(true);
    try {
      let res = await geocodeArea(term);
      if (!res) {
        const cleanedTerm = term.replace(/\b(shop|salon|barber|branch|base|store|parlor|studio|primary|secondary|home|my)\b/gi, "").trim();
        if (cleanedTerm.length >= 3) {
          res = await geocodeArea(cleanedTerm);
        }
      }

      if (res) {
        setLocAddress(res.label);
        setLocCoords(res.coordinates);
        setAutoDetectedBadge(true);
      }
    } catch (e) {
      console.log("Auto detect address error:", e);
    } finally {
      setResolvingLocation(false);
    }
  }

  function handleLocNameChange(text: string) {
    setLocName(text);
    setAutoDetectedBadge(false);

    if (locNameDebounceRef.current) {
      clearTimeout(locNameDebounceRef.current);
    }

    if (text.trim().length >= 3) {
      locNameDebounceRef.current = setTimeout(() => {
        handleAutoDetectAddressFromName(text);
      }, 500);
    }
  }

  function handleAddWorker() {
    setEditingWorkerId(null);
    setWorkerName("");
    setWorkerRole("");
    setWorkerStart("09:00 AM");
    setWorkerEnd("06:00 PM");
    setWorkerFormVisible(true);
  }

  function handleEditWorker(emp: typeof employeeHours[number]) {
    setEditingWorkerId(emp.id);
    setWorkerName(emp.name);
    setWorkerRole(emp.role);
    setWorkerStart(emp.start);
    setWorkerEnd(emp.end);
    setWorkerFormVisible(true);
  }

  function handleDeleteWorker(id: string) {
    setEmployeeHours((current) => current.filter((item) => item.id !== id));
  }

  function handleSaveWorker() {
    const nameVal = workerName.trim();
    const roleVal = workerRole.trim();
    
    if (!nameVal) {
      alert("Please enter the worker's name.");
      return;
    }
    if (!roleVal) {
      alert("Please enter the worker's role.");
      return;
    }

    if (editingWorkerId) {
      setEmployeeHours((current) =>
        current.map((item) =>
          item.id === editingWorkerId
            ? { ...item, name: nameVal, role: roleVal, start: workerStart, end: workerEnd }
            : item
        )
      );
    } else {
      const newWorker = {
        id: `emp-${Date.now()}`,
        name: nameVal,
        role: roleVal,
        start: workerStart,
        end: workerEnd,
        active: true,
        avatar: images.masterBarber
      };
      setEmployeeHours((current) => [...current, newWorker]);
    }

    setWorkerFormVisible(false);
  }

  function handleAddLocation() {
    setEditingLocId(null);
    setLocName("");
    setLocAddress("");
    setLocCoords({ latitude: 14.91342, longitude: 79.9855 });
    setAutoDetectedBadge(false);
    setLocFormVisible(true);
  }

  function handleEditLocation(loc: typeof savedLocations[number]) {
    setEditingLocId(loc.id);
    setLocName(loc.name);
    setLocAddress(loc.address);
    setLocCoords(loc.coordinates);
    setAutoDetectedBadge(false);
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
          <View style={[styles.shopStatus, !shopOpen && styles.shopStatusClosed]}>
            <Text style={[styles.shopStatusText, !shopOpen && styles.shopStatusTextClosed]}>{shopOpen ? "Open" : "Closed"}</Text>
          </View>
        </View>
      </Card>
      
      <SettingRow icon="power" title="Accepting bookings" copy="Customers can request open slots" value={shopOpen} onChange={setShopOpen} />
      
      <Text style={[styles.sectionHeadingBento, { color: theme.secondaryText }]}>SHOP MANAGEMENT</Text>

      <View style={styles.bentoGridContainer}>
        {/* Row 1: Map Tile (Full Width) */}
        <Pressable 
          onPress={() => {
            setLocationsModalVisible(true);
          }} 
          style={({ pressed }) => [styles.bentoMapTile, { borderColor: theme.border }, pressed && styles.pressed]}
        >
          <View style={styles.tileMapBackground}>
            <MapPreview shops={[]} origin={locCoords} height={140} originLabel={locAddress} compact={true} />
          </View>
          <View style={styles.tileGlassOverlay} />
          <View style={styles.tileContent}>
            <View style={styles.tileHeaderRow}>
              <View style={[styles.tileIconContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Feather name="map-pin" size={18} color="#C89A43" />
              </View>
              <View style={styles.liveIndicatorCircle} />
            </View>
            <View>
              <Text style={styles.tileTitleLight}>Address & Maps</Text>
              <Text style={styles.tileSubtitleLight} numberOfLines={1}>{locAddress || "Configure primary shop address"}</Text>
            </View>
          </View>
        </Pressable>

        {/* Row 2: QR Code & Working Hours (50/50 Split) */}
        <View style={styles.bentoRow}>
          <Pressable 
            onPress={() => {
              setQrModalVisible(true);
            }} 
            style={({ pressed }) => [styles.bentoHalfTile, { backgroundColor: isDark ? "#1C1C1E" : "#000000" }, pressed && styles.pressed]}
          >
            <View style={styles.cardPatternDark} />
            <View style={styles.cardPatternGold} />
            <View style={styles.tileContentHalf}>
              <View style={[styles.tileIconContainer, { backgroundColor: isDark ? "#252528" : "#FFFFFF" }]}>
                <Feather name="maximize" size={18} color="#C89A43" />
              </View>
              <View>
                <Text style={styles.tileTitleHalfLight}>Shop QR Code</Text>
                <Text style={styles.tileDescriptionHalfLight}>Tap to scan</Text>
              </View>
            </View>
          </Pressable>

          <Pressable 
            onPress={() => {
              navigation.navigate("WorkingHours");
            }} 
            style={({ pressed }) => [styles.bentoHalfTile, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.pressed]}
          >
            <View style={styles.tileContentHalf}>
              <View style={styles.tileHeaderRow}>
                <View style={[styles.tileIconContainer, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Feather name="clock" size={18} color="#946B22" />
                </View>
                <View style={styles.activeRosterBadge}>
                  <Text style={styles.activeRosterBadgeText}>4 STAFF</Text>
                </View>
              </View>
              <View>
                <Text style={[styles.tileTitleHalf, { color: theme.text }]}>Working Hours</Text>
                <Text style={[styles.tileDescriptionHalf, { color: theme.secondaryText }]}>Configure shifts</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Pop-up 1: Shop QR Code Floating Sheet */}
      <Modal visible={qrModalVisible} transparent animationType="slide" onRequestClose={() => setQrModalVisible(false)}>
        <View style={styles.modalOverlayBottom}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setQrModalVisible(false)} />
          <View style={[styles.floatingCardModal, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeaderRow, { borderBottomColor: theme.border }]}>
              <View style={styles.modalHeaderTitleBox}>
                <Feather name="maximize" size={18} color="#C89A43" />
                <Text style={[styles.modalTitleText, { color: theme.text }]}>Shop QR Code</Text>
              </View>
              <Pressable onPress={() => setQrModalVisible(false)} style={[styles.modalCloseCircleBtn, { backgroundColor: theme.input, borderColor: theme.border }]}>
                <Feather name="x" size={16} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <Card style={[styles.qrCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.cardPatternDark} />
                <View style={styles.cardPatternGold} />
                
                <View style={styles.qrCardHeader}>
                  <Text style={[styles.qrShopName, { color: theme.text }]}>Black Box Barbershop</Text>
                  <Text style={[styles.qrShopAddress, { color: theme.secondaryText }]}>123 Main Street, New York</Text>
                </View>

                <View style={styles.qrFrame}>
                  <Image source={images.shopQrCode} style={styles.qrCodeImage} />
                </View>

                <Text style={[styles.qrDescription, { color: theme.secondaryText }]}>
                  Scan this code for quick checkout, profile view & payments at Black Box Barbershop.
                </Text>
              </Card>

              <View style={styles.qrActions}>
                <Pressable onPress={() => alert("QR Code shared successfully!")} style={({ pressed }) => [styles.shareQrBtn, pressed && styles.pressed]}>
                  <Feather name="share-2" size={16} color={colors.white} style={{ marginRight: 8 }} />
                  <Text style={styles.shareQrText}>Share QR Code</Text>
                </Pressable>
                
                <Pressable onPress={() => alert("QR Code saved to gallery!")} style={({ pressed }) => [styles.downloadQrBtn, { backgroundColor: theme.card, borderColor: "#C89A43" }, pressed && styles.pressed]}>
                  <Feather name="download" size={16} color="#946B22" style={{ marginRight: 8 }} />
                  <Text style={styles.downloadQrText}>Download QR</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Pop-up 2: Shop Locations Floating Sheet */}
      <Modal visible={locationsModalVisible} transparent animationType="slide" onRequestClose={() => {
        setLocationsModalVisible(false);
        setLocFormVisible(false);
      }}>
        <View style={styles.modalOverlayBottom}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => {
            setLocationsModalVisible(false);
            setLocFormVisible(false);
          }} />
          <View style={[styles.floatingCardModal, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.modalHeaderRow, { borderBottomColor: theme.border }]}>
              <View style={styles.modalHeaderTitleBox}>
                {locFormVisible ? (
                  <Pressable 
                    onPress={() => setLocFormVisible(false)} 
                    style={{ marginRight: 8, padding: 4 }}
                  >
                    <Feather name="arrow-left" size={20} color={theme.text} />
                  </Pressable>
                ) : (
                  <Feather name="map-pin" size={18} color="#C89A43" style={{ marginRight: 8 }} />
                )}
                <Text style={[styles.modalTitleText, { color: theme.text }]}>
                  {locFormVisible ? (editingLocId ? "Edit Location" : "Add Location") : "Shop Locations"}
                </Text>
              </View>
              
              {!locFormVisible ? (
                <Pressable onPress={() => setLocationsModalVisible(false)} style={[styles.modalCloseCircleBtn, { backgroundColor: theme.input, borderColor: theme.border }]}>
                  <Feather name="x" size={16} color={theme.text} />
                </Pressable>
              ) : (
                <View style={{ width: 32 }} />
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              {locFormVisible ? (
                <View>
                  <Card style={[styles.mapCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <MapPreview 
                      shops={[]} 
                      origin={locCoords} 
                      height={200} 
                      originLabel={locAddress}
                      zoom={locZoom}
                      onZoomChange={setLocZoom}
                      onMapPress={async (coords) => {
                        setLocCoords(coords);
                        setResolvingLocation(true);
                        try {
                          const label = await reverseGeocodeAreaLabel(coords);
                          setLocAddress(label);
                          if (label) {
                            const autoName = label.split(",")[0]?.trim();
                            if (autoName) setLocName(autoName);
                          }
                        } catch (err) {
                          setLocAddress(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
                        }
                        setResolvingLocation(false);
                      }}
                    />
                    <View style={[styles.mapPinOverlay, { backgroundColor: isDark ? "rgba(15,17,21,0.75)" : "rgba(255,255,255,0.9)" }]}>
                      <Text style={[styles.mapPinText, { color: theme.text }]}>Pinpoint your service area</Text>
                    </View>
                    <View style={styles.mapZoomControls}>
                      <Pressable onPress={() => setLocZoom((z) => Math.min(18, z + 1))} style={[styles.zoomBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.zoomBtnText, { color: theme.text }]}>+</Text>
                      </Pressable>
                      <Pressable onPress={() => setLocZoom((z) => Math.max(3, z - 1))} style={[styles.zoomBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.zoomBtnText, { color: theme.text }]}>-</Text>
                      </Pressable>
                    </View>
                  </Card>

                  <Pressable onPress={handleUseLiveLocation} style={({ pressed }) => [styles.useLiveLocationBtn, { backgroundColor: isDark ? "rgba(200,154,67,0.18)" : "#F4EBD9", borderColor: isDark ? "#C89A43" : "#D7A84F" }, pressed && styles.pressed]}>
                    <Feather name="navigation" size={16} color="#946B22" style={{ marginRight: 8 }} />
                    <Text style={[styles.useLiveLocationText, { color: isDark ? "#C89A43" : "#946B22" }]}>Use Current Live Location</Text>
                  </Pressable>

                  <Card style={[styles.addressFormCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.editInputLabel, { color: theme.text }]}>Location Name</Text>
                    <View style={styles.inputWithIconRow}>
                      <View style={[styles.inputIconBox, { backgroundColor: theme.input }]}>
                        <Feather name="bookmark" size={18} color="#C89A43" />
                      </View>
                      <TextInput
                        value={locName}
                        onChangeText={handleLocNameChange}
                        onSubmitEditing={() => handleAutoDetectAddressFromName(locName)}
                        onBlur={() => handleAutoDetectAddressFromName(locName)}
                        placeholder="e.g. Nellore / Primary Base"
                        placeholderTextColor={theme.muted}
                        style={[styles.editTextInputWithIcon, { backgroundColor: theme.input, color: theme.text }]}
                      />
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 4 }}>
                      <Text style={[styles.editInputLabel, { marginBottom: 0, color: theme.text }]}>Address</Text>
                      {autoDetectedBadge ? (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(30,141,91,0.12)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full }}>
                          <Feather name="check-circle" size={12} color={colors.success} />
                          <Text style={{ color: colors.success, fontFamily: fonts.medium, fontSize: 10 }}>Auto-Detected</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={styles.inputWithIconRow}>
                      <View style={[styles.inputIconBox, { backgroundColor: theme.input }]}>
                        <Feather name="map-pin" size={18} color="#C89A43" />
                      </View>
                      <TextInput
                        value={locAddress}
                        onChangeText={(text) => {
                          setLocAddress(text);
                          setAutoDetectedBadge(false);
                        }}
                        onSubmitEditing={handleGeocodeSearch}
                        placeholder="Search address or location"
                        placeholderTextColor={theme.muted}
                        style={[styles.editTextInputWithIcon, { backgroundColor: theme.input, color: theme.text, flex: 1 }]}
                      />
                      <Pressable onPress={handleGeocodeSearch} style={[styles.searchLocationBtnInner, { backgroundColor: theme.input, borderColor: theme.border }]}>
                        {resolvingLocation ? (
                          <ActivityIndicator size="small" color="#C89A43" />
                        ) : (
                          <Feather name="search" size={18} color="#C89A43" />
                        )}
                      </Pressable>
                    </View>

                    <Pressable onPress={handleOpenInGoogleMaps} style={[styles.googleMapsBtn, { backgroundColor: theme.input, borderColor: theme.border }]}>
                      <Feather name="map" size={14} color={colors.info} />
                      <Text style={[styles.googleMapsBtnText, { color: colors.info }]}>Open / Search in Google Maps</Text>
                    </Pressable>
                  </Card>

                  <View style={styles.locSaveActionRow}>
                    <Pressable onPress={() => setLocFormVisible(false)} style={({ pressed }) => [styles.locCancelBtn, { backgroundColor: theme.input, borderColor: theme.border }, pressed && styles.pressed]}>
                      <Text style={[styles.locCancelText, { color: theme.secondaryText }]}>Cancel</Text>
                    </Pressable>
                    
                    <Pressable onPress={handleSaveLocation} style={({ pressed }) => [styles.locSaveBtn, { backgroundColor: isDark ? "#C89A43" : "#000000" }, pressed && styles.pressed]}>
                      <Text style={[styles.locSaveText, { color: isDark ? "#000000" : "#FFFFFF" }]}>Save Location</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View>
                  {showBanner ? (
                    <View style={[styles.banner, { backgroundColor: isDark ? "rgba(200,154,67,0.15)" : "#F4EBD9" }]}>
                      <Feather name="info" size={16} color="#946B22" style={styles.bannerIcon} />
                      <Text style={[styles.bannerText, { color: isDark ? "#CCCCCC" : "#1C1C1E" }]}>
                        Nearby bookings and job opportunities are prioritized based on your Default Location.
                      </Text>
                      <Pressable onPress={() => setShowBanner(false)} style={styles.bannerClose}>
                        <Feather name="x" size={16} color={theme.muted} />
                      </Pressable>
                    </View>
                  ) : null}

                  <Pressable onPress={handleAddLocation} style={({ pressed }) => [styles.addLocationCard, { backgroundColor: theme.card, borderColor: theme.border }, pressed && styles.pressed]}>
                    <View style={[styles.addLocationIconCircle, { backgroundColor: theme.primarySoft }]}>
                      <Feather name="plus" size={20} color="#946B22" />
                    </View>
                    <Text style={[styles.addLocationCardText, { color: theme.text }]}>Add New Location</Text>
                  </Pressable>

                  <Text style={[styles.sectionHeading, { color: theme.secondaryText }]}>Saved Locations</Text>

                  {savedLocations.map((loc) => (
                    <Card key={loc.id} style={[styles.locationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <View style={styles.locHeaderRow}>
                        <View style={[styles.locIconBox, { backgroundColor: theme.primarySoft }]}>
                          <Feather name="map-pin" size={18} color="#946B22" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Text style={[styles.locTitleText, { color: theme.text }]}>{loc.name}</Text>
                            {loc.isDefault && (
                              <View style={styles.defaultBadgeGold}>
                                <Feather name="star" size={8} color="#FFF" style={{ marginRight: 2 }} />
                                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.locAddressText, { color: theme.secondaryText }]}>{loc.address}</Text>
                        </View>
                      </View>

                      <View style={[styles.locDivider, { backgroundColor: theme.divider }]} />

                      <View style={styles.locActionsRow}>
                        <Pressable onPress={() => handleSetDefault(loc.id)} style={styles.setDefaultPressable}>
                          <Feather name="star" size={16} color={loc.isDefault ? "#946B22" : theme.muted} style={{ marginRight: 6 }} />
                          <Text style={[styles.setDefaultText, { color: theme.secondaryText }, loc.isDefault && { color: "#946B22", fontFamily: fonts.bold }]}>
                            {loc.isDefault ? "Default Location" : "Set as Default"}
                          </Text>
                        </Pressable>

                        <View style={styles.locActionButtons}>
                          <Pressable onPress={() => handleEditLocation(loc)} style={[styles.locRoundBtn, { backgroundColor: theme.input, borderColor: theme.border }]}>
                            <Feather name="edit-3" size={14} color={theme.secondaryText} />
                          </Pressable>
                          
                          <Pressable onPress={() => handleDeleteLocation(loc.id)} style={[styles.locRoundBtn, { backgroundColor: "rgba(255,59,48,0.12)", borderColor: "rgba(198,64,70,0.2)" }]}>
                            <Feather name="trash-2" size={14} color={colors.error} />
                          </Pressable>
                        </View>
                      </View>
                    </Card>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Pop-up 3: Working Hours Floating Sheet */}
      <Modal visible={hoursModalVisible} transparent animationType="slide" onRequestClose={() => {
        setHoursModalVisible(false);
        setWorkerFormVisible(false);
      }}>
        <View style={styles.modalOverlayBottom}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => {
            setHoursModalVisible(false);
            setWorkerFormVisible(false);
          }} />
          <View style={styles.floatingCardModal}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleBox}>
                {workerFormVisible ? (
                  <Pressable 
                    onPress={() => setWorkerFormVisible(false)} 
                    style={{ marginRight: 8, padding: 4 }}
                  >
                    <Feather name="arrow-left" size={20} color={colors.text} />
                  </Pressable>
                ) : (
                  <Feather name="clock" size={18} color="#C89A43" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.modalTitleText}>
                  {workerFormVisible ? (editingWorkerId ? "Edit Worker" : "Add Worker") : "Working Hours"}
                </Text>
              </View>
              
              {!workerFormVisible ? (
                <Pressable onPress={() => setHoursModalVisible(false)} style={styles.modalCloseCircleBtn}>
                  <Feather name="x" size={16} color={colors.text} />
                </Pressable>
              ) : (
                <View style={{ width: 32 }} />
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              {workerFormVisible ? (
                // Worker Form Content
                <View>
                  <Card style={styles.addressFormCard}>
                    <Text style={styles.editInputLabel}>Worker Name</Text>
                    <View style={styles.inputWithIconRow}>
                      <View style={styles.inputIconBox}>
                        <Feather name="user" size={18} color="#555" />
                      </View>
                      <TextInput
                        value={workerName}
                        onChangeText={setWorkerName}
                        placeholder="e.g. Richard Anderson"
                        placeholderTextColor={colors.muted}
                        style={styles.editTextInputWithIcon}
                      />
                    </View>

                    <Text style={styles.editInputLabel}>Role / Specialty</Text>
                    <View style={styles.inputWithIconRow}>
                      <View style={styles.inputIconBox}>
                        <Feather name="briefcase" size={18} color="#555" />
                      </View>
                      <TextInput
                        value={workerRole}
                        onChangeText={setWorkerRole}
                        placeholder="e.g. Expert Barber"
                        placeholderTextColor={colors.muted}
                        style={styles.editTextInputWithIcon}
                      />
                    </View>

                    <Text style={styles.editInputLabel}>Shift Start Time</Text>
                    <View style={styles.inputWithIconRow}>
                      <View style={styles.inputIconBox}>
                        <Feather name="clock" size={18} color="#555" />
                      </View>
                      <TextInput
                        value={workerStart}
                        onChangeText={setWorkerStart}
                        placeholder="e.g. 09:00 AM"
                        placeholderTextColor={colors.muted}
                        style={styles.editTextInputWithIcon}
                      />
                    </View>

                    <Text style={styles.editInputLabel}>Shift End Time</Text>
                    <View style={styles.inputWithIconRow}>
                      <View style={styles.inputIconBox}>
                        <Feather name="clock" size={18} color="#555" />
                      </View>
                      <TextInput
                        value={workerEnd}
                        onChangeText={setWorkerEnd}
                        placeholder="e.g. 06:00 PM"
                        placeholderTextColor={colors.muted}
                        style={styles.editTextInputWithIcon}
                      />
                    </View>
                  </Card>

                  <View style={styles.locSaveActionRow}>
                    <Pressable onPress={() => setWorkerFormVisible(false)} style={({ pressed }) => [styles.locCancelBtn, pressed && styles.pressed]}>
                      <Text style={styles.locCancelText}>Cancel</Text>
                    </Pressable>
                    
                    <Pressable onPress={handleSaveWorker} style={({ pressed }) => [styles.locSaveBtn, pressed && styles.pressed]}>
                      <Text style={styles.locSaveText}>Save Worker</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                // Worker List Content
                <View>
                  <View style={styles.banner}>
                    <Feather name="clock" size={16} color="#946B22" style={styles.bannerIcon} />
                    <Text style={styles.bannerText}>
                      Configure working hour schedules and availability for all shop employees.
                    </Text>
                  </View>

                  <Pressable onPress={handleAddWorker} style={({ pressed }) => [styles.addLocationCard, pressed && styles.pressed]}>
                    <View style={styles.addLocationIconCircle}>
                      <Feather name="plus" size={20} color="#946B22" />
                    </View>
                    <Text style={styles.addLocationCardText}>Add New Worker</Text>
                  </Pressable>

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
                          trackColor={{ false: isDark ? "#3A3A3C" : "#E0E0E0", true: "#00A896" }}
                          thumbColor="#FFFFFF"
                          ios_backgroundColor={isDark ? "#3A3A3C" : "#E0E0E0"}
                        />
                      </View>

                      <View style={styles.locDivider} />
                      <View style={styles.locActionsRow}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Feather name="clock" size={14} color="#946B22" style={{ marginRight: 6 }} />
                          <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.secondaryText }}>
                            {emp.active ? `${emp.start} - ${emp.end}` : "Off-duty"}
                          </Text>
                        </View>
                        <View style={styles.locActionButtons}>
                          <Pressable onPress={() => handleEditWorker(emp)} style={styles.locRoundBtn}>
                            <Feather name="edit-3" size={14} color={colors.secondaryText} />
                          </Pressable>
                          
                          <Pressable onPress={() => handleDeleteWorker(emp.id)} style={[styles.locRoundBtn, { borderColor: "rgba(198,64,70,0.12)" }]}>
                            <Feather name="trash-2" size={14} color={colors.error} />
                          </Pressable>
                        </View>
                      </View>
                    </Card>
                  ))}

                  <Pressable onPress={() => setHoursModalVisible(false)} style={({ pressed }) => [styles.saveHoursBtn, pressed && styles.pressed]}>
                    <Text style={styles.saveHoursBtnText}>Save Schedule & Roster</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PanelHeader({ title, copy, action, onAction }: { title: string; copy: string; action?: string; onAction?: () => void }) {
  const { themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const theme = getThemeColors(isDark);
  return (
    <View style={styles.panelHeader}>
      <View style={styles.panelCopy}>
        <Text style={[styles.panelTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.panelBody, { color: theme.secondaryText }]}>{copy}</Text>
      </View>
      {action ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.panelAction, { backgroundColor: isDark ? "#C89A43" : "#000000" }, pressed && styles.pressed]}>
          <Text style={[styles.panelActionText, { color: isDark ? "#000000" : "#FFFFFF" }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function BusinessMetric({ label, value, change }: { label: string; value: string; change: string }) {
  const { themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const theme = getThemeColors(isDark);
  return (
    <View style={[styles.businessMetric, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.businessMetricLabel, { color: theme.secondaryText }]}>{label}</Text>
      <Text style={[styles.businessMetricValue, { color: theme.text }]}>{value}</Text>
      <Text style={styles.businessMetricChange}>{change}</Text>
    </View>
  );
}

function SettingRow({ icon, title, copy, value, onChange }: { icon: FeatherName; title: string; copy: string; value: boolean; onChange: (value: boolean) => void }) {
  const { themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const theme = getThemeColors(isDark);
  return (
    <View style={[styles.settingRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: theme.primarySoft }]}>
        <Feather name={icon} size={17} color={colors.primaryDark} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.settingBody, { color: theme.secondaryText }]}>{copy}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: isDark ? "#3A3A3C" : "#E0E0E0", true: "#00A896" }}
        thumbColor="#FFFFFF"
        ios_backgroundColor={isDark ? "#3A3A3C" : "#E0E0E0"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#121214" },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, paddingTop: 16, marginBottom: 16 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: "#8E8E93", fontFamily: fonts.bold, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  title: { color: "#FFFFFF", fontFamily: fonts.headingHeavy, fontSize: 32, letterSpacing: -0.5, marginTop: 2 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  tabRail: { minHeight: 86, borderRadius: radius.lg, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "#1C1C1E", padding: 6, flexDirection: "row", gap: 6, marginBottom: 20 },
  tabOption: { flex: 1, minWidth: 0, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, paddingVertical: 8 },
  tabOptionActive: { backgroundColor: "#C89A43" },
  tabIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(200,154,67,0.18)", marginBottom: 6 },
  tabIconActive: { backgroundColor: "#000000" },
  tabLabel: { color: "#8E8E93", fontFamily: fonts.semibold, fontSize: 11 },
  tabLabelActive: { color: "#000000" },
  tabSummary: { color: "#8E8E93", fontFamily: fonts.medium, fontSize: 16, marginTop: 2 },
  tabSummaryActive: { color: "#000000" },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 6, marginBottom: 14 },
  panelCopy: { flex: 1, minWidth: 0 },
  panelTitle: { color: "#FFFFFF", fontFamily: fonts.headingSemi, fontSize: 18, letterSpacing: -0.4 },
  panelBody: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  panelAction: { minHeight: 36, borderRadius: 18, backgroundColor: "#C89A43", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 },
  panelActionText: { color: "#000000", fontFamily: fonts.bold, fontSize: 12 },
  form: { borderRadius: 16, backgroundColor: "#1C1C1E", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", padding: 14, gap: 10, marginBottom: 12 },
  input: { minHeight: 46, borderRadius: 10, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#252528", color: "#FFFFFF", fontFamily: fonts.body, fontSize: 14, paddingHorizontal: 12 },
  formRow: { flexDirection: "row", gap: 10 },
  halfInput: { flex: 1 },
  saveButton: { minHeight: 44, borderRadius: 22, backgroundColor: "#C89A43", alignItems: "center", justifyContent: "center" },
  saveText: { color: "#000000", fontFamily: fonts.semibold, fontSize: 13 },
  serviceList: { gap: 10 },
  serviceRow: { minHeight: 64, borderRadius: 16, backgroundColor: "#1C1C1E", borderWidth: 0.5, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  serviceIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(200,154,67,0.18)" },
  serviceCopy: { flex: 1, minWidth: 0 },
  serviceName: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 14 },
  serviceMeta: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  serviceActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  editButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  deleteButton: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,59,48,0.18)" },
  confirmDeleteContainer: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  confirmDeleteText: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 13, flex: 1, marginRight: 8 },
  confirmActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  confirmCancelBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.12)" },
  confirmCancelText: { color: "#8E8E93", fontFamily: fonts.medium, fontSize: 12 },
  confirmDeleteBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.error },
  confirmDeleteTextBtn: { color: colors.white, fontFamily: fonts.bold, fontSize: 12 },
  payoutHero: { minHeight: 118, borderRadius: radius.md, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 12 },
  payoutCopy: { flex: 1, minWidth: 0 },
  payoutLabel: { color: "#8E8E93", fontFamily: fonts.medium, fontSize: 10, textTransform: "uppercase" },
  payoutValue: { color: "#FFFFFF", fontFamily: fonts.headingHeavy, fontSize: 32, marginTop: 6 },
  payoutMeta: { color: "#D9DBD7", fontFamily: fonts.body, fontSize: 11, marginTop: 5 },
  readyBadge: { minHeight: 34, borderRadius: radius.full, backgroundColor: "rgba(30,141,91,0.24)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10 },
  readyText: { color: "#75D7A6", fontFamily: fonts.semibold, fontSize: 9 },
  metricGrid: { flexDirection: "row", gap: 10 },
  businessMetric: { flex: 1, minHeight: 96, borderRadius: radius.md, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14 },
  businessMetricLabel: { color: "#8E8E93", fontFamily: fonts.medium, fontSize: 14 },
  businessMetricValue: { color: "#FFFFFF", fontFamily: fonts.heading, fontSize: 22, marginTop: 9 },
  businessMetricChange: { color: colors.success, fontFamily: fonts.semibold, fontSize: 10, marginTop: 5 },
  withdrawButton: { minHeight: 50, borderRadius: radius.full, backgroundColor: "#C89A43", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
  withdrawText: { color: "#000000", fontFamily: fonts.bold, fontSize: 13 },
  successMessage: { color: colors.success, fontFamily: fonts.medium, fontSize: 11, textAlign: "center", marginTop: 10 },
  shopHero: { minHeight: 104, borderRadius: radius.md, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  shopHeroCopy: { flex: 1, minWidth: 0 },
  shopEyebrow: { color: "#C89A43", fontFamily: fonts.semibold, fontSize: 9, textTransform: "uppercase" },
  shopName: { color: "#FFFFFF", fontFamily: fonts.headingSemi, fontSize: 17, marginTop: 6 },
  shopAddress: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 10, marginTop: 4 },
  shopStatus: { borderRadius: radius.full, backgroundColor: "rgba(30,141,91,0.24)", paddingHorizontal: 10, paddingVertical: 7 },
  shopStatusClosed: { backgroundColor: "rgba(198,64,70,0.24)" },
  shopStatusText: { color: "#75D7A6", fontFamily: fonts.semibold, fontSize: 9 },
  shopStatusTextClosed: { color: "#F28D91" },
  settingRow: { minHeight: 76, borderRadius: radius.md, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(200,154,67,0.18)" },
  settingCopy: { flex: 1, minWidth: 0 },
  settingTitle: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 14 },
  settingBody: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  shopActions: { borderRadius: radius.md, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 10 },
  shopAction: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)", flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12 },
  shopActionText: { flex: 1, color: "#FFFFFF", fontFamily: fonts.medium, fontSize: 14 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", padding: 24 },
  qrContainer: { width: "100%", maxWidth: 320, backgroundColor: "#1C1C1E", borderRadius: radius.lg, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  qrTitle: { color: "#FFFFFF", fontFamily: fonts.heading, fontSize: 20, textAlign: "center" },
  qrSubtitle: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18 },
  qrImage: { width: 220, height: 220, marginTop: 20, borderRadius: radius.sm },
  qrShopName: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 15, marginTop: 16 },
  qrCloseButton: { width: "100%", minHeight: 46, borderRadius: radius.full, backgroundColor: "#C89A43", justifyContent: "center", alignItems: "center", marginTop: 24 },
  qrCloseText: { color: "#000000", fontFamily: fonts.semibold, fontSize: 13 },
  subviewHeader: { height: 56, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 18 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" },
  subviewTitle: { color: "#FFFFFF", fontFamily: fonts.heading, fontSize: 20 },
  banner: { minHeight: 64, borderRadius: radius.md, backgroundColor: "rgba(200,154,67,0.15)", paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 18 },
  bannerIcon: { marginTop: 2 },
  bannerText: { color: "#E5E5EA", fontFamily: fonts.body, fontSize: 13, flex: 1, marginRight: 8, lineHeight: 18 },
  bannerClose: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  addLocButton: { minHeight: 46, borderRadius: radius.full, backgroundColor: "#C89A43", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 },
  addLocButtonText: { color: "#000000", fontFamily: fonts.bold, fontSize: 13 },
  sectionHeading: { color: "#FFFFFF", fontFamily: fonts.headingSemi, fontSize: 16, marginBottom: 12 },
  locCard: { borderRadius: radius.md, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, gap: 12, marginBottom: 12 },
  locCardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  locCardTitle: { color: "#FFFFFF", fontFamily: fonts.headingSemi, fontSize: 15 },
  defaultBadge: { borderRadius: radius.full, backgroundColor: colors.success, paddingHorizontal: 8, paddingVertical: 4 },
  defaultBadgeText: { color: colors.white, fontFamily: fonts.bold, fontSize: 8 },
  locCardAddressRow: { gap: 4 },
  locCardAddressLabel: { color: "#C89A43", fontFamily: fonts.bold, fontSize: 9 },
  locCardAddress: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  locCardActions: { borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  locActionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  locActionBtnText: { color: "#8E8E93", fontFamily: fonts.semibold, fontSize: 11 },
  locActionRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  locEditBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  locEditBtnText: { color: "#8E8E93", fontFamily: fonts.semibold, fontSize: 11 },
  locDeleteBtn: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  fabContainer: { position: "absolute", bottom: 20, right: 14, zIndex: 10 },
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#C89A43", alignItems: "center", justifyContent: "center", elevation: 4 },
  mapContainer: { height: 200, borderRadius: radius.md, overflow: "hidden", marginBottom: 18 },
  mapPinOverlay: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(28,28,30,0.9)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full },
  mapPinText: { color: "#FFFFFF", fontFamily: fonts.medium, fontSize: 10 },
  mapZoomControls: { position: "absolute", top: 12, right: 12, gap: 6 },
  zoomBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(28,28,30,0.9)", alignItems: "center", justifyContent: "center" },
  zoomBtnText: { color: "#FFFFFF", fontFamily: fonts.bold, fontSize: 16 },
  liveLocationBtn: { minHeight: 46, borderRadius: radius.full, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#252528", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 18 },
  liveLocationText: { color: "#C89A43", fontFamily: fonts.semibold, fontSize: 13 },
  addressForm: { gap: 12, marginBottom: 20 },
  inputLabel: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 12 },
  formInput: { minHeight: 46, borderRadius: radius.sm, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#252528", color: "#FFFFFF", fontFamily: fonts.body, fontSize: 13, paddingHorizontal: 12, marginBottom: 10 },
  addressInputRow: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 },
  searchAddrBtn: { width: 46, height: 46, borderRadius: radius.sm, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#252528", alignItems: "center", justifyContent: "center" },
  googleMapsBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  googleMapsBtnText: { color: colors.info, fontFamily: fonts.semibold, fontSize: 12, textDecorationLine: "underline" },
  helperText: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 12, marginTop: 8, fontStyle: "italic", lineHeight: 18 },
  saveLocationBtn: { minHeight: 46, borderRadius: radius.full, backgroundColor: "#C89A43", justifyContent: "center", alignItems: "center" },
  saveLocationBtnText: { color: "#000000", fontFamily: fonts.bold, fontSize: 13 },
  empCard: { borderRadius: radius.md, backgroundColor: "#1C1C1E", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, marginBottom: 12 },
  empRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  empAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" },
  empDetails: { flex: 1, minWidth: 0 },
  empName: { color: "#FFFFFF", fontFamily: fonts.headingSemi, fontSize: 14 },
  empRole: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  hoursEditor: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingTop: 12 },
  hourInputGroup: { flex: 1 },
  hourInputLabel: { color: "#FFFFFF", fontFamily: fonts.semibold, fontSize: 10, marginBottom: 4 },
  hourInput: { minHeight: 40, borderRadius: radius.sm, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "#252528", color: "#FFFFFF", fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 10 },
  hourSeparator: { justifyContent: "center", alignItems: "center", marginTop: 14 },
  hourSeparatorText: { color: "#8E8E93", fontFamily: fonts.medium, fontSize: 12 },
  offDutyBanner: { marginTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingTop: 12 },
  offDutyText: { color: "#8E8E93", fontFamily: fonts.body, fontSize: 11, fontStyle: "italic" },
  saveHoursBtn: { minHeight: 46, borderRadius: radius.full, backgroundColor: "#C89A43", justifyContent: "center", alignItems: "center", marginTop: 10 },
  saveHoursBtnText: { color: "#000000", fontFamily: fonts.bold, fontSize: 13 },
  modalOverlayBottom: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 16 },
  editContainer: {
    width: "100%",
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 30,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -10 },
    elevation: 10
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
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
    backgroundColor: "#252528",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10
  },
  editTitle: {
    color: "#FFFFFF",
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
    color: "#FFFFFF",
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
    backgroundColor: "#252528",
    alignItems: "center",
    justifyContent: "center"
  },
  editTextInputWithIcon: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#252528",
    paddingHorizontal: 16,
    color: "#FFFFFF",
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
    borderColor: "#C89A43",
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center"
  },
  editCancelText: {
    color: "#C89A43",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  editSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#C89A43",
    alignItems: "center",
    justifyContent: "center"
  },
  editSaveText: {
    color: "#000000",
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
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
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
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    backgroundColor: "#1C1C1E",
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  shopActionRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)"
  },
  shopActionIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(200,154,67,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  shopActionLabel: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: fonts.medium,
    fontSize: 14
  },
  qrCard: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    padding: 24,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  qrCardHeader: {
    alignItems: "center",
    marginBottom: 20,
    zIndex: 2
  },
  qrShopAddress: {
    color: "#8E8E93",
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
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
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
    color: "#8E8E93",
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
    backgroundColor: "#C89A43",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  shareQrText: {
    color: "#000000",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  downloadQrBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#C89A43",
    backgroundColor: "#1C1C1E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  downloadQrText: {
    color: "#C89A43",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  addLocationCard: {
    height: 64,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#C89A43",
    borderStyle: "dashed",
    backgroundColor: "rgba(200,154,67,0.12)",
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
    backgroundColor: "#C89A43",
    alignItems: "center",
    justifyContent: "center"
  },
  addLocationCardText: {
    color: "#C89A43",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  locationCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
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
    backgroundColor: "rgba(200,154,67,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2
  },
  locTitleText: {
    color: "#FFFFFF",
    fontFamily: fonts.headingSemi,
    fontSize: 15
  },
  locAddressText: {
    color: "#8E8E93",
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18
  },
  locDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
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
    color: "#8E8E93",
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
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#252528",
    alignItems: "center",
    justifyContent: "center"
  },
  defaultBadgeGold: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C89A43",
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
    borderColor: "rgba(255,255,255,0.08)",
    padding: 0
  },
  useLiveLocationBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(200,154,67,0.18)",
    borderWidth: 1,
    borderColor: "#C89A43",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  useLiveLocationText: {
    color: "#C89A43",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  addressFormCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 20
  },
  searchLocationBtnInner: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#252528",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
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
    borderColor: "#C89A43",
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center"
  },
  locCancelText: {
    color: "#C89A43",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  locSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#C89A43",
    alignItems: "center",
    justifyContent: "center"
  },
  locSaveText: {
    color: "#000000",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  employeeCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 12
  },
  empAvatarWrapper: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "#C89A43",
    padding: 2,
    backgroundColor: "#1C1C1E"
  },
  empAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19
  },
  empNameText: {
    color: "#FFFFFF",
    fontFamily: fonts.headingSemi,
    fontSize: 14
  },
  empRoleText: {
    color: "#8E8E93",
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2
  },
  hoursEditorRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
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
    color: "#8E8E93",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  offDutyBannerBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
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
    color: "#8E8E93",
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
    borderColor: "rgba(255,255,255,0.08)",
    position: "relative"
  },
  tileMapBackground: {
    ...StyleSheet.absoluteFill,
    opacity: 0.8
  },
  tileGlassOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)"
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
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
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
    color: "#FFFFFF",
    fontFamily: fonts.headingSemi,
    fontSize: 16
  },
  tileSubtitle: {
    color: "#8E8E93",
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
    borderColor: "rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden"
  },
  bentoQrTile: {
    backgroundColor: "#1C1C1E"
  },
  bentoHoursTile: {
    backgroundColor: "#1C1C1E"
  },
  tileContentHalf: {
    ...StyleSheet.absoluteFill,
    padding: 16,
    justifyContent: "space-between"
  },
  tileTitleHalf: {
    color: "#FFFFFF",
    fontFamily: fonts.headingSemi,
    fontSize: 14
  },
  tileDescriptionHalf: {
    color: "#8E8E93",
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
  tileTitleLight: {
    color: colors.white,
    fontFamily: fonts.headingSemi,
    fontSize: 16,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  tileSubtitleLight: {
    color: "#E2E5E0",
    fontFamily: fonts.body,
    fontSize: 11,
    marginTop: 2,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  activeRosterBadge: {
    backgroundColor: "#C89A43",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  activeRosterBadgeText: {
    color: "#000000",
    fontFamily: fonts.bold,
    fontSize: 9
  },
  immersiveContainer: {
    flex: 1,
    backgroundColor: "#121214"
  },
  immersiveHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)"
  },
  immersiveBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  immersiveHeaderTitle: {
    color: "#FFFFFF",
    fontFamily: fonts.heading,
    fontSize: 18
  },
  immersiveContentContainer: {
    padding: 20,
    paddingBottom: 40
  },
  floatingCardModal: {
    width: "95%",
    maxWidth: 420,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#C89A43",
    backgroundColor: "#1C1C1E",
    padding: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)"
  },
  modalHeaderTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  modalTitleText: {
    color: "#FFFFFF",
    fontFamily: fonts.heading,
    fontSize: 18
  },
  modalCloseCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#252528",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center"
  }
});
