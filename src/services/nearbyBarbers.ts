import { Platform } from "react-native";
import { images } from "../assets/images";
import { barbers, barbershops, services, type Barber, type Barbershop, type Coordinates } from "../data";

type OverpassElement = {
  id: number;
  type: string;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

type NominatimPlace = {
  place_id?: number;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  category?: string;
  type?: string;
  address?: Record<string, string | undefined>;
};

export type AreaSearchResult = {
  label: string;
  coordinates: Coordinates;
};

export const DEFAULT_COORDS: Coordinates = {
  latitude: 40.758,
  longitude: -73.9855
};

const imagePool = [images.luxuryBarbershop, images.masterBarber, images.barberToolsBoard];
const fallbackOffsets = [
  { latitude: 0.006, longitude: -0.004 },
  { latitude: -0.004, longitude: 0.005 },
  { latitude: 0.003, longitude: 0.008 }
];

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.max(120, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

export function distanceMeters(from: Coordinates, to: Coordinates) {
  const earthRadius = 6371000;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function fallbackShops(origin: Coordinates = DEFAULT_COORDS, localizeToOrigin = false): Barbershop[] {
  return barbershops
    .map((shop, index) => {
      const coordinates = localizeToOrigin ? offsetCoordinates(origin, index) : shop.coordinates;
      const meters = distanceMeters(origin, coordinates);
      return {
        ...shop,
        coordinates,
        distanceMeters: Math.round(meters),
        distance: formatDistance(meters),
        address: localizeToOrigin ? "Nearby sample location - live map data unavailable" : shop.address,
        bestBarbers: buildBestBarbersForShop(shop.name, index)
      };
    })
    .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
}

export async function fetchNearbyBarbershops(origin: Coordinates, radiusMeters = 5500): Promise<Barbershop[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["shop"~"^(hairdresser|beauty)$"](around:${radiusMeters},${origin.latitude},${origin.longitude})["name"];
      way["shop"~"^(hairdresser|beauty)$"](around:${radiusMeters},${origin.latitude},${origin.longitude})["name"];
      relation["shop"~"^(hairdresser|beauty)$"](around:${radiusMeters},${origin.latitude},${origin.longitude})["name"];
      node["name"~"[Bb]arber|[Bb]arbershop|[Hh]aircut"](around:${radiusMeters},${origin.latitude},${origin.longitude});
      way["name"~"[Bb]arber|[Bb]arbershop|[Hh]aircut"](around:${radiusMeters},${origin.latitude},${origin.longitude});
    );
    out center tags 50;
  `;

  const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
    headers: buildMapHeaders()
  });
  if (!response.ok) {
    throw new Error(`Overpass request failed: ${response.status}`);
  }

  const payload = (await response.json()) as OverpassResponse;
  const unique = new Map<string, Barbershop>();

  (payload.elements || []).forEach((element, index) => {
    const tags = element.tags || {};
    const name = tags.name || tags.brand;
    const latitude = element.lat ?? element.center?.lat;
    const longitude = element.lon ?? element.center?.lon;
    if (!name || latitude == null || longitude == null || !looksLikeBarberShop(tags)) return;

    const coordinates = { latitude, longitude };
    const meters = Math.round(distanceMeters(origin, coordinates));
    const address = formatAddress(tags);
    const id = `osm-${element.type}-${element.id}`;

    unique.set(id, {
      id,
      name,
      distance: formatDistance(meters),
      distanceMeters: meters,
      rating: ratingForSeed(element.id),
      reviews: reviewsForSeed(element.id),
      address: address || "Address available from map data",
      image: imagePool[index % imagePool.length],
      coordinates,
      source: "osm",
      phone: tags.phone || tags["contact:phone"],
      website: tags.website || tags["contact:website"],
      services,
      bestBarbers: buildBestBarbersForShop(name, index),
      openUntil: openUntilForSeed(element.id),
      queue: queueForSeed(element.id)
    });
  });

  return Array.from(unique.values()).sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
}

export async function searchBarbershopsByAreaName(areaName: string, origin: Coordinates): Promise<Barbershop[]> {
  const term = areaName.trim();
  if (term.length < 3) return [];

  const queries = [`hairdresser in ${term}`, `barber shop in ${term}`, `salon in ${term}`];
  const unique = new Map<string, Barbershop>();

  for (const query of queries) {
    const places = await searchNominatimPlaces(query, 20);
    places.forEach((place, index) => {
      const shop = nominatimPlaceToShop(place, origin, unique.size + index);
      if (!shop) return;
      unique.set(shop.id, shop);
    });

    if (unique.size >= 8) break;
  }

  return Array.from(unique.values()).sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0)).slice(0, 30);
}

export async function geocodeArea(query: string): Promise<AreaSearchResult | null> {
  const term = query.trim();
  if (term.length < 3) return null;

  const params = new URLSearchParams({
    q: term,
    format: "jsonv2",
    addressdetails: "1",
    limit: "1"
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: buildMapHeaders()
  });

  if (!response.ok) {
    throw new Error(`Area search failed: ${response.status}`);
  }

  const [place] = (await response.json()) as NominatimPlace[];
  if (!place) return null;

  const latitude = Number(place.lat);
  const longitude = Number(place.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    label: formatPlaceLabel(place, term),
    coordinates: { latitude, longitude }
  };
}

export async function reverseGeocodeAreaLabel(origin: Coordinates) {
  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    lat: String(origin.latitude),
    lon: String(origin.longitude)
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
    headers: buildMapHeaders()
  });

  if (!response.ok) return "Current location";

  const place = (await response.json()) as NominatimPlace;
  return formatPlaceLabel(place, "Current location");
}

export function buildBestBarbersForShop(shopName: string, offset = 0): Barber[] {
  return [0, 1, 2, 3].map((_, index) => {
    const base = barbers[(offset + index) % barbers.length];
    const reviewBoost = Number(base.reviews) + ((shopName.length + index * 17) % 45);
    return {
      ...base,
      id: `${slugify(shopName)}-${base.id}`,
      reviews: String(reviewBoost),
      rating: index === 0 ? "4.9" : base.rating,
      bio: `${base.bio} Available at ${shopName}.`
    };
  });
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function offsetCoordinates(origin: Coordinates, index: number) {
  const offset = fallbackOffsets[index % fallbackOffsets.length];
  return {
    latitude: origin.latitude + offset.latitude,
    longitude: origin.longitude + offset.longitude
  };
}

function formatAddress(tags: Record<string, string>) {
  const line = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  const city = [tags["addr:suburb"], tags["addr:city"], tags["addr:district"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean).join(", ");
  return [line, city].filter(Boolean).join(", ");
}

async function searchNominatimPlaces(query: string, limit: number) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: String(limit)
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: buildMapHeaders()
  });

  if (!response.ok) return [];
  return (await response.json()) as NominatimPlace[];
}

function nominatimPlaceToShop(place: NominatimPlace, origin: Coordinates, index: number): Barbershop | null {
  const name = place.name?.trim();
  const latitude = Number(place.lat);
  const longitude = Number(place.lon);
  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !looksLikeNominatimShop(place)) return null;

  const coordinates = { latitude, longitude };
  const meters = Math.round(distanceMeters(origin, coordinates));
  const seed = place.place_id || Math.round(Math.abs(latitude * 10000 + longitude * 10000));

  return {
    id: `osm-nominatim-${seed}-${slugify(name)}`,
    name,
    distance: formatDistance(meters),
    distanceMeters: meters,
    rating: ratingForSeed(seed),
    reviews: reviewsForSeed(seed),
    address: place.display_name || "Address available from map data",
    image: imagePool[index % imagePool.length],
    coordinates,
    source: "osm",
    services,
    bestBarbers: buildBestBarbersForShop(name, index),
    openUntil: openUntilForSeed(seed),
    queue: queueForSeed(seed)
  };
}

function looksLikeBarberShop(tags: Record<string, string>) {
  const taggedAsGrooming = [tags.shop, tags.amenity, tags.craft, tags["hairdresser:for"]]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/barber|hairdresser|hair|beauty|salon|male|men|unisex/.test(taggedAsGrooming)) return true;

  const name = [tags.name, tags.brand].filter(Boolean).join(" ").toLowerCase();
  return /barber|barbers|barbershop|hairdresser|hair salon|hair cut|haircut|men.?s salon|salon/.test(name);
}

function looksLikeNominatimShop(place: NominatimPlace) {
  const tags = [place.category, place.type, place.name].filter(Boolean).join(" ").toLowerCase();
  return /shop|hairdresser|beauty|barber|salon|saloon|hair/.test(tags);
}

function formatPlaceLabel(place: NominatimPlace, fallback: string) {
  const address = place.address || {};
  const parts = [
    address.suburb || address.neighbourhood || address.city_district || address.city || address.town || address.village || place.name,
    address.state,
    address.country
  ].filter(Boolean) as string[];

  const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index);
  return uniqueParts.length ? uniqueParts.join(", ") : place.display_name || fallback;
}

function buildMapHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  if (Platform.OS !== "web") {
    headers["User-Agent"] = "BlackBoxBarbers/1.0";
  }

  return headers;
}

function ratingForSeed(seed: number) {
  return (4.5 + (seed % 5) / 10).toFixed(1);
}

function reviewsForSeed(seed: number) {
  return String(64 + (seed % 180));
}

function openUntilForSeed(seed: number) {
  return ["7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM"][seed % 4];
}

function queueForSeed(seed: number) {
  return ["Walk-ins open", "1 chair free", "2 chairs free", "Next slot soon"][seed % 4];
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
