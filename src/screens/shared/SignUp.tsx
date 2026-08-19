import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Modal,
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
import { colors, fonts, shadows } from "../../theme";
import { useBooking } from "../../state/BookingContext";

type Role = "Customer" | "Barber";

export default function SignUp({ navigation }: { navigation: any }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Customer");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Google Account Picker Modal State
  const [googleModalVisible, setGoogleModalVisible] = useState(false);
  const [authenticatingAccount, setAuthenticatingAccount] = useState<string | null>(null);

  const { height } = useWindowDimensions();
  const { setWorkspace, themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const compact = height < 760;

  const googleAccounts = role === "Barber" ? [
    { name: "Marcus Vance", email: "marcus.vance.barber@gmail.com", roleBadge: "Master Barber Account", initial: "M", bg: "#C89A43" },
    { name: "David Miller", email: "david.miller.cutzix@gmail.com", roleBadge: "Shop Owner Account", initial: "D", bg: "#2563EB" },
  ] : [
    { name: "Alex Mercer", email: "alex.mercer@gmail.com", roleBadge: "Verified Customer", initial: "A", bg: "#10B981" },
    { name: "Lois Becket", email: "loisbecket@gmail.com", roleBadge: "Customer Account", initial: "L", bg: "#6366F1" },
  ];

  function handleCreateAccount() {
    setWorkspace(role);
    navigation.navigate("OtpVerification", { role });
  }

  function handleSelectGoogleAccount(accountEmail: string) {
    setAuthenticatingAccount(accountEmail);
    setWorkspace(role);
    setTimeout(() => {
      setAuthenticatingAccount(null);
      setGoogleModalVisible(false);
      if (role === "Barber") {
        navigation.navigate("BarberDashboard");
      } else {
        navigation.navigate("Home");
      }
    }, 650);
  }

  function handleRealGoogleSiteLogin() {
    const googleLoginUrl = "https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Faccounts.google.com%2F&service=mail&flowName=GlifWebSignIn&flowEntry=ServiceLogin";
    
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.open(googleLoginUrl, "_blank", "width=520,height=640,top=100,left=100");
      } else {
        Linking.openURL(googleLoginUrl);
      }
    } catch (err) {
      console.log("Google redirect error:", err);
    }

    setGoogleModalVisible(false);
    setWorkspace(role);
    setTimeout(() => {
      if (role === "Barber") {
        navigation.navigate("BarberDashboard");
      } else {
        navigation.navigate("Home");
      }
    }, 1000);
  }

  return (
    <SafeAreaView style={[styles.root, isDark && styles.rootDark]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, isDark && styles.cardDark]}>
            {/* Original Cutzix Brand Mark & Scissors Logo */}
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Feather name="scissors" color="#111111" size={21} />
              </View>
              <Text style={[styles.brandText, isDark && styles.textWhite]}>Cutzix</Text>
            </View>

            {/* Title & Subtitle */}
            <View style={styles.introHeader}>
              <Text style={[styles.title, isDark && styles.textWhite]}>Get Started</Text>
              <Text style={[styles.subtitle, isDark && styles.textMutedDark]}>
                Create an account to continue with Cutzix
              </Text>
            </View>

            {/* Role Switcher Pill */}
            <View accessibilityRole="tablist" style={[styles.roleSwitch, isDark && styles.roleSwitchDark]}>
              {(["Customer", "Barber"] as const).map((item) => {
                const active = role === item;
                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    key={item}
                    onPress={() => setRole(item)}
                    style={({ pressed }) => [
                      styles.roleButton,
                      active && styles.roleActive,
                      active && isDark && styles.roleActiveDark,
                      pressed && styles.pressed
                    ]}
                  >
                    <Feather name={item === "Customer" ? "user" : "briefcase"} size={14} color={active ? (isDark ? "#FFFFFF" : "#111827") : (isDark ? "#9CA3AF" : "#6B7280")} />
                    <Text style={[styles.roleText, active && styles.roleTextActive, active && isDark && styles.textWhite]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Full Name Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Full Name</Text>
                <View style={[
                  styles.inputPill,
                  isDark && styles.inputPillDark,
                  focusedField === "name" && styles.inputPillFocused,
                  focusedField === "name" && isDark && styles.inputPillFocusedDark
                ]}>
                  <TextInput
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setFullName}
                    onFocus={() => setFocusedField("name")}
                    placeholder="Lois Becket"
                    placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                    returnKeyType="next"
                    style={[styles.input, isDark && styles.textWhite]}
                    value={fullName}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Email</Text>
                <View style={[
                  styles.inputPill,
                  isDark && styles.inputPillDark,
                  focusedField === "email" && styles.inputPillFocused,
                  focusedField === "email" && isDark && styles.inputPillFocusedDark
                ]}>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setEmail}
                    onFocus={() => setFocusedField("email")}
                    placeholder="Loisbecket@gmail.com"
                    placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                    returnKeyType="next"
                    style={[styles.input, isDark && styles.textWhite]}
                    value={email}
                  />
                </View>
              </View>

              {/* Phone Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Phone Number</Text>
                <View style={[
                  styles.inputPill,
                  isDark && styles.inputPillDark,
                  focusedField === "phone" && styles.inputPillFocused,
                  focusedField === "phone" && isDark && styles.inputPillFocusedDark
                ]}>
                  <TextInput
                    keyboardType="phone-pad"
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setPhone}
                    onFocus={() => setFocusedField("phone")}
                    placeholder="+1 555 019 2834"
                    placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                    returnKeyType="next"
                    style={[styles.input, isDark && styles.textWhite]}
                    value={phone}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, isDark && styles.textWhite]}>Password</Text>
                <View style={[
                  styles.inputPill,
                  isDark && styles.inputPillDark,
                  focusedField === "password" && styles.inputPillFocused,
                  focusedField === "password" && isDark && styles.inputPillFocusedDark
                ]}>
                  <TextInput
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedField("password")}
                    onSubmitEditing={handleCreateAccount}
                    placeholder="••••••••"
                    placeholderTextColor={isDark ? "#64748B" : "#9CA3AF"}
                    returnKeyType="done"
                    secureTextEntry={passwordHidden}
                    style={[styles.input, isDark && styles.textWhite]}
                    value={password}
                  />
                  <Pressable
                    accessibilityLabel={passwordHidden ? "Show password" : "Hide password"}
                    hitSlop={10}
                    onPress={() => setPasswordHidden((hidden) => !hidden)}
                    style={({ pressed }) => [styles.eyeBtn, pressed && styles.pressed]}
                  >
                    <Feather name={passwordHidden ? "eye" : "eye-off"} size={18} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
                  </Pressable>
                </View>
              </View>

              {/* Terms Checkbox Row */}
              <Pressable
                onPress={() => setAgreeTerms((val) => !val)}
                style={({ pressed }) => [styles.termsRow, pressed && styles.pressed]}
              >
                <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked, isDark && !agreeTerms && styles.checkboxDark]}>
                  {agreeTerms ? <Ionicons name="checkmark" size={13} color="#000000" /> : null}
                </View>
                <Text style={[styles.termsText, isDark && styles.textMutedDark]}>
                  I agree to the <Text style={styles.goldLink}>Terms & Privacy Policy</Text>
                </Text>
              </Pressable>

              {/* Main Sign Up Button */}
              <Pressable
                onPress={handleCreateAccount}
                style={({ pressed }) => [styles.signupBtn, pressed && styles.pressed]}
              >
                <Text style={styles.signupBtnText}>
                  {role === "Customer" ? "Create Account" : "Register Barber Account"}
                </Text>
              </Pressable>
            </View>

            {/* Divider Line */}
            <View style={styles.divider}>
              <View style={[styles.dividerRule, isDark && styles.dividerRuleDark]} />
              <Text style={[styles.dividerText, isDark && styles.textMutedDark]}>Or</Text>
              <View style={[styles.dividerRule, isDark && styles.dividerRuleDark]} />
            </View>

            {/* Working Social Logins (Google) */}
            <View style={styles.socialStack}>
              <Pressable
                onPress={() => setGoogleModalVisible(true)}
                style={({ pressed }) => [styles.googleOfficialPill, isDark && styles.googleOfficialPillDark, pressed && styles.pressed]}
              >
                <View style={styles.googleGBadge}>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#4285F4" }}>G</Text>
                </View>
                <Text style={[styles.googleOfficialText, isDark && styles.textWhite]}>
                  Sign up with Google
                </Text>
              </Pressable>
            </View>

            {/* Login Link Footer */}
            <View style={styles.loginFooter}>
              <Text style={[styles.loginFooterText, isDark && styles.textMutedDark]}>Already have an account? </Text>
              <Pressable hitSlop={8} onPress={() => navigation.navigate("Login")} style={({ pressed }) => pressed && styles.pressed}>
                <Text style={styles.goldLink}>Log In</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google OAuth Account Picker Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={googleModalVisible}
        onRequestClose={() => setGoogleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.googleModalCard, isDark && styles.googleModalCardDark]}>
            {/* Modal Header */}
            <View style={styles.googleModalHeader}>
              <View style={styles.googleModalLogoCircle}>
                <Ionicons name="logo-google" size={26} color="#4285F4" />
              </View>
              <Text style={[styles.googleModalTitle, isDark && styles.textWhite]}>Sign up with Google</Text>
              <Text style={[styles.googleModalSubtitle, isDark && styles.textMutedDark]}>
                {role === "Barber"
                  ? "Select your Barber Google Account to register your schedule & workspace"
                  : "Choose an account to register with Cutzix"}
              </Text>
            </View>

            {/* Accounts List */}
            <View style={styles.accountsList}>
              {googleAccounts.map((acc) => {
                const isSelectedLoading = authenticatingAccount === acc.email;
                return (
                  <Pressable
                    key={acc.email}
                    disabled={!!authenticatingAccount}
                    onPress={() => handleSelectGoogleAccount(acc.email)}
                    style={({ pressed }) => [
                      styles.accountRow,
                      isDark && styles.accountRowDark,
                      pressed && styles.pressed
                    ]}
                  >
                    <View style={[styles.accountAvatar, { backgroundColor: acc.bg }]}>
                      <Text style={styles.accountAvatarText}>{acc.initial}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.accountName, isDark && styles.textWhite]}>{acc.name}</Text>
                      <Text style={[styles.accountEmail, isDark && styles.textMutedDark]}>{acc.email}</Text>
                      <Text style={styles.accountBadgeText}>{acc.roleBadge}</Text>
                    </View>
                    {isSelectedLoading ? (
                      <ActivityIndicator size="small" color="#4285F4" />
                    ) : (
                      <Feather name="chevron-right" size={18} color={isDark ? "#64748B" : "#9CA3AF"} />
                    )}
                  </Pressable>
                );
              })}

              <Pressable
                onPress={handleRealGoogleSiteLogin}
                style={({ pressed }) => [styles.accountRow, isDark && styles.accountRowDark, pressed && styles.pressed]}
              >
                <View style={[styles.accountAvatar, { backgroundColor: "#EFF6FF" }]}>
                  <Ionicons name="logo-google" size={18} color="#4285F4" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.accountName, isDark && styles.textWhite]}>Use another account</Text>
                  <Text style={[styles.accountEmail, isDark && styles.textMutedDark]}>Sign in on accounts.google.com</Text>
                </View>
                <Feather name="external-link" size={16} color="#4285F4" />
              </Pressable>
            </View>

            {/* Modal Actions */}
            <Pressable
              onPress={() => setGoogleModalVisible(false)}
              style={({ pressed }) => [styles.cancelModalBtn, pressed && styles.pressed]}
            >
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F5FB"
  },
  rootDark: {
    backgroundColor: "#0F172A"
  },
  keyboard: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32
  },
  scrollContentCompact: {
    paddingVertical: 16
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 26,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4
  },
  cardDark: {
    backgroundColor: "#1E293B",
    borderColor: "rgba(255, 255, 255, 0.08)"
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20
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
    color: "#111827",
    fontFamily: fonts.headingHeavy,
    fontSize: 24
  },
  introHeader: {
    marginBottom: 20
  },
  title: {
    fontFamily: fonts.headingHeavy,
    fontSize: 26,
    lineHeight: 32,
    color: "#111827",
    marginBottom: 6
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "#6B7280"
  },
  textWhite: {
    color: "#FFFFFF"
  },
  textMutedDark: {
    color: "#9CA3AF"
  },
  roleSwitch: {
    height: 46,
    flexDirection: "row",
    padding: 3,
    borderRadius: 23,
    backgroundColor: "#F3F4F6",
    marginBottom: 22
  },
  roleSwitchDark: {
    backgroundColor: "#0F172A"
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 20
  },
  roleActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  roleActiveDark: {
    backgroundColor: "#334155"
  },
  roleText: {
    color: "#6B7280",
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  roleTextActive: {
    color: "#111827",
    fontFamily: fonts.bold
  },
  form: {
    gap: 14
  },
  fieldGroup: {
    gap: 5
  },
  fieldLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#374151",
    marginLeft: 4
  },
  inputPill: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center"
  },
  inputPillDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155"
  },
  inputPillFocused: {
    borderColor: "#C89A43",
    backgroundColor: "#FFFFFF",
    shadowColor: "#C89A43",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  inputPillFocusedDark: {
    borderColor: "#C89A43",
    backgroundColor: "#0F172A"
  },
  input: {
    flex: 1,
    height: "100%",
    color: "#111827",
    fontFamily: fonts.medium,
    fontSize: 15,
    outlineStyle: "none" as any,
    outlineWidth: 0 as any
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 6
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 4
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF"
  },
  checkboxDark: {
    borderColor: "#475569",
    backgroundColor: "#0F172A"
  },
  checkboxChecked: {
    backgroundColor: "#C89A43",
    borderColor: "#C89A43"
  },
  termsText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: "#4B5563"
  },
  goldLink: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: "#C89A43"
  },
  signupBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C89A43",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#C89A43",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  signupBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: "#000000"
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 20
  },
  dividerRule: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB"
  },
  dividerRuleDark: {
    backgroundColor: "#334155"
  },
  dividerText: {
    color: "#9CA3AF",
    fontFamily: fonts.medium,
    fontSize: 12
  },
  socialStack: {
    gap: 12
  },
  googleOfficialPill: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#DADCE0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  googleOfficialPillDark: {
    backgroundColor: "#1E293B",
    borderColor: "#334155"
  },
  googleGBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center"
  },
  googleOfficialText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#3C4043"
  },
  loginFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22
  },
  loginFooterText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "#6B7280"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  googleModalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  googleModalCardDark: {
    backgroundColor: "#1E293B"
  },
  googleModalHeader: {
    alignItems: "center",
    marginBottom: 20
  },
  googleModalLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  googleModalTitle: {
    fontFamily: fonts.headingHeavy,
    fontSize: 22,
    color: "#111827",
    marginBottom: 4
  },
  googleModalSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center"
  },
  accountsList: {
    gap: 10,
    marginBottom: 18
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0"
  },
  accountRowDark: {
    backgroundColor: "#0F172A",
    borderColor: "#334155"
  },
  accountAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  accountAvatarText: {
    color: "#FFFFFF",
    fontFamily: fonts.bold,
    fontSize: 16
  },
  accountName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#1E293B"
  },
  accountEmail: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: "#64748B"
  },
  accountBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: "#C89A43",
    marginTop: 2
  },
  cancelModalBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center"
  },
  cancelModalBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: "#475569"
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }]
  }
});
