import { StyleSheet, View } from "react-native";
import { images } from "../../assets/images";
import { FeaturePill, OnboardingShell } from "./components/OnboardingShell";

export default function OnboardingOne({ navigation }: any) {
  return (
    <OnboardingShell
      image={images.onboardingDiscover}
      step={1}
      title="The right barber, right around the corner."
      description="Discover trusted shops, compare live availability, and choose the experience that fits you."
      onSkip={() => navigation.replace("Login")}
      onNext={() => navigation.navigate("OnboardingTwo")}
    >
      <View style={styles.features}>
        <FeaturePill icon="star" label="Top-rated local shops" />
        <FeaturePill icon="clock" label="Live availability" />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  features: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  }
});
