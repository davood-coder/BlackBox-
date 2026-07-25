import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
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
  const isWide = width >= 540;
  const titleSize = Math.min(isWide ? 52 : 46, Math.max(isNarrow ? 30 : 34, width * 0.112));
  const horizontalPadding = isNarrow ? 16 : isWide ? 28 : spacing.screen;
  const actionButtonStyle = isShort ? styles.compactButton : undefined;

  return (
    <View style={styles.root}>
      <ImageBackground source={images.luxuryBarbershop} resizeMode="cover" style={styles.background}>
        <LinearGradient
          colors={["rgba(15,17,21,0.18)", "rgba(15,17,21,0.58)", "rgba(15,17,21,0.98)"]}
          style={[
            styles.overlay,
            {
              paddingHorizontal: horizontalPadding,
              paddingTop: isShort ? 28 : 48
            }
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={[
              styles.scrollContent,
              {
                minHeight: Math.max(0, height - (isShort ? 28 : 48)),
                paddingBottom: isShort ? 108 : 124
              }
            ]}
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.brandWrap}>
                  <View style={styles.brandMark}>
                    <Feather name="scissors" size={15} color={colors.black} />
                  </View>
                  <Text style={[styles.logo, { fontSize: isNarrow ? 18 : 22 }]}>BLACK BOX</Text>
                </View>
                <Pressable onPress={() => navigation.navigate("Profile")} style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}>
                  <Feather name="menu" size={23} color={colors.text} />
                </Pressable>
              </View>

              <FadeInView delay={120} style={[styles.hero, { gap: isShort ? 10 : 14 }]}>
                <View style={styles.heroHeader}>
                  <Text style={styles.eyebrow}>Premium barber booking</Text>
                  <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 6 }]}>
                    Elevate{"\n"}Your Look.
                  </Text>
                  <Text style={[styles.copy, { fontSize: isNarrow ? 14 : 16, lineHeight: isNarrow ? 21 : 24 }]}>Premium grooming for the modern gentleman.</Text>
                </View>

                <View style={[styles.statsRow, isNarrow && styles.statsRowNarrow]}>
                  {barberHomeStats.map((item) => (
                    <View key={item.label} style={[styles.statCard, isNarrow && styles.statCardNarrow]}>
                      <Text style={[styles.statValue, item.tone === "success" && styles.successText, item.tone === "info" && styles.infoText]}>{item.value}</Text>
                      <Text style={styles.statLabel} numberOfLines={1}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.actions, isWide && styles.actionsWide, { gap: isShort ? 9 : 12, marginTop: isShort ? 2 : 8 }]}>
                  <PrimaryButton label="Book Appointment" icon={null} onPress={() => navigation.navigate("SelectLocation", { nextScreen: "BookAppointment" })} style={[styles.actionButton, isWide && styles.actionButtonWide, actionButtonStyle]} />
                  <GhostButton label="Explore Barbers" onPress={() => navigation.navigate("SelectLocation", { nextScreen: "Barbers" })} style={[styles.actionButton, isWide && styles.actionButtonWide, actionButtonStyle]} />
                </View>

                <View style={styles.quickGrid}>
                  {homeQuickActions.map((action) => (
                    <Pressable
                      key={action.label}
                      onPress={() => navigation.navigate(action.route, "params" in action ? action.params : undefined)}
                      style={({ pressed }) => [styles.quickAction, isWide && styles.quickActionWide, pressed && styles.pressed]}
                    >
                      <Feather name={action.icon as any} size={17} color={colors.primary} />
                      <Text style={styles.quickLabel}>{action.label}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={[styles.socialProof, isNarrow && styles.socialProofNarrow, { marginTop: isShort ? 8 : 16 }]}>
                  <View style={styles.avatarStack}>
                    {[0, 1, 2].map((item) => (
                      <Image key={item} source={item === 1 ? images.luxuryBarbershop : images.masterBarber} style={[styles.avatar, { marginLeft: item ? -12 : 0 }]} />
                    ))}
                  </View>
                  <View style={styles.ratingCopy}>
                    <View style={styles.ratingLine}>
                      <Text style={styles.rating}>4.9</Text>
                      <Ionicons name="star-outline" color={colors.primaryLight} size={22} />
                    </View>
                    <Text style={styles.caption}>Trusted by 1k+ clients</Text>
                  </View>
                </View>
              </FadeInView>
            </View>
          </ScrollView>
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
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  content: {
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
    flexGrow: 1,
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 46
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  logo: {
    color: colors.text,
    fontFamily: fonts.heading,
    letterSpacing: 1.4
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
    width: "100%",
    paddingTop: 34
  },
  heroHeader: {
    gap: 8
  },
  eyebrow: {
    alignSelf: "flex-start",
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(212,168,90,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,168,90,0.24)",
    overflow: "hidden"
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.headingHeavy,
    maxWidth: 360
  },
  copy: {
    color: colors.creamMuted,
    fontFamily: fonts.body,
    maxWidth: 330
  },
  actions: {
    width: "100%"
  },
  actionsWide: {
    flexDirection: "row"
  },
  actionButton: {
    width: "100%"
  },
  actionButtonWide: {
    flex: 1
  },
  compactButton: {
    minHeight: 48
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2
  },
  statsRowNarrow: {
    gap: 6
  },
  statCard: {
    flex: 1,
    minWidth: 94,
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(17,21,28,0.58)",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  statCardNarrow: {
    minWidth: 88,
    paddingHorizontal: 8
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
    flexWrap: "wrap",
    gap: 8
  },
  quickAction: {
    flexGrow: 1,
    flexBasis: "23%",
    minWidth: 72,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  quickActionWide: {
    minHeight: 64
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
  socialProofNarrow: {
    gap: 12
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
  ratingCopy: {
    flex: 1,
    minWidth: 0
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
