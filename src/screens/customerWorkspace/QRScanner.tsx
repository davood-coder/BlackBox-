import { useState } from "react";
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import { barbershops } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius, spacing } from "../../theme";

export default function QRScanner({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState("Align the shop QR inside the frame");
  const { availableShops, setSelectedShop, setSelectedBarber } = useBooking();

  function openShop(shopId = barbershops[0].id) {
    const allShops = [...availableShops, ...barbershops];
    const shop = allShops.find((item) => item.id === shopId) || allShops[0];
    if (!shop) {
      setMessage("This Cutzix shop could not be found.");
      setScanned(false);
      return;
    }
    setSelectedShop(shop);
    setSelectedBarber((current) => shop.bestBarbers?.[0] || current);
    navigation.replace("ShopProfile");
  }

  function handleScan(result: BarcodeScanningResult) {
    if (scanned) return;
    setScanned(true);
    const match = result.data.match(/(?:shop\/|shop:)([a-z0-9-]+)/i);
    const shopId = match?.[1] || result.data.trim();
    setMessage("Shop found. Opening profile...");
    setTimeout(() => openShop(shopId), 350);
  }

  const cameraReady = permission?.granted;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" onPress={() => goBackOrNavigate(navigation, "Home")} style={styles.headerButton}>
          <Feather name="arrow-left" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Scan shop QR</Text>
        <Pressable accessibilityLabel="Flash" style={styles.headerButton}>
          <Feather name="zap" size={20} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.cameraWrap}>
        {cameraReady ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />
        ) : (
          <View style={styles.cameraPlaceholder}>
            <View style={styles.placeholderIcon}>
              <Feather name="camera" size={32} color={colors.primary} />
            </View>
            <Text style={styles.permissionTitle}>Camera access</Text>
            <Text style={styles.permissionCopy}>Allow camera access to scan a Cutzix shop code.</Text>
            <Pressable onPress={requestPermission} style={({ pressed }) => [styles.permissionButton, pressed && styles.pressed]}>
              <Text style={styles.permissionButtonText}>Enable camera</Text>
            </Pressable>
          </View>
        )}

        {cameraReady ? (
          <View pointerEvents="none" style={styles.scanOverlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              <View style={styles.scanLine} />
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Text style={styles.helper}>{message}</Text>
        <Pressable onPress={() => openShop()} style={({ pressed }) => [styles.demoButton, pressed && styles.pressed]}>
          <Feather name={Platform.OS === "web" ? "monitor" : "external-link"} size={17} color={colors.black} />
          <Text style={styles.demoText}>Open demo shop</Text>
        </Pressable>
        {scanned ? (
          <Pressable onPress={() => setScanned(false)}>
            <Text style={styles.scanAgain}>Scan another code</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.mediaBackground },
  header: {
    height: 62,
    paddingHorizontal: spacing.screen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)"
  },
  headerTitle: { color: colors.white, fontFamily: fonts.headingSemi, fontSize: 16 },
  cameraWrap: { flex: 1, marginHorizontal: 14, borderRadius: radius.lg, overflow: "hidden", backgroundColor: "#1C2026" },
  cameraPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 34 },
  placeholderIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(200,154,67,0.12)",
    borderWidth: 1,
    borderColor: "rgba(200,154,67,0.26)"
  },
  permissionTitle: { color: colors.white, fontFamily: fonts.heading, fontSize: 21, marginTop: 20 },
  permissionCopy: { color: "#BFC2C6", fontFamily: fonts.body, fontSize: 13, lineHeight: 20, textAlign: "center", marginTop: 8 },
  permissionButton: { minHeight: 46, borderRadius: radius.full, backgroundColor: colors.primary, justifyContent: "center", paddingHorizontal: 20, marginTop: 22 },
  permissionButtonText: { color: colors.black, fontFamily: fonts.bold, fontSize: 13 },
  scanOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,7,10,0.14)" },
  scanFrame: { width: 238, height: 238 },
  corner: { position: "absolute", width: 48, height: 48, borderColor: colors.primary, borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 14 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 14 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 14 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 14 },
  scanLine: { position: "absolute", left: 14, right: 14, top: "50%", height: 2, backgroundColor: colors.primary },
  footer: { minHeight: 180, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.screen },
  helper: { color: "#D6D8D5", fontFamily: fonts.medium, fontSize: 13, textAlign: "center" },
  demoButton: {
    minHeight: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18
  },
  demoText: { color: colors.black, fontFamily: fonts.bold, fontSize: 13 },
  scanAgain: { color: colors.primarySoft, fontFamily: fonts.medium, fontSize: 12, marginTop: 14 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] }
});
