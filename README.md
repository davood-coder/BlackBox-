# Cutzix

Cutzix is a React Native and Expo barber-booking platform with dedicated customer and barber workspaces.

## Customer Workspace

- Discover nearby shops with device location, map data, search, and filters
- Scan a shop QR code with `expo-camera`
- View shop services, pricing, live queue, barbers, ratings, and opening hours
- Save favorite shops and receive booking, payment, reminder, and offer notifications
- Request a service, barber, date, time, add-ons, preferences, and payment method
- Track pending, accepted, rejected, cancelled, and completed appointments
- Open confirmed appointment tickets with QR-style check-in details

## Barber Workspace

- Monitor revenue, requests, accepted bookings, live queue, ratings, and daily schedule
- Accept, decline, cancel, and complete customer booking requests
- Manage services and availability
- Review payments, transactions, customers, loyalty, analytics, and demand trends
- Control shop availability, holiday mode, working hours, employees, and the shop QR

Booking selections, workspace mode, favorites, notifications, and status transitions are shared through `src/state/BookingContext.tsx`. Nearby shop discovery uses `expo-location` with OpenStreetMap data and local fallback shops when location or network access is unavailable.

## Screen Structure

```text
src/screens/
  customerWorkspace/  Customer discovery, shops, barbers, and bookings
  barberWorkspace/    Dashboard, requests, and business operations
  shared/             Onboarding, authentication, profile, and notifications
```

## Run

```sh
npm start
```

For the web workspace:

```sh
npm run web
```

Useful validation commands:

```sh
npm run typecheck
npx expo-doctor
npx expo export --platform web
```
