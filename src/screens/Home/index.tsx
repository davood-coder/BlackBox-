import { Image, ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BottomNav, GhostButton, PrimaryButton } from "../../components/ui";
import { images } from "../../assets/images";
import { colors, fonts, spacing } from "../../theme";

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

          <View style={[styles.hero, { gap: isShort ? 12 : 18, marginBottom: isShort ? 4 : 18 }]}>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 6 }]}>
              Elevate{"\n"}Your Look.
            </Text>
            <Text style={[styles.copy, { fontSize: isNarrow ? 15 : 17, lineHeight: isNarrow ? 22 : 25 }]}>Premium grooming for the modern gentleman.</Text>
            <View style={[styles.actions, { gap: isShort ? 10 : 12, marginTop: isShort ? 4 : 10 }]}>
              <PrimaryButton label="Book Appointment" icon={null} onPress={() => navigation.navigate("SelectLocation", { nextScreen: "BookAppointment" })} />
              <GhostButton label="Explore Barbers" onPress={() => navigation.navigate("SelectLocation", { nextScreen: "Barbers" })} />
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
          </View>
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
  }
});
