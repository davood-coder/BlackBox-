import { View } from "react-native";
import { images } from "../../assets/images";
import { FeatureLine, OnboardingShell } from "./components/OnboardingShell";

export default function OnboardingThree({ navigation }: any) {
  return (
    <OnboardingShell
      image={images.onboardingArrival}
      step={3}
      title="Arrive expected. Leave sharper."
      description="Your booking, queue position, payment, and visit history stay together from request to review."
      ctaLabel="Start with Cutzix"
      onSkip={() => navigation.replace("Login")}
      onNext={() => navigation.replace("Login")}
    >
      <View>
        <FeatureLine icon="check-circle" title="Know before you go" copy="Confirmation and wait time update in one place." />
        <FeatureLine icon="award" title="Keep every visit connected" copy="Tickets, rewards, and receipts stay with your profile." />
      </View>
    </OnboardingShell>
  );
}
