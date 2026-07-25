import { Image, ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BottomNav, FadeInView, GhostButton, PrimaryButton } from "../components/ui";
import { images } from "../assets/images";
import { barberHomeStats, homeQuickActions } from "../data";
import { colors, fonts, spacing } from "../theme";

export default function Home({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const isShort = height < 720;
  const isNarrow = width < 360;
  const titleSize = Math.min(46, Math.max(34, width * 0.118));
  const horizontalPadding = isNarrow ? 16 : spacing.screen;

  return (
    <View style={styles.root}>
      <ImageBackground source={images.luxuryBarbershop} resizeMode="cover" style={styles.background}>
        <LinearGradient
          colors={["rgba(15,17,21,0.2)", "rgba(15,17,21,0.64)", colors.background]}
          style={[
            styles.overlay,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: isShort ? 34 : 50,
              paddingBottom: isShort ? 96 : 112
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.logo, { fontSize: isNarrow ? 20 : 24 }]}>BLACK BOX</Text>
            <Pressable onPress={() => navigation.navigate("Profile")} style={styles.menuButton}>
              <Feather name="menu" size={25} color={colors.text} />
            </Pressable>
          </View>

          <FadeInView delay={120} style={[styles.hero, { gap: isShort ? 10 : 14, marginBottom: isShort ? 2 : 14 }]}>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 6 }]}>
              Elevate{"\n"}Your Look.
            </Text>
            <Text style={[styles.copy, { fontSize: isNarrow ? 15 : 17, lineHeight: isNarrow ? 22 : 25 }]}>Premium grooming for the modern gentleman.</Text>
            <View style={styles.statsRow}>
              {barberHomeStats.map((item) => (
                <View key={item.label} style={styles.statCard}>
                  <Text style={[styles.statValue, item.tone === "success" && styles.successText, item.tone === "info" && styles.infoText]}>{item.value}</Text>
                  <Text style={styles.statLabel} numberOfLines={1}>{item.label}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.actions, { gap: isShort ? 10 : 12, marginTop: isShort ? 4 : 10 }]}>
              <PrimaryButton label="Book Appointment" icon={null} onPress={() => navigation.navigate("SelectLocation", { nextScreen: "BookAppointment" })} />
              <GhostButton label="Explore Barbers" onPress={() => navigation.navigate("SelectLocation", { nextScreen: "Barbers" })} />
            </View>
            <View style={styles.quickGrid}>
              {homeQuickActions.map((action) => (
                <Pressable
                  key={action.label}
                  onPress={() => navigation.navigate(action.route, "params" in action ? action.params : undefined)}
                  style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
                >
                  <Feather name={action.icon as any} size={17} color={colors.primary} />
                  <Text style={styles.quickLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={[styles.socialProof, { marginTop: isShort ? 12 : 22 }]}>
              <View style={styles.avatarStack}>
                {[0, 1, 2].map((item) => (
                  <Image key={item} source={item === 1 ? images.luxuryBarbershop : images.masterBarber} style={[styles.avatar, { marginLeft: item ? -12 : 0 }]} />
                ))}
              </View>
              <View>
                <View style={styles.ratingLine}>
                  <Text style={styles.rating}>4.9</Text>
                  <Ionicons name="star-outline" color={colors.primaryLight} size={22} />
                </View>
                <Text style={styles.caption}>Trusted by 1k+ clients</Text>
              </View>
            </View>
          </FadeInView>
        </LinearGradient>
      </ImageBackground>
      <BottomNav active="Home" navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  background: {
    flex: 1
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  logo: {
    color: colors.text,
    fontFamily: fonts.heading,
    letterSpacing: 1.6
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)"
  },
  hero: {
    width: "100%"
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.headingHeavy,
    maxWidth: 310
  },
  copy: {
    color: colors.creamMuted,
    fontFamily: fonts.body,
    maxWidth: 280
  },
  actions: {
    width: "100%"
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2
  },
  statCard: {
    flex: 1,
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(17,21,28,0.58)",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  statValue: {
    color: colors.warning,
    fontFamily: fonts.heading,
    fontSize: 18
  },
  successText: {
    color: colors.success
  },
  infoText: {
    color: colors.info
  },
  statLabel: {
    color: colors.creamMuted,
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 3
  },
  quickGrid: {
    flexDirection: "row",
    gap: 8
  },
  quickAction: {
    flex: 1,
    minHeight: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  quickLabel: {
    color: colors.cream,
    fontFamily: fonts.medium,
    fontSize: 11
  },
  socialProof: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: colors.background
  },
  ratingLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  rating: {
    color: colors.cream,
    fontFamily: fonts.heading,
    fontSize: 23
  },
  caption: {
    color: colors.creamMuted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 2
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  }
});
