import { Pressable, StyleSheet, Text, View } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { colors, fonts, radius } from "../theme";
import type { Barbershop, Coordinates } from "../data";

type MapPreviewProps = {
  shops: Barbershop[];
  selectedShop?: Barbershop;
  origin?: Coordinates;
  height?: number;
  compact?: boolean;
  onMarkerPress?: (shop: Barbershop) => void;
};

export function MapPreview({ shops, selectedShop, origin, height = 300, compact = false, onMarkerPress }: MapPreviewProps) {
  const visibleShops = shops.slice(0, 6);
  const markerPositions = buildMarkerPositions(visibleShops, origin);
  const originPosition = origin ? buildPointPosition(origin, [...visibleShops.map((shop) => shop.coordinates), origin]) : null;

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
        const position = markerPositions[index];
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
      {originPosition && !compact ? (
        <View style={[styles.originPin, originPosition]}>
          <View style={styles.originPulse} />
          <View style={styles.originDot} />
        </View>
      ) : null}
      {selectedShop ? (
        <View style={styles.mapBadge}>
          <Text style={styles.mapBadgeText} numberOfLines={1}>{selectedShop.name}</Text>
          <Text style={styles.mapBadgeMeta}>{selectedShop.distance} - {selectedShop.queue || "Walk-ins open"}</Text>
        </View>
      ) : null}
    </View>
  );
}

function buildMarkerPositions(shops: Barbershop[], origin?: Coordinates) {
  const points = origin ? [...shops.map((shop) => shop.coordinates), origin] : shops.map((shop) => shop.coordinates);
  return shops.map((shop, index) => {
    if (!shop.coordinates) {
      return fallbackMarkerPosition(index);
    }

    return buildPointPosition(shop.coordinates, points);
  });
}

function buildPointPosition(point: Coordinates, points: Coordinates[]) {
  const latitudes = points.map((item) => item.latitude);
  const longitudes = points.map((item) => item.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);
  const latSpan = Math.max(maxLat - minLat, 0.01);
  const lonSpan = Math.max(maxLon - minLon, 0.01);
  const top = clamp(14 + ((maxLat - point.latitude) / latSpan) * 72, 12, 76);
  const left = clamp(14 + ((point.longitude - minLon) / lonSpan) * 72, 12, 86);

  return {
    top: `${top}%` as const,
    left: `${left}%` as const
  };
}

function fallbackMarkerPosition(index: number) {
  const positions: Array<{ top: `${number}%`; left: `${number}%` }> = [
    { top: "22%", left: "60%" },
    { top: "36%", left: "32%" },
    { top: "62%", left: "22%" },
    { top: "30%", left: "78%" },
    { top: "54%", left: "52%" },
    { top: "70%", left: "68%" }
  ];
  return positions[index % positions.length];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
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
  originPin: {
    position: "absolute",
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -12 }, { translateY: -12 }]
  },
  originPulse: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(77,171,247,0.18)",
    borderWidth: 1,
    borderColor: "rgba(77,171,247,0.42)"
  },
  originDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.info,
    borderWidth: 2,
    borderColor: colors.text
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
