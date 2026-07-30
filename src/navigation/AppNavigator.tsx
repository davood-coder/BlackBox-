import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  BarberProfile,
  Barbers,
  BookAppointment,
  BookingConfirmed,
  BookingDetails,
  BookingSummary,
  Favorites,
  Home,
  MyBookings,
  QRScanner,
  Reviews,
  SelectLocation,
  ShopProfile
} from "../screens/customerWorkspace";
import { BarberBookings, BarberDashboard, BusinessHub } from "../screens/barberWorkspace";
import {
  Login,
  Notifications,
  OnboardingOne,
  OnboardingThree,
  OnboardingTwo,
  OtpVerification,
  Profile,
  SplashScreen
} from "../screens/shared";
import { colors } from "../theme";

export type RootStackParamList = {
  Splash: undefined;
  OnboardingOne: undefined;
  OnboardingTwo: undefined;
  OnboardingThree: undefined;
  Login: undefined;
  OtpVerification: { role?: "Customer" | "Barber" } | undefined;
  SelectLocation: { nextScreen?: "Barbers" | "BookAppointment" | "ShopProfile" } | undefined;
  Home: undefined;
  BookAppointment: undefined;
  BookingSummary: undefined;
  BookingConfirmed: undefined;
  MyBookings: undefined;
  Barbers: undefined;
  BarberProfile: undefined;
  Reviews: undefined;
  Profile: undefined;
  ShopProfile: undefined;
  QRScanner: undefined;
  Notifications: undefined;
  Favorites: undefined;
  BookingDetails: { bookingId?: string } | undefined;
  BarberDashboard: undefined;
  BarberBookings: undefined;
  BusinessHub: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      id="RootStack"
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: "fade" }} />
      <Stack.Screen name="OnboardingOne" component={OnboardingOne} />
      <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
      <Stack.Screen name="OnboardingThree" component={OnboardingThree} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="OtpVerification" component={OtpVerification} />
      <Stack.Screen name="SelectLocation" component={SelectLocation} />
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="BookAppointment" component={BookAppointment} />
      <Stack.Screen name="BookingSummary" component={BookingSummary} />
      <Stack.Screen name="BookingConfirmed" component={BookingConfirmed} />
      <Stack.Screen name="MyBookings" component={MyBookings} />
      <Stack.Screen name="Barbers" component={Barbers} />
      <Stack.Screen name="BarberProfile" component={BarberProfile} />
      <Stack.Screen name="Reviews" component={Reviews} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="ShopProfile" component={ShopProfile} />
      <Stack.Screen name="QRScanner" component={QRScanner} options={{ animation: "fade" }} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Favorites" component={Favorites} />
      <Stack.Screen name="BookingDetails" component={BookingDetails} />
      <Stack.Screen name="BarberDashboard" component={BarberDashboard} />
      <Stack.Screen name="BarberBookings" component={BarberBookings} />
      <Stack.Screen name="BusinessHub" component={BusinessHub} />
    </Stack.Navigator>
  );
}
