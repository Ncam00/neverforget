import React, { useState, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import Logo from '../components/Logo';
import { ThemeContext } from '../../App';
import { purchasePro, restorePurchase, PRO_PRICE_LABEL, PRO_FEATURES } from '../utils/purchase';

export default function ProScreen({ navigation, onPurchase }) {
  const theme = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  async function handlePurchase() {
    setLoading(true);
    try {
      const result = await purchasePro();
      if (result.success) {
        onPurchase?.();
        Alert.alert(
          '🐘 Welcome to Pro!',
          'All features are now unlocked. Thank you for supporting NeverForget!',
          [{ text: 'Let\'s go!', onPress: () => navigation.goBack() }]
        );
      }
    } catch (e) {
      Alert.alert('Purchase failed', 'Please try again or contact support.');
    }
    setLoading(false);
  }

  async function handleRestore() {
    setRestoring(true);
    const found = await restorePurchase();
    setRestoring(false);
    if (found) {
      onPurchase?.();
      Alert.alert('Purchase restored! 🎉', 'Pro features are unlocked.', [
        { text: 'Great!', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('No purchase found', 'We couldn\'t find a previous purchase on this account.');
    }
  }

  const GOLD = '#C4A000';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: '#000' }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Logo size={80} color={GOLD} />
          </View>
          <Text style={styles.badge}>PRO</Text>
          <Text style={styles.title}>NeverForget Pro</Text>
          <Text style={styles.subtitle}>
            One payment. Every feature. Forever.
          </Text>
        </View>

        {/* Feature list */}
        <View style={[styles.featureCard, { backgroundColor: '#0D0D0D', borderColor: GOLD + '30' }]}>
          {PRO_FEATURES.map((f, i) => (
            <View key={i} style={[styles.featureRow, i < PRO_FEATURES.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#1A1A1A' }]}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <View style={styles.featureText}>
                <Text style={[styles.featureLabel, { color: '#FFF' }]}>{f.label}</Text>
                <Text style={[styles.featureSub, { color: '#666' }]}>{f.sub}</Text>
              </View>
              <Text style={[styles.check, { color: GOLD }]}>✓</Text>
            </View>
          ))}
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: GOLD }]}>{PRO_PRICE_LABEL}</Text>
          <Text style={[styles.priceNote, { color: '#555' }]}>No subscription · No recurring charges</Text>
        </View>

        {/* Purchase button */}
        <TouchableOpacity
          style={[styles.purchaseBtn, loading && { opacity: 0.7 }]}
          onPress={handlePurchase}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.purchaseBtnText}>Unlock Pro — {PRO_PRICE_LABEL}</Text>
          }
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore} disabled={restoring}>
          {restoring
            ? <ActivityIndicator color={GOLD} size="small" />
            : <Text style={[styles.restoreText, { color: '#555' }]}>Restore previous purchase</Text>
          }
        </TouchableOpacity>

        {/* Fine print */}
        <Text style={styles.finePrint}>
          Payment processed securely via the App Store.{'\n'}
          All features unlocked permanently on this Apple ID.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24, paddingBottom: 48, alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 28, gap: 10 },
  logoCircle: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 1, borderColor: 'rgba(196,160,0,0.3)',
    backgroundColor: 'rgba(196,160,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    backgroundColor: '#C4A000', color: '#000',
    fontSize: 11, fontWeight: '900', letterSpacing: 2,
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6,
  },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: '#888', textAlign: 'center' },
  featureCard: {
    width: '100%', borderRadius: 16, borderWidth: 1,
    overflow: 'hidden', marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 12,
  },
  featureEmoji: { fontSize: 22, width: 30, textAlign: 'center' },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '600' },
  featureSub: { fontSize: 12, marginTop: 1 },
  check: { fontSize: 16, fontWeight: '700' },
  priceRow: { alignItems: 'center', marginBottom: 20, gap: 4 },
  price: { fontSize: 28, fontWeight: '900' },
  priceNote: { fontSize: 13 },
  purchaseBtn: {
    backgroundColor: '#C4A000', borderRadius: 16,
    paddingVertical: 18, width: '100%', alignItems: 'center', marginBottom: 14,
  },
  purchaseBtnText: { color: '#000', fontSize: 17, fontWeight: '900', letterSpacing: 0.3 },
  restoreBtn: { paddingVertical: 10, marginBottom: 24 },
  restoreText: { fontSize: 14 },
  finePrint: {
    fontSize: 11, color: '#333', textAlign: 'center', lineHeight: 18,
  },
});
