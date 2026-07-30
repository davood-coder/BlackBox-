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

export type ServiceAddOn = {
  id: string;
  label: string;
  icon: string;
  duration: string;
  price: number;
  description: string;
};

export type GroomingPreference = {
  id: string;
  label: string;
  icon: string;
  description: string;
};

export type PaymentMethod = {
  id: string;
  label: string;
  detail: string;
  icon: string;
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
  nextSlot: string;
  availability: string[];
  portfolio: string[];
  languages: string[];
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
  openUntil?: string;
  queue?: string;
  owner?: string;
  status?: "Open" | "Busy" | "Closed";
  averageWait?: string;
  openingHours?: string;
};

export type BookingStatus = "Confirmed" | "Pending" | "Rejected" | "Cancelled" | "Completed";

export type Booking = {
  id?: string;
  date: string;
  shop: string;
  service: string;
  status: BookingStatus;
  barber?: string;
  addOns?: string[];
  preference?: string;
  paymentMethod?: string;
  note?: string;
  address?: string;
  total?: number;
  shopId?: string;
  customer?: string;
  customerPhone?: string;
  appointmentNumber?: string;
  estimatedWait?: string;
  paymentStatus?: "Paid" | "Pending" | "Pay at shop";
};

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "booking" | "payment" | "offer" | "review" | "shop";
  read: boolean;
};

export type Workspace = "Customer" | "Barber";

export type ProfileDetail = {
  label: string;
  value: string;
};

export type TemporaryProfile = {
  name: string;
  email: string;
  phone: string;
  roleLabel: string;
  badge: string;
  headline: string;
  note: string;
  avatar: ImageSourcePropType;
  rewardPoints?: number;
  cadence?: string;
  savedStyles?: number;
  basePayout?: number;
  queueOffset?: number;
  repeatClients?: number;
  details: ProfileDetail[];
};

export const temporaryProfiles: Record<Workspace, TemporaryProfile> = {
  Customer: {
    name: "Michael Johnson",
    email: "michael@email.com",
    phone: "+1 555 019 2834",
    roleLabel: "Customer",
    badge: "Member",
    headline: "Keeps bookings, favorite shops, and grooming preferences together.",
    note: "Booking preferences and saved styles are ready for faster rebooking.",
    avatar: images.masterBarber,
    rewardPoints: 420,
    cadence: "Every 3 weeks",
    savedStyles: 8,
    details: [
      { label: "Home shop", value: "Black Box Barbershop" },
      { label: "Preferred service", value: "Haircut & Beard Trim" },
      { label: "Default payment", value: "Visa **** 4242" }
    ]
  },
  Barber: {
    name: "Daniel Brooks",
    email: "daniel@blackboxbarbershop.com",
    phone: "+1 555 019 2201",
    roleLabel: "Barber",
    badge: "Pro",
    headline: "Manages chair flow, booking requests, services, and shop profile.",
    note: "Shop operations, chair flow, and business tools stay in one place.",
    avatar: images.blackBoxMark,
    basePayout: 680,
    queueOffset: 2,
    repeatClients: 68,
    details: [
      { label: "Shop", value: "Black Box Barbershop" },
      { label: "Role", value: "Owner barber" },
      { label: "Working hours", value: "9:00 AM - 9:00 PM" }
    ]
  }
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

export const serviceAddOns: ServiceAddOn[] = [
  {
    id: "hot-towel",
    label: "Hot Towel Finish",
    icon: "wind",
    duration: "10 min",
    price: 8,
    description: "Steam towel reset with calming aftershave."
  },
  {
    id: "hair-wash",
    label: "Hair Wash",
    icon: "droplet",
    duration: "12 min",
    price: 10,
    description: "Cleanse, condition, and towel dry before styling."
  },
  {
    id: "style-photo",
    label: "Style Match",
    icon: "image",
    duration: "8 min",
    price: 6,
    description: "Match your saved reference with barber guidance."
  },
  {
    id: "home-care",
    label: "Home Care Kit",
    icon: "package",
    duration: "Pickup",
    price: 18,
    description: "Travel pomade, beard oil, and comb bundle."
  }
];

export const groomingPreferences: GroomingPreference[] = [
  {
    id: "consult-first",
    label: "Consult First",
    icon: "message-circle",
    description: "Start with shape, length, and styling advice."
  },
  {
    id: "quiet-chair",
    label: "Quiet Chair",
    icon: "volume-x",
    description: "Keep conversation minimal during the service."
  },
  {
    id: "sensitive-skin",
    label: "Sensitive Skin",
    icon: "shield",
    description: "Use gentle products and avoid strong fragrance."
  },
  {
    id: "occasion-ready",
    label: "Occasion Ready",
    icon: "award",
    description: "Finish with extra polish for an event or shoot."
  }
];

export const paymentMethods: PaymentMethod[] = [
  { id: "card", label: "Card", detail: "Visa **** 4242", icon: "credit-card" },
  { id: "upi", label: "UPI", detail: "michael@okbank", icon: "send" },
  { id: "wallet", label: "Wallet", detail: "Cutzix balance", icon: "smartphone" },
  { id: "shop", label: "Pay at Shop", detail: "Cash or counter card", icon: "briefcase" }
];

export const dates = buildBookingDates();

export const barberHomeStats = [
  { label: "Open Chairs", value: "8", tone: "info" },
  { label: "Avg Wait", value: "18m", tone: "warning" },
  { label: "Top Rated", value: "4.9", tone: "success" }
];

export const homeQuickActions = [
  { label: "Scan QR", icon: "maximize", route: "QRScanner" },
  { label: "Nearby", icon: "map-pin", route: "SelectLocation", params: { nextScreen: "ShopProfile" } },
  { label: "Bookings", icon: "calendar", route: "MyBookings" },
  { label: "Favorites", icon: "heart", route: "Favorites" }
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
    bio: "Richard blends old-school barbering with clean modern finishing, especially for fades and beard lines.",
    nextSlot: "10:00 AM",
    availability: ["Today 10:00", "Today 12:00", "Tomorrow 11:00"],
    portfolio: ["Executive taper", "Razor beard line", "Classic side part"],
    languages: ["English", "Spanish"]
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
    bio: "Marco is a detail-first barber focused on balanced fades, texture, and everyday wearable shapes.",
    nextSlot: "11:00 AM",
    availability: ["Today 11:00", "Today 01:00", "Tomorrow 10:00"],
    portfolio: ["Skin fade", "Textured crop", "Sharp taper"],
    languages: ["English", "Italian"]
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
    bio: "Jayden is known for polished styling, consultation-led cuts, and a refined client experience.",
    nextSlot: "12:00 PM",
    availability: ["Today 12:00", "Today 02:00", "Tomorrow 12:00"],
    portfolio: ["Deluxe finish", "Long hair shape", "Camera-ready styling"],
    languages: ["English", "French"]
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
    bio: "Alex specializes in beard geometry, hot towel finishes, and sharp facial hair details.",
    nextSlot: "01:00 PM",
    availability: ["Today 01:00", "Tomorrow 10:00", "Tomorrow 03:00"],
    portfolio: ["Full beard sculpt", "Straight razor shave", "Neckline detail"],
    languages: ["English"]
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
    bestBarbers: barbers.slice(0, 3),
    openUntil: "9:00 PM",
    queue: "2 chairs free",
    owner: "Daniel Brooks",
    status: "Open",
    averageWait: "12 min",
    openingHours: "9:00 AM - 9:00 PM",
    phone: "+1 555 019 2201"
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
    bestBarbers: [barbers[1], barbers[2], barbers[3]],
    openUntil: "8:30 PM",
    queue: "Next slot soon",
    owner: "Sophia Miller",
    status: "Busy",
    averageWait: "24 min",
    openingHours: "10:00 AM - 8:30 PM",
    phone: "+1 555 019 4482"
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
    bestBarbers: [barbers[2], barbers[0], barbers[3]],
    openUntil: "8:00 PM",
    queue: "Walk-ins open",
    owner: "Aiden Carter",
    status: "Open",
    averageWait: "8 min",
    openingHours: "9:30 AM - 8:00 PM",
    phone: "+1 555 019 7730"
  }
];

export const bookings: Booking[] = [
  {
    id: "#CZX12345",
    date: "Jul 26, 2026 - 12:00 PM",
    shop: "Black Box Barbershop",
    service: "Haircut & Beard Trim",
    barber: "Richard Anderson",
    status: "Confirmed",
    addOns: ["Hot Towel Finish"],
    preference: "Consult First",
    paymentMethod: "Visa **** 4242",
    total: 53,
    shopId: "black-box-barbershop",
    customer: "Michael Johnson",
    customerPhone: "+1 555 019 2834",
    appointmentNumber: "A-104",
    estimatedWait: "12 min",
    paymentStatus: "Paid"
  },
  {
    id: "#CZX12346",
    date: "Jul 29, 2026 - 03:00 PM",
    shop: "The Barber Shop",
    service: "Hair Color",
    barber: "Jayden Malik",
    status: "Pending",
    addOns: ["Style Match"],
    preference: "Occasion Ready",
    paymentMethod: "Pay at Shop",
    total: 61,
    shopId: "the-barber-shop",
    customer: "Noah Williams",
    customerPhone: "+1 555 019 4820",
    appointmentNumber: "P-018",
    estimatedWait: "18 min",
    paymentStatus: "Pay at shop"
  },
  {
    id: "#CZX12344",
    date: "Jul 18, 2026 - 11:00 AM",
    shop: "Good Place",
    service: "Classic Shave",
    barber: "Alex Carter",
    status: "Completed",
    addOns: ["Hot Towel Finish"],
    preference: "Quiet Chair",
    paymentMethod: "Visa **** 4242",
    total: 26,
    shopId: "good-place",
    customer: "Ethan Brown",
    customerPhone: "+1 555 019 6102",
    appointmentNumber: "A-099",
    estimatedWait: "Completed",
    paymentStatus: "Paid"
  }
];

export const appNotifications: AppNotification[] = [
  {
    id: "notification-1",
    title: "Booking accepted",
    body: "Richard confirmed your haircut at Black Box Barbershop.",
    time: "8 min ago",
    type: "booking",
    read: false
  },
  {
    id: "notification-2",
    title: "Appointment reminder",
    body: "Your chair is reserved tomorrow at 12:00 PM.",
    time: "2 hr ago",
    type: "booking",
    read: false
  },
  {
    id: "notification-3",
    title: "Weekend grooming offer",
    body: "Save 15% on Deluxe Grooming at participating shops.",
    time: "Yesterday",
    type: "offer",
    read: true
  },
  {
    id: "notification-4",
    title: "Payment received",
    body: "Your $53 card payment was successful.",
    time: "2 days ago",
    type: "payment",
    read: true
  }
];

export const barberCustomers = [
  { id: "customer-1", name: "Michael Johnson", visits: 14, lastService: "Haircut & Beard Trim", loyalty: "Gold" },
  { id: "customer-2", name: "Noah Williams", visits: 8, lastService: "Hair Color", loyalty: "Regular" },
  { id: "customer-3", name: "Ethan Brown", visits: 5, lastService: "Classic Shave", loyalty: "Regular" }
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

function buildBookingDates() {
  const monthLabels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortWeekdayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const start = new Date();
  start.setHours(12, 0, 0, 0);

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index + 1);
    const day = String(date.getDate()).padStart(2, "0");
    return {
      day,
      label: shortWeekdayLabels[date.getDay()],
      full: `${weekdayLabels[date.getDay()]}, ${monthLabels[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    };
  });
}
