import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Platform, Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemeContext } from '../../App';

const PRIORITIES = [
  { value: 'high', label: '🔴 High', color: '#FF4444' },
  { value: 'medium', label: '🟡 Medium', color: '#FFAA00' },
  { value: 'low', label: '🟢 Low', color: '#44CC88' },
];

export default function AddTaskScreen({ navigation, route }) {
  const theme = useContext(ThemeContext);
  const { onAdd } = route.params;

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState(null);
  const [reminderTime, setReminderTime] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(new Date());
  const [pickerDate, setPickerDate] = useState(new Date());

  function formatTime(date) {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  function formatTimeDisplay(date) {
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  function formatDateDisplay(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function handleTimeChange(event, selected) {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selected) { setPickerTime(selected); setReminderTime(formatTime(selected)); }
  }

  function handleDateChange(event, selected) {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selected) { setPickerDate(selected); setDueDate(selected.toISOString()); }
  }

  function handleSave() {
    if (!title.trim()) { Alert.alert('Task name required', 'Please enter a task name.'); return; }
    onAdd({ title: title.trim(), note: note.trim(), reminderTime, priority, dueDate });
    navigation.goBack();
  }

  const T = theme;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: T.bg }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.label, { color: T.primary }]}>Task Name *</Text>
      <TextInput
        style={[styles.input, { backgroundColor: T.card, borderColor: T.border, color: T.text }]}
        placeholder="What needs to be done?"
        placeholderTextColor={T.subtext}
        value={title}
        onChangeText={setTitle}
        maxLength={80}
        autoFocus
      />

      <Text style={[styles.label, { color: T.primary }]}>Note (optional)</Text>
      <TextInput
        style={[styles.input, styles.noteInput, { backgroundColor: T.card, borderColor: T.border, color: T.text }]}
        placeholder="Add details..."
        placeholderTextColor={T.subtext}
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={200}
      />

      <Text style={[styles.label, { color: T.primary }]}>Priority</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => (
          <TouchableOpacity
            key={p.value}
            style={[
              styles.priorityBtn,
              { backgroundColor: T.card, borderColor: priority === p.value ? p.color : T.border },
              priority === p.value && { backgroundColor: p.color + '22' },
            ]}
            onPress={() => setPriority(priority === p.value ? null : p.value)}
          >
            <Text style={{ color: priority === p.value ? p.color : T.subtext, fontWeight: '600', fontSize: 13 }}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: T.primary }]}>Due Date (optional)</Text>
      <View style={styles.timeRow}>
        <TouchableOpacity
          style={[styles.timeBtn, { backgroundColor: T.card, borderColor: T.border }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: dueDate ? T.primary : T.subtext, fontSize: 15 }}>
            {dueDate ? `📅 ${formatDateDisplay(pickerDate)}` : '+ Set a due date'}
          </Text>
        </TouchableOpacity>
        {dueDate && (
          <TouchableOpacity onPress={() => setDueDate(null)} style={styles.clearBtn}>
            <Text style={{ color: T.subtext, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          themeVariant="dark"
        />
      )}

      <Text style={[styles.label, { color: T.primary }]}>Reminder Time (optional)</Text>
      <View style={styles.timeRow}>
        <TouchableOpacity
          style={[styles.timeBtn, { backgroundColor: T.card, borderColor: T.border }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={{ color: reminderTime ? T.primary : T.subtext, fontSize: 15 }}>
            {reminderTime ? `⏰ ${formatTimeDisplay(pickerTime)}` : '+ Set a reminder time'}
          </Text>
        </TouchableOpacity>
        {reminderTime && (
          <TouchableOpacity onPress={() => setReminderTime(null)} style={styles.clearBtn}>
            <Text style={{ color: T.subtext, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={pickerTime}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          themeVariant="dark"
        />
      )}

      <View style={[styles.hint, { backgroundColor: T.card, borderColor: T.border }]}>
        <Text style={[styles.hintText, { color: T.subtext }]}>
          🐘 Incomplete tasks carry over to tomorrow automatically.{'\n'}
          Smart follow-up reminders fire 1 hour after your set time.
        </Text>
      </View>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: T.primary }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Add Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 20 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 16 },
  noteInput: { minHeight: 80, textAlignVertical: 'top' },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityBtn: { flex: 1, borderWidth: 1.5, borderRadius: 10, padding: 10, alignItems: 'center' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeBtn: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 14 },
  clearBtn: { padding: 10 },
  hint: { marginTop: 24, borderRadius: 10, borderWidth: 1, padding: 14 },
  hintText: { fontSize: 13, lineHeight: 20 },
  saveBtn: { marginTop: 30, borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
