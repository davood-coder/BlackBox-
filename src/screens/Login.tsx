import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Field, PrimaryButton } from "../components/ui";
import { colors, fonts, radius, shadows, spacing } from "../theme";

export default function Login({ navigation }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Client");

  return (
    <LinearGradient colors={["#17130D", colors.backgroundWarm, colors.background]} style={styles.root}>
      <View style={styles.overlay}>
        <View style={styles.brand}>
          <Feather name="scissors" color={colors.primary} size={32} />
          <Text style={styles.brandText}>Black Box</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.copy}>Enter your details to access appointments, barbers, and shop tools.</Text>
          <View style={styles.roleSwitch}>
            {["Client", "Barber"].map((item) => (
              <Pressable key={item} onPress={() => setRole(item)} style={[styles.roleButton, role === item && styles.roleActive]}>
                <Text style={[styles.roleText, role === item && styles.roleTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.form}>
            <Field icon="user" placeholder="Email or Phone Number" value={identifier} onChangeText={setIdentifier} style={styles.warmField} />
            <Field icon="lock" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.warmField} />
            <Pressable style={styles.forgot}>
              <Text style={styles.link}>Forgot Password?</Text>
            </Pressable>
            <PrimaryButton label="Login" onPress={() => navigation.navigate("OtpVerification")} />
          </View>
          <View style={styles.divider}>
            <View style={styles.rule} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.rule} />
          </View>
          <View style={styles.socials}>
            <SocialButton label="Apple" icon="logo-apple" onPress={() => navigation.navigate("OtpVerification")} />
            <SocialButton label="Google" icon="logo-google" onPress={() => navigation.navigate("OtpVerification")} />
          </View>
        </View>
        <View style={styles.signup}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate("OtpVerification")}>
            <Text style={styles.link}> Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

function SocialButton({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={24} color={colors.cream} />
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screen
  },
  brand: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 34
  },
  brandText: {
    color: colors.cream,
    fontFamily: fonts.heading,
    fontSize: 25
  },
  card: {
    backgroundColor: "rgba(23,26,33,0.96)",
    borderRadius: radius.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    ...shadows.floating
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.heading,
    fontSize: 32,
    marginBottom: 6
  },
  copy: {
    color: colors.creamMuted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18
  },
  roleSwitch: {
    height: 48,
    flexDirection: "row",
    padding: 4,
    borderRadius: radius.full,
    backgroundColor: "rgba(15,17,21,0.48)",
    borderWidth: 1,
    borderColor: "#594A35",
    marginBottom: 22
  },
  roleButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full
  },
  roleActive: {
    backgroundColor: colors.primary
  },
  roleText: {
    color: colors.creamMuted,
    fontFamily: fonts.medium,
    fontSize: 13
  },
  roleTextActive: {
    color: colors.black,
    fontFamily: fonts.bold
  },
  form: {
    gap: 14
  },
  warmField: {
    backgroundColor: "#1D1913",
    borderColor: "#594A35"
  },
  forgot: {
    alignSelf: "flex-end",
    paddingVertical: 2
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 25
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider
  },
  dividerText: {
    color: colors.creamMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  socials: {
    gap: 10
  },
  socialButton: {
    minHeight: 58,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#594A35",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    backgroundColor: "rgba(15,17,21,0.24)"
  },
  socialText: {
    color: colors.cream,
    fontFamily: fonts.bold,
    fontSize: 17
  },
  signup: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28
  },
  signupText: {
    color: colors.creamMuted,
    fontFamily: fonts.body,
    fontSize: 15
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }]
  }
});
