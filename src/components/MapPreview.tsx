import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
  originLabel?: string;
  onMapPress?: (coords: Coordinates) => void;
};

export function MapPreview({ shops, selectedShop, origin, height = 300, compact = false, onMarkerPress, originLabel, onMapPress }: MapPreviewProps) {
  const visibleShops = shops.slice(0, 6);
  const markerPositions = buildMarkerPositions(visibleShops, origin);
  const originPosition = origin ? buildPointPosition(origin, [...visibleShops.map((shop) => shop.coordinates), origin]) : null;

  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);

  const handleMapPress = (event: any) => {
    if (!onMapPress || !origin || !layoutWidth || !layoutHeight) return;
    const { locationX, locationY } = event.nativeEvent;
    const xPercent = (locationX / layoutWidth) * 100;
    const yPercent = (locationY / layoutHeight) * 100;

    // Center is 50%, 50%. Top-right is positive offset from center.
    // 1% of the layout matches roughly 0.00015 degrees of latitude/longitude.
    const deltaLat = (50 - yPercent) * 0.00015;
    const deltaLon = (xPercent - 50) * 0.00015;

    const newCoords = {
      latitude: origin.latitude + deltaLat,
      longitude: origin.longitude + deltaLon
    };
    onMapPress(newCoords);
  };

  const lat = origin ? origin.latitude : 14.91342;
  const lon = origin ? origin.longitude : 79.9855;
  const zoom = 14;
  const apiKey = "GEOAPIFY_API_KEY"; // Official Geoapify test key

  // Generate real OSM static map centered at the coordinates using Geoapify
  const staticMapUrl = `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${layoutWidth || 400}&height=${height}&center=lonlat:${lon},${lat}&zoom=${zoom}&marker=lonlat:${lon},${lat};color:%23c89a43;size:medium&apiKey=${apiKey}`;

  return (
    <Pressable 
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayoutWidth(width);
        setLayoutHeight(height);
      }}
      onPress={handleMapPress}
      style={[styles.map, { height }, compact && styles.compactMap]}
    >
      {layoutWidth > 0 ? (
        <Image 
          source={{ uri: staticMapUrl }} 
          style={StyleSheet.absoluteFill} 
          resizeMode="cover"
        />
      ) : (
        <View style={styles.mapShade} pointerEvents="none" />
      )}
      
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
      {origin && (!compact || visibleShops.length === 0) ? (
        <View style={[styles.originPin, { top: "50%", left: "50%" }]} pointerEvents="none">
          <View style={styles.originPulse} />
          <View style={styles.originDot} />
        </View>
      ) : null}
      {selectedShop ? (
        <View style={styles.mapBadge} pointerEvents="none">
          <Text style={styles.mapBadgeText} numberOfLines={1}>{selectedShop.name}</Text>
          <Text style={styles.mapBadgeMeta}>{selectedShop.distance} - {selectedShop.queue || "Walk-ins open"}</Text>
        </View>
      ) : null}
      {!selectedShop && originLabel && !compact ? (
        <View style={styles.mapBadge} pointerEvents="none">
          <Text style={styles.mapBadgeText} numberOfLines={1}>{originLabel}</Text>
          <Text style={styles.mapBadgeMeta}>Detected Live Area</Text>
        </View>
      ) : null}
    </Pressable>
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
  if (points.length <= 1) {
    return {
      top: "50%" as const,
      left: "50%" as const
    };
  }
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
