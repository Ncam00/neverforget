import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert,
} from 'react-native';
import { ThemeContext } from '../../App';
import { loadArchive, saveArchive } from '../utils/storage';

export default function ArchiveScreen() {
  const theme = useContext(ThemeContext);
  const [archive, setArchive] = useState([]);

  useEffect(() => {
    loadArchive().then(setArchive);
  }, []);

  async function handleDelete(id) {
    Alert.alert('Remove from Archive', 'Permanently delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = archive.filter((t) => t.id !== id);
          setArchive(updated);
          await saveArchive(updated);
        },
      },
    ]);
  }

  async function handleClearAll() {
    Alert.alert('Clear Archive', 'Delete all archived tasks?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          setArchive([]);
          await saveArchive([]);
        },
      },
    ]);
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const PRIORITY_COLORS = { high: '#FF4444', medium: '#FFAA00', low: '#44CC88' };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <FlatList
        data={archive}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          archive.length > 0 ? (
            <View style={styles.headerRow}>
              <Text style={[styles.count, { color: theme.subtext }]}>
                {archive.length} archived task{archive.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity onPress={handleClearAll}>
                <Text style={{ color: '#FF4444', fontSize: 13, fontWeight: '600' }}>Clear All</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {item.priority && (
              <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />
            )}
            <View style={styles.info}>
              <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
              {item.note ? <Text style={[styles.note, { color: theme.subtext }]} numberOfLines={1}>{item.note}</Text> : null}
              <View style={styles.meta}>
                {item.priority && (
                  <Text style={[styles.metaText, { color: PRIORITY_COLORS[item.priority] }]}>
                    {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} priority
                  </Text>
                )}
                <Text style={[styles.metaText, { color: theme.subtext }]}>
                  📦 Archived {formatDate(item.archivedAt)}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
              <Text style={{ color: theme.subtext, fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📦</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Archive is empty</Text>
            <Text style={[styles.emptySubtitle, { color: theme.subtext }]}>
              Tap the 📦 icon on any task to archive it.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: 16, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  count: { fontSize: 13 },
  item: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 12,
    borderWidth: 1, marginBottom: 10, paddingVertical: 12, paddingHorizontal: 12, overflow: 'hidden',
  },
  priorityBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3, borderTopLeftRadius: 12, borderBottomLeftRadius: 12,
  },
  info: { flex: 1, marginLeft: 8 },
  title: { fontSize: 15, fontWeight: '500' },
  note: { fontSize: 12, marginTop: 2 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  metaText: { fontSize: 11 },
  deleteBtn: { padding: 6, marginLeft: 8 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
});
