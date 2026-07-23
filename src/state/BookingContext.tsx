import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { barbers, barbershops, bookings as initialBookings, dates, services, timeRanges, times, type Barber, type Barbershop, type Booking, type Service } from "../data";
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
  selectedDate: DateOption;
  setSelectedDate: Dispatch<SetStateAction<DateOption>>;
  selectedTime: string;
  setSelectedTime: Dispatch<SetStateAction<string>>;
  bookingTotal: number;
  bookingId: string;
  lastConfirmation: Booking | null;
  bookings: Booking[];
  confirmBooking: () => Booking;
};

const initialShops = fallbackShops();
const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [availableShops, setAvailableShops] = useState<Barbershop[]>(initialShops);
  const [selectedShop, setSelectedShop] = useState<Barbershop>(initialShops[0] || barbershops[0]);
  const [selectedService, setSelectedService] = useState<Service>(services[0]);
  const [selectedBarber, setSelectedBarber] = useState<Barber>((initialShops[0]?.bestBarbers || barbers)[0]);
  const [selectedDate, setSelectedDate] = useState<DateOption>(dates[0]);
  const [selectedTime, setSelectedTime] = useState<string>(times[2]);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [lastConfirmation, setLastConfirmation] = useState<Booking | null>(null);

  const bookingTotal = selectedService.price;
  const bookingId = useMemo(() => `#BBX${String(bookings.length + 12345).padStart(5, "0")}`, [bookings.length]);

  function confirmBooking() {
    const id = bookingId;
    const nextBooking: Booking = {
      id,
      date: `${selectedDate.full} ${timeRanges[selectedTime] || selectedTime}`,
      shop: selectedShop.name,
      service: selectedService.label,
      status: "Confirmed",
      address: selectedShop.address,
      total: bookingTotal
    };
    setBookings((current) => [nextBooking, ...current]);
    setLastConfirmation(nextBooking);
    return nextBooking;
  }

  const value: BookingContextValue = {
    availableShops,
    setAvailableShops,
    selectedShop,
    setSelectedShop,
    selectedService,
    setSelectedService,
    selectedBarber,
    setSelectedBarber,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    bookingTotal,
    bookingId,
    lastConfirmation,
    bookings,
    confirmBooking
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const value = useContext(BookingContext);
  if (!value) {
    throw new Error("useBooking must be used inside BookingProvider");
  }
  return value;
}
