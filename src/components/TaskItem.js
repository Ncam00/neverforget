import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';

const GOLD = '#C4A000';
const GOLD_DIM = '#7A6500';

export default function TaskItem({ task, onToggle, onDelete }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function handleDelete() {
    Alert.alert('Delete Task', `Remove "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }).start(() => onDelete(task.id));
        },
      },
    ]);
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.checkArea}
        onPress={() => onToggle(task.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.checkbox, task.completed && styles.checkboxDone]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.title, task.completed && styles.titleDone]}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          {task.carriedOver && !task.completed && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🐘 Carried over</Text>
            </View>
          )}
          {task.reminderTime && (
            <Text style={styles.time}>⏰ {task.reminderTime}</Text>
          )}
        </View>
        {task.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {task.note}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  checkArea: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: GOLD,
    borderColor: GOLD,
  },
  checkmark: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  titleDone: {
    color: '#555',
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  badge: {
    backgroundColor: '#2A2000',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: GOLD_DIM,
  },
  badgeText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '600',
  },
  time: {
    color: GOLD_DIM,
    fontSize: 12,
  },
  note: {
    color: '#666',
    fontSize: 13,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
    marginLeft: 8,
  },
  deleteText: {
    color: '#555',
    fontSize: 16,
  },
});
