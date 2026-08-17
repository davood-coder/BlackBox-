import { useState } from "react";
import type { ComponentProps } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "../../components/ui";
import { colors, fonts, radius, shadows, spacing } from "../../theme";
import { useBooking } from "../../state/BookingContext";
import { images } from "../../assets/images";

type Role = "Customer" | "Barber";
type FeatherIcon = ComponentProps<typeof Feather>["name"];

export default function Login({ navigation }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Customer");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const { height } = useWindowDimensions();
  const { setWorkspace } = useBooking();
  const compact = height < 760;

  function continueWithRole() {
    setWorkspace(role);
    navigation.navigate("OtpVerification", { role });
  }

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            <View style={[styles.brand, compact && styles.brandCompact]}>
              <View style={styles.brandMark}>
                <Feather name="scissors" color={colors.black} size={21} />
              </View>
              <Text style={styles.brandText}>Cutzix</Text>
            </View>

            <View style={styles.intro}>
              <Text style={styles.eyebrow}>{role === "Customer" ? "YOUR NEXT CUT, SORTED" : "YOUR BUSINESS, IN ONE PLACE"}</Text>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.copy}>
                {role === "Customer"
                  ? "Sign in to book trusted barbers and manage your appointments."
                  : "Sign in to manage bookings, clients, and your shop."}
              </Text>
            </View>

            <View accessibilityRole="tablist" style={styles.roleSwitch}>
              {(["Customer", "Barber"] as const).map((item) => {
                const active = role === item;
                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    key={item}
                    onPress={() => setRole(item)}
                    style={({ pressed }) => [styles.roleButton, active && styles.roleActive, pressed && styles.pressed]}
                  >
                    <Feather name={item === "Customer" ? "user" : "briefcase"} size={15} color={active ? colors.white : colors.secondaryText} />
                    <Text style={[styles.roleText, active && styles.roleTextActive]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.form}>
              <AuthField
                autoCapitalize="none"
                icon="user"
                keyboardType="email-address"
                onChangeText={setIdentifier}
                placeholder="Email or phone number"
                returnKeyType="next"
                value={identifier}
              />
              <AuthField
                icon="lock"
                onChangeText={setPassword}
                onSubmitEditing={continueWithRole}
                placeholder="Password"
                returnKeyType="done"
                secureTextEntry={passwordHidden}
                value={password}
                trailing={
                  <Pressable
                    accessibilityLabel={passwordHidden ? "Show password" : "Hide password"}
                    hitSlop={10}
                    onPress={() => setPasswordHidden((hidden) => !hidden)}
                    style={({ pressed }) => [styles.visibilityButton, pressed && styles.pressed]}
                  >
                    <Feather name={passwordHidden ? "eye" : "eye-off"} size={19} color={colors.secondaryText} />
                  </Pressable>
                }
              />

              <Pressable hitSlop={8} style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}>
                <Text style={styles.link}>Forgot password?</Text>
              </Pressable>

              <PrimaryButton label={role === "Customer" ? "Continue as customer" : "Continue as barber"} onPress={continueWithRole} />
            </View>

            <View style={styles.divider}>
              <View style={styles.rule} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.rule} />
            </View>

            <View style={styles.socials}>
              <SocialButton label="Apple" icon="logo-apple" onPress={continueWithRole} />
              <SocialButton label="Google" icon="logo-google" onPress={continueWithRole} />
            </View>

            <View style={styles.signup}>
              <Text style={styles.signupText}>New to Cutzix?</Text>
              <Pressable hitSlop={8} onPress={continueWithRole} style={({ pressed }) => pressed && styles.pressed}>
                <Text style={styles.link}> Create account</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFieldProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  icon: FeatherIcon;
  keyboardType?: "default" | "email-address";
  onChangeText: (value: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  returnKeyType?: "next" | "done";
  secureTextEntry?: boolean;
  trailing?: React.ReactNode;
  value: string;
};

function AuthField({
  autoCapitalize,
  icon,
  keyboardType,
  onChangeText,
  onSubmitEditing,
  placeholder,
  returnKeyType,
  secureTextEntry,
  trailing,
  value
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, focused && styles.fieldFocused]}>
      <Feather name={icon} size={18} color={focused ? colors.primaryDark : colors.secondaryText} />
      <TextInput
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        onBlur={() => setFocused(false)}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        style={styles.input}
        value={value}
      />
      {trailing}
    </View>
  );
}

function SocialButton({ label, icon, onPress }: { label: string; icon: ComponentProps<typeof Ionicons>["name"]; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={`Continue with ${label}`} onPress={onPress} style={({ pressed }) => [styles.socialButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={21} color={colors.text} />
      <Text style={styles.socialText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboard: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.screen,
    paddingVertical: 28
  },
  scrollContentCompact: {
    justifyContent: "flex-start",
    paddingVertical: 18
  },
  shell: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center"
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 38
  },
  brandCompact: {
    marginBottom: 26
  },
  brandMarkImage: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  brandText: {
    color: colors.text,
    fontFamily: fonts.headingHeavy,
    fontSize: 24
  },
  intro: {
    marginBottom: 24
  },
  eyebrow: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 11,
    marginBottom: 9
  },
  title: {
    color: colors.text,
    fontFamily: fonts.headingHeavy,
    fontSize: 34,
    lineHeight: 41,
    marginBottom: 8
  },
  copy: {
    maxWidth: 400,
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 23
  },
  roleSwitch: {
    height: 52,
    flexDirection: "row",
    padding: 4,
    borderRadius: radius.md,
    backgroundColor: colors.elevated,
    marginBottom: 22
  },
  roleButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: radius.sm
  },
  roleActive: {
    backgroundColor: colors.black,
    ...shadows.card
  },
  roleText: {
    color: colors.secondaryText,
    fontFamily: fonts.semibold,
    fontSize: 16
  },
  roleTextActive: {
    color: colors.white,
    fontFamily: fonts.bold
  },
  form: {
    gap: 13
  },
  field: {
    minHeight: 58,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 16
  },
  fieldFocused: {
    borderColor: colors.primaryDark,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15
  },
  visibilityButton: {
    width: 32,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  forgot: {
    minHeight: 30,
    alignSelf: "flex-end",
    justifyContent: "center"
  },
  link: {
    color: colors.primaryDark,
    fontFamily: fonts.bold,
    fontSize: 14
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 23
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider
  },
  dividerText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11
  },
  socials: {
    flexDirection: "row",
    gap: 10
  },
  socialButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    backgroundColor: colors.white
  },
  socialText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  signup: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22
  },
  signupText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }]
  }
});
