import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
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
import { View, ActivityIndicator, Platform, Image } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { BookingProvider } from "./src/state/BookingContext";
import { colors } from "./src/theme";
import { images } from "./src/assets/images";

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text
  }
};

export default function App() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    // Set browser title and favicon logo (matching YouTube style)
    document.title = "Cutzix • Barber & Grooming";

    try {
      const svgFavicon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23C89A43'/%3E%3Cpath d='M36 32a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 24a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm6-19 23 23M42 57l23-23' stroke='%23111111' stroke-width='6.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E`;

      let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "shortcut icon";
        document.getElementsByTagName("head")[0].appendChild(favicon);
      }
      favicon.type = "image/svg+xml";
      favicon.href = svgFavicon;

      let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!appleIcon) {
        appleIcon = document.createElement("link");
        appleIcon.rel = "apple-touch-icon";
        document.getElementsByTagName("head")[0].appendChild(appleIcon);
      }
      appleIcon.href = svgFavicon;
    } catch (err) {
      console.log("Favicon set error:", err);
    }

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
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </BookingProvider>
  );
}
