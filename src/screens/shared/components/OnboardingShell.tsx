import type { ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";
import { Image, ImageBackground, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts, radius, shadows, spacing } from "../../../theme";
import { images } from "../../../assets/images";

type OnboardingShellProps = {
  image: ImageSourcePropType;
  step: 1 | 2 | 3;
  title: string;
  description: string;
  onNext: () => void;
  onSkip: () => void;
  children?: ReactNode;
  mediaOverlay?: ReactNode;
  ctaLabel?: string;
};

export function OnboardingShell({
  image,
  step,
  title,
  description,
  onNext,
  onSkip,
  children,
  mediaOverlay,
  ctaLabel
}: OnboardingShellProps) {
  const { height } = useWindowDimensions();
  const isShort = height < 740;
  const mediaHeight = isShort ? Math.max(250, height * 0.39) : Math.min(430, height * 0.46);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.viewport}>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        >
          <ImageBackground source={image} resizeMode="cover" style={[styles.media, { height: mediaHeight }]}>
            <View style={styles.topbar}>
              <View style={styles.brand}>
                <View style={styles.brandMark}>
                  <Feather name="scissors" size={14} color={colors.black} />
                </View>
                <Text style={styles.brandText}>Cutzix</Text>
              </View>
              <Pressable onPress={onSkip} style={({ pressed }) => [styles.skip, pressed && styles.pressed]}>
                <Text style={styles.skipText}>{step === 3 ? "Sign in" : "Skip"}</Text>
              </Pressable>
            </View>
            {mediaOverlay}
            <LinearGradient
              colors={["rgba(246,247,244,0)", "rgba(246,247,244,0.08)", colors.background]}
              locations={[0, 0.7, 1]}
              style={styles.mediaFade}
            />
          </ImageBackground>

          <View style={[styles.content, isShort && styles.contentShort]}>
            <View style={styles.stepRow}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>0{step}</Text>
              </View>
              <Text style={styles.stepLabel}>{step === 1 ? "DISCOVER" : step === 2 ? "BOOK" : "ARRIVE"}</Text>
            </View>
            <Text style={[styles.title, isShort && styles.titleShort]}>{title}</Text>
            <Text style={[styles.description, isShort && styles.descriptionShort]}>{description}</Text>
            {children ? <View style={[styles.detailArea, isShort && styles.detailAreaShort]}>{children}</View> : null}

            <View style={styles.footer}>
              <ProgressDots step={step} />
              {ctaLabel ? (
                <Pressable onPress={onNext} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
                  <Text style={styles.ctaText}>{ctaLabel}</Text>
                  <Feather name="arrow-right" size={18} color={colors.black} />
                </Pressable>
              ) : (
                <Pressable accessibilityLabel="Next" onPress={onNext} style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
                  <Feather name="arrow-right" size={22} color={colors.black} />
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export function FeaturePill({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featurePill}>
      <View style={styles.featureIcon}>
        <Feather name={icon as any} size={14} color={colors.primaryDark} />
      </View>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

export function FeatureLine({ icon, title, copy }: { icon: string; title: string; copy: string }) {
  return (
    <View style={styles.featureLine}>
      <View style={styles.lineIcon}>
        <Feather name={icon as any} size={16} color={colors.black} />
      </View>
      <View style={styles.lineCopy}>
        <Text style={styles.lineTitle}>{title}</Text>
        <Text style={styles.lineBody}>{copy}</Text>
      </View>
    </View>
  );
}

function ProgressDots({ step }: { step: number }) {
  return (
    <View style={styles.progress} accessibilityLabel={`Onboarding step ${step} of 3`}>
      {[1, 2, 3].map((item) => <View key={item} style={[styles.progressDot, item === step && styles.progressDotActive]} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  viewport: {
    flex: 1,
    width: "100%",
    maxWidth: 540,
    alignSelf: "center",
    backgroundColor: colors.background
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background
  },
  media: {
    width: "100%",
    minHeight: 250,
    backgroundColor: colors.elevated
  },
  topbar: {
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.screen,
    paddingTop: 14
  },
  brand: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 7,
    paddingRight: 13,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)"
  },
  brandMarkImage: {
    width: 30,
    height: 30,
    borderRadius: 15
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  brandText: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 14,
    letterSpacing: 0
  },
  skip: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.86)"
  },
  skipText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12
  },
  mediaFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 92,
    pointerEvents: "none"
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 24
  },
  contentShort: {
    paddingTop: 2,
    paddingBottom: 18
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  stepBadge: {
    width: 30,
    height: 24,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  stepText: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 10
  },
  stepLabel: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 10,
    letterSpacing: 0
  },
  title: {
    maxWidth: 430,
    color: colors.text,
    fontFamily: fonts.headingHeavy,
    fontSize: 34,
    lineHeight: 41,
    marginTop: 14,
    letterSpacing: 0
  },
  titleShort: {
    fontSize: 29,
    lineHeight: 35,
    marginTop: 10
  },
  description: {
    maxWidth: 430,
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10
  },
  descriptionShort: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7
  },
  detailArea: {
    marginTop: 20
  },
  detailAreaShort: {
    marginTop: 14
  },
  footer: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginTop: "auto",
    paddingTop: 18
  },
  progress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D2D4CE"
  },
  progressDotActive: {
    width: 28,
    backgroundColor: colors.black
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    ...shadows.card
  },
  cta: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    ...shadows.card
  },
  ctaText: {
    color: colors.black,
    fontFamily: fonts.bold,
    fontSize: 13
  },
  featurePill: {
    flex: 1,
    minWidth: 138,
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border
  },
  featureIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  featureText: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 11
  },
  featureLine: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  lineIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  lineCopy: {
    flex: 1,
    minWidth: 0
  },
  lineTitle: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 12
  },
  lineBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    marginTop: 3
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  }
});
