import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { AppHeader, BarberBottomNav, Card, Screen } from "../../components/ui";
import { goBackOrNavigate } from "../../navigation/goBack";
import { colors, fonts, radius, getThemeColors } from "../../theme";
import { images } from "../../assets/images";
import { useBooking } from "../../state/BookingContext";

const DAYS_OF_WEEK = [
  { id: "mon", short: "Mon", full: "Monday" },
  { id: "tue", short: "Tue", full: "Tuesday" },
  { id: "wed", short: "Wed", full: "Wednesday" },
  { id: "thu", short: "Thu", full: "Thursday" },
  { id: "fri", short: "Fri", full: "Friday" },
  { id: "sat", short: "Sat", full: "Saturday" },
  { id: "sun", short: "Sun", full: "Sunday" }
];

const TIME_SLOTS = [
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM", "11:00 PM"
];

export default function WorkingHours({ navigation }: any) {
  const { themeMode } = useBooking();
  const isDark = themeMode === "dark";
  const theme = getThemeColors(isDark);
  // General Shop Hours state
  const [shopOpenTime, setShopOpenTime] = useState("09:00 AM");
  const [shopCloseTime, setShopCloseTime] = useState("09:00 PM");
  const [activeDays, setActiveDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
  const [showOpenTimeDropdown, setShowOpenTimeDropdown] = useState(false);
  const [showCloseTimeDropdown, setShowCloseTimeDropdown] = useState(false);

  // Employee Rosters state
  const [employeeHours, setEmployeeHours] = useState([
    { id: "richard-anderson", name: "Richard Anderson", role: "Expert Barber", start: "09:00 AM", end: "06:00 PM", active: true, avatar: images.masterBarber },
    { id: "marco-rossi", name: "Marco Rossi", role: "Fade Specialist", start: "10:00 AM", end: "07:00 PM", active: true, avatar: images.luxuryBarbershop },
    { id: "jayden-malik", name: "Jayden Malik", role: "Styling Expert", start: "09:00 AM", end: "05:00 PM", active: false, avatar: images.masterBarber },
    { id: "alex-carter", name: "Alex Carter", role: "Beard Specialist", start: "11:00 AM", end: "08:00 PM", active: true, avatar: images.luxuryBarbershop }
  ]);

  // Worker Modal state
  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
  const [workerName, setWorkerName] = useState("");
  const [workerRole, setWorkerRole] = useState("");
  const [workerStart, setWorkerStart] = useState("09:00 AM");
  const [workerEnd, setWorkerEnd] = useState("06:00 PM");

  const [savedSuccessBanner, setSavedSuccessBanner] = useState(false);

  function toggleDay(dayId: string) {
    if (activeDays.includes(dayId)) {
      if (activeDays.length === 1) return; // Keep at least 1 open day
      setActiveDays(activeDays.filter((d) => d !== dayId));
    } else {
      setActiveDays([...activeDays, dayId]);
    }
  }

  function handleAddWorker() {
    setEditingWorkerId(null);
    setWorkerName("");
    setWorkerRole("");
    setWorkerStart("09:00 AM");
    setWorkerEnd("06:00 PM");
    setWorkerModalVisible(true);
  }

  function handleEditWorker(emp: typeof employeeHours[number]) {
    setEditingWorkerId(emp.id);
    setWorkerName(emp.name);
    setWorkerRole(emp.role);
    setWorkerStart(emp.start);
    setWorkerEnd(emp.end);
    setWorkerModalVisible(true);
  }

  function handleDeleteWorker(id: string) {
    setEmployeeHours((current) => current.filter((item) => item.id !== id));
  }

  function handleSaveWorker() {
    const nameVal = workerName.trim();
    const roleVal = workerRole.trim();

    if (!nameVal) {
      alert("Please enter worker name");
      return;
    }
    if (!roleVal) {
      alert("Please enter worker role");
      return;
    }

    if (editingWorkerId) {
      setEmployeeHours((current) =>
        current.map((item) =>
          item.id === editingWorkerId
            ? { ...item, name: nameVal, role: roleVal, start: workerStart, end: workerEnd }
            : item
        )
      );
    } else {
      const newWorker = {
        id: `emp-${Date.now()}`,
        name: nameVal,
        role: roleVal,
        start: workerStart,
        end: workerEnd,
        active: true,
        avatar: images.masterBarber
      };
      setEmployeeHours((current) => [...current, newWorker]);
    }

    setWorkerModalVisible(false);
  }

  function handleSaveSchedule() {
    setSavedSuccessBanner(true);
    setTimeout(() => {
      setSavedSuccessBanner(false);
    }, 3000);
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <Screen scroll bottomInset>
        <AppHeader
          title="Working Hours"
          onBack={() => goBackOrNavigate(navigation, "BusinessHub")}
          backVariant="circle"
        />

        {savedSuccessBanner && (
          <View style={styles.toastSuccess}>
            <Ionicons name="checkmark-circle" size={20} color="#2E7D32" />
            <Text style={styles.toastText}>Working hours & roster updated successfully!</Text>
          </View>
        )}

        {/* Hero Info Banner */}
        <Card style={styles.heroCard}>
          <View style={styles.cardPatternDark} />
          <View style={styles.cardPatternGold} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconCircle}>
              <Feather name="clock" size={22} color="#C89A43" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Shop Schedule & Roster</Text>
              <Text style={styles.heroSubtitle}>
                Configure operating hours, weekly work days, and employee shifts.
              </Text>
            </View>
          </View>
        </Card>

        {/* Section 1: Shop Operating Hours */}
        <Card style={[styles.sectionCard, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }, (showOpenTimeDropdown || showCloseTimeDropdown) && { zIndex: 1000 }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconHeadingBox}>
              <Feather name="sun" size={18} color="#C89A43" />
              <Text style={[styles.sectionHeadingTitle, isDark && { color: "#FFFFFF" }]}>Shop Operating Hours</Text>
            </View>
          </View>

          <Text style={[styles.labelTitle, isDark && { color: "#FFFFFF" }]}>Working Days</Text>
          <View style={styles.daysRow}>
            {DAYS_OF_WEEK.map((day) => {
              const isActive = activeDays.includes(day.id);
              return (
                <Pressable
                  key={day.id}
                  onPress={() => toggleDay(day.id)}
                  style={[
                    styles.dayChip,
                    isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" },
                    isActive && (isDark ? { backgroundColor: "#C89A43", borderColor: "#C89A43" } : styles.dayChipActive)
                  ]}
                >
                  <Text style={[
                    styles.dayChipText,
                    isDark && { color: "#8E8E93" },
                    isActive && (isDark ? { color: "#000000", fontFamily: fonts.bold } : styles.dayChipTextActive)
                  ]}>
                    {day.short}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.timingsRow, (showOpenTimeDropdown || showCloseTimeDropdown) && { zIndex: 1000 }]}>
            <View style={[styles.timingCol, showOpenTimeDropdown && { zIndex: 1000 }]}>
              <Text style={[styles.labelTitle, isDark && { color: "#FFFFFF" }]}>Opening Time</Text>
              <Pressable
                onPress={() => {
                  setShowCloseTimeDropdown(false);
                  setShowOpenTimeDropdown(!showOpenTimeDropdown);
                }}
                style={[styles.timeSelectorBtn, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" }]}
              >
                <Feather name="clock" size={16} color="#C89A43" style={{ marginRight: 8 }} />
                <Text style={[styles.timeSelectorText, isDark && { color: "#FFFFFF" }]}>{shopOpenTime}</Text>
                <Feather name={showOpenTimeDropdown ? "chevron-up" : "chevron-down"} size={16} color={isDark ? "#8E8E93" : "#555"} style={{ marginLeft: "auto" }} />
              </Pressable>

              {showOpenTimeDropdown && (
                <View style={[styles.dropdownContainer, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" }]}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = shopOpenTime === slot;
                      return (
                        <Pressable
                          key={slot}
                          onPress={() => {
                            setShopOpenTime(slot);
                            setShowOpenTimeDropdown(false);
                          }}
                          style={[
                            styles.dropdownOption,
                            isDark && { borderBottomColor: "rgba(255,255,255,0.08)" },
                            isSelected && (isDark ? { backgroundColor: "rgba(200,154,67,0.18)" } : styles.dropdownOptionSelectedRow)
                          ]}
                        >
                          <Text style={[
                            styles.dropdownOptionText,
                            isDark && { color: "#FFFFFF" },
                            isSelected && (isDark ? { color: "#C89A43", fontFamily: fonts.bold } : styles.dropdownOptionSelected)
                          ]}>
                            {slot}
                          </Text>
                          {isSelected && <Feather name="check" size={14} color="#C89A43" />}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>

            <View style={[styles.timingCol, showCloseTimeDropdown && { zIndex: 1000 }]}>
              <Text style={[styles.labelTitle, isDark && { color: "#FFFFFF" }]}>Closing Time</Text>
              <Pressable
                onPress={() => {
                  setShowOpenTimeDropdown(false);
                  setShowCloseTimeDropdown(!showCloseTimeDropdown);
                }}
                style={[styles.timeSelectorBtn, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" }]}
              >
                <Feather name="clock" size={16} color="#C89A43" style={{ marginRight: 8 }} />
                <Text style={[styles.timeSelectorText, isDark && { color: "#FFFFFF" }]}>{shopCloseTime}</Text>
                <Feather name={showCloseTimeDropdown ? "chevron-up" : "chevron-down"} size={16} color={isDark ? "#8E8E93" : "#555"} style={{ marginLeft: "auto" }} />
              </Pressable>

              {showCloseTimeDropdown && (
                <View style={[styles.dropdownContainer, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" }]}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = shopCloseTime === slot;
                      return (
                        <Pressable
                          key={slot}
                          onPress={() => {
                            setShopCloseTime(slot);
                            setShowCloseTimeDropdown(false);
                          }}
                          style={[
                            styles.dropdownOption,
                            isDark && { borderBottomColor: "rgba(255,255,255,0.08)" },
                            isSelected && (isDark ? { backgroundColor: "rgba(200,154,67,0.18)" } : styles.dropdownOptionSelectedRow)
                          ]}
                        >
                          <Text style={[
                            styles.dropdownOptionText,
                            isDark && { color: "#FFFFFF" },
                            isSelected && (isDark ? { color: "#C89A43", fontFamily: fonts.bold } : styles.dropdownOptionSelected)
                          ]}>
                            {slot}
                          </Text>
                          {isSelected && <Feather name="check" size={14} color="#C89A43" />}
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </Card>

        {/* Section 2: Employee Rosters & Shifts */}
        <Card style={[styles.sectionCard, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)" }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.iconHeadingBox}>
              <Feather name="users" size={18} color="#C89A43" />
              <Text style={[styles.sectionHeadingTitle, isDark && { color: "#FFFFFF" }]}>Employee Roster & Shifts</Text>
            </View>

            <Pressable
              onPress={handleAddWorker}
              style={({ pressed }) => [
                styles.addWorkerBtn,
                isDark && { backgroundColor: "rgba(200,154,67,0.18)", borderColor: "#C89A43" },
                pressed && styles.pressed
              ]}
            >
              <Feather name="plus" size={16} color="#C89A43" style={{ marginRight: 4 }} />
              <Text style={[styles.addWorkerBtnText, isDark && { color: "#C89A43" }]}>Add Worker</Text>
            </Pressable>
          </View>

          {employeeHours.map((emp) => (
            <Card key={emp.id} style={[styles.employeeCard, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.08)" }]}>
              <View style={styles.empRow}>
                <View style={styles.empAvatarWrapper}>
                  <Image source={emp.avatar} style={styles.empAvatarImg} />
                </View>
                <View style={styles.empDetails}>
                  <Text style={[styles.empNameText, isDark && { color: "#FFFFFF" }]}>{emp.name}</Text>
                  <Text style={[styles.empRoleText, isDark && { color: "#8E8E93" }]}>{emp.role}</Text>
                </View>
                <Switch
                  value={emp.active}
                  onValueChange={(val) => {
                    setEmployeeHours((current) =>
                      current.map((item) => (item.id === emp.id ? { ...item, active: val } : item))
                    );
                  }}
                  trackColor={{ false: isDark ? "#3A3A3C" : "#E0E0E0", true: "#00A896" }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={isDark ? "#3A3A3C" : "#E0E0E0"}
                />
              </View>

              <View style={[styles.divider, isDark && { backgroundColor: "rgba(255,255,255,0.08)" }]} />

              <View style={styles.empBottomRow}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Feather name="clock" size={14} color="#C89A43" style={{ marginRight: 6 }} />
                  <Text style={[styles.shiftTimeText, isDark && { color: "#8E8E93" }]}>
                    {emp.active ? `${emp.start} - ${emp.end}` : "Off-duty"}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <Pressable onPress={() => handleEditWorker(emp)} style={[styles.actionCircleBtn, isDark && { backgroundColor: "#3A3A3C", borderColor: "rgba(255,255,255,0.12)" }]}>
                    <Feather name="edit-3" size={14} color={isDark ? "#FFFFFF" : colors.secondaryText} />
                  </Pressable>

                  <Pressable
                    onPress={() => handleDeleteWorker(emp.id)}
                    style={[styles.actionCircleBtn, isDark ? { backgroundColor: "rgba(255,59,48,0.18)", borderColor: "rgba(255,59,48,0.3)" } : { borderColor: "rgba(198,64,70,0.2)" }]}
                  >
                    <Feather name="trash-2" size={14} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}
        </Card>

        {/* Save Button */}
        <Pressable
          onPress={handleSaveSchedule}
          style={({ pressed }) => [
            styles.saveMainBtn,
            isDark && { backgroundColor: "#C89A43", shadowColor: "#C89A43" },
            pressed && styles.pressed
          ]}
        >
          <Feather name="check" size={18} color={isDark ? "#000000" : colors.white} style={{ marginRight: 8 }} />
          <Text style={[styles.saveMainBtnText, isDark && { color: "#000000" }]}>Save Schedule & Roster</Text>
        </Pressable>
      </Screen>

      <BarberBottomNav active="Business" navigation={navigation} />

      {/* Modal for Adding / Editing Worker */}
      <Modal
        visible={workerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWorkerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setWorkerModalVisible(false)} />
          <View style={[styles.modalContentCard, isDark && { backgroundColor: "#1C1C1E", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1 }]}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleBox}>
                <Feather name="user-check" size={18} color="#C89A43" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitleText, isDark && { color: "#FFFFFF" }]}>
                  {editingWorkerId ? "Edit Worker Shift" : "Add New Worker"}
                </Text>
              </View>
              <Pressable onPress={() => setWorkerModalVisible(false)} style={[styles.modalCloseBtn, isDark && { backgroundColor: "#252528" }]}>
                <Feather name="x" size={16} color={isDark ? "#FFFFFF" : colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <Text style={[styles.inputLabel, isDark && { color: "#FFFFFF" }]}>Worker Name</Text>
              <View style={[styles.inputRow, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" }]}>
                <Feather name="user" size={18} color="#C89A43" style={{ marginRight: 10 }} />
                <TextInput
                  value={workerName}
                  onChangeText={setWorkerName}
                  placeholder="e.g. Richard Anderson"
                  placeholderTextColor={isDark ? "#8E8E93" : colors.muted}
                  style={[styles.textInput, isDark && { color: "#FFFFFF" }]}
                />
              </View>

              <Text style={[styles.inputLabel, isDark && { color: "#FFFFFF" }]}>Role / Specialty</Text>
              <View style={[styles.inputRow, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" }]}>
                <Feather name="briefcase" size={18} color="#C89A43" style={{ marginRight: 10 }} />
                <TextInput
                  value={workerRole}
                  onChangeText={setWorkerRole}
                  placeholder="e.g. Expert Barber"
                  placeholderTextColor={isDark ? "#8E8E93" : colors.muted}
                  style={[styles.textInput, isDark && { color: "#FFFFFF" }]}
                />
              </View>

              <Text style={[styles.inputLabel, isDark && { color: "#FFFFFF" }]}>Shift Start Time</Text>
              <View style={[styles.inputRow, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" }]}>
                <Feather name="clock" size={18} color="#C89A43" style={{ marginRight: 10 }} />
                <TextInput
                  value={workerStart}
                  onChangeText={setWorkerStart}
                  placeholder="e.g. 09:00 AM"
                  placeholderTextColor={isDark ? "#8E8E93" : colors.muted}
                  style={[styles.textInput, isDark && { color: "#FFFFFF" }]}
                />
              </View>

              <Text style={[styles.inputLabel, isDark && { color: "#FFFFFF" }]}>Shift End Time</Text>
              <View style={[styles.inputRow, isDark && { backgroundColor: "#252528", borderColor: "rgba(255,255,255,0.12)" }]}>
                <Feather name="clock" size={18} color="#C89A43" style={{ marginRight: 10 }} />
                <TextInput
                  value={workerEnd}
                  onChangeText={setWorkerEnd}
                  placeholder="e.g. 06:00 PM"
                  placeholderTextColor={isDark ? "#8E8E93" : colors.muted}
                  style={[styles.textInput, isDark && { color: "#FFFFFF" }]}
                />
              </View>

              <View style={styles.modalActionRow}>
                <Pressable
                  onPress={() => setWorkerModalVisible(false)}
                  style={({ pressed }) => [
                    styles.cancelBtn,
                    isDark && { backgroundColor: "#1C1C1E", borderColor: "#C89A43" },
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={[styles.cancelBtnText, isDark && { color: "#C89A43" }]}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveWorker}
                  style={({ pressed }) => [
                    styles.confirmBtn,
                    isDark && { backgroundColor: "#C89A43" },
                    pressed && styles.pressed
                  ]}
                >
                  <Text style={[styles.confirmBtnText, isDark && { color: "#000000" }]}>Save Worker</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }]
  },
  toastSuccess: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#A5D6A7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radius.md,
    marginBottom: 14,
    gap: 8
  },
  toastText: {
    color: "#1B5E20",
    fontFamily: fonts.medium,
    fontSize: 13
  },
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    padding: 20,
    backgroundColor: colors.black,
    marginBottom: 16,
    position: "relative"
  },
  cardPatternDark: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: "rgba(255, 255, 255, 0.03)"
  },
  cardPatternGold: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(200, 154, 67, 0.12)"
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    zIndex: 2
  },
  heroIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(200, 154, 67, 0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(200, 154, 67, 0.3)"
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: 4
  },
  heroSubtitle: {
    color: "#CCCCCC",
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18
  },
  sectionCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  iconHeadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sectionHeadingTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: "#000000"
  },
  labelTitle: {
    fontSize: 14,
    fontFamily: fonts.bold,
    color: "#1C1C1E",
    marginBottom: 10
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18
  },
  dayChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5"
  },
  dayChipActive: {
    backgroundColor: "#946B22",
    borderColor: "#946B22"
  },
  dayChipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.secondaryText
  },
  dayChipTextActive: {
    color: colors.white,
    fontFamily: fonts.bold
  },
  timingsRow: {
    flexDirection: "row",
    gap: 12
  },
  timingCol: {
    flex: 1,
    position: "relative"
  },
  timeSelectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FAF8F5",
    paddingHorizontal: 12
  },
  timeSelectorText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text
  },
  dropdownContainer: {
    position: "absolute",
    top: 78,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    zIndex: 9999,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 30,
    overflow: "hidden"
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F4"
  },
  dropdownOptionSelectedRow: {
    backgroundColor: "#FDF7EC"
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text
  },
  dropdownOptionSelected: {
    color: "#946B22",
    fontFamily: fonts.bold
  },
  addWorkerBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FDF7EC",
    borderWidth: 1,
    borderColor: "#F7E6C8"
  },
  addWorkerBtnText: {
    fontSize: 12,
    fontFamily: fonts.bold,
    color: "#946B22"
  },
  employeeCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FAF9F6",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFECE6"
  },
  empRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  empAvatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D4AF37"
  },
  empAvatarImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  empDetails: {
    flex: 1
  },
  empNameText: {
    fontSize: 15,
    fontFamily: fonts.bold,
    color: colors.text
  },
  empRoleText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.secondaryText,
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: "#EBE8E1",
    marginVertical: 12
  },
  empBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  shiftTimeText: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.secondaryText
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8
  },
  actionCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  saveMainBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#946B22",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#946B22",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  saveMainBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 16
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  modalContentCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },
  modalHeaderTitleBox: {
    flexDirection: "row",
    alignItems: "center"
  },
  modalTitleText: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center"
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: colors.text,
    marginTop: 12,
    marginBottom: 6
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FAF8F5",
    paddingHorizontal: 14
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.body,
    color: colors.text
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 10
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#946B22",
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelBtnText: {
    color: "#946B22",
    fontFamily: fonts.bold,
    fontSize: 14
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#946B22",
    alignItems: "center",
    justifyContent: "center"
  },
  confirmBtnText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 14
  }
});
