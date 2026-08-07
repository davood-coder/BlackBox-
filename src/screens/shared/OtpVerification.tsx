import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, PrimaryButton, Screen } from "../../components/ui";
import { colors, fonts, radius, spacing } from "../../theme";
import { useBooking } from "../../state/BookingContext";
import { goBackOrNavigate } from "../../navigation/goBack";

export default function OtpVerification({ navigation, route }) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(30);
  const inputs = useRef([]);
  const { workspace, setWorkspace } = useBooking();
  const role = route?.params?.role || workspace;

  function continueToWorkspace() {
    setWorkspace(role);
    navigation.reset({
      index: 0,
      routes: [{ name: role === "Barber" ? "BarberDashboard" : "Home" }]
    });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function updateDigit(value, index) {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    if (clean && index < inputs.current.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key, index) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  return (
    <Screen>
      <View style={styles.glow} />
      <AppHeader title="" onBack={() => goBackOrNavigate(navigation, "Login")} backVariant="circle" />
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Phone</Text>
        <Text style={styles.copy}>
          We've sent a 4-digit code to{"\n"}
          <Text style={styles.phone}>+1 (555) 019-2834</Text>
        </Text>
        <View style={styles.otpRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(input) => {
                inputs.current[index] = input;
              }}
              value={digit}
              onChangeText={(value) => updateDigit(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              style={styles.otpInput}
              selectionColor={colors.primary}
            />
          ))}
        </View>
        <PrimaryButton label="Verify & Continue" onPress={continueToWorkspace} style={styles.verify} />
        <View style={styles.resendWrap}>
          {timeLeft > 0 ? (
            <Text style={styles.resendText}>
              Didn't receive a code? <Text style={styles.timer}>00:{String(timeLeft).padStart(2, "0")}</Text>
            </Text>
          ) : (
            <Pressable onPress={() => setTimeLeft(30)} style={styles.resendButton}>
              <Ionicons name="refresh" size={16} color={colors.primary} />
              <Text style={styles.timer}>Resend Code</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  glow: {
    position: "absolute",
    top: -160,
    left: "50%",
    width: 620,
    height: 620,
    marginLeft: -310,
    borderRadius: 310,
    backgroundColor: "rgba(212,168,90,0.05)"
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 70
  },
  title: {
    color: colors.text,
    fontFamily: fonts.headingHeavy,
    fontSize: 38,
    lineHeight: 46,
    textAlign: "center"
  },
  copy: {
    marginTop: 10,
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center"
  },
  phone: {
    color: colors.text,
    fontFamily: fonts.semibold
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 44,
    marginBottom: 32
  },
  otpInput: {
    width: 72,
    height: 86,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    textAlign: "center",
    fontFamily: fonts.headingHeavy,
    fontSize: 34
  },
  verify: {
    width: "100%"
  },
  resendWrap: {
    marginTop: spacing.lg,
    minHeight: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  resendText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16
  },
  timer: {
    color: colors.primary,
    fontFamily: fonts.semibold
  },
  resendButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  }
});
