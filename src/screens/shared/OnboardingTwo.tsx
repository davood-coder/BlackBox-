import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { images } from "../../assets/images";
import { colors, fonts, radius, shadows } from "../../theme";
import { FeaturePill, OnboardingShell } from "./components/OnboardingShell";

export default function OnboardingTwo({ navigation }: any) {
  return (
    <OnboardingShell
      image={images.onboardingBooking}
      step={2}
      title="Book without the back-and-forth."
      description="Choose a service, barber, and open time. The shop confirms your request and keeps you updated."
      onSkip={() => navigation.replace("Login")}
      onNext={() => navigation.navigate("OnboardingThree")}
      mediaOverlay={<BookingPreview />}
    >
      <View style={styles.features}>
        <FeaturePill icon="calendar" label="Real-time slots" />
        <FeaturePill icon="bell" label="Instant decisions" />
      </View>
    </OnboardingShell>
  );
}

function BookingPreview() {
  return (
    <View style={styles.preview}>
      <View style={styles.previewHeader}>
        <View>
          <Text style={styles.previewEyebrow}>NEXT AVAILABLE</Text>
          <Text style={styles.previewTitle}>Today, 1:30 PM</Text>
        </View>
        <View style={styles.confirmed}>
          <Feather name="check" size={12} color={colors.success} />
          <Text style={styles.confirmedText}>Open</Text>
        </View>
      </View>
      <View style={styles.days}>
        {[
          { day: "MON", date: "27" },
          { day: "TUE", date: "28", active: true },
          { day: "WED", date: "29" },
          { day: "THU", date: "30" }
        ].map((item) => (
          <View key={item.day} style={[styles.day, item.active && styles.dayActive]}>
            <Text style={[styles.dayLabel, item.active && styles.dayLabelActive]}>{item.day}</Text>
            <Text style={[styles.dateLabel, item.active && styles.dateLabelActive]}>{item.date}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  preview: {
    position: "absolute",
    zIndex: 2,
    left: 20,
    right: 20,
    bottom: 8,
    minHeight: 132,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    ...shadows.floating
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  previewEyebrow: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 8,
    letterSpacing: 0
  },
  previewTitle: {
    color: colors.text,
    fontFamily: fonts.headingSemi,
    fontSize: 14,
    marginTop: 3
  },
  confirmed: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: radius.full,
    backgroundColor: "rgba(30,141,91,0.1)"
  },
  confirmedText: {
    color: colors.success,
    fontFamily: fonts.semibold,
    fontSize: 9
  },
  days: {
    flexDirection: "row",
    gap: 7,
    marginTop: 12
  },
  day: {
    flex: 1,
    minWidth: 0,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.background
  },
  dayActive: {
    backgroundColor: colors.primary
  },
  dayLabel: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 8
  },
  dayLabelActive: {
    color: colors.black
  },
  dateLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
    marginTop: 4
  },
  dateLabelActive: {
    color: colors.black
  }
});
