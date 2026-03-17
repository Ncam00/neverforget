import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  AppState,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import Logo from '../components/Logo';
import TaskItem from '../components/TaskItem';
import {
  loadTasks,
  saveTasks,
  carryOverTasks,
} from '../utils/storage';
import {
  registerForNotifications,
  scheduleTaskNotification,
  scheduleCarryOverNotification,
  cancelTaskNotification,
} from '../utils/notifications';

const GOLD = '#C4A000';

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [notifGranted, setNotifGranted] = useState(false);

  // Load & carry over tasks on mount
  useEffect(() => {
    (async () => {
      const granted = await registerForNotifications();
      setNotifGranted(granted);
      const stored = await loadTasks();
      const carried = carryOverTasks(stored);
      setTasks(carried);
      await saveTasks(carried);
    })();
  }, []);

  // Re-check when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        const stored = await loadTasks();
        const carried = carryOverTasks(stored);
        setTasks(carried);
        await saveTasks(carried);
      }
    });
    return () => sub.remove();
  }, []);

  // Update carry-over notification whenever tasks change
  useEffect(() => {
    const pending = tasks.filter((t) => !t.completed).length;
    scheduleCarryOverNotification(pending);
  }, [tasks]);

  useFocusEffect(
    useCallback(() => {
      loadTasks().then((stored) => {
        setTasks(carryOverTasks(stored));
      });
    }, [])
  );

  async function handleAddTask({ title, note, reminderTime }) {
    const newTask = {
      id: Date.now().toString(),
      title,
      note,
      reminderTime,
      completed: false,
      carriedOver: false,
      date: new Date().toDateString(),
      notificationId: null,
    };

    let notifId = null;
    if (reminderTime && notifGranted) {
      notifId = await scheduleTaskNotification({ ...newTask });
    }
    newTask.notificationId = notifId;

    const updated = [newTask, ...tasks];
    setTasks(updated);
    await saveTasks(updated);
  }

  async function handleToggle(id) {
    const updated = tasks.map((t) => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      if (completed && t.notificationId) {
        cancelTaskNotification(t.notificationId);
      } else if (!completed && t.reminderTime && notifGranted) {
        scheduleTaskNotification(t).then((nid) => {
          setTasks((prev) =>
            prev.map((x) => (x.id === id ? { ...x, notificationId: nid } : x))
          );
        });
      }
      return { ...t, completed };
    });
    setTasks(updated);
    await saveTasks(updated);
  }

  async function handleDelete(id) {
    const task = tasks.find((t) => t.id === id);
    if (task?.notificationId) cancelTaskNotification(task.notificationId);
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    await saveTasks(updated);
  }

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Logo size={90} />
              <Text style={styles.appName}>NeverForget</Text>
              <Text style={styles.date}>{today}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{pending.length}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{done.length}</Text>
                  <Text style={styles.statLabel}>Done</Text>
                </View>
              </View>
            </View>

            {/* Carry-over warning */}
            {tasks.some((t) => t.carriedOver && !t.completed) && (
              <View style={styles.carryBanner}>
                <Text style={styles.carryText}>
                  🐘 Some tasks carried over from yesterday
                </Text>
              </View>
            )}

            {tasks.length > 0 && (
              <Text style={styles.sectionLabel}>TODAY'S TASKS</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🐘</Text>
            <Text style={styles.emptyTitle}>Nothing to do yet</Text>
            <Text style={styles.emptySubtitle}>
              An elephant never forgets — add your first task below.
            </Text>
          </View>
        }
        ListFooterComponent={
          done.length > 0 ? (
            <Text style={styles.doneLabel}>
              ✓ {done.length} completed today
            </Text>
          ) : null
        }
      />

      {/* Add Task FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('AddTask', { onAdd: handleAddTask })
        }
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+ Add Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  appName: {
    color: GOLD,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 3,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  date: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222',
    paddingVertical: 14,
    paddingHorizontal: 30,
    gap: 30,
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    color: GOLD,
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    color: '#555',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#2A2A2A',
  },
  carryBanner: {
    backgroundColor: '#0D0D00',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A3000',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  carryText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    color: '#333',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  doneLabel: {
    color: '#444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: GOLD,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
