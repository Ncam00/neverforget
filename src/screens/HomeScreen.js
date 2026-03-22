import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  AppState, SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import Logo from '../components/Logo';
import TaskItem from '../components/TaskItem';
import ElephantCelebration from '../components/ElephantCelebration';
import NotificationPrompt from '../components/NotificationPrompt';
import { ThemeContext } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadTasks, saveTasks, carryOverTasks,
  loadArchive, saveArchive, recordCompletion,
} from '../utils/storage';
import {
  registerForNotifications, scheduleTaskNotification,
  scheduleCarryOverNotification, cancelTaskNotification,
} from '../utils/notifications';

export default function HomeScreen({ navigation }) {
  const theme = useContext(ThemeContext);
  const [tasks, setTasks] = useState([]);
  const [notifGranted, setNotifGranted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'low'
  const [focusMode, setFocusMode] = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  const prevAllDone = useRef(false);

  useEffect(() => {
    (async () => {
      const stored = await loadTasks();
      const carried = carryOverTasks(stored);
      setTasks(carried);
      await saveTasks(carried);
      // Show notification prompt only if not yet asked
      const asked = await AsyncStorage.getItem('notif_asked');
      if (!asked) setShowNotifPrompt(true);
    })();
  }, []);

  async function handleNotifAllow() {
    setShowNotifPrompt(false);
    await AsyncStorage.setItem('notif_asked', '1');
    const granted = await registerForNotifications();
    setNotifGranted(granted);
  }

  async function handleNotifSkip() {
    setShowNotifPrompt(false);
    await AsyncStorage.setItem('notif_asked', '1');
  }

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

  useEffect(() => {
    const pending = tasks.filter((t) => !t.completed);
    scheduleCarryOverNotification(pending.length);

    // Trigger elephant celebration when ALL tasks completed
    const hasTasks = tasks.length > 0;
    const allDone = hasTasks && tasks.every((t) => t.completed);
    if (allDone && !prevAllDone.current) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 4500);
    }
    prevAllDone.current = allDone;
  }, [tasks]);

  useFocusEffect(
    useCallback(() => {
      loadTasks().then((stored) => setTasks(carryOverTasks(stored)));
    }, [])
  );

  async function handleAddTask({ title, note, reminderTime, priority, dueDate }) {
    const newTask = {
      id: Date.now().toString(),
      title,
      note,
      reminderTime,
      priority: priority || null,
      dueDate: dueDate || null,
      completed: false,
      carriedOver: false,
      pinned: false,
      archived: false,
      date: new Date().toDateString(),
      completedAt: null,
      notificationId: null,
    };
    let notifId = null;
    if (reminderTime && notifGranted) {
      notifId = await scheduleTaskNotification(newTask);
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
      if (completed) {
        cancelTaskNotification(t.notificationId);
        recordCompletion();
      } else if (t.reminderTime && notifGranted) {
        scheduleTaskNotification(t).then((nid) => {
          setTasks((prev) => prev.map((x) => (x.id === id ? { ...x, notificationId: nid } : x)));
        });
      }
      return { ...t, completed, completedAt: completed ? new Date().toISOString() : null };
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

  async function handlePin(id) {
    const updated = tasks.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t));
    setTasks(updated);
    await saveTasks(updated);
  }

  async function handleEdit(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    navigation.navigate('AddTask', {
      task,
      onAdd: null,
      onEdit: async ({ title, note, reminderTime, priority, dueDate }) => {
        const updated = tasks.map((t) =>
          t.id === id ? { ...t, title, note, reminderTime, priority, dueDate } : t
        );
        setTasks(updated);
        await saveTasks(updated);
      },
    });
  }

  async function handleArchive(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    if (task.notificationId) cancelTaskNotification(task.notificationId);
    const archive = await loadArchive();
    await saveArchive([{ ...task, archived: true, archivedAt: new Date().toISOString() }, ...archive]);
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    await saveTasks(updated);
  }

  // Sort: pinned first, then by priority, then completed last
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedTasks = [...tasks]
    .filter((t) => {
      if (focusMode && t.completed) return false;
      if (filter !== 'all' && t.priority !== filter) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const pa = priorityOrder[a.priority] ?? 3;
      const pb = priorityOrder[b.priority] ?? 3;
      return pa - pb;
    });

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const pinned = tasks.filter((t) => t.pinned && !t.completed);
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {/* Top action bar — outside FlatList so it always stretches full width */}
      <View style={[styles.topBar, { backgroundColor: theme.bg }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Themes')} style={styles.topBtn}>
          <Text style={{ color: theme.primary, fontSize: 22 }}>🎨</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Archive')} style={styles.topBtn}>
          <Text style={{ color: theme.primary, fontSize: 22 }}>📦</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Logo size={90} color={theme.primary} />
              <Text style={[styles.appName, { color: theme.primary }]}>NeverForget</Text>
              <Text style={[styles.date, { color: theme.subtext }]}>{today}</Text>

              {/* Stats row */}
              <View style={[styles.statsRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: theme.primary }]}>{pending.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.subtext }]}>Pending</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: theme.primary }]}>{done.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.subtext }]}>Done</Text>
                </View>
                {pinned.length > 0 && (
                  <>
                    <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                    <View style={styles.stat}>
                      <Text style={[styles.statNum, { color: theme.primary }]}>{pinned.length}</Text>
                      <Text style={[styles.statLabel, { color: theme.subtext }]}>Pinned</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Weekly summary button */}
              <TouchableOpacity
                style={[styles.weeklyBtn, { borderColor: theme.primary + '50' }]}
                onPress={() => navigation.navigate('Weekly')}
              >
                <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '700' }}>
                  📊 Weekly Summary
                </Text>
              </TouchableOpacity>
            </View>

            {/* Filter chips + Focus mode */}
            <View style={styles.filterRow}>
              {[
                { key: 'all', label: 'All' },
                { key: 'high', label: '🔴' },
                { key: 'medium', label: '🟡' },
                { key: 'low', label: '🟢' },
              ].map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[styles.filterChip, { borderColor: filter === f.key ? theme.primary : theme.border, backgroundColor: filter === f.key ? theme.primary + '20' : 'transparent' }]}
                  onPress={() => setFilter(filter === f.key && f.key !== 'all' ? 'all' : f.key)}
                >
                  <Text style={{ color: filter === f.key ? theme.primary : theme.subtext, fontSize: 13, fontWeight: '600' }}>{f.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.filterChip, { borderColor: focusMode ? theme.primary : theme.border, backgroundColor: focusMode ? theme.primary + '20' : 'transparent', marginLeft: 'auto' }]}
                onPress={() => setFocusMode(!focusMode)}
              >
                <Text style={{ color: focusMode ? theme.primary : theme.subtext, fontSize: 13, fontWeight: '600' }}>🎯 Focus</Text>
              </TouchableOpacity>
            </View>

            {/* Carry-over banner */}
            {tasks.some((t) => t.carriedOver && !t.completed) && (
              <View style={[styles.carryBanner, { borderColor: theme.primary + '40' }]}>
                <Text style={[styles.carryText, { color: theme.primary }]}>
                  🐘 Some tasks carried over from yesterday
                </Text>
              </View>
            )}

            {tasks.length > 0 && (
              <Text style={[styles.sectionLabel, { color: theme.subtext }]}>TODAY'S TASKS</Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onPin={handlePin}
            onArchive={handleArchive}
            onEdit={handleEdit}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Logo size={72} color={theme.primary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing to do yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
              An elephant never forgets — add your first task below.
            </Text>
          </View>
        }
        ListFooterComponent={
          done.length > 0 ? (
            <Text style={[styles.doneLabel, { color: theme.subtext }]}>
              ✓ {done.length} completed today
            </Text>
          ) : null
        }
      />

      {/* Elephant celebration animation */}
      <ElephantCelebration visible={showCelebration} />

      {/* Notification permission prompt */}
      <NotificationPrompt
        visible={showNotifPrompt}
        onAllow={handleNotifAllow}
        onSkip={handleNotifSkip}
      />

      {/* Add Task FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
        onPress={() => navigation.navigate('AddTask', { onAdd: handleAddTask })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+ Add Task</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, paddingBottom: 110 },
  topBar: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 8, paddingVertical: 4 },
  topBtn: { padding: 8 },
  header: { alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
  appName: { fontSize: 28, fontWeight: '800', letterSpacing: 3, marginTop: 8, textTransform: 'uppercase' },
  date: { fontSize: 14, marginTop: 4, letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row', marginTop: 18, borderRadius: 14, borderWidth: 1,
    paddingVertical: 14, paddingHorizontal: 24, gap: 24, alignItems: 'center',
  },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 26, fontWeight: '800' },
  statLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  statDivider: { width: 1, height: 36 },
  weeklyBtn: {
    marginTop: 14, paddingVertical: 10, paddingHorizontal: 22,
    borderRadius: 20, borderWidth: 1,
  },
  carryBanner: {
    borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 12,
    alignItems: 'center', backgroundColor: 'rgba(196,160,0,0.05)',
  },
  carryText: { fontSize: 13, fontWeight: '600' },
  sectionLabel: { fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 10, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 50, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  doneLabel: { fontSize: 13, textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  fab: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    borderRadius: 30, paddingVertical: 14, paddingHorizontal: 32,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: '#000', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
