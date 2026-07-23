import { ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { images } from "../../assets/images";
import { PrimaryButton } from "../../components/ui";
import { colors, fonts, spacing } from "../../theme";

export default function OnboardingThree({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isShort = height < 720;
  const isNarrow = width < 360;
  const titleSize = isNarrow ? 32 : 38;
  const copySize = isNarrow ? 14 : 16;

  return (
    <ImageBackground source={images.luxuryBarbershop} resizeMode="cover" style={[styles.root, { minHeight: height }]}>
      <LinearGradient
        colors={["rgba(22,19,13,0.38)", "rgba(22,19,13,0.15)", "rgba(15,17,21,0.98)"]}
        style={[styles.overlay, { minHeight: height, paddingHorizontal: isNarrow ? 16 : spacing.screen, paddingBottom: isShort ? 30 : 48 }]}
      >
        <Pressable onPress={() => navigation.replace("Login")} style={[styles.skip, { top: isShort ? 34 : 54 }]}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
        <View style={styles.bottom}>
          <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 8 }]}>Join the Club</Text>
          <Text style={[styles.copy, { fontSize: copySize, lineHeight: copySize + 8, marginBottom: isShort ? 18 : 28 }]}>Experience premium grooming tailored for the modern gentleman.</Text>
          <PrimaryButton label="Get Started" icon="arrow-forward" dark onPress={() => navigation.replace("Login")} style={[styles.button, { minHeight: isShort ? 58 : 68 }]} />
          <View style={[styles.dots, { marginTop: isShort ? 12 : 18 }]}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.activeDot} />
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.background
  },
  overlay: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    justifyContent: "flex-end",
    paddingBottom: 48
  },
  skip: {
    position: "absolute",
    top: 54,
    right: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(30,34,43,0.42)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)"
  },
  skipText: {
    color: colors.creamMuted,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  bottom: {
    alignItems: "center",
    gap: 14
  },
  title: {
    color: colors.primary,
    fontFamily: fonts.headingHeavy,
    fontSize: 38,
    lineHeight: 46,
    textAlign: "center"
  },
  copy: {
    color: colors.creamMuted,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 305,
    marginBottom: 28
  },
  button: {
    width: "100%",
    minHeight: 68
  },
  dots: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    marginTop: 18
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.elevated
  },
  activeDot: {
    width: 26,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary
  }
});
