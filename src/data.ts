import type { ImageSourcePropType } from "react-native";
import { images } from "./assets/images";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Service = {
  id: string;
  label: string;
  shortLabel?: string;
  profileLabel?: string;
  icon: string;
  duration: string;
  price: number;
  description: string;
};

export type Barber = {
  id: string;
  name: string;
  role: string;
  rating: string;
  reviews: string;
  experience: string;
  image: ImageSourcePropType;
  specialty: string;
  bio: string;
};

export type Barbershop = {
  id: string;
  name: string;
  distance: string;
  distanceMeters?: number;
  rating: string;
  reviews: string;
  address: string;
  image: ImageSourcePropType;
  coordinates: Coordinates;
  source?: "osm" | "fallback";
  phone?: string;
  website?: string;
  services?: Service[];
  bestBarbers?: Barber[];
};

export type Booking = {
  id?: string;
  date: string;
  shop: string;
  service: string;
  status: "Confirmed" | "Pending" | "Cancelled" | "Completed";
  address?: string;
  total?: number;
};

export const services: Service[] = [
  {
    id: "haircut",
    label: "Haircut & Beard Trim",
    shortLabel: "Haircut",
    profileLabel: "Haircut & Styling",
    icon: "scissors",
    duration: "60 min",
    price: 45,
    description: "Consultation, precision cut, beard shape-up, hot towel finish."
  },
  {
    id: "beard",
    label: "Beard Trim",
    icon: "smile",
    duration: "30 min",
    price: 20,
    description: "Beard sculpting, neckline cleanup, oil treatment."
  },
  {
    id: "shave",
    label: "Classic Shave",
    shortLabel: "Shave",
    icon: "user",
    duration: "30 min",
    price: 18,
    description: "Straight razor shave with warm lather and aftercare."
  },
  {
    id: "color",
    label: "Hair Color",
    icon: "droplet",
    duration: "75 min",
    price: 55,
    description: "Tone refresh, gray blending, or subtle color work."
  },
  {
    id: "fade",
    label: "Skin Fade",
    icon: "trending-up",
    duration: "45 min",
    price: 38,
    description: "Sharp fade, taper, line-up, and finishing style."
  },
  {
    id: "deluxe",
    label: "Deluxe Grooming",
    icon: "award",
    duration: "90 min",
    price: 72,
    description: "Cut, beard, shave, scalp massage, and premium finish."
  }
];

export const dates = [
  { day: "12", label: "FRI", full: "Friday, August 12, 2024" },
  { day: "13", label: "SAT", full: "Saturday, August 13, 2024" },
  { day: "14", label: "SUN", full: "Sunday, August 14, 2024" },
  { day: "15", label: "MON", full: "Monday, August 15, 2024" },
  { day: "16", label: "TUE", full: "Tuesday, August 16, 2024" }
];

export const times = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM"];

export const timeRanges: Record<string, string> = {
  "10:00 AM": "10:00 AM - 11:00 AM",
  "11:00 AM": "11:00 AM - 12:00 PM",
  "12:00 PM": "12:00 PM - 01:00 PM",
  "01:00 PM": "01:00 PM - 02:00 PM"
};

export const barbers: Barber[] = [
  {
    id: "richard-anderson",
    name: "Richard Anderson",
    role: "Expert Barber",
    rating: "4.8",
    reviews: "114",
    experience: "5+ Years Experience",
    image: images.masterBarber,
    specialty: "Precision cuts, beard work, classic styling",
    bio: "Richard blends old-school barbering with clean modern finishing, especially for fades and beard lines."
  },
  {
    id: "marco-rossi",
    name: "Marco Rossi",
    role: "Fade Specialist",
    rating: "4.7",
    reviews: "96",
    experience: "4+ Years Experience",
    image: images.luxuryBarbershop,
    specialty: "Skin fades, tapers, textured crops",
    bio: "Marco is a detail-first barber focused on balanced fades, texture, and everyday wearable shapes."
  },
  {
    id: "jayden-malik",
    name: "Jayden Malik",
    role: "Styling Expert",
    rating: "4.9",
    reviews: "128",
    experience: "6+ Years Experience",
    image: images.masterBarber,
    specialty: "Styling, long hair, deluxe grooming",
    bio: "Jayden is known for polished styling, consultation-led cuts, and a refined client experience."
  },
  {
    id: "alex-carter",
    name: "Alex Carter",
    role: "Beard Specialist",
    rating: "4.6",
    reviews: "87",
    experience: "3+ Years Experience",
    image: images.luxuryBarbershop,
    specialty: "Beard shaping, straight razor shave",
    bio: "Alex specializes in beard geometry, hot towel finishes, and sharp facial hair details."
  }
];

export const barbershops: Barbershop[] = [
  {
    id: "black-box-barbershop",
    name: "Black Box Barbershop",
    distance: "3 km",
    distanceMeters: 3000,
    rating: "4.9",
    reviews: "179",
    address: "123 Main Street, New York, NY 10001",
    image: images.luxuryBarbershop,
    coordinates: { latitude: 40.7484, longitude: -73.9857 },
    source: "fallback",
    services,
    bestBarbers: barbers.slice(0, 3)
  },
  {
    id: "the-barber-shop",
    name: "The Barber Shop",
    distance: "1.7 km",
    distanceMeters: 1700,
    rating: "4.8",
    reviews: "128",
    address: "66 Prince Street, New York, NY 10012",
    image: images.masterBarber,
    coordinates: { latitude: 40.7233, longitude: -73.9973 },
    source: "fallback",
    services,
    bestBarbers: [barbers[1], barbers[2], barbers[3]]
  },
  {
    id: "good-place",
    name: "Good Place",
    distance: "2.3 km",
    distanceMeters: 2300,
    rating: "4.6",
    reviews: "98",
    address: "45 Grand Avenue, New York, NY 10013",
    image: images.luxuryBarbershop,
    coordinates: { latitude: 40.7216, longitude: -74.0048 },
    source: "fallback",
    services,
    bestBarbers: [barbers[2], barbers[0], barbers[3]]
  }
];

export const bookings: Booking[] = [
  { date: "Aug 12, 2024 - 12:00 PM", shop: "Black Box Barbershop", service: "Haircut & Beard Trim", status: "Confirmed" },
  { date: "Aug 18, 2024 - 03:00 PM", shop: "The Barber Shop", service: "Hair Color", status: "Pending" },
  { date: "Aug 25, 2024 - 11:00 AM", shop: "Good Place", service: "Classic Shave", status: "Confirmed" }
];

export const reviews = [
  {
    name: "Michael Johnson",
    age: "2 days ago",
    text: "Amazing service! Richard is the best barber I have ever had.",
    rating: 5
  },
  {
    name: "David Wilson",
    age: "1 week ago",
    text: "Perfect fade and great conversation. Highly recommended!",
    rating: 5
  }
];
