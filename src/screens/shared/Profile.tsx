import { Image, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
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
  const stats = buildStats(workspace, {
    activeBookings: activeBookings.length,
    pendingRequests: pendingRequests.length,
    queue: confirmedBookings.length + (profile.queueOffset || 0),
    payout,
    rewardPoints: profile.rewardPoints || 0,
    savedShops: favoriteShopIds.length
  });
  const focusMetrics = isBarber
    ? [
        { label: "Shop", value: shopName },
        { label: "Today queue", value: `${confirmedBookings.length + (profile.queueOffset || 0)} clients` },
        { label: "Repeat clients", value: `${profile.repeatClients || 0}%` }
      ]
    : [
        { label: "Favorite barber", value: selectedBarber.name },
        { label: "Cadence", value: profile.cadence || "Not set" },
        { label: "Saved styles", value: `${profile.savedStyles || 0} photos` }
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

  function openMenuItem(item: ProfileMenuItem) {
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

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <AppHeader
          title="Profile"
          onBack={() => goBackOrNavigate(navigation, homeRoute)}
        />

        <Card style={styles.identityCard}>
          <View style={styles.identityTop}>
            <Image source={profileAvatar} style={styles.avatar} />
            <View style={styles.identityCopy}>
              <View style={styles.badgeRow}>
                <Text style={styles.roleLabel}>{profile.roleLabel}</Text>
                {profile.badge && profile.badge.toUpperCase() !== "PRO" ? (
                  <View style={styles.badge}><Text style={styles.badgeText}>{profile.badge}</Text></View>
                ) : null}
              </View>
              <Text style={styles.name}>{profileName}</Text>
              <Text style={styles.email}>{profileEmail}</Text>
            </View>
            <Pressable
              onPress={() => {
                setTempName(profileName);
                setTempEmail(profileEmail);
                setTempShopName(shopName);
                setTempRole(role);
                setTempWorkingHours(workingHours);
                setTempPhone(phone);
                setTempHeadline(profileHeadline);
                setTempAvatar(profileAvatar);
                setEditModalVisible(true);
              }}
              style={({ pressed }) => [styles.editProfileBtn, pressed && styles.pressed]}
            >
              <Feather name="edit-2" size={16} color={colors.primaryDark} />
            </Pressable>
          </View>
          <Text style={styles.headline}>{profileHeadline}</Text>
        </Card>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <Card key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

        {!isBarber ? (
          <Card style={[styles.focusCard, isBarber && styles.barberFocusCard]}>
            <View style={styles.focusHeader}>
              <View>
                <Text style={styles.focusTitle}>{isBarber ? "Barber Profile" : "Grooming Profile"}</Text>
                <Text style={styles.focusCopy}>{profile.note}</Text>
              </View>
              <Text style={styles.focusStatus}>{isBarber ? "Accepting bookings" : selectedPreference.label}</Text>
            </View>
            <View style={styles.metricGrid}>
              {focusMetrics.map((item) => (
                <ProfileMetric key={item.label} label={item.label} value={item.value} />
              ))}
            </View>
          </Card>
        ) : null}

        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>{isBarber ? "Business Details" : "Customer Details"}</Text>
          {details.map((item, index) => (
            <View key={`${item.label}-${item.value}`} style={[styles.detailRow, index === details.length - 1 && styles.lastRow]}>
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
              <MenuIcon name={item.icon} size={18} color={colors.text} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
            </Pressable>
          ))}
        </Card>
      </Screen>
      {isBarber ? <BarberBottomNav active="Profile" navigation={navigation} /> : <BottomNav active="Profile" navigation={navigation} />}

      <Modal visible={editModalVisible} transparent animationType="fade" onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setEditModalVisible(false)} />
          <View style={styles.editContainer}>
            <Text style={styles.editTitle}>Edit Profile</Text>

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
                    <Image source={{ uri: tempAvatar }} style={styles.avatarPickerImg} />
                  ) : (
                    <Feather name="plus" size={18} color={colors.primaryDark} />
                  )}
                </Pressable>
              </View>

              <Text style={styles.editInputLabel}>Full Name</Text>
              <TextInput
                value={tempName}
                onChangeText={setTempName}
                style={styles.editTextInput}
                placeholder="Enter full name"
                placeholderTextColor={colors.muted}
              />

              <Text style={styles.editInputLabel}>Email</Text>
              <TextInput
                value={tempEmail}
                onChangeText={setTempEmail}
                style={styles.editTextInput}
                placeholder="Enter email"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.editInputLabel}>Phone Number</Text>
              <TextInput
                value={tempPhone}
                onChangeText={setTempPhone}
                style={styles.editTextInput}
                placeholder="Enter phone number"
                placeholderTextColor={colors.muted}
                keyboardType="phone-pad"
              />

              {isBarber ? (
                <>
                  <Text style={styles.editInputLabel}>Company / Shop Name</Text>
                  <TextInput
                    value={tempShopName}
                    onChangeText={setTempShopName}
                    style={styles.editTextInput}
                    placeholder="Enter company name"
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={styles.editInputLabel}>Role</Text>
                  <TextInput
                    value={tempRole}
                    onChangeText={setTempRole}
                    style={styles.editTextInput}
                    placeholder="e.g. Owner barber"
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={styles.editInputLabel}>Working Hours</Text>
                  <TextInput
                    value={tempWorkingHours}
                    onChangeText={setTempWorkingHours}
                    style={styles.editTextInput}
                    placeholder="e.g. 9:00 AM - 9:00 PM"
                    placeholderTextColor={colors.muted}
                  />

                  <Text style={styles.editInputLabel}>Company Description</Text>
                  <TextInput
                    value={tempHeadline}
                    onChangeText={setTempHeadline}
                    style={[styles.editTextInput, { minHeight: 68, textAlignVertical: "top" }]}
                    placeholder="Enter company details"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.editInputLabel}>Grooming Preferences / Bio</Text>
                  <TextInput
                    value={tempHeadline}
                    onChangeText={setTempHeadline}
                    style={[styles.editTextInput, { minHeight: 68, textAlignVertical: "top" }]}
                    placeholder="Describe your styling preferences"
                    placeholderTextColor={colors.muted}
                    multiline
                    numberOfLines={3}
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
          </View>
        </View>
      </Modal>

      <Modal visible={privacyModalVisible} transparent animationType="slide" onRequestClose={() => setPrivacyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPrivacyModalVisible(false)} />
          <View style={styles.privacyContainer}>
            <View style={styles.privacyHeader}>
              <Text style={styles.privacyTitle}>Privacy Settings</Text>
              <Pressable onPress={() => setPrivacyModalVisible(false)} style={styles.privacyCloseBtn}>
                <Feather name="x" size={20} color={colors.text} />
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

function buildStats(
  workspace: Workspace,
  values: { activeBookings: number; pendingRequests: number; queue: number; payout: number; rewardPoints: number; savedShops: number }
) {
  if (workspace === "Barber") {
    return [
      { label: "Pending Requests", value: String(values.pendingRequests) },
      { label: "Today Queue", value: String(values.queue) },
      { label: "Payout", value: `$${values.payout}` }
    ];
  }
  return [
    { label: "Active Bookings", value: String(values.activeBookings) },
    { label: "Reward Points", value: String(values.rewardPoints) },
    { label: "Saved Shops", value: String(values.savedShops) }
  ];
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileMetric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  identityCard: {
    gap: 14,
    marginTop: 6,
    marginBottom: 14
  },
  identityTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14
  },
  editProfileBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.primary
  },
  identityCopy: {
    flex: 1,
    minWidth: 0
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6
  },
  roleLabel: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 10,
    textTransform: "uppercase"
  },
  badge: {
    borderRadius: radius.full,
    backgroundColor: colors.black,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  badgeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 8,
    textTransform: "uppercase"
  },
  name: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 20
  },
  email: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    marginTop: 4
  },
  headline: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  statCard: {
    flex: 1,
    minHeight: 84,
    justifyContent: "center"
  },
  statValue: {
    color: colors.primaryDark,
    fontFamily: fonts.heading,
    fontSize: 23
  },
  statLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4
  },
  focusCard: {
    gap: 14,
    marginBottom: 14,
    borderColor: "rgba(212,168,90,0.26)",
    backgroundColor: "rgba(212,168,90,0.08)"
  },
  barberFocusCard: {
    borderColor: "rgba(17,17,17,0.14)",
    backgroundColor: "#FFFFFF"
  },
  focusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  focusTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 15
  },
  focusCopy: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4
  },
  focusStatus: {
    color: colors.primaryDark,
    fontFamily: fonts.semibold,
    fontSize: 10,
    textAlign: "right"
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  profileMetric: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 96,
    minHeight: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    paddingHorizontal: 10
  },
  metricLabel: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 10
  },
  metricValue: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
    marginTop: 4
  },
  detailsCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: 14
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4
  },
  detailRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  detailLabel: {
    width: 118,
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 16
  },
  detailValue: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12,
    textAlign: "right"
  },
  menuCard: {
    padding: 0,
    borderRadius: radius.md,
    overflow: "hidden"
  },
  menuRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  lastRow: {
    borderBottomWidth: 0
  },
  menuLabel: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  pressed: {
    opacity: 0.75,
    backgroundColor: colors.elevated
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,17,21,0.76)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  editContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 24
  },
  editTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center"
  },
  editForm: {
    gap: 12,
    marginBottom: 24
  },
  editInputLabel: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12
  },
  editTextInput: {
    minHeight: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 12,
    paddingHorizontal: 12
  },
  editActionRow: {
    flexDirection: "row",
    gap: 12
  },
  editCancelBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white
  },
  editCancelText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12
  },
  editSaveBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center"
  },
  editSaveText: {
    color: colors.white,
    fontFamily: fonts.semibold,
    fontSize: 12
  },
  avatarPickerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10
  },
  avatarPickerItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    padding: 2
  },
  avatarPickerItemActive: {
    borderColor: colors.primary
  },
  avatarPickerImg: {
    width: "100%",
    height: "100%",
    borderRadius: 22
  },
  galleryPickerBtn: {
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed"
  },
  privacyContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 24
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
