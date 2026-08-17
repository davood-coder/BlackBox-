import { Pressable, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppHeader, Screen } from "../../components/ui";
import type { AppNotification } from "../../data";
import { goBackOrNavigate } from "../../navigation/goBack";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

const notificationIcons: Record<AppNotification["type"], string> = {
  booking: "calendar",
  payment: "credit-card",
  offer: "tag",
  review: "star",
  shop: "message-square"
};

export default function Notifications({ navigation }: any) {
  const { notifications, unreadNotificationCount, markNotificationRead, markAllNotificationsRead, workspace, themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const fallbackRoute = workspace === "Barber" ? "BarberDashboard" : "Home";

  return (
    <Screen scroll>
      <AppHeader
        title="Notifications"
        onBack={() => goBackOrNavigate(navigation, fallbackRoute)}
        right={
          unreadNotificationCount ? (
            <Pressable onPress={markAllNotificationsRead}>
              <Text style={styles.markAll}>Read all</Text>
            </Pressable>
          ) : null
        }
      />
      <View style={styles.summary}>
        <Text style={[styles.summaryTitle, isDark && { color: "#FFFFFF" }]}>{unreadNotificationCount ? `${unreadNotificationCount} new updates` : "You are all caught up"}</Text>
        <Text style={[styles.summaryCopy, isDark && { color: "#8E8E93" }]}>Booking decisions, reminders, payments, and shop messages appear here.</Text>
      </View>
      <View style={styles.list}>
        {notifications.map((notification) => (
          <Pressable
            key={notification.id}
            onPress={() => {
              markNotificationRead(notification.id);
              if (notification.type === "booking") navigation.navigate("MyBookings");
            }}
            style={({ pressed }) => [styles.row, !notification.read && styles.unreadRow, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, !notification.read && styles.unreadIcon]}>
              <Feather name={notificationIcons[notification.type] as any} size={18} color={notification.read ? colors.secondaryText : colors.primaryDark} />
            </View>
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{notification.title}</Text>
                {!notification.read ? <View style={styles.unreadDot} /> : null}
              </View>
              <Text style={styles.body}>{notification.body}</Text>
              <Text style={styles.time}>{notification.time}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  markAll: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 11 },
  summary: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 18 },
  summaryCopy: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, marginTop: 5, maxWidth: 330 },
  list: { paddingTop: 8 },
  row: { minHeight: 96, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 15, flexDirection: "row", gap: 12 },
  unreadRow: { backgroundColor: "#FFFBF3", marginHorizontal: -10, paddingHorizontal: 10, borderRadius: radius.sm },
  iconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated },
  unreadIcon: { backgroundColor: colors.primarySoft },
  copy: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, color: colors.text, fontFamily: fonts.semibold, fontSize: 14 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  body: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 16, lineHeight: 22, marginTop: 5 },
  time: { color: colors.muted, fontFamily: fonts.medium, fontSize: 10, marginTop: 7 },
  pressed: { opacity: 0.76 }
});
