import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from "@expo-google-fonts/inter";
import {
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold
} from "@expo-google-fonts/plus-jakarta-sans";
import { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { BookingProvider } from "./src/state/BookingContext";
import { colors } from "./src/theme";

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text
  }
};

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    document.documentElement.style.backgroundColor = colors.background;
    document.documentElement.style.minHeight = "100%";
    document.body.style.backgroundColor = colors.background;
    document.body.style.margin = "0";
    document.body.style.minHeight = "100%";

    const root = document.getElementById("root");
    if (root) {
      root.style.backgroundColor = colors.background;
      root.style.minHeight = "100vh";
    }
  }, []);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <BookingProvider>
      <NavigationContainer theme={navigationTheme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </BookingProvider>
  );
}
