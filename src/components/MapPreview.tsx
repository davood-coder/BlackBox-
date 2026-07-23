import { Pressable, StyleSheet, Text, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { colors, fonts, radius } from "../theme";
import type { Barbershop } from "../data";

type MapPreviewProps = {
  shops: Barbershop[];
  selectedShop?: Barbershop;
  height?: number;
  compact?: boolean;
  onMarkerPress?: (shop: Barbershop) => void;
};

const positions: Array<{ top: `${number}%`; left: `${number}%` }> = [
  { top: "22%", left: "60%" },
  { top: "36%", left: "32%" },
  { top: "62%", left: "22%" },
  { top: "30%", left: "78%" },
  { top: "54%", left: "52%" },
  { top: "70%", left: "68%" }
];

export function MapPreview({ shops, selectedShop, height = 300, compact = false, onMarkerPress }: MapPreviewProps) {
  const visibleShops = shops.slice(0, 6);

  return (
    <View style={[styles.map, { height }, compact && styles.compactMap]}>
      <View style={styles.mapShade} />
      {[0, 1, 2, 3].map((line) => (
        <View key={`v-${line}`} style={[styles.mapLine, styles.verticalLine, { left: `${18 + line * 22}%` }]} />
      ))}
      {[0, 1, 2, 3, 4].map((line) => (
        <View key={`h-${line}`} style={[styles.mapLine, styles.horizontalLine, { top: `${15 + line * 18}%` }]} />
      ))}
      <View style={styles.routeLine} />
      {visibleShops.map((shop, index) => {
        const active = selectedShop?.id === shop.id;
        const position = positions[index % positions.length];
        return (
          <Pressable
            key={shop.id}
            onPress={() => onMarkerPress?.(shop)}
            style={[styles.pin, position, active && styles.activePin]}
          >
            <FontAwesome6 name="location-dot" size={active ? 30 : compact ? 18 : 23} color={active ? colors.primary : colors.text} />
          </Pressable>
        );
      })}
      {selectedShop ? (
        <View style={styles.mapBadge}>
          <Text style={styles.mapBadgeText} numberOfLines={1}>{selectedShop.name}</Text>
          <Text style={styles.mapBadgeMeta}>{selectedShop.distance}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#191D24",
    borderWidth: 1,
    borderColor: colors.border
  },
  compactMap: {
    borderRadius: radius.md
  },
  mapShade: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(15,17,21,0.25)"
  },
  mapLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.04)"
  },
  verticalLine: {
    top: -60,
    width: 2,
    height: 460,
    transform: [{ rotate: "14deg" }]
  },
  horizontalLine: {
    left: -70,
    width: 560,
    height: 2,
    transform: [{ rotate: "15deg" }]
  },
  routeLine: {
    position: "absolute",
    left: "22%",
    top: "62%",
    width: 160,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.18)",
    transform: [{ rotate: "35deg" }]
  },
  pin: {
    position: "absolute",
    transform: [{ translateX: -11 }, { translateY: -22 }]
  },
  activePin: {
    transform: [{ translateX: -15 }, { translateY: -28 }]
  },
  mapBadge: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: "rgba(15,17,21,0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  mapBadgeText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13
  },
  mapBadgeMeta: {
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 2
  }
});
