import { ImageBackground, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { images } from "../../assets/images";
import { PrimaryButton } from "../../components/ui";
import { colors, fonts, spacing } from "../../theme";

export default function OnboardingOne({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const isShort = height < 720;
  const isNarrow = width < 360;
  const titleSize = isNarrow ? 32 : 38;
  const copySize = isNarrow ? 14 : 16;
  const horizontalPadding = isNarrow ? 16 : spacing.screen;

  return (
    <ImageBackground source={images.masterBarber} resizeMode="cover" style={[styles.root, { minHeight: height }]}>
      <LinearGradient
        colors={["rgba(15,17,21,0.16)", "rgba(15,17,21,0.7)", colors.background]}
        style={[styles.overlay, { minHeight: height, paddingBottom: isShort ? 32 : 58, paddingHorizontal: horizontalPadding }]}
      >
        <View style={[styles.content, { gap: isShort ? 24 : 40 }]}>
          <View>
            <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 8 }]}>The Art of Grooming</Text>
            <Text style={[styles.copy, { fontSize: copySize, lineHeight: copySize + 8 }]}>Experience precision, heritage, and modern luxury tailored to the discerning gentleman.</Text>
          </View>
          <View style={styles.controls}>
            <View style={styles.dots}>
              <View style={styles.activeDash} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
            <PrimaryButton label="Next" onPress={() => navigation.navigate("OnboardingTwo")} style={styles.nextButton} />
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
    justifyContent: "flex-end",
    paddingHorizontal: spacing.screen,
    paddingBottom: 64
  },
  content: {
    gap: 44
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.headingHeavy,
    fontSize: 40,
    lineHeight: 48,
    maxWidth: 330
  },
  copy: {
    marginTop: 8,
    color: colors.creamMuted,
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 330
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  activeDash: {
    width: 32,
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.primary
  },
  dot: {
    width: 9,
    height: 5,
    borderRadius: 4,
    backgroundColor: colors.elevated
  },
  nextButton: {
    minHeight: 48,
    paddingHorizontal: 18
  }
});
