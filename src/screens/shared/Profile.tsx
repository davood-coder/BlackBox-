import { Image, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View, ScrollView } from "react-native";
import { useState } from "react";
import type { ComponentProps, ComponentType } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppHeader, BarberBottomNav, BottomNav, Card, Screen } from "../../components/ui";
import { temporaryProfiles, type Workspace } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";
import { images } from "../../assets/images";
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

export default function Profile({ navigation }: any) {
  const {
    bookings,
    favoriteShopIds,
    selectedBarber,
    selectedPaymentMethod,
    selectedPreference,
    workspace
  } = useBooking();
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

  const menu = isBarber ? barberMenu : customerMenu;
  const profileBookings = isBarber ? bookings : bookings.filter((booking) => !booking.customer || booking.customer === profileName);
  const activeBookings = profileBookings.filter((booking) => booking.status === "Confirmed" || booking.status === "Pending");
  const pendingRequests = profileBookings.filter((booking) => booking.status === "Pending");
  const confirmedBookings = profileBookings.filter((booking) => booking.status === "Confirmed");
  const completedBookings = profileBookings.filter((booking) => booking.status === "Completed");
  const payout = (profile.basePayout || 0) + completedBookings.reduce((total, booking) => total + (booking.total || 0), 0);
  const homeRoute = isBarber ? "BarberDashboard" : "Home";

  const statsWithIcons = isBarber
    ? [
        {
          label: "Pending\nRequests",
          value: String(pendingRequests.length),
          icon: "clipboard" as const,
          route: "BarberBookings"
        },
        {
          label: "Today\nQueue",
          value: String(confirmedBookings.length + (profile.queueOffset || 0)),
          icon: "clock" as const,
          route: "BarberDashboard"
        },
        {
          label: "Payout",
          value: `$${payout}`,
          icon: "wallet" as const,
          route: "BusinessHub"
        }
      ]
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
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <AppHeader
          title="Profile"
          onBack={() => goBackOrNavigate(navigation, homeRoute)}
          backVariant="circle"
          right={
            <Pressable
              onPress={() => navigation.navigate("Notifications")}
              style={styles.notificationBtn}
            >
              <Feather name="bell" size={24} color={colors.text} />
              <View style={styles.notificationBadge} />
            </Pressable>
          }
        />

        <Card style={styles.identityCard}>
          <View style={styles.cardPatternDark} />
          <View style={styles.cardPatternGold} />
          
          <View style={styles.identityTop}>
            <View style={styles.avatarWrapper}>
              <Image source={profileAvatar} style={styles.avatar} />
            </View>
            <View style={styles.identityCopy}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{profile.roleLabel.toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>{profileName}</Text>
              <Text style={styles.email}>{profileEmail}</Text>
              {profile.badge ? (
                <View style={styles.premiumBadge}>
                  <Ionicons name="shield-checkmark" size={14} color="#946B22" style={{ marginRight: 4 }} />
                  <Text style={styles.premiumBadgeText}>{profile.badge}</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.editProfileColumn}>
              <Pressable
                onPress={openEditModal}
                style={({ pressed }) => [styles.editCircleBtn, pressed && styles.pressed]}
              >
                <Feather name="edit-2" size={18} color="#946B22" />
              </Pressable>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </View>
          </View>
        </Card>

        <View style={styles.statsRow}>
          {statsWithIcons.map((item) => (
            <Pressable
              key={item.label.replace("\n", " ")}
              onPress={() => navigation.navigate(item.route)}
              style={styles.statCard}
            >
              <View style={styles.statTopRow}>
                <View style={styles.statIconContainer}>
                  <Feather name={item.icon} size={16} color="#946B22" />
                </View>
                <Text style={styles.statValue}>{item.value}</Text>
              </View>
              <Text style={styles.statLabel}>{item.label}</Text>
              
              <View style={styles.statArrowCircle}>
                <Feather name="arrow-right" size={10} color="#946B22" />
              </View>
            </Pressable>
          ))}
        </View>

        <Card style={styles.detailsCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{isBarber ? "Business Details" : "Customer Details"}</Text>
            <Pressable onPress={() => {}} style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color="#946B22" />
            </Pressable>
          </View>
          {details.map((item, index) => (
            <View key={`${item.label}-${item.value}`} style={[styles.detailRow, index === details.length - 1 && styles.lastRow]}>
              <View style={styles.detailIconContainer}>
                <Feather name={getDetailIcon(item.label)} size={16} color="#946B22" />
              </View>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue} numberOfLines={1}>{item.value}</Text>
            </View>
          ))}
        </Card>

        <Card style={styles.menuCard}>
          {menu.map((item, index) => (
            <Pressable
              key={item.label}
              onPress={() => openMenuItem(item)}
              style={({ pressed }) => [styles.menuRow, index === menu.length - 1 && styles.lastRow, pressed && styles.pressed]}
            >
              <View style={styles.menuIconContainer}>
                <Feather name={item.icon} size={16} color="#946B22" />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
            </Pressable>
          ))}
        </Card>
      </Screen>
      {isBarber ? <BarberBottomNav active="Profile" navigation={navigation} /> : <BottomNav active="Profile" navigation={navigation} />}

      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlayCenter}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditModalVisible(false)} />
          <View style={styles.editPopUpCard}>
            <View style={styles.popUpHeaderRow}>
              <View style={styles.popUpHeaderTitleBox}>
                <Feather name="edit-3" size={18} color="#946B22" style={{ marginRight: 8 }} />
                <Text style={styles.popUpTitleText}>Edit Profile</Text>
              </View>
              <Pressable onPress={() => setEditModalVisible(false)} style={styles.modalCloseCircleBtn}>
                <Feather name="x" size={16} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 1 }} contentContainerStyle={styles.editScrollContent}>
              <View style={styles.editForm}>
                <Text style={styles.editInputLabel}>Profile Picture</Text>
                <View style={styles.avatarPickerRow}>
                  {AVATAR_OPTIONS.map((img, idx) => {
                    const isSelected = tempAvatar === img;
                    return (
                      <Pressable
                        key={idx}
                        onPress={() => setTempAvatar(img)}
                        style={[styles.avatarPickerItem, isSelected && styles.avatarPickerItemActive]}
                      >
                        <Image source={img} style={styles.avatarPickerImg} />
                        {isSelected && (
                          <View style={styles.avatarCheckBadge}>
                            <Feather name="check" size={10} color={colors.white} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}

                  <Pressable
                    onPress={handlePickImage}
                    style={[
                      styles.avatarPickerItem,
                      styles.galleryPickerBtn,
                      typeof tempAvatar === "string" && styles.avatarPickerItemActive
                    ]}
                  >
                    {typeof tempAvatar === "string" ? (
                      <>
                        <Image source={{ uri: tempAvatar }} style={styles.avatarPickerImg} />
                        <View style={styles.avatarCheckBadge}>
                          <Feather name="check" size={10} color={colors.white} />
                        </View>
                      </>
                    ) : (
                      <Feather name="plus" size={18} color="#946B22" />
                    )}
                  </Pressable>
                </View>

                <Text style={styles.editInputLabel}>Full Name</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={styles.inputIconBox}>
                    <Feather name="user" size={18} color="#555" />
                  </View>
                  <TextInput
                    value={tempName}
                    onChangeText={setTempName}
                    style={styles.editTextInputWithIcon}
                    placeholder="Enter full name"
                    placeholderTextColor={colors.muted}
                  />
                </View>

                <Text style={styles.editInputLabel}>Email</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={styles.inputIconBox}>
                    <Feather name="mail" size={18} color="#555" />
                  </View>
                  <TextInput
                    value={tempEmail}
                    onChangeText={setTempEmail}
                    style={styles.editTextInputWithIcon}
                    placeholder="Enter email"
                    placeholderTextColor={colors.muted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <Text style={styles.editInputLabel}>Phone Number</Text>
                <View style={styles.inputWithIconRow}>
                  <View style={styles.inputIconBox}>
                    <Feather name="phone" size={18} color="#555" />
                  </View>
                  <TextInput
                    value={tempPhone}
                    onChangeText={setTempPhone}
                    style={styles.editTextInputWithIcon}
                    placeholder="Enter phone number"
                    placeholderTextColor={colors.muted}
                    keyboardType="phone-pad"
                  />
                </View>

                {isBarber ? (
                  <>
                    <Text style={styles.editInputLabel}>Company / Shop Name</Text>
                    <View style={styles.inputWithIconRow}>
                      <View style={styles.inputIconBox}>
                        <Feather name="home" size={18} color="#555" />
                      </View>
                      <TextInput
                        value={tempShopName}
                        onChangeText={setTempShopName}
                        style={styles.editTextInputWithIcon}
                        placeholder="Enter company name"
                        placeholderTextColor={colors.muted}
                      />
                    </View>

                    <Text style={styles.editInputLabel}>Role</Text>
                    <View style={styles.inputWithIconRow}>
                      <View style={styles.inputIconBox}>
                        <Feather name="briefcase" size={18} color="#555" />
                      </View>
                      <TextInput
                        value={tempRole}
                        onChangeText={setTempRole}
                        style={styles.editTextInputWithIcon}
                        placeholder="e.g. Owner barber"
                        placeholderTextColor={colors.muted}
                      />
                    </View>

                    <Text style={styles.editInputLabel}>Working Hours</Text>
                    <View style={styles.inputWithIconRow}>
                      <View style={styles.inputIconBox}>
                        <Feather name="clock" size={18} color="#555" />
                      </View>
                      <Pressable
                        onPress={() => setShowHoursDropdown(!showHoursDropdown)}
                        style={styles.editDropdownInput}
                      >
                        <Text style={[styles.editDropdownText, !tempWorkingHours && { color: colors.muted }]}>
                          {tempWorkingHours || "Select working hours"}
                        </Text>
                        <Feather name="chevron-down" size={18} color="#555" />
                      </Pressable>
                    </View>

                    {showHoursDropdown && (
                      <View style={styles.dropdownOptionsContainer}>
                        {["9:00 AM - 9:00 PM", "8:00 AM - 8:00 PM", "9:00 AM - 6:00 PM", "10:00 AM - 7:00 PM"].map((opt) => (
                          <Pressable
                            key={opt}
                            onPress={() => {
                              setTempWorkingHours(opt);
                              setShowHoursDropdown(false);
                            }}
                            style={styles.dropdownOptionItem}
                          >
                            <Text style={[styles.dropdownOptionText, tempWorkingHours === opt && { color: "#946B22", fontFamily: fonts.bold }]}>
                              {opt}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    <Text style={styles.editInputLabel}>Company Description</Text>
                    <TextInput
                      value={tempHeadline}
                      onChangeText={setTempHeadline}
                      style={styles.editCompanyDescriptionInput}
                      placeholder="Enter company details"
                      placeholderTextColor={colors.muted}
                      multiline
                      numberOfLines={4}
                    />
                  </>
                ) : (
                  <>
                    <Text style={styles.editInputLabel}>Grooming Preferences / Bio</Text>
                    <TextInput
                      value={tempHeadline}
                      onChangeText={setTempHeadline}
                      style={styles.editCompanyDescriptionInput}
                      placeholder="Describe your styling preferences"
                      placeholderTextColor={colors.muted}
                      multiline
                      numberOfLines={4}
                    />
                  </>
                )}
              </View>

              <View style={styles.editActionRow}>
                <Pressable
                  onPress={() => setEditModalVisible(false)}
                  style={({ pressed }) => [styles.editCancelBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.editCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
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
                  }}
                  style={({ pressed }) => [styles.editSaveBtn, pressed && styles.pressed]}
                >
                  <Text style={styles.editSaveText}>Save Changes</Text>
                </Pressable>
              </View>
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
  identityCard: {
    marginTop: 6,
    marginBottom: 14,
    borderRadius: 24,
    overflow: "hidden",
    padding: 20,
    backgroundColor: colors.white,
    position: "relative"
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
  identityTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    zIndex: 2
  },
  avatarWrapper: {
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: "#C89A43",
    padding: 3,
    backgroundColor: colors.white
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34
  },
  identityCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 4
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FDF7EC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4
  },
  roleBadgeText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.5
  },
  name: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22
  },
  email: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    marginTop: 2
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
  detailsCard: {
    padding: 0,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: colors.white
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
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  detailIconContainer: {
    width: 34,
    height: 34,
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
    fontSize: 14
  },
  detailValue: {
    color: colors.secondaryText,
    fontFamily: fonts.semibold,
    fontSize: 13,
    textAlign: "right"
  },
  menuCard: {
    padding: 0,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: colors.white
  },
  menuRow: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  menuIconContainer: {
    width: 34,
    height: 34,
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
    fontSize: 14
  },
  lastRow: {
    borderBottomWidth: 0
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: colors.elevated
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
  galleryPickerBtn: {
    backgroundColor: "#FDF7EC",
    borderWidth: 1,
    borderColor: "#F3E2C3",
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed"
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
