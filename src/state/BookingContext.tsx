import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  barbers,
  barbershops,
  appNotifications,
  bookings as initialBookings,
  dates,
  groomingPreferences,
  paymentMethods,
  services,
  timeRanges,
  times,
  type Barber,
  type Barbershop,
  type Booking,
  type BookingStatus,
  type GroomingPreference,
  type PaymentMethod,
  type Service,
  type ServiceAddOn,
  type AppNotification,
  type Workspace
} from "../data";
import { fallbackShops } from "../services/nearbyBarbers";

type DateOption = (typeof dates)[number];

type BookingContextValue = {
  availableShops: Barbershop[];
  setAvailableShops: Dispatch<SetStateAction<Barbershop[]>>;
  selectedShop: Barbershop;
  setSelectedShop: Dispatch<SetStateAction<Barbershop>>;
  selectedService: Service;
  setSelectedService: Dispatch<SetStateAction<Service>>;
  selectedBarber: Barber;
  setSelectedBarber: Dispatch<SetStateAction<Barber>>;
  selectedAddOns: ServiceAddOn[];
  toggleAddOn: (addOn: ServiceAddOn) => void;
  selectedPreference: GroomingPreference;
  setSelectedPreference: Dispatch<SetStateAction<GroomingPreference>>;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: Dispatch<SetStateAction<PaymentMethod>>;
  appointmentNote: string;
  setAppointmentNote: Dispatch<SetStateAction<string>>;
  selectedDate: DateOption;
  setSelectedDate: Dispatch<SetStateAction<DateOption>>;
  selectedTime: string;
  setSelectedTime: Dispatch<SetStateAction<string>>;
  bookingTotal: number;
  bookingId: string;
  lastConfirmation: Booking | null;
  bookings: Booking[];
  confirmBooking: () => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  workspace: Workspace;
  setWorkspace: Dispatch<SetStateAction<Workspace>>;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  favoriteShopIds: string[];
  toggleFavoriteShop: (shopId: string) => void;
};

const initialShops = fallbackShops();
const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [availableShops, setAvailableShops] = useState<Barbershop[]>(initialShops);
  const [selectedShop, setSelectedShop] = useState<Barbershop>(initialShops[0] || barbershops[0]);
  const [selectedService, setSelectedService] = useState<Service>(services[0]);
  const [selectedBarber, setSelectedBarber] = useState<Barber>((initialShops[0]?.bestBarbers || barbers)[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<ServiceAddOn[]>([]);
  const [selectedPreference, setSelectedPreference] = useState<GroomingPreference>(groomingPreferences[0]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(paymentMethods[0]);
  const [appointmentNote, setAppointmentNote] = useState("");
  const [selectedDate, setSelectedDate] = useState<DateOption>(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string>(times[2]);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [lastConfirmation, setLastConfirmation] = useState<Booking | null>(null);
  const [workspace, setWorkspace] = useState<Workspace>("Customer");
  const [notifications, setNotifications] = useState<AppNotification[]>(appNotifications);
  const [favoriteShopIds, setFavoriteShopIds] = useState<string[]>([barbershops[0].id]);

  const bookingTotal = selectedService.price + selectedAddOns.reduce((total, addOn) => total + addOn.price, 0);
  const bookingId = useMemo(() => `#CZX${String(bookings.length + 12345).padStart(5, "0")}`, [bookings.length]);

  function toggleAddOn(addOn: ServiceAddOn) {
    setSelectedAddOns((current) => {
      if (current.some((item) => item.id === addOn.id)) {
        return current.filter((item) => item.id !== addOn.id);
      }
      return [...current, addOn];
    });
  }

  function confirmBooking() {
    const id = bookingId;
    const nextBooking: Booking = {
      id,
      date: `${selectedDate.full} ${timeRanges[selectedTime] || selectedTime}`,
      shop: selectedShop.name,
      service: selectedService.label,
      barber: selectedBarber.name,
      status: "Pending",
      addOns: selectedAddOns.map((addOn) => addOn.label),
      preference: selectedPreference.label,
      paymentMethod: selectedPaymentMethod.detail,
      note: appointmentNote.trim() || undefined,
      address: selectedShop.address,
      total: bookingTotal,
      shopId: selectedShop.id,
      customer: "Michael Johnson",
      customerPhone: "+1 555 019 2834",
      appointmentNumber: `P-${String(bookings.length + 19).padStart(3, "0")}`,
      estimatedWait: selectedShop.averageWait || "15 min",
      paymentStatus: selectedPaymentMethod.id === "shop" ? "Pay at shop" : "Pending"
    };
    setBookings((current) => [nextBooking, ...current]);
    setLastConfirmation(nextBooking);
    setNotifications((current) => [
      {
        id: `notification-${Date.now()}`,
        title: "Request sent",
        body: `${selectedShop.name} will review your ${selectedService.shortLabel || selectedService.label} request.`,
        time: "Just now",
        type: "booking",
        read: false
      },
      ...current
    ]);
    setAppointmentNote("");
    return nextBooking;
  }

  function updateBookingStatus(bookingId: string, status: BookingStatus) {
    let updatedBooking: Booking | undefined;
    setBookings((current) =>
      current.map((booking) => {
        if (booking.id !== bookingId) return booking;
        updatedBooking = {
          ...booking,
          status,
          paymentStatus: status === "Completed" ? "Paid" : booking.paymentStatus
        };
        return updatedBooking;
      })
    );

    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return;
    const notificationCopy = getStatusNotification(status, booking);
    if (notificationCopy) {
      setNotifications((current) => [
        {
          id: `notification-${Date.now()}`,
          ...notificationCopy,
          time: "Just now",
          type: "booking",
          read: false
        },
        ...current
      ]);
    }
    if (lastConfirmation?.id === bookingId) {
      setLastConfirmation({ ...lastConfirmation, status });
    }
  }

  function markNotificationRead(notificationId: string) {
    setNotifications((current) => current.map((item) => (item.id === notificationId ? { ...item, read: true } : item)));
  }

  function markAllNotificationsRead() {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }

  function toggleFavoriteShop(shopId: string) {
    setFavoriteShopIds((current) => current.includes(shopId) ? current.filter((id) => id !== shopId) : [...current, shopId]);
  }

  const unreadNotificationCount = notifications.filter((item) => !item.read).length;

  const value: BookingContextValue = {
    availableShops,
    setAvailableShops,
    selectedShop,
    setSelectedShop,
    selectedService,
    setSelectedService,
    selectedBarber,
    setSelectedBarber,
    selectedAddOns,
    toggleAddOn,
    selectedPreference,
    setSelectedPreference,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    appointmentNote,
    setAppointmentNote,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    bookingTotal,
    bookingId,
    lastConfirmation,
    bookings,
    confirmBooking,
    updateBookingStatus,
    workspace,
    setWorkspace,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    favoriteShopIds,
    toggleFavoriteShop
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

function getStatusNotification(status: BookingStatus, booking: Booking) {
  if (status === "Confirmed") {
    return {
      title: "Booking accepted",
      body: `${booking.shop} accepted your ${booking.service} request.`
    };
  }
  if (status === "Rejected") {
    return {
      title: "Time not available",
      body: `${booking.shop} could not accept this time. Choose another slot.`
    };
  }
  if (status === "Cancelled") {
    return {
      title: "Booking cancelled",
      body: `Your appointment at ${booking.shop} was cancelled.`
    };
  }
  if (status === "Completed") {
    return {
      title: "Service completed",
      body: `Your visit at ${booking.shop} is complete. Your receipt is ready.`
    };
  }
  return null;
}

export function useBooking() {
  const value = useContext(BookingContext);
  if (!value) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return value;
}
