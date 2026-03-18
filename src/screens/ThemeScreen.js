import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
} from 'react-native';
import { ThemeContext, ThemeUpdateContext } from '../../App';
import { THEMES } from '../utils/themes';

export default function ThemeScreen({ navigation }) {
  const theme = useContext(ThemeContext);
  const updateTheme = useContext(ThemeUpdateContext);

  async function handleSelect(id) {
    await updateTheme(id);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.heading, { color: theme.primary }]}>Choose Your Theme</Text>
        <Text style={[styles.sub, { color: theme.subtext }]}>
          Pick the vibe that matches your energy
        </Text>

        {Object.values(THEMES).map((t) => {
          const isActive = theme.id === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => handleSelect(t.id)}
              style={[
                styles.card,
                { backgroundColor: t.card, borderColor: isActive ? t.primary : t.border },
                isActive && { borderWidth: 2 },
              ]}
              activeOpacity={0.85}
            >
              {/* Preview swatch */}
              <View style={[styles.swatch, { backgroundColor: t.bg, borderColor: t.border }]}>
                <View style={[styles.swatchPrimary, { backgroundColor: t.primary }]} />
                <View style={[styles.swatchCard, { backgroundColor: t.card, borderColor: t.border }]}>
                  <View style={[styles.swatchLine, { backgroundColor: t.text }]} />
                  <View style={[styles.swatchLine, { backgroundColor: t.subtext, width: '60%' }]} />
                </View>
              </View>

              {/* Info */}
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={{ fontSize: 20 }}>{t.emoji}</Text>
                  <Text style={[styles.name, { color: t.primary }]}>{t.name}</Text>
                  {isActive && (
                    <View style={[styles.activeBadge, { backgroundColor: t.primary }]}>
                      <Text style={{ color: '#000', fontSize: 11, fontWeight: '700' }}>ACTIVE</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.desc, { color: t.subtext }]}>{t.description}</Text>

                {/* Color dots */}
                <View style={styles.dots}>
                  <View style={[styles.dot, { backgroundColor: t.bg, borderColor: t.border, borderWidth: 1 }]} />
                  <View style={[styles.dot, { backgroundColor: t.primary }]} />
                  <View style={[styles.dot, { backgroundColor: t.card, borderColor: t.border, borderWidth: 1 }]} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  sub: { fontSize: 14, marginBottom: 24 },
  card: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 16,
    borderWidth: 1, padding: 16, marginBottom: 14, gap: 16,
  },
  swatch: {
    width: 72, height: 72, borderRadius: 12, borderWidth: 1,
    padding: 8, justifyContent: 'space-between',
  },
  swatchPrimary: { height: 6, borderRadius: 3, width: '60%' },
  swatchCard: { borderRadius: 6, borderWidth: 1, padding: 6, gap: 4 },
  swatchLine: { height: 4, borderRadius: 2 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '800' },
  activeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  desc: { fontSize: 13, marginBottom: 10 },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 16, height: 16, borderRadius: 8 },
});
