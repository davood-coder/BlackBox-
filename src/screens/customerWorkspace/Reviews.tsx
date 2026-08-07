import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, Card, Screen } from "../../components/ui";
import { images } from "../../assets/images";
import { reviews } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { colors, fonts, radius } from "../../theme";

export default function Reviews({ navigation }) {
  const [filter, setFilter] = useState("All Reviews");

  return (
    <Screen scroll>
      <AppHeader title="Reviews" onBack={() => goBackOrNavigate(navigation, "ShopProfile")} />
      <View style={styles.summary}>
        <View style={styles.scoreBlock}>
          <Text style={styles.score}>4.8</Text>
          <Stars />
          <Text style={styles.count}>(114 Reviews)</Text>
        </View>
        <View style={styles.bars}>
          {[5, 4, 3, 2, 1].map((value, index) => (
            <View key={value} style={styles.barRow}>
              <Text style={styles.barLabel}>{value}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${[74, 46, 24, 10, 4][index]}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.segment}>
        {["All Reviews", "With Photos"].map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)} style={[styles.segmentButton, filter === item && styles.segmentActive]}>
            <Text style={[styles.segmentText, filter === item && styles.segmentTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.list}>
        {reviews.map((review, index) => (
          <Card key={review.name} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image source={index === 0 ? images.masterBarber : images.luxuryBarbershop} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{review.name}</Text>
                <Text style={styles.age}>{review.age}</Text>
              </View>
            </View>
            <Stars size={13} />
            <Text style={styles.reviewText}>{review.text}</Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}

function Stars({ size = 14 }) {
  return (
    <View style={styles.stars}>
      {[0, 1, 2, 3, 4].map((item) => (
        <Ionicons key={item} name="star" size={size} color={colors.primaryLight} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginBottom: 22
  },
  scoreBlock: {
    width: 120
  },
  score: {
    color: colors.text,
    fontFamily: fonts.headingHeavy,
    fontSize: 48,
    lineHeight: 54
  },
  stars: {
    flexDirection: "row",
    gap: 2,
    marginTop: 3
  },
  count: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    marginTop: 6
  },
  bars: {
    flex: 1,
    gap: 10
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  barLabel: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 16,
    width: 10
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.card,
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primaryLight
  },
  segment: {
    height: 54,
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 5,
    marginBottom: 18
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm
  },
  segmentActive: {
    backgroundColor: colors.border
  },
  segmentText: {
    color: colors.secondaryText,
    fontFamily: fonts.medium,
    fontSize: 16
  },
  segmentTextActive: {
    color: colors.text
  },
  list: {
    gap: 14,
    paddingBottom: 24
  },
  reviewCard: {
    gap: 12
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21
  },
  name: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 14
  },
  age: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    marginTop: 2
  },
  reviewText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22
  }
});
