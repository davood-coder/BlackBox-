import { useEffect, useState } from "react";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BarberBottomNav, Screen } from "../../components/ui";
import { services } from "../../data";
import { useBooking } from "../../state/BookingContext";
import { colors, fonts, radius } from "../../theme";

type HubTab = "Services" | "Payments" | "Shop";
type FeatherName = ComponentProps<typeof Feather>["name"];

const hubTabs: Array<{ key: HubTab; label: string; icon: FeatherName; summary: string }> = [
  { key: "Services", label: "Services", icon: "scissors", summary: "Menu" },
  { key: "Payments", label: "Payments", icon: "credit-card", summary: "Payouts" },
  { key: "Shop", label: "Shop", icon: "home", summary: "Profile" }
];

export default function BusinessHub({ navigation }: any) {
  const [tab, setTab] = useState<HubTab>("Services");
  const { setWorkspace } = useBooking();

  useEffect(() => setWorkspace("Barber"), [setWorkspace]);

  return (
    <View style={styles.root}>
      <Screen scroll bottomInset>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Business workspace</Text>
            <Text style={styles.title}>Manage your shop</Text>
          </View>
          <Pressable accessibilityLabel="Settings" style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
            <Feather name="settings" size={19} color={colors.text} />
          </Pressable>
        </View>

        <View accessibilityRole="tablist" style={styles.tabRail}>
          {hubTabs.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                key={item.key}
                onPress={() => setTab(item.key)}
                style={({ pressed }) => [styles.tabOption, active && styles.tabOptionActive, pressed && styles.pressed]}
              >
                <View style={[styles.tabIcon, active && styles.tabIconActive]}>
                  <Feather name={item.icon} size={16} color={active ? colors.black : colors.primaryDark} />
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>{item.label}</Text>
                <Text style={[styles.tabSummary, active && styles.tabSummaryActive]} numberOfLines={1}>{item.summary}</Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "Services" ? <ServicesPanel /> : null}
        {tab === "Payments" ? <PaymentsPanel /> : null}
        {tab === "Shop" ? <ShopPanel navigation={navigation} /> : null}
      </Screen>
      <BarberBottomNav active="Business" navigation={navigation} />
    </View>
  );
}

function ServicesPanel() {
  const [enabledIds, setEnabledIds] = useState(services.map((service) => service.id));
  const [showForm, setShowForm] = useState(false);
  const [customServices, setCustomServices] = useState<Array<{ id: string; label: string; price: number; duration: string }>>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  function addService() {
    if (!name.trim() || !price.trim()) return;
    setCustomServices((current) => [
      ...current,
      { id: `custom-${Date.now()}`, label: name.trim(), price: Number(price) || 0, duration: duration.trim() || "30 min" }
    ]);
    setName("");
    setPrice("");
    setDuration("");
    setShowForm(false);
  }

  return (
    <View>
      <PanelHeader
        action={showForm ? "Close" : "Add service"}
        copy={`${enabledIds.length + customServices.length} services live`}
        onAction={() => setShowForm((value) => !value)}
        title="Service menu"
      />
      {showForm ? (
        <View style={styles.form}>
          <TextInput value={name} onChangeText={setName} placeholder="Service name" placeholderTextColor={colors.muted} style={styles.input} />
          <View style={styles.formRow}>
            <TextInput value={price} onChangeText={setPrice} placeholder="Price" placeholderTextColor={colors.muted} keyboardType="numeric" style={[styles.input, styles.halfInput]} />
            <TextInput value={duration} onChangeText={setDuration} placeholder="Duration" placeholderTextColor={colors.muted} style={[styles.input, styles.halfInput]} />
          </View>
          <Pressable onPress={addService} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}><Text style={styles.saveText}>Save service</Text></Pressable>
        </View>
      ) : null}
      <View style={styles.serviceList}>
        {[...services, ...customServices.map((service) => ({ ...service, icon: "scissors", description: "Custom shop service" }))].map((service) => {
          const custom = service.id.startsWith("custom-");
          const enabled = custom || enabledIds.includes(service.id);
          return (
            <View key={service.id} style={styles.serviceRow}>
              <View style={styles.serviceIcon}><Feather name={service.icon as FeatherName} size={17} color={colors.primaryDark} /></View>
              <View style={styles.serviceCopy}>
                <Text style={styles.serviceName} numberOfLines={1}>{service.label}</Text>
                <Text style={styles.serviceMeta}>${service.price} - {service.duration}</Text>
              </View>
              <View style={styles.serviceActions}>
                <Pressable accessibilityLabel={`Edit ${service.label}`} style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}>
                  <Feather name="edit-2" size={15} color={colors.secondaryText} />
                </Pressable>
                <Switch
                  value={enabled}
                  disabled={custom}
                  onValueChange={() => setEnabledIds((current) => current.includes(service.id) ? current.filter((id) => id !== service.id) : [...current, service.id])}
                  trackColor={{ false: "#DADCD7", true: "#E7CE9B" }}
                  thumbColor={enabled ? colors.primaryDark : colors.muted}
                />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PaymentsPanel() {
  const [message, setMessage] = useState("");
  return (
    <View>
      <PanelHeader title="Payments" copy="Payouts and collected revenue" />
      <View style={styles.payoutHero}>
        <View style={styles.payoutCopy}>
          <Text style={styles.payoutLabel}>Available balance</Text>
          <Text style={styles.payoutValue}>$9,420</Text>
          <Text style={styles.payoutMeta}>Today collected $680</Text>
        </View>
        <View style={styles.readyBadge}>
          <Feather name="check-circle" size={14} color={colors.success} />
          <Text style={styles.readyText}>Ready</Text>
        </View>
      </View>
      <View style={styles.metricGrid}>
        <BusinessMetric label="This week" value="$4,240" change="+8%" />
        <BusinessMetric label="Avg ticket" value="$48" change="+$4" />
      </View>
      <Pressable onPress={() => setMessage("Withdrawal request sent to your verified account.")} style={({ pressed }) => [styles.withdrawButton, pressed && styles.pressed]}>
        <Feather name="arrow-down-circle" size={18} color={colors.black} />
        <Text style={styles.withdrawText}>Withdraw earnings</Text>
      </Pressable>
      {message ? <Text style={styles.successMessage}>{message}</Text> : null}
    </View>
  );
}

function ShopPanel({ navigation }: { navigation: any }) {
  const [open, setOpen] = useState(true);
  return (
    <View>
      <PanelHeader title="Shop profile" copy="Availability and public details" />
      <View style={styles.shopHero}>
        <View style={styles.shopHeroCopy}>
          <Text style={styles.shopEyebrow}>Public profile</Text>
          <Text style={styles.shopName} numberOfLines={1}>Black Box Barbershop</Text>
          <Text style={styles.shopAddress} numberOfLines={1}>123 Main Street, New York</Text>
        </View>
        <View style={[styles.shopStatus, !open && styles.shopStatusClosed]}>
          <Text style={[styles.shopStatusText, !open && styles.shopStatusTextClosed]}>{open ? "Open" : "Closed"}</Text>
        </View>
      </View>
      <SettingRow icon="power" title="Accepting bookings" copy="Customers can request open slots" value={open} onChange={setOpen} />
      <View style={styles.shopActions}>
        <Pressable onPress={() => navigation.navigate("QRScanner")} style={({ pressed }) => [styles.shopAction, pressed && styles.pressed]}>
          <Feather name="maximize" size={19} color={colors.primaryDark} />
          <Text style={styles.shopActionText}>Shop QR code</Text>
          <Feather name="chevron-right" size={18} color={colors.muted} />
        </Pressable>
        {[
          { icon: "map-pin", label: "Address & map" },
          { icon: "clock", label: "Working hours" }
        ].map((item) => (
          <Pressable key={item.label} style={({ pressed }) => [styles.shopAction, pressed && styles.pressed]}>
            <Feather name={item.icon as FeatherName} size={19} color={colors.primaryDark} />
            <Text style={styles.shopActionText}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function PanelHeader({ title, copy, action, onAction }: { title: string; copy: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.panelHeader}>
      <View style={styles.panelCopy}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelBody}>{copy}</Text>
      </View>
      {action ? (
        <Pressable onPress={onAction} style={({ pressed }) => [styles.panelAction, pressed && styles.pressed]}>
          <Text style={styles.panelActionText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function BusinessMetric({ label, value, change }: { label: string; value: string; change: string }) {
  return (
    <View style={styles.businessMetric}>
      <Text style={styles.businessMetricLabel}>{label}</Text>
      <Text style={styles.businessMetricValue}>{value}</Text>
      <Text style={styles.businessMetricChange}>{change}</Text>
    </View>
  );
}

function SettingRow({ icon, title, copy, value, onChange }: { icon: FeatherName; title: string; copy: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}><Feather name={icon} size={17} color={colors.primaryDark} /></View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingBody}>{copy}</Text>
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: "#DADCD7", true: "#E7CE9B" }} thumbColor={value ? colors.primaryDark : colors.muted} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 72, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14 },
  headerCopy: { flex: 1, minWidth: 0 },
  eyebrow: { color: colors.primaryDark, fontFamily: fonts.semibold, fontSize: 9, textTransform: "uppercase" },
  title: { color: colors.text, fontFamily: fonts.headingHeavy, fontSize: 24, marginTop: 4 },
  iconButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  tabRail: { minHeight: 86, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, padding: 6, flexDirection: "row", gap: 6, marginBottom: 20 },
  tabOption: { flex: 1, minWidth: 0, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: 6, paddingVertical: 8 },
  tabOptionActive: { backgroundColor: colors.black },
  tabIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft, marginBottom: 6 },
  tabIconActive: { backgroundColor: colors.primary },
  tabLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 11 },
  tabLabelActive: { color: colors.white },
  tabSummary: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 9, marginTop: 2 },
  tabSummaryActive: { color: "#C8CAC5" },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 },
  panelCopy: { flex: 1, minWidth: 0 },
  panelTitle: { color: colors.text, fontFamily: fonts.headingSemi, fontSize: 19 },
  panelBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 11, marginTop: 4 },
  panelAction: { minHeight: 38, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 13 },
  panelActionText: { color: colors.black, fontFamily: fonts.bold, fontSize: 10 },
  form: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary, padding: 14, gap: 10, marginBottom: 12 },
  input: { minHeight: 46, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, color: colors.text, fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 12 },
  formRow: { flexDirection: "row", gap: 10 },
  halfInput: { flex: 1 },
  saveButton: { minHeight: 44, borderRadius: radius.full, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" },
  saveText: { color: colors.white, fontFamily: fonts.semibold, fontSize: 11 },
  serviceList: { gap: 10 },
  serviceRow: { minHeight: 70, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  serviceIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  serviceCopy: { flex: 1, minWidth: 0 },
  serviceName: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  serviceMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 10, marginTop: 4 },
  serviceActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  editButton: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.elevated },
  payoutHero: { minHeight: 118, borderRadius: radius.md, backgroundColor: colors.black, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 14, marginBottom: 12 },
  payoutCopy: { flex: 1, minWidth: 0 },
  payoutLabel: { color: "#C4C6C2", fontFamily: fonts.medium, fontSize: 10, textTransform: "uppercase" },
  payoutValue: { color: colors.white, fontFamily: fonts.headingHeavy, fontSize: 32, marginTop: 6 },
  payoutMeta: { color: "#D9DBD7", fontFamily: fonts.body, fontSize: 11, marginTop: 5 },
  readyBadge: { minHeight: 34, borderRadius: radius.full, backgroundColor: "rgba(30,141,91,0.14)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10 },
  readyText: { color: "#75D7A6", fontFamily: fonts.semibold, fontSize: 9 },
  metricGrid: { flexDirection: "row", gap: 10 },
  businessMetric: { flex: 1, minHeight: 96, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 14 },
  businessMetricLabel: { color: colors.secondaryText, fontFamily: fonts.medium, fontSize: 10 },
  businessMetricValue: { color: colors.text, fontFamily: fonts.heading, fontSize: 22, marginTop: 9 },
  businessMetricChange: { color: colors.success, fontFamily: fonts.semibold, fontSize: 9, marginTop: 5 },
  withdrawButton: { minHeight: 50, borderRadius: radius.full, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
  withdrawText: { color: colors.black, fontFamily: fonts.bold, fontSize: 12 },
  successMessage: { color: colors.success, fontFamily: fonts.medium, fontSize: 10, textAlign: "center", marginTop: 10 },
  shopHero: { minHeight: 104, borderRadius: radius.md, backgroundColor: colors.black, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 },
  shopHeroCopy: { flex: 1, minWidth: 0 },
  shopEyebrow: { color: colors.primarySoft, fontFamily: fonts.semibold, fontSize: 9, textTransform: "uppercase" },
  shopName: { color: colors.white, fontFamily: fonts.headingSemi, fontSize: 17, marginTop: 6 },
  shopAddress: { color: "#C3C5C1", fontFamily: fonts.body, fontSize: 9, marginTop: 4 },
  shopStatus: { borderRadius: radius.full, backgroundColor: "rgba(30,141,91,0.18)", paddingHorizontal: 10, paddingVertical: 7 },
  shopStatusClosed: { backgroundColor: "rgba(198,64,70,0.18)" },
  shopStatusText: { color: "#75D7A6", fontFamily: fonts.semibold, fontSize: 9 },
  shopStatusTextClosed: { color: "#F28D91" },
  settingRow: { minHeight: 76, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft },
  settingCopy: { flex: 1, minWidth: 0 },
  settingTitle: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12 },
  settingBody: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 9, marginTop: 4 },
  shopActions: { borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginTop: 10 },
  shopAction: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12 },
  shopActionText: { flex: 1, color: colors.text, fontFamily: fonts.medium, fontSize: 12 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] }
});
