import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  barbers,
  barbershops,
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
  type GroomingPreference,
  type PaymentMethod,
  type Service,
  type ServiceAddOn
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

  const bookingTotal = selectedService.price + selectedAddOns.reduce((total, addOn) => total + addOn.price, 0);
  const bookingId = useMemo(() => `#BBX${String(bookings.length + 12345).padStart(5, "0")}`, [bookings.length]);

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
      status: "Confirmed",
      addOns: selectedAddOns.map((addOn) => addOn.label),
      preference: selectedPreference.label,
      paymentMethod: selectedPaymentMethod.detail,
      note: appointmentNote.trim() || undefined,
      address: selectedShop.address,
      total: bookingTotal
    };
    setBookings((current) => [nextBooking, ...current]);
    setLastConfirmation(nextBooking);
    setAppointmentNote("");
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
