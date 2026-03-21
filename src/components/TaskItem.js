import React, { useRef, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Alert,
} from 'react-native';
import { ThemeContext } from '../../App';
import { hapticComplete, hapticLight } from '../utils/haptics';

const PRIORITY_COLORS = { high: '#FF4444', medium: '#FFAA00', low: '#44CC88' };
const PRIORITY_LABELS = { high: '🔴 High', medium: '🟡 Medium', low: '🟢 Low' };

export default function TaskItem({ task, onToggle, onDelete, onPin, onArchive, onEdit }) {
  const theme = useContext(ThemeContext);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handleToggle() {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.04, useNativeDriver: true, speed: 60, bounciness: 8 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 60 }),
    ]).start();
    if (!task.completed) hapticComplete();
    else hapticLight();
    onToggle(task.id);
  }

  function handleDelete() {
    Alert.alert('Delete Task', `Remove "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true })
            .start(() => onDelete(task.id));
        },
      },
    ]);
  }

  function handleArchive() {
    hapticLight();
    onArchive(task.id);
  }

  function handlePin() {
    hapticLight();
    onPin(task.id);
  }

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();

  const dueDateLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          backgroundColor: theme.card,
          borderColor: task.pinned ? theme.primary : theme.border,
          borderWidth: task.pinned ? 1.5 : 1,
        },
      ]}
    >
      {/* Priority bar on left edge */}
      {task.priority && (
        <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />
      )}

      {/* Checkbox */}
      <TouchableOpacity style={styles.checkArea} onPress={handleToggle} activeOpacity={0.7}>
        <View style={[
          styles.checkbox,
          { borderColor: theme.primary },
          task.completed && { backgroundColor: theme.primary, borderColor: theme.primary },
        ]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          {task.pinned && <Text style={{ color: theme.primary, fontSize: 12, marginRight: 4 }}>📌</Text>}
          <Text
            style={[styles.title, { color: theme.text }, task.completed && styles.titleDone]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
        </View>

        {task.note ? (
          <Text style={[styles.note, { color: theme.subtext }]} numberOfLines={1}>{task.note}</Text>
        ) : null}

        <View style={styles.meta}>
          {task.carriedOver && !task.completed && (
            <View style={[styles.badge, { borderColor: theme.primary + '60' }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>🐘 Carried over</Text>
            </View>
          )}
          {task.reminderTime && (
            <Text style={[styles.metaText, { color: theme.subtext }]}>⏰ {task.reminderTime}</Text>
          )}
          {dueDateLabel && (
            <Text style={[styles.metaText, { color: isOverdue ? '#FF4444' : theme.subtext }]}>
              {isOverdue ? '⚠️ Overdue' : `📅 ${dueDateLabel}`}
            </Text>
          )}
          {task.priority && (
            <Text style={[styles.metaText, { color: PRIORITY_COLORS[task.priority] }]}>
              {PRIORITY_LABELS[task.priority]}
            </Text>
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(task.id)} style={styles.actionBtn}>
            <Text style={{ color: theme.subtext, fontSize: 14 }}>✏️</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handlePin} style={styles.actionBtn}>
          <Text style={{ color: task.pinned ? theme.primary : theme.subtext, fontSize: 14 }}>📌</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleArchive} style={styles.actionBtn}>
          <Text style={{ color: theme.subtext, fontSize: 14 }}>📦</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
          <Text style={{ color: theme.subtext, fontSize: 14 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  priorityBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  checkArea: { marginRight: 10, marginLeft: 6 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#000', fontSize: 13, fontWeight: 'bold' },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '500', flex: 1 },
  titleDone: { textDecorationLine: 'line-through', opacity: 0.45 },
  note: { fontSize: 12, marginTop: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 5, alignItems: 'center' },
  badge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  metaText: { fontSize: 11 },
  actions: { flexDirection: 'column', gap: 2, marginLeft: 6 },
  actionBtn: { padding: 4 },
});
