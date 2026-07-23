# Black Box Barbers

React Native / Expo implementation of the premium barber booking app. The UI is built with native React Native components, shared design tokens, local image assets, and Expo-friendly navigation.

## Flow

Splash -> Onboarding 1 -> Onboarding 2 -> Onboarding 3 -> Login -> OTP -> Select Location -> Home.

From Home:

- Book Appointment -> Nearby Barbers map/search -> Best Barbers -> Barber Profile -> Book Appointment -> Booking Summary -> Booking Confirmed
- Explore Barbers -> selected shop barbers -> Barber Profile -> Reviews or Book Appointment
- Bottom navigation moves between Home, My Bookings, Barbers, and Profile

Selections are shared through `src/state/BookingContext.tsx`, so chosen nearby shop, service, barber, date, and time flow into Booking Summary, Booking Confirmed, and My Bookings.

Nearby barber shops are fetched through device location using `expo-location` and OpenStreetMap Overpass data, with local fallback data when permission or network access is unavailable.

Each screen folder in `src/screens` now contains only the React Native `index.tsx` implementation. The design reference artifacts have been removed from `src` after migration.

## Run

```sh
npm start
```

The local Expo server runs at `http://localhost:8081`.
