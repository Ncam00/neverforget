import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { ThemeContext } from '../../App';
import { loadWeeklyData, loadTasks } from '../utils/storage';

function getDayLabel(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toDateString());
  }
  return days;
}

function getStreak(weeklyData) {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (weeklyData[d.toDateString()] > 0) streak++;
    else break;
  }
  return streak;
}

export default function WeeklyScreen() {
  const theme = useContext(ThemeContext);
  const [weeklyData, setWeeklyData] = useState({});
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    (async () => {
      const data = await loadWeeklyData();
      setWeeklyData(data);
      const tasks = await loadTasks();
      // Today's rate = only today's tasks (not already-completed-and-gone tasks)
      const todayStr = new Date().toDateString();
      const todayTasks = tasks.filter((t) => t.date === todayStr || t.carriedOver);
      setTotalTasks(todayTasks.length);
      setCompletedTasks(todayTasks.filter((t) => t.completed).length);
    })();
  }, []);

  const last7 = getLast7Days();
  const weekTotal = last7.reduce((sum, d) => sum + (weeklyData[d] || 0), 0);
  const maxBar = Math.max(...last7.map((d) => weeklyData[d] || 0), 1);
  const streak = getStreak(weeklyData);
  const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Summary cards */}
        <View style={styles.cards}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardNum, { color: theme.primary }]}>{weekTotal}</Text>
            <Text style={[styles.cardLabel, { color: theme.subtext }]}>This Week</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardNum, { color: theme.primary }]}>{streak}🔥</Text>
            <Text style={[styles.cardLabel, { color: theme.subtext }]}>Day Streak</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardNum, { color: theme.primary }]}>{rate}%</Text>
            <Text style={[styles.cardLabel, { color: theme.subtext }]}>Today's Rate</Text>
          </View>
        </View>

        {/* Bar chart */}
        <Text style={[styles.sectionTitle, { color: theme.subtext }]}>COMPLETIONS THIS WEEK</Text>
        <View style={[styles.chart, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {last7.map((dateStr) => {
            const count = weeklyData[dateStr] || 0;
            const barH = maxBar > 0 ? Math.max((count / maxBar) * 100, count > 0 ? 8 : 2) : 2;
            const isToday = dateStr === new Date().toDateString();
            const dayLabel = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
            return (
              <View key={dateStr} style={styles.barCol}>
                <Text style={[styles.barCount, { color: count > 0 ? theme.primary : theme.subtext }]}>
                  {count > 0 ? count : ''}
                </Text>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barH,
                        backgroundColor: isToday ? theme.primary : theme.primary + '55',
                        borderColor: isToday ? theme.primary : 'transparent',
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: isToday ? theme.primary : theme.subtext, fontWeight: isToday ? '700' : '400' }]}>
                  {dayLabel}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Recent completions */}
        <Text style={[styles.sectionTitle, { color: theme.subtext }]}>RECENT ACTIVITY</Text>
        {Object.keys(weeklyData).length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={{ color: theme.subtext, fontSize: 14, textAlign: 'center' }}>
              🐘 Complete tasks to see your activity here!
            </Text>
          </View>
        ) : (
          Object.entries(weeklyData)
            .sort((a, b) => new Date(b[0]) - new Date(a[0]))
            .slice(0, 7)
            .map(([date, count]) => (
              <View key={date} style={[styles.activityRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={{ color: theme.text, fontSize: 14 }}>{getDayLabel(date)}</Text>
                <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '700' }}>
                  {count} task{count !== 1 ? 's' : ''} ✓
                </Text>
              </View>
            ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  cards: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  card: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 14, alignItems: 'center' },
  cardNum: { fontSize: 24, fontWeight: '800' },
  cardLabel: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  sectionTitle: { fontSize: 11, letterSpacing: 2, fontWeight: '700', marginBottom: 12 },
  chart: {
    borderRadius: 14, borderWidth: 1, padding: 16,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    height: 160, marginBottom: 24,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barCount: { fontSize: 11, fontWeight: '700' },
  barWrapper: { width: '70%', height: 100, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, borderWidth: 1 },
  barLabel: { fontSize: 11 },
  emptyCard: { borderRadius: 12, borderWidth: 1, padding: 20, alignItems: 'center' },
  activityRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 8,
  },
});
