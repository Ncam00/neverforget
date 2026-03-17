import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const GOLD = '#C4A000';

export default function AddTaskScreen({ navigation, route }) {
  const { onAdd } = route.params;
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [reminderTime, setReminderTime] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());

  function formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  function formatDisplay(date) {
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  }

  function handleTimeChange(event, selected) {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) {
      setPickerDate(selected);
      setReminderTime(formatTime(selected));
    }
  }

  function handleSave() {
    if (!title.trim()) {
      Alert.alert('Task name required', 'Please enter a task name.');
      return;
    }
    onAdd({ title: title.trim(), note: note.trim(), reminderTime });
    navigation.goBack();
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Task Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="What needs to be done?"
        placeholderTextColor="#555"
        value={title}
        onChangeText={setTitle}
        maxLength={80}
        autoFocus
      />

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={[styles.input, styles.noteInput]}
        placeholder="Add details..."
        placeholderTextColor="#555"
        value={note}
        onChangeText={setNote}
        multiline
        maxLength={200}
      />

      <Text style={styles.label}>Reminder Time (optional)</Text>
      <View style={styles.timeRow}>
        <TouchableOpacity
          style={styles.timeBtn}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.timeBtnText}>
            {reminderTime
              ? `⏰ ${formatDisplay(pickerDate)}`
              : '+ Set a reminder time'}
          </Text>
        </TouchableOpacity>
        {reminderTime && (
          <TouchableOpacity
            onPress={() => setReminderTime(null)}
            style={styles.clearBtn}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showPicker && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
          themeVariant="dark"
        />
      )}

      <View style={styles.hint}>
        <Text style={styles.hintText}>
          🐘 Incomplete tasks automatically carry over to the next day with a
          reminder.
        </Text>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Add Task</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    color: '#FFF',
    padding: 14,
    fontSize: 16,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeBtn: {
    flex: 1,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 10,
    padding: 14,
  },
  timeBtnText: {
    color: GOLD,
    fontSize: 15,
  },
  clearBtn: {
    padding: 10,
  },
  clearText: {
    color: '#555',
    fontSize: 18,
  },
  hint: {
    marginTop: 24,
    backgroundColor: '#0D0D00',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2A2000',
    padding: 14,
  },
  hintText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
  saveBtn: {
    marginTop: 30,
    backgroundColor: GOLD,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
