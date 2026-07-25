import { ImageBackground, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { images } from "../assets/images";
import { PrimaryButton } from "../components/ui";
import { colors, fonts, radius, shadows, spacing } from "../theme";

export default function OnboardingTwo({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isShort = height < 720;
  const isNarrow = width < 360;
  const horizontalPadding = isNarrow ? 16 : spacing.screen;
  const mockWidth = Math.min(260, Math.max(218, width - horizontalPadding * 4));
  const slotWidth = (mockWidth - 40) / 2;
  const titleSize = isNarrow ? 30 : 36;
  const copySize = isNarrow ? 13 : 15;

  return (
    <ImageBackground source={images.luxuryBarbershop} resizeMode="cover" style={[styles.root, { minHeight: height }]}>
      <LinearGradient
        colors={["rgba(15,17,21,0.2)", "rgba(15,17,21,0.76)", colors.background]}
        style={[
          styles.overlay,
          {
            minHeight: height,
            paddingHorizontal: horizontalPadding,
            paddingTop: isShort ? 46 : 84,
            paddingBottom: isShort ? 24 : 34
          }
        ]}
      >
        <View style={[styles.mockPhone, { width: mockWidth, minHeight: isShort ? 300 : 360 }]}>
          <View style={styles.mockHeader}>
            <View style={styles.avatar}>
              <Feather name="user" size={16} color={colors.secondaryText} />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <View style={styles.lineLg} />
              <View style={styles.lineSm} />
            </View>
          </View>
          <View style={styles.calendar}>
            {["Mo", "Tu", "We", "Th"].map((day, index) => (
              <View key={day} style={styles.day}>
                <Text style={[styles.dayLabel, index === 1 && styles.activeDayLabel]}>{day}</Text>
                <View style={[styles.dayCircle, index === 1 && styles.activeDayCircle]}>
                  <Text style={[styles.dayNumber, index === 1 && styles.activeDayNumber]}>{12 + index}</Text>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.slotGrid}>
            {[0, 1, 2, 3].map((slot) => (
              <View key={slot} style={[styles.slot, { width: slotWidth, height: isShort ? 30 : 34 }, slot === 1 && styles.activeSlot]}>
                <View style={[styles.slotLine, slot === 1 && styles.activeSlotLine]} />
              </View>
            ))}
          </View>
          <View style={styles.mockCta} />
        </View>

        <View style={styles.bottom}>
          <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 7 }]}>
            Book with <Text style={styles.accent}>Ease</Text>
          </Text>
          <Text style={[styles.copy, { fontSize: copySize, lineHeight: copySize + 8, marginBottom: isShort ? 24 : 38 }]}>Select your master barber, choose a perfect time, and secure your session effortlessly.</Text>
          <View style={styles.controls}>
            <Pressable onPress={() => navigation.replace("Login")} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            <View style={styles.dots}>
              <View style={styles.dot} />
              <View style={styles.activeDot} />
              <View style={styles.dot} />
            </View>
            <PrimaryButton label="Next" onPress={() => navigation.navigate("OnboardingThree")} style={styles.nextButton} />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 84,
    paddingHorizontal: spacing.screen,
    paddingBottom: 34
  },
  mockPhone: {
    width: 260,
    minHeight: 360,
    borderRadius: 32,
    padding: 16,
    backgroundColor: "rgba(37,42,53,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    ...shadows.floating
  },
  mockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.elevated,
    alignItems: "center",
    justifyContent: "center"
  },
  lineLg: {
    width: 76,
    height: 7,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.4)"
  },
  lineSm: {
    width: 48,
    height: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.22)"
  },
  calendar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(23,26,33,0.78)",
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)"
  },
  day: {
    alignItems: "center",
    gap: 6
  },
  dayLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 10
  },
  activeDayLabel: {
    color: colors.primary
  },
  dayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  activeDayCircle: {
    backgroundColor: colors.primary
  },
  dayNumber: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 10
  },
  activeDayNumber: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16
  },
  slot: {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23,26,33,0.82)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)"
  },
  activeSlot: {
    backgroundColor: colors.primary
  },
  slotLine: {
    width: 42,
    height: 6,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)"
  },
  activeSlotLine: {
    backgroundColor: "rgba(17,17,17,0.7)"
  },
  mockCta: {
    marginTop: "auto",
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.textWarm
  },
  bottom: {
    width: "100%",
    alignItems: "center"
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.headingHeavy,
    fontSize: 36,
    lineHeight: 43,
    textAlign: "center"
  },
  accent: {
    color: colors.primary,
    fontStyle: "italic"
  },
  copy: {
    color: colors.creamMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    maxWidth: 295,
    marginTop: 8,
    marginBottom: 38
  },
  controls: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  skipButton: {
    minWidth: 70,
    paddingVertical: 12
  },
  skipText: {
    color: colors.creamMuted,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.elevated
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryLight
  },
  nextButton: {
    minHeight: 44,
    minWidth: 86
  }
});
