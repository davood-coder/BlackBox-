import { useEffect, useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
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
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  showZoomControls?: boolean;
};

// Web Mercator tile projection calculations for native fallback
function latLonToTileXY(lat: number, lon: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const xFloat = ((lon + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yFloat = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { xFloat, yFloat };
}

function tileXYToLatLon(xFloat: number, yFloat: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const lon = (xFloat / n) * 360 - 180;
  const rad = Math.PI - (2 * Math.PI * yFloat) / n;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(rad) - Math.exp(-rad)));
  return { latitude: lat, longitude: lon };
}

export function MapPreview({
  shops,
  selectedShop,
  origin,
  height = 300,
  compact = false,
  onMarkerPress,
  originLabel,
  onMapPress,
  zoom: externalZoom,
  onZoomChange,
  showZoomControls = false
}: MapPreviewProps) {
  const visibleShops = shops.slice(0, 8);

  const [internalZoom, setInternalZoom] = useState(14);
  const currentZoom = externalZoom !== undefined ? externalZoom : internalZoom;

  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);

  const centerLat = origin ? origin.latitude : 14.91342;
  const centerLon = origin ? origin.longitude : 79.9855;

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "MAP_CLICK") {
          onMapPress?.({ latitude: data.latitude, longitude: data.longitude });
        } else if (data?.type === "ZOOM_CHANGE") {
          setInternalZoom(data.zoom);
          onZoomChange?.(data.zoom);
        } else if (data?.type === "MARKER_PRESS") {
          const shop = shops.find((s) => s.id === data.shopId);
          if (shop) onMarkerPress?.(shop);
        }
      } catch (err) {
        // Ignore non-json messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onMapPress, onZoomChange, onMarkerPress, shops]);

  const handleZoom = (delta: number) => {
    const nextZoom = Math.min(18, Math.max(3, currentZoom + delta));
    setInternalZoom(nextZoom);
    onZoomChange?.(nextZoom);
  };

  if (Platform.OS === "web") {
    const shopsData = visibleShops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      distance: shop.distance,
      lat: shop.coordinates?.latitude,
      lon: shop.coordinates?.longitude
    }));

    const leafletHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body, #map { width: 100%; height: 100%; background: #F8F9FA; overflow: hidden; }
          .leaflet-container { background: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .leaflet-control-zoom { border: none !important; box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important; margin-right: 12px !important; margin-top: 12px !important; }
          .leaflet-control-zoom a { background: rgba(255,255,255,0.92) !important; color: #151515 !important; border: 1px solid rgba(0,0,0,0.12) !important; border-radius: 8px !important; width: 32px !important; height: 32px !important; line-height: 30px !important; font-size: 16px !important; margin-bottom: 6px !important; font-weight: bold; }
          .leaflet-control-zoom a:hover { background: #C89A43 !important; color: #FFFFFF !important; }
          .leaflet-popup-content-wrapper { background: rgba(255,255,255,0.95); color: #151515; border: 1px solid rgba(200,154,67,0.4); border-radius: 10px; padding: 4px 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
          .leaflet-popup-tip { background: rgba(255,255,255,0.95); border: 1px solid rgba(200,154,67,0.4); }
          .popup-title { font-weight: 600; font-size: 13px; color: #151515; margin-bottom: 2px; }
          .popup-sub { font-size: 11px; color: #946B22; }
          
          .origin-marker-icon {
            position: relative;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .origin-pulse {
            position: absolute;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(200, 154, 67, 0.25);
            border: 1.5px solid rgba(200, 154, 67, 0.8);
            animation: pulse 2s infinite;
          }
          .origin-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #C89A43;
            border: 2px solid #FFFFFF;
            box-shadow: 0 0 8px rgba(200, 154, 67, 0.5);
            z-index: 2;
          }
          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 1; }
            70% { transform: scale(1.6); opacity: 0; }
            100% { transform: scale(0.9); opacity: 0; }
          }
          .shop-pin {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            line-height: 1;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var center = [${centerLat}, ${centerLon}];
          var zoom = ${currentZoom};
          var map = L.map('map', {
            center: center,
            zoom: zoom,
            zoomControl: ${showZoomControls ? "true" : "false"},
            attributionControl: false
          });

          L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19
          }).addTo(map);

          var originIcon = L.divIcon({
            className: 'origin-marker-icon',
            html: '<div class="origin-pulse"></div><div class="origin-dot"></div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });

          var originMarker = L.marker(center, { icon: originIcon, draggable: true }).addTo(map);

          originMarker.on('dragend', function(e) {
            var latlng = originMarker.getLatLng();
            window.parent.postMessage(JSON.stringify({ type: 'MAP_CLICK', latitude: latlng.lat, longitude: latlng.lng }), '*');
          });

          map.on('click', function(e) {
            originMarker.setLatLng(e.latlng);
            window.parent.postMessage(JSON.stringify({ type: 'MAP_CLICK', latitude: e.latlng.lat, longitude: e.latlng.lng }), '*');
          });

          map.on('zoomend', function() {
            window.parent.postMessage(JSON.stringify({ type: 'ZOOM_CHANGE', zoom: map.getZoom() }), '*');
          });

          var shopsData = ${JSON.stringify(shopsData)};
          var selectedShopId = '${selectedShop?.id || ""}';
          shopsData.forEach(function(shop) {
            if (!shop.lat || !shop.lon) return;
            var isActive = shop.id === selectedShopId;
            var pinColor = isActive ? '#C89A43' : '#151515';
            var shopIcon = L.divIcon({
              className: 'custom-shop-pin',
              html: '<div class="shop-pin" style="color:' + pinColor + '">📍</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 24]
            });
            var m = L.marker([shop.lat, shop.lon], { icon: shopIcon }).addTo(map);
            var popupContent = '<div class="popup-title">' + shop.name + '</div><div class="popup-sub">' + (shop.distance || '') + '</div>';
            m.bindPopup(popupContent);
            m.on('click', function() {
              window.parent.postMessage(JSON.stringify({ type: 'MARKER_PRESS', shopId: shop.id }), '*');
            });
          });
        </script>
      </body>
      </html>
    `;

    return (
      <View style={[styles.map, { height }, compact && styles.compactMap]}>
        <iframe
          srcDoc={leafletHtml}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: compact ? 12 : 16
          }}
          title="Interactive Leaflet Location Map"
        />

        {selectedShop ? (
          <View style={styles.mapBadge} pointerEvents="none">
            <Text style={styles.mapBadgeText} numberOfLines={1}>
              {selectedShop.name}
            </Text>
            <Text style={styles.mapBadgeMeta}>
              {selectedShop.distance} - {selectedShop.queue || "Walk-ins open"}
            </Text>
          </View>
        ) : null}

        {!selectedShop && originLabel && !compact ? (
          <View style={styles.mapBadge} pointerEvents="none">
            <Text style={styles.mapBadgeText} numberOfLines={1}>
              {originLabel}
            </Text>
            <Text style={styles.mapBadgeMeta}>Detected Live Area</Text>
          </View>
        ) : null}
      </View>
    );
  }

  // Native tile projection fallback
  const handleNativeMapPress = (event: any) => {
    if (!onMapPress || !layoutWidth || !layoutHeight) return;
    const { locationX, locationY } = event.nativeEvent;

    const { xFloat, yFloat } = latLonToTileXY(centerLat, centerLon, currentZoom);
    const centerWorldPxX = xFloat * 256;
    const centerWorldPxY = yFloat * 256;

    const leftPx = centerWorldPxX - layoutWidth / 2;
    const topPx = centerWorldPxY - layoutHeight / 2;

    const tapWorldPxX = leftPx + locationX;
    const tapWorldPxY = topPx + locationY;

    const tapXFloat = tapWorldPxX / 256;
    const tapYFloat = tapWorldPxY / 256;

    const newCoords = tileXYToLatLon(tapXFloat, tapYFloat, currentZoom);
    onMapPress(newCoords);
  };

  const tiles: Array<{ id: string; url: string; left: number; top: number }> = [];
  let originMarkerPos = { left: layoutWidth / 2, top: layoutHeight / 2 };

  if (layoutWidth > 0 && layoutHeight > 0) {
    const { xFloat, yFloat } = latLonToTileXY(centerLat, centerLon, currentZoom);
    const centerWorldPxX = xFloat * 256;
    const centerWorldPxY = yFloat * 256;

    const leftPx = centerWorldPxX - layoutWidth / 2;
    const topPx = centerWorldPxY - layoutHeight / 2;

    const minTileX = Math.floor(leftPx / 256);
    const maxTileX = Math.floor((leftPx + layoutWidth) / 256);
    const minTileY = Math.floor(topPx / 256);
    const maxTileY = Math.floor((topPx + layoutHeight) / 256);

    const subdomains = ["a", "b", "c", "d"];
    const n = Math.pow(2, currentZoom);

    for (let ty = minTileY; ty <= maxTileY; ty++) {
      for (let tx = minTileX; tx <= maxTileX; tx++) {
        const wrappedX = ((tx % n) + n) % n;
        const wrappedY = Math.min(n - 1, Math.max(0, ty));
        const sub = subdomains[Math.abs(tx + ty) % subdomains.length];
        const url = `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/${currentZoom}/${wrappedY}/${wrappedX}.png`;
        tiles.push({
          id: `${currentZoom}-${tx}-${ty}`,
          url,
          left: tx * 256 - leftPx,
          top: ty * 256 - topPx
        });
      }
    }

    if (origin) {
      const originTile = latLonToTileXY(origin.latitude, origin.longitude, currentZoom);
      originMarkerPos = {
        left: originTile.xFloat * 256 - leftPx,
        top: originTile.yFloat * 256 - topPx
      };
    }
  }

  const shopMarkerPositions = visibleShops.map((shop) => {
    if (!shop.coordinates || !layoutWidth || !layoutHeight) return null;
    const { xFloat, yFloat } = latLonToTileXY(centerLat, centerLon, currentZoom);
    const leftPx = xFloat * 256 - layoutWidth / 2;
    const topPx = yFloat * 256 - layoutHeight / 2;

    const shopTile = latLonToTileXY(shop.coordinates.latitude, shop.coordinates.longitude, currentZoom);
    return {
      left: shopTile.xFloat * 256 - leftPx,
      top: shopTile.yFloat * 256 - topPx
    };
  });

  return (
    <Pressable
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayoutWidth(width);
        setLayoutHeight(height);
      }}
      onPress={handleNativeMapPress}
      style={[styles.map, { height }, compact && styles.compactMap]}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {tiles.map((tile) => (
          <Image
            key={tile.id}
            source={{ uri: tile.url }}
            style={{
              position: "absolute",
              left: tile.left,
              top: tile.top,
              width: 256,
              height: 256
            }}
            resizeMode="cover"
          />
        ))}
      </View>

      <View style={styles.mapShade} pointerEvents="none" />

      {visibleShops.map((shop, index) => {
        const active = selectedShop?.id === shop.id;
        const pos = shopMarkerPositions[index];
        if (!pos) return null;

        return (
          <Pressable
            key={shop.id}
            onPress={() => onMarkerPress?.(shop)}
            style={[
              styles.pin,
              { left: pos.left, top: pos.top },
              active && styles.activePin
            ]}
          >
            <FontAwesome6
              name="location-dot"
              size={active ? 30 : compact ? 18 : 23}
              color={active ? colors.primary : colors.text}
            />
          </Pressable>
        );
      })}

      {origin ? (
        <View
          style={[
            styles.originPin,
            { left: originMarkerPos.left, top: originMarkerPos.top }
          ]}
          pointerEvents="none"
        >
          <View style={styles.originPulse} />
          <View style={styles.originDot} />
        </View>
      ) : null}

      {showZoomControls ? (
        <View style={styles.zoomControlsContainer}>
          <Pressable onPress={() => handleZoom(1)} style={styles.zoomBtn}>
            <Text style={styles.zoomBtnText}>+</Text>
          </Pressable>
          <Pressable onPress={() => handleZoom(-1)} style={styles.zoomBtn}>
            <Text style={styles.zoomBtnText}>-</Text>
          </Pressable>
        </View>
      ) : null}

      {selectedShop ? (
        <View style={styles.mapBadge} pointerEvents="none">
          <Text style={styles.mapBadgeText} numberOfLines={1}>
            {selectedShop.name}
          </Text>
          <Text style={styles.mapBadgeMeta}>
            {selectedShop.distance} - {selectedShop.queue || "Walk-ins open"}
          </Text>
        </View>
      ) : null}

      {!selectedShop && originLabel && !compact ? (
        <View style={styles.mapBadge} pointerEvents="none">
          <Text style={styles.mapBadgeText} numberOfLines={1}>
            {originLabel}
          </Text>
          <Text style={styles.mapBadgeMeta}>Detected Live Area</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  map: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: "#F8F9FA",
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
    backgroundColor: "rgba(255,255,255,0.05)"
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(200,154,67,0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(200,154,67,0.8)"
  },
  originDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: "#FFFFFF"
  },
  zoomControlsContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    gap: 6
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  zoomBtnText: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 20
  },
  mapBadge: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  mapBadgeText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13
  },
  mapBadgeMeta: {
    color: colors.primaryDark,
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 2
  }
});

