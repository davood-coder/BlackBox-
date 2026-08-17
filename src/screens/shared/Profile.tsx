import { Image, ImageBackground, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import type { ComponentProps, ComponentType } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppHeader, BarberBottomNav, BottomNav, Card, IOSSegmentedControl, Screen } from "../../components/ui";
import { temporaryProfiles, type Workspace } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";
import { images } from "../../assets/images";
import { convertCurrencyAmount } from "../../utils/currency";
import * as ImagePicker from "expo-image-picker";

const MenuIcon = Feather as ComponentType<any>;
type FeatherName = ComponentProps<typeof Feather>["name"];

type ProfileMenuItem = {
  label: string;
  icon: FeatherName;
  route: string;
  params?: unknown;
};

const customerMenu: ProfileMenuItem[] = [
  { label: "Edit Profile", icon: "user-check", route: "EditProfile" },
  { label: "My Bookings", icon: "calendar", route: "MyBookings" },
  { label: "Favorite Shops & Barbers", icon: "heart", route: "Favorites" },
  { label: "Saved Style Photos", icon: "image", route: "Profile" },
  { label: "Payment Methods", icon: "credit-card", route: "BookingSummary" },
  { label: "Notifications", icon: "bell", route: "Notifications" },
  { label: "Help & Support", icon: "help-circle", route: "Profile" },
  { label: "Privacy & Safety", icon: "shield", route: "Privacy" },
  { label: "Logout", icon: "log-out", route: "Login" }
];

const barberMenu: ProfileMenuItem[] = [
  { label: "Edit Profile", icon: "user-check", route: "EditProfile" },
  { label: "Notifications", icon: "bell", route: "Notifications" },
  { label: "Help & Support", icon: "help-circle", route: "Profile" },
  { label: "Privacy & Safety", icon: "shield", route: "Privacy" },
  { label: "Logout", icon: "log-out", route: "Login" }
];

const AVATAR_OPTIONS = [
  images.blackBoxMark,
  images.masterBarber,
  images.luxuryBarbershop,
  images.barberToolsBoard
];

const EMOJI_OPTIONS = [
  { emoji: "💈", label: "Barber Pole" },
  { emoji: "✂️", label: "Scissors" },
  { emoji: "👑", label: "Master" },
  { emoji: "🧔", label: "Beard" },
  { emoji: "👨‍🦱", label: "Fade" },
  { emoji: "💆", label: "Style" },
  { emoji: "🔥", label: "Hot Cut" },
  { emoji: "💇‍♂️", label: "Classic" },
  { emoji: "🌟", label: "Star" },
  { emoji: "🎩", label: "Top Style" }
];

export default function Profile({ navigation }: any) {
  const {
    bookings,
    favoriteShopIds,
    selectedBarber,
    selectedPaymentMethod,
    selectedPreference,
    workspace,
    currency,
    themeMode,
    setThemeMode
  } = useBooking();
  const isDark = themeMode === "dark";
  const isBarber = workspace === "Barber";
  const profile = temporaryProfiles[workspace];

  const [profileName, setProfileName] = useState(profile.name);
  const [profileEmail, setProfileEmail] = useState(profile.email);
  const [profileHeadline, setProfileHeadline] = useState(profile.headline);
  const [shopName, setShopName] = useState(profile.details.find((d: any) => d.label === "Shop" || d.label === "Home shop")?.value || "Black Box Barbershop");
  const [role, setRole] = useState(profile.details.find((d: any) => d.label === "Role")?.value || "Owner barber");
  const [workingHours, setWorkingHours] = useState(profile.details.find((d: any) => d.label === "Working hours")?.value || "9:00 AM - 9:00 PM");
  const [phone, setPhone] = useState(profile.phone || "");
  const [profileAvatar, setProfileAvatar] = useState<any>(profile.avatar);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [shareLocation, setShareLocation] = useState(true);
  const [shareAnalytics, setShareAnalytics] = useState(false);
  const [tailoredAds, setTailoredAds] = useState(true);
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);

  const [tempName, setTempName] = useState(profileName);
  const [tempEmail, setTempEmail] = useState(profileEmail);
  const [tempHeadline, setTempHeadline] = useState(profileHeadline);
  const [tempShopName, setTempShopName] = useState(shopName);
  const [tempRole, setTempRole] = useState(role);
  const [tempWorkingHours, setTempWorkingHours] = useState(workingHours);
  const [tempPhone, setTempPhone] = useState(phone);
  const [tempAvatar, setTempAvatar] = useState<any>(profileAvatar);

  async function handlePickImage() {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access photo library is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setTempAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
      alert("Error picking image from gallery.");
    }
  }

  async function handleTakePhoto() {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setTempAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
      alert("Error taking photo with camera.");
    }
  }

  const menu = isBarber ? barberMenu : customerMenu;
  const profileBookings = isBarber ? bookings : bookings.filter((booking) => !booking.customer || booking.customer === profileName);
  const activeBookings = profileBookings.filter((booking) => booking.status === "Confirmed" || booking.status === "Pending");
  const pendingRequests = profileBookings.filter((booking) => booking.status === "Pending");
  const confirmedBookings = profileBookings.filter((booking) => booking.status === "Confirmed");
  const completedBookings = profileBookings.filter((booking) => booking.status === "Completed");
  const payout = (profile.basePayout || 0) + completedBookings.reduce((total, booking) => total + (booking.total || 0), 0);
  const displayPayout = convertCurrencyAmount(payout, currency.code);
  const homeRoute = isBarber ? "BarberDashboard" : "Home";

  const statsWithIcons = isBarber
    ? []
    : [
        {
          label: "Active\nBookings",
          value: String(activeBookings.length),
          icon: "calendar" as const,
          route: "MyBookings"
        },
        {
          label: "Reward\nPoints",
          value: String(profile.rewardPoints || 0),
          icon: "gift" as const,
          route: "Profile"
        },
        {
          label: "Saved\nShops",
          value: String(favoriteShopIds.length),
          icon: "heart" as const,
          route: "Favorites"
        }
      ];

  const details = isBarber
    ? [
        { label: "Shop", value: shopName },
        { label: "Role", value: role },
        { label: "Working hours", value: workingHours },
        { label: "Phone", value: phone }
      ]
    : [
        { label: "Phone", value: phone },
        ...profile.details,
        { label: "Preference", value: selectedPreference.label },
        { label: "Payment", value: selectedPaymentMethod.detail },
        { label: "Saved shops", value: `${favoriteShopIds.length} shops` }
      ];

  function openEditModal() {
    setTempName(profileName);
    setTempEmail(profileEmail);
    setTempShopName(shopName);
    setTempRole(role);
    setTempWorkingHours(workingHours);
    setTempPhone(phone);
    setTempHeadline(profileHeadline);
    setTempAvatar(profileAvatar);
    setShowHoursDropdown(false);
    setEditModalVisible(true);
  }

  function handleSaveProfile() {
    temporaryProfiles[workspace].name = tempName;
    temporaryProfiles[workspace].email = tempEmail;
    temporaryProfiles[workspace].phone = tempPhone;
    temporaryProfiles[workspace].headline = tempHeadline;
    temporaryProfiles[workspace].avatar = tempAvatar;
    
    const shopDetail = temporaryProfiles[workspace].details?.find((d: any) => d.label === "Shop" || d.label === "Home shop");
    if (shopDetail) {
      shopDetail.value = tempShopName;
    }
    const roleDetail = temporaryProfiles[workspace].details?.find((d: any) => d.label === "Role");
    if (roleDetail) {
      roleDetail.value = tempRole;
    }
    const hoursDetail = temporaryProfiles[workspace].details?.find((d: any) => d.label === "Working hours");
    if (hoursDetail) {
      hoursDetail.value = tempWorkingHours;
    }

    setProfileName(tempName);
    setProfileEmail(tempEmail);
    setShopName(tempShopName);
    setRole(tempRole);
    setWorkingHours(tempWorkingHours);
    setPhone(tempPhone);
    setProfileHeadline(tempHeadline);
    setProfileAvatar(tempAvatar);
    setEditModalVisible(false);
  }

  function openMenuItem(item: ProfileMenuItem) {
    if (item.label === "Edit Profile") {
      openEditModal();
      return;
    }
    if (item.route === "Privacy") {
      setPrivacyModalVisible(true);
      return;
    }
    if (item.route === "Login") {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
      return;
    }
    navigation.navigate(item.route, item.params);
  }

  const getDetailIcon = (label: string): FeatherName => {
    const lower = label.toLowerCase();
    if (lower.includes("shop")) return "home";
    if (lower.includes("role")) return "user";
    if (lower.includes("hours") || lower.includes("working")) return "clock";
    if (lower.includes("phone")) return "phone";
    if (lower.includes("preference") || lower.includes("service")) return "sliders";
    if (lower.includes("payment")) return "credit-card";
    if (lower.includes("styles")) return "image";
    return "info";
  };

  return (
    <View style={[styles.root, isDark && styles.darkRoot]}>
      <Screen scroll bottomInset>
        {/* Scenic Hero Cover Header Card (Image 1 Inspiration) */}
        <View style={styles.heroHeaderContainer}>
          <ImageBackground source={images.luxuryBarbershop} style={styles.heroCoverBg} imageStyle={{ borderRadius: 24 }}>
            <LinearGradient
              colors={["rgba(15,17,21,0.25)", "rgba(15,17,21,0.85)"]}
              style={styles.heroCoverOverlay}
            >
              {/* Top Navigation Actions */}
              <View style={styles.heroTopRow}>
                <Pressable
                  onPress={() => goBackOrNavigate(navigation, homeRoute)}
                  style={styles.heroCircleAction}
                >
                  <Feather name="arrow-left" size={18} color={colors.white} />
                </Pressable>
              </View>

              {/* Centered Hero Profile Avatar */}
              <View style={styles.heroCenterContent}>
                <View style={styles.heroAvatarWrapper}>
                  <Pressable onPress={openEditModal} style={{ width: "100%", height: "100%" }}>
                    {typeof profileAvatar === "string" && profileAvatar.startsWith("emoji:") ? (
                      <View style={styles.heroAvatarEmojiBadge}>
                        <Text style={styles.heroAvatarEmojiChar}>{profileAvatar.replace("emoji:", "")}</Text>
                      </View>
                    ) : typeof profileAvatar === "string" ? (
                      <Image source={{ uri: profileAvatar }} style={styles.heroAvatarImg} />
                    ) : (
                      <Image source={profileAvatar} style={styles.heroAvatarImg} />
                    )}
                  </Pressable>
                  <Pressable onPress={handleTakePhoto} style={styles.heroCameraOverlayBadge}>
                    <Feather name="camera" size={12} color={colors.white} />
                  </Pressable>
                </View>

                <Text style={styles.heroNameText}>{profileName}</Text>
                
                <View style={styles.heroLocationRow}>
                  <Feather name="map-pin" size={12} color="#C89A43" />
                  <Text style={styles.heroLocationText}>{shopName}</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Section 1: Business / Customer Details */}
        <Text style={[styles.iosGroupHeader, isDark && styles.darkGroupHeader]}>
          {isBarber ? "BUSINESS DETAILS" : "CUSTOMER DETAILS"}
        </Text>
        <Card style={[styles.detailsCard, isDark && styles.darkCard]}>
          {details.map((item, index) => {
            const isWorkingHours = item.label.toLowerCase().includes("working") || item.label.toLowerCase().includes("hours");
            return (
              <Pressable
                key={`${item.label}-${item.value}`}
                onPress={isWorkingHours ? () => navigation.navigate("WorkingHours") : undefined}
                disabled={!isWorkingHours}
                style={({ pressed }) => [
                  styles.detailRow,
                  index === details.length - 1 && styles.lastRow,
                  isWorkingHours && pressed && styles.pressed
                ]}
              >
                <View style={styles.detailIconContainer}>
                  <Feather name={getDetailIcon(item.label)} size={16} color="#946B22" />
                </View>
                <Text style={[styles.detailLabel, isDark && styles.darkText]}>{item.label}</Text>
                <Text style={[styles.detailValue, isDark && styles.darkSubText]} numberOfLines={1}>{item.value}</Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? "#55555E" : "#C7C7CC"} style={{ marginLeft: 6 }} />
              </Pressable>
            );
          })}
        </Card>

        {/* Section 2: Appearance Theme Selector */}
        <Text style={[styles.iosGroupHeader, isDark && styles.darkGroupHeader]}>APPEARANCE</Text>
        <Card style={[styles.detailsCard, isDark && styles.darkCard, { paddingVertical: 14, paddingHorizontal: 14 }]}>
          <IOSSegmentedControl
            values={[
              { key: "light", label: "☀️ Light Mode" },
              { key: "dark", label: "🌙 Dark Mode" }
            ]}
            selectedValue={themeMode}
            onChange={(mode) => setThemeMode(mode as "light" | "dark")}
          />
          <Text style={[styles.themeSubText, isDark && styles.darkSubText, { marginTop: 6, textAlign: "center" }]}>
            {isDark ? "Dark Mode Active" : "Light Mode Active"}
          </Text>
        </Card>

        {/* Section 3: Account & Settings */}
        <Text style={[styles.iosGroupHeader, isDark && styles.darkGroupHeader]}>ACCOUNT & SETTINGS</Text>
        <Card style={[styles.menuCard, isDark && styles.darkCard]}>
          {menu.map((item, index) => {
            const isLogout = item.label === "Logout";
            return (
              <Pressable
                key={item.label}
                onPress={() => openMenuItem(item)}
                style={({ pressed }) => [styles.menuRow, index === menu.length - 1 && styles.lastRow, pressed && styles.pressed]}
              >
                <View style={[styles.menuIconContainer, isLogout && { backgroundColor: "rgba(255, 59, 48, 0.1)" }]}>
                  <Feather name={item.icon} size={16} color={isLogout ? "#FF3B30" : "#946B22"} />
                </View>
                <Text style={[styles.menuLabel, isDark && !isLogout && styles.darkText, isLogout && { color: "#FF3B30" }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? "#55555E" : "#C7C7CC"} />
              </Pressable>
            );
          })}
        </Card>
      </Screen>
      {isBarber ? <BarberBottomNav active="Profile" navigation={navigation} /> : <BottomNav active="Profile" navigation={navigation} />}

      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={[styles.darkModalOverlay, !isDark && { backgroundColor: "rgba(0,0,0,0.4)" }]}>
          <View style={[styles.darkModalCard, !isDark && { backgroundColor: "#FFFFFF", borderColor: "#E5E5EA" }]}>
            {/* Header Bar with Back Circle Button & Centered Title */}
            <View style={styles.darkModalHeader}>
              <Pressable onPress={() => setEditModalVisible(false)} style={[styles.darkModalBackBtn, !isDark && { backgroundColor: "#F2F2F7" }]}>
                <Feather name="arrow-left" size={18} color={isDark ? colors.white : colors.black} />
              </Pressable>
              <Text style={[styles.darkModalTitleText, !isDark && { color: "#000000" }]}>Edit Profile</Text>
              <View style={{ width: 38 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.darkModalScrollContent}>
              {/* Centered Large Avatar with Neon Gold Camera Overlay */}
              <View style={styles.darkAvatarSection}>
                <Pressable onPress={handlePickImage} style={styles.darkAvatarWrapper}>
                  {!tempAvatar ? (
                    <View style={[styles.darkAvatarEmojiBadge, { backgroundColor: isDark ? "#252528" : "#F2F2F7" }]}>
                      <Feather name="user" size={32} color={isDark ? "#8E8E93" : "#6C6C70"} />
                    </View>
                  ) : typeof tempAvatar === "string" && tempAvatar.startsWith("emoji:") ? (
                    <View style={styles.darkAvatarEmojiBadge}>
                      <Text style={styles.darkAvatarEmojiChar}>{tempAvatar.replace("emoji:", "")}</Text>
                    </View>
                  ) : typeof tempAvatar === "string" ? (
                    <Image source={{ uri: tempAvatar }} style={styles.darkAvatarImg} />
                  ) : (
                    <Image source={tempAvatar} style={styles.darkAvatarImg} />
                  )}
                  <Pressable onPress={handleTakePhoto} style={styles.darkCameraIconBadge}>
                    <Feather name="camera" size={14} color="#000000" />
                  </Pressable>
                </Pressable>

                {/* Photo Pickers (Camera, Gallery & Remove Photo) */}
                <View style={styles.darkPhotoActionRow}>
                  <Pressable onPress={handleTakePhoto} style={[styles.darkPhotoPill, !isDark && { backgroundColor: "#F4EBD9", borderColor: "#D7A84F" }]}>
                    <Feather name="camera" size={13} color="#946B22" />
                    <Text style={[styles.darkPhotoPillText, !isDark && { color: "#946B22" }]}>Take Photo</Text>
                  </Pressable>
                  <Pressable onPress={handlePickImage} style={[styles.darkPhotoPill, !isDark && { backgroundColor: "#F4EBD9", borderColor: "#D7A84F" }]}>
                    <Feather name="image" size={13} color="#946B22" />
                    <Text style={[styles.darkPhotoPillText, !isDark && { color: "#946B22" }]}>From Gallery</Text>
                  </Pressable>
                  {tempAvatar && (
                    <Pressable onPress={() => setTempAvatar(null)} style={[styles.darkPhotoPill, { backgroundColor: "rgba(255,59,48,0.12)", borderColor: "rgba(255,59,48,0.25)" }]}>
                      <Feather name="trash-2" size={13} color="#FF3B30" />
                      <Text style={[styles.darkPhotoPillText, { color: "#FF3B30" }]}>Remove</Text>
                    </Pressable>
                  )}
                </View>

                {/* Barber Emojis Grid Selector */}
                <Text style={[styles.darkEmojiSectionTitle, !isDark && { color: "#6C6C70" }]}>SELECT AVATAR EMOJI</Text>
                <View style={styles.darkEmojiGridContainer}>
                  {EMOJI_OPTIONS.map((item) => {
                    const emojiCode = `emoji:${item.emoji}`;
                    const isSelected = tempAvatar === emojiCode;
                    return (
                      <Pressable
                        key={item.emoji}
                        onPress={() => setTempAvatar(emojiCode)}
                        style={[styles.darkEmojiGridItem, !isDark && { backgroundColor: "#F8F8F8", borderColor: "#E5E5EA" }, isSelected && styles.darkEmojiGridItemActive]}
                      >
                        <Text style={styles.darkEmojiGridText}>{item.emoji}</Text>
                        {isSelected && (
                          <View style={styles.darkEmojiCheckBadge}>
                            <Feather name="check" size={9} color={colors.white} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Grouped Form Card */}
              <View style={[styles.darkFormGroupCard, !isDark && { backgroundColor: "#F8F8FA", borderColor: "#E5E5EA" }]}>
                {/* Full name Input Block */}
                <View style={styles.darkInputBlock}>
                  <Text style={[styles.darkFieldLabel, !isDark && { color: "#000000" }]}>Full name</Text>
                  <View style={[styles.darkInputRowBox, !isDark && { backgroundColor: "#FFFFFF", borderColor: "#E5E5EA" }]}>
                    <Feather name="user" size={16} color="#C89A43" style={{ marginRight: 10 }} />
                    <TextInput
                      value={tempName}
                      onChangeText={setTempName}
                      style={[styles.darkTextInputField, !isDark && { color: "#000000" }]}
                      placeholder="Enter full name"
                      placeholderTextColor={isDark ? "#66666E" : "#8E8E93"}
                    />
                  </View>
                </View>

                {/* Phone number Input Block */}
                <View style={styles.darkInputBlock}>
                  <Text style={[styles.darkFieldLabel, !isDark && { color: "#000000" }]}>Phone number</Text>
                  <View style={[styles.darkInputRowBox, !isDark && { backgroundColor: "#FFFFFF", borderColor: "#E5E5EA" }]}>
                    <Feather name="phone" size={16} color="#C89A43" style={{ marginRight: 10 }} />
                    <TextInput
                      value={tempPhone}
                      onChangeText={setTempPhone}
                      style={[styles.darkTextInputField, !isDark && { color: "#000000" }]}
                      placeholder="Enter phone number"
                      placeholderTextColor={isDark ? "#66666E" : "#8E8E93"}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Email Input Block */}
                <View style={styles.darkInputBlock}>
                  <Text style={[styles.darkFieldLabel, !isDark && { color: "#000000" }]}>Email address</Text>
                  <View style={[styles.darkInputRowBox, !isDark && { backgroundColor: "#FFFFFF", borderColor: "#E5E5EA" }]}>
                    <Feather name="mail" size={16} color="#C89A43" style={{ marginRight: 10 }} />
                    <TextInput
                      value={tempEmail}
                      onChangeText={setTempEmail}
                      style={[styles.darkTextInputField, !isDark && { color: "#000000" }]}
                      placeholder="Enter email address"
                      placeholderTextColor={isDark ? "#66666E" : "#8E8E93"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {isBarber && (
                  <>
                    {/* Shop Name Input Block */}
                    <View style={styles.darkInputBlock}>
                      <Text style={[styles.darkFieldLabel, !isDark && { color: "#000000" }]}>Shop name</Text>
                      <View style={[styles.darkInputRowBox, !isDark && { backgroundColor: "#FFFFFF", borderColor: "#E5E5EA" }]}>
                        <Feather name="home" size={16} color="#C89A43" style={{ marginRight: 10 }} />
                        <TextInput
                          value={tempShopName}
                          onChangeText={setTempShopName}
                          style={[styles.darkTextInputField, !isDark && { color: "#000000" }]}
                          placeholder="Enter shop name"
                          placeholderTextColor={isDark ? "#66666E" : "#8E8E93"}
                        />
                      </View>
                    </View>

                    {/* Role Input Block */}
                    <View style={styles.darkInputBlock}>
                      <Text style={[styles.darkFieldLabel, !isDark && { color: "#000000" }]}>Role / Specialty</Text>
                      <View style={[styles.darkInputRowBox, !isDark && { backgroundColor: "#FFFFFF", borderColor: "#E5E5EA" }]}>
                        <Feather name="briefcase" size={16} color="#C89A43" style={{ marginRight: 10 }} />
                        <TextInput
                          value={tempRole}
                          onChangeText={setTempRole}
                          style={[styles.darkTextInputField, !isDark && { color: "#000000" }]}
                          placeholder="e.g. Master Barber"
                          placeholderTextColor={isDark ? "#66666E" : "#8E8E93"}
                        />
                      </View>
                    </View>

                    {/* Working Hours Input Block */}
                    <View style={styles.darkInputBlock}>
                      <Text style={[styles.darkFieldLabel, !isDark && { color: "#000000" }]}>Working hours</Text>
                      <Pressable
                        onPress={() => setShowHoursDropdown(!showHoursDropdown)}
                        style={[styles.darkInputRowBox, !isDark && { backgroundColor: "#FFFFFF", borderColor: "#E5E5EA" }]}
                      >
                        <Feather name="clock" size={16} color="#C89A43" style={{ marginRight: 10 }} />
                        <Text style={[styles.darkDropdownValueText, !isDark && { color: "#000000" }]}>{tempWorkingHours || "Select working hours"}</Text>
                        <Feather name={showHoursDropdown ? "chevron-up" : "chevron-down"} size={16} color={isDark ? "#8E8E93" : "#555"} style={{ marginLeft: "auto" }} />
                      </Pressable>
                    </View>

                    {showHoursDropdown && (
                      <View style={[styles.darkDropdownList, !isDark && { backgroundColor: "#FFFFFF", borderColor: "#E5E5EA" }]}>
                        {["9:00 AM - 9:00 PM", "8:00 AM - 8:00 PM", "9:00 AM - 6:00 PM", "10:00 AM - 7:00 PM"].map((opt) => (
                          <Pressable
                            key={opt}
                            onPress={() => {
                              setTempWorkingHours(opt);
                              setShowHoursDropdown(false);
                            }}
                            style={styles.darkDropdownItem}
                          >
                            <Text style={[styles.darkDropdownOptionText, !isDark && { color: "#000000" }, tempWorkingHours === opt && { color: "#C89A43", fontFamily: fonts.bold }]}>
                              {opt}
                            </Text>
                            {tempWorkingHours === opt && <Feather name="check" size={14} color="#C89A43" />}
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </View>

              {/* Primary Save Changes Pill Button */}
              <Pressable
                onPress={handleSaveProfile}
                style={({ pressed }) => [styles.darkSavePrimaryBtn, !isDark && { backgroundColor: "#000000" }, pressed && styles.pressed]}
              >
                <Text style={[styles.darkSavePrimaryText, !isDark && { color: "#FFFFFF" }]}>Save Changes</Text>
              </Pressable>

              {/* Secondary Cancel Pill Button */}
              <Pressable
                onPress={() => setEditModalVisible(false)}
                style={({ pressed }) => [styles.darkCancelSecondaryBtn, !isDark && { backgroundColor: "#F2F2F7", borderColor: "#E5E5EA" }, pressed && styles.pressed]}
              >
                <Text style={[styles.darkCancelSecondaryText, !isDark && { color: "#6C6C70" }]}>Cancel</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={privacyModalVisible} transparent animationType="slide" onRequestClose={() => setPrivacyModalVisible(false)}>
        <View style={styles.privacyOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPrivacyModalVisible(false)} />
          <View style={styles.privacyContainer}>
            <View style={styles.privacyHeader}>
              <Text style={styles.privacyTitle}>Privacy Settings</Text>
              <Pressable onPress={() => setPrivacyModalVisible(false)} style={styles.privacyCloseBtn}>
                <Feather name="x" size={16} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.privacyForm}>
              {[
                {
                  id: "visibility",
                  title: "Profile Visibility",
                  desc: "Allow other users and shops to find your profile in searches.",
                  val: profileVisible,
                  setVal: setProfileVisible
                },
                {
                  id: "location",
                  title: "Location Services",
                  desc: "Use live location services to match you with nearby bookings.",
                  val: shareLocation,
                  setVal: setShareLocation
                },
                {
                  id: "analytics",
                  title: "Anonymized Analytics",
                  desc: "Share crash reports and generic usage stats to help build better services.",
                  val: shareAnalytics,
                  setVal: setShareAnalytics
                },
                {
                  id: "recommendations",
                  title: "Tailored Promotions",
                  desc: "Receive customized alerts and discount booking offers.",
                  val: tailoredAds,
                  setVal: setTailoredAds
                }
              ].map((opt) => (
                <View key={opt.id} style={styles.privacyRow}>
                  <View style={styles.privacyCopy}>
                    <Text style={styles.privacyOptTitle}>{opt.title}</Text>
                    <Text style={styles.privacyOptDesc}>{opt.desc}</Text>
                  </View>
                  <Switch
                    value={opt.val}
                    onValueChange={opt.setVal}
                    trackColor={{ false: "#DADCD7", true: "#E7CE9B" }}
                    thumbColor={opt.val ? colors.primaryDark : colors.muted}
                  />
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => setPrivacyModalVisible(false)}
              style={({ pressed }) => [styles.privacySaveBtn, pressed && styles.pressed]}
            >
              <Text style={styles.privacySaveText}>Save & Apply Settings</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  darkRoot: {
    backgroundColor: "#121214"
  },
  darkGroupHeader: {
    color: "#8E8E93"
  },
  darkCard: {
    backgroundColor: "#1C1C1E",
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  darkText: {
    color: "#FFFFFF"
  },
  darkSubText: {
    color: "#8E8E93"
  },
  themeToggleRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12
  },
  themeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(200, 154, 67, 0.15)",
    alignItems: "center",
    justifyContent: "center"
  },
  themeSubText: {
    fontSize: 11,
    fontFamily: fonts.medium,
    color: colors.secondaryText,
    marginTop: 1
  },
  heroHeaderContainer: {
    height: 280,
    borderRadius: 24,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  heroCoverBg: {
    width: "100%",
    height: "100%"
  },
  heroCoverOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between"
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  heroCircleAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  heroCenterContent: {
    alignItems: "center",
    paddingBottom: 10
  },
  heroAvatarWrapper: {
    position: "relative",
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: colors.white,
    padding: 2,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    marginBottom: 10
  },
  heroAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 40
  },
  heroAvatarEmojiBadge: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    backgroundColor: "#FDF7EC",
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatarEmojiChar: {
    fontSize: 38
  },
  heroCameraOverlayBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#946B22",
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  heroNameText: {
    color: colors.white,
    fontFamily: fonts.headingHeavy,
    fontSize: 24,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  },
  heroLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4
  },
  heroLocationText: {
    color: "#E2E5E0",
    fontFamily: fonts.medium,
    fontSize: 13,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  heroRoleGlassPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(200,154,67,0.4)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8
  },
  heroRoleGlassText: {
    color: "#F3E2C3",
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0.5
  },
  floatingStatsCard: {
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  statCol: {
    alignItems: "center",
    flex: 1
  },
  statColValue: {
    color: colors.text,
    fontFamily: fonts.headingHeavy,
    fontSize: 18
  },
  statColLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E5E5EA"
  },
  reportsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4
  },
  reportsSectionTitle: {
    color: "#000000",
    fontFamily: fonts.headingSemi,
    fontSize: 18,
    letterSpacing: -0.4
  },
  reportsEditAction: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 13
  },
  reportsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16
  },
  reportCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    minHeight: 110,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  reportIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  reportValue: {
    color: colors.white,
    fontFamily: fonts.headingHeavy,
    fontSize: 20,
    marginTop: 8
  },
  reportLabel: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: fonts.medium,
    fontSize: 11
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FDF7EC",
    borderWidth: 1,
    borderColor: "#F3E2C3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6
  },
  premiumBadgeText: {
    color: "#946B22",
    fontFamily: fonts.semibold,
    fontSize: 11
  },
  editProfileColumn: {
    alignItems: "center",
    justifyContent: "center"
  },
  editCircleBtn: {
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
  editProfileText: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 6
  },
  notificationBtn: {
    position: "relative",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center"
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryDark
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECECE6",
    minHeight: 100,
    position: "relative"
  },
  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FDF7EC",
    alignItems: "center",
    justifyContent: "center"
  },
  statValue: {
    color: "#946B22",
    fontFamily: fonts.heading,
    fontSize: 20,
    marginLeft: 8
  },
  statLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16
  },
  statArrowCircle: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E3E4DE",
    alignItems: "center",
    justifyContent: "center"
  },
  iosGroupHeader: {
    color: "#3C3C43",
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.6,
    marginTop: 14,
    marginBottom: 6,
    marginLeft: 12,
    textTransform: "uppercase"
  },
  detailsCard: {
    padding: 0,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)"
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 16
  },
  viewAllText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 12
  },
  detailRow: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA"
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FDF7EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  detailLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15
  },
  detailValue: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 14,
    textAlign: "right"
  },
  menuCard: {
    padding: 0,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.white,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
    marginBottom: 16
  },
  menuRow: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA"
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FDF7EC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 15
  },
  lastRow: {
    borderBottomWidth: 0
  },
  pressed: {
    opacity: 0.72,
    backgroundColor: "rgba(118, 118, 128, 0.08)"
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(15,17,21,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  editPopUpCard: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "86%",
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)"
  },
  popUpHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)"
  },
  popUpHeaderTitleBox: {
    flexDirection: "row",
    alignItems: "center"
  },
  popUpTitleText: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  modalCloseCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center"
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
  editDropdownInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  editDropdownText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  dropdownOptionsContainer: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 8,
    marginTop: -8,
    gap: 4
  },
  dropdownOptionItem: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8
  },
  dropdownOptionText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  editCompanyDescriptionInput: {
    width: "100%",
    minHeight: 90,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    padding: 16,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlignVertical: "top"
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
  avatarPickerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 4
  },
  avatarPickerItem: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative"
  },
  avatarPickerItemActive: {
    borderColor: "#C89A43"
  },
  avatarPickerImg: {
    width: "100%",
    height: "100%",
    borderRadius: 28
  },
  avatarCheckBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#946B22",
    alignItems: "center",
    justifyContent: "center"
  },
  darkModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "flex-end"
  },
  darkModalCard: {
    width: "100%",
    height: "92%",
    backgroundColor: "#121214",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24
  },
  darkModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.08)"
  },
  darkModalBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center"
  },
  darkModalTitleText: {
    color: colors.white,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  darkModalScrollContent: {
    paddingVertical: 20,
    paddingBottom: 40
  },
  darkAvatarSection: {
    alignItems: "center",
    marginBottom: 20
  },
  darkAvatarWrapper: {
    position: "relative",
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#C89A43",
    padding: 2,
    backgroundColor: "#1C1C1E",
    marginBottom: 12
  },
  darkAvatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: 44
  },
  darkAvatarEmojiBadge: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center"
  },
  darkAvatarEmojiChar: {
    fontSize: 42
  },
  darkCameraIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#C89A43",
    borderWidth: 2,
    borderColor: "#121214",
    alignItems: "center",
    justifyContent: "center"
  },
  darkPhotoActionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12
  },
  darkPhotoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1C1C1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  darkPhotoPillText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12
  },
  darkEmojiSectionTitle: {
    color: "#C89A43",
    fontFamily: fonts.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 10,
    textAlign: "center"
  },
  darkEmojiGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 6
  },
  darkEmojiGridItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1C1C1E",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  darkEmojiGridItemActive: {
    borderColor: "#C89A43",
    backgroundColor: "rgba(200,154,67,0.2)"
  },
  darkEmojiGridText: {
    fontSize: 26
  },
  darkEmojiCheckBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#C89A43",
    borderWidth: 1.5,
    borderColor: "#121214",
    alignItems: "center",
    justifyContent: "center"
  },
  darkFormGroupCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 14
  },
  darkInputBlock: {
    gap: 6
  },
  darkFieldLabel: {
    color: "#8E8E93",
    fontFamily: fonts.medium,
    fontSize: 12,
    marginLeft: 2
  },
  darkInputRowBox: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 14,
    backgroundColor: "#252528",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)"
  },
  darkTextInputField: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  darkDropdownValueText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  darkDropdownList: {
    backgroundColor: "#252528",
    borderRadius: 14,
    padding: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 4
  },
  darkDropdownItem: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderRadius: 8
  },
  darkDropdownOptionText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  darkSavePrimaryBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C89A43",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#C89A43",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  darkSavePrimaryText: {
    color: "#FFFFFF",
    fontFamily: fonts.heading,
    fontSize: 16
  },
  darkCancelSecondaryBtn: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  darkCancelSecondaryText: {
    color: "#8E8E93",
    fontFamily: fonts.semibold,
    fontSize: 15
  },
  galleryPickerBtn: {
    backgroundColor: "#FDF7EC",
    borderWidth: 1,
    borderColor: "#F3E2C3",
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed"
  },
  photoSourceRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10
  },
  photoSourceBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FDF7EC",
    borderWidth: 1,
    borderColor: "#F3E2C3",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  photoSourceIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  photoSourceText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 13
  },
  editSubLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
    marginTop: 10,
    marginBottom: 6
  },
  emojiPickerRow: {
    gap: 10,
    paddingVertical: 4
  },
  emojiPickerItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F8F8F8",
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  emojiPickerItemActive: {
    borderColor: "#C89A43",
    backgroundColor: "#FDF7EC"
  },
  emojiText: {
    fontSize: 26
  },
  avatarEmojiBadge: {
    width: "100%",
    height: "100%",
    borderRadius: 34,
    backgroundColor: "#FDF7EC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#F3E2C3"
  },
  avatarEmojiChar: {
    fontSize: 32
  },
  privacyOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,17,21,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  privacyContainer: {
    width: "95%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: "#C89A43",
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10
  },
  privacyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },
  privacyTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20
  },
  privacyCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FDF7EC",
    borderWidth: 1,
    borderColor: "#F3E2C3",
    alignItems: "center",
    justifyContent: "center"
  },
  privacyForm: {
    gap: 16,
    marginBottom: 24
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14
  },
  privacyCopy: {
    flex: 1,
    minWidth: 0
  },
  privacyOptTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13
  },
  privacyOptDesc: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4
  },
  privacySaveBtn: {
    minHeight: 46,
    borderRadius: radius.full,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center"
  },
  privacySaveText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 12
  }
});
