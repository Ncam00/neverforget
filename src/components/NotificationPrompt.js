import React, { useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
} from 'react-native';
import { ThemeContext } from '../../App';

export default function NotificationPrompt({ visible, onAllow, onSkip }) {
  const theme = useContext(ThemeContext);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.primary + '40' }]}>
          {/* Icon */}
          <View style={[styles.iconCircle, { borderColor: theme.primary + '30', backgroundColor: theme.primary + '10' }]}>
            <Text style={styles.iconText}>🔔</Text>
          </View>

          <Text style={[styles.title, { color: theme.primary }]}>Stay on track</Text>

          <Text style={[styles.body, { color: theme.text }]}>
            NeverForget uses notifications to:
          </Text>

          <View style={styles.bullets}>
            {[
              '⏰  Remind you of tasks at your chosen time',
              '🐘  Alert you when tasks carry over',
              '🎯  Send a gentle follow-up if you miss one',
            ].map((line, i) => (
              <Text key={i} style={[styles.bullet, { color: theme.subtext }]}>{line}</Text>
            ))}
          </View>

          <Text style={[styles.note, { color: theme.subtext }]}>
            You can change this any time in Settings.
          </Text>

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.allowBtn, { backgroundColor: theme.primary }]}
            onPress={onAllow}
            activeOpacity={0.85}
          >
            <Text style={styles.allowText}>Allow Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={[styles.skipText, { color: theme.subtext }]}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  card: {
    borderRadius: 20, borderWidth: 1, padding: 28,
    alignItems: 'center', width: '100%', maxWidth: 380, gap: 12,
  },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  iconText: { fontSize: 36 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  body: { fontSize: 15, textAlign: 'center' },
  bullets: { alignSelf: 'stretch', gap: 8 },
  bullet: { fontSize: 14, lineHeight: 20 },
  note: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  allowBtn: {
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    alignSelf: 'stretch', marginTop: 8,
  },
  allowText: { color: '#000', fontWeight: '800', fontSize: 16 },
  skipBtn: { paddingVertical: 8 },
  skipText: { fontSize: 14 },
});
