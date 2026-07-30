import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fonts } from "../../theme";

export default function SplashScreen({ navigation }) {
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true
    }).start();

    const timer = setTimeout(() => {
      navigation.replace("OnboardingOne");
    }, 1900);

    return () => clearTimeout(timer);
  }, [intro, navigation]);

  const animatedStyle: any = {
    opacity: intro,
    transform: [
      {
        translateY: intro.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0]
        })
      },
      {
        scale: intro.interpolate({
          inputRange: [0, 1],
          outputRange: [0.96, 1]
        })
      }
    ]
  };

  return (
    <LinearGradient colors={[colors.mediaBackground, "#121317", colors.mediaBackground]} style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.monogram}>
          <Text style={styles.monogramText}>CX</Text>
        </View>
        <Text style={styles.title}>
          Cutz<Text style={styles.titleAccent}>ix</Text>
        </Text>
      </Animated.View>
      <Animated.Text style={[styles.footer, { opacity: intro }]}>Cutzix</Animated.Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  content: {
    alignItems: "center"
  },
  monogram: {
    width: 108,
    height: 108,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(37,42,53,0.24)",
    marginBottom: 22
  },
  monogramText: {
    color: colors.primary,
    fontFamily: fonts.headingHeavy,
    fontSize: 38
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.heading,
    fontSize: 30
  },
  titleAccent: {
    color: colors.primary,
    fontFamily: fonts.headingSemi
  },
  footer: {
    position: "absolute",
    bottom: 32,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase"
  }
});
