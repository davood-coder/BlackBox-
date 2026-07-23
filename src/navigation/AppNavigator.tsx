import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "../screens/SplashScreen";
import OnboardingOne from "../screens/OnboardingOne";
import OnboardingTwo from "../screens/OnboardingTwo";
import OnboardingThree from "../screens/OnboardingThree";
import Login from "../screens/Login";
import OtpVerification from "../screens/OtpVerification";
import Home from "../screens/Home";
import SelectLocation from "../screens/SelectLocation";
import BookAppointment from "../screens/BookAppointment";
import BookingSummary from "../screens/BookingSummary";
import BookingConfirmed from "../screens/BookingConfirmed";
import MyBookings from "../screens/MyBookings";
import Barbers from "../screens/Barbers";
import BarberProfile from "../screens/BarberProfile";
import Reviews from "../screens/Reviews";
import Profile from "../screens/Profile";
import { colors } from "../theme";

export type RootStackParamList = {
  Splash: undefined;
  OnboardingOne: undefined;
  OnboardingTwo: undefined;
  OnboardingThree: undefined;
  Login: undefined;
  OtpVerification: undefined;
  SelectLocation: { nextScreen?: "Barbers" | "BookAppointment" } | undefined;
  Home: undefined;
  BookAppointment: undefined;
  BookingSummary: undefined;
  BookingConfirmed: undefined;
  MyBookings: undefined;
  Barbers: undefined;
  BarberProfile: undefined;
  Reviews: undefined;
  Profile: undefined;
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
    </Stack.Navigator>
  );
}
