import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentProps, ComponentType } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppHeader, BarberBottomNav, BottomNav, Card, Screen } from "../../components/ui";
import { temporaryProfiles, type Workspace } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

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
  { label: "Logout", icon: "log-out", route: "Login" }
];

const barberMenu: ProfileMenuItem[] = [
  { label: "Booking Requests", icon: "calendar", route: "BarberBookings" },
  { label: "Business Hub", icon: "briefcase", route: "BusinessHub" },
  { label: "Shop Dashboard", icon: "grid", route: "BarberDashboard" },
  { label: "Notifications", icon: "bell", route: "Notifications" },
  { label: "Help & Support", icon: "help-circle", route: "Profile" },
  { label: "Logout", icon: "log-out", route: "Login" }
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
  const menu = isBarber ? barberMenu : customerMenu;
  const profileBookings = isBarber ? bookings : bookings.filter((booking) => !booking.customer || booking.customer === profile.name);
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
        { label: "Shop", value: profile.details[0]?.value || "Shop profile" },
        { label: "Today queue", value: `${confirmedBookings.length + (profile.queueOffset || 0)} clients` },
        { label: "Repeat clients", value: `${profile.repeatClients || 0}%` }
      ]
    : [
        { label: "Favorite barber", value: selectedBarber.name },
        { label: "Cadence", value: profile.cadence || "Not set" },
        { label: "Saved styles", value: `${profile.savedStyles || 0} photos` }
      ];
  const details = isBarber
    ? [...profile.details, { label: "Phone", value: profile.phone }]
    : [
        { label: "Phone", value: profile.phone },
        ...profile.details,
        { label: "Preference", value: selectedPreference.label },
        { label: "Payment", value: selectedPaymentMethod.detail },
        { label: "Saved shops", value: `${favoriteShopIds.length} shops` }
      ];

  function openMenuItem(item: ProfileMenuItem) {
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
          right={<Feather name="settings" size={20} color={colors.text} />}
        />

        <Card style={styles.identityCard}>
          <View style={styles.identityTop}>
            <Image source={profile.avatar} style={styles.avatar} />
            <View style={styles.identityCopy}>
              <View style={styles.badgeRow}>
                <Text style={styles.roleLabel}>{profile.roleLabel}</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{profile.badge}</Text></View>
              </View>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.email}>{profile.email}</Text>
            </View>
          </View>
          <Text style={styles.headline}>{profile.headline}</Text>
        </Card>

        <View style={styles.statsGrid}>
          {stats.map((item) => (
            <Card key={item.label} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </Card>
          ))}
        </View>

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
    gap: 14
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
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
    fontSize: 13,
    marginTop: 4
  },
  headline: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18
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
    fontSize: 10,
    lineHeight: 14,
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
    fontSize: 10,
    lineHeight: 15,
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
    fontSize: 11
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
  }
});
