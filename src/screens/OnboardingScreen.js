import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../components/Logo';

const { width } = Dimensions.get('window');
const GOLD = '#C4A000';
const BG = '#000';

const SLIDES = [
  {
    icon: null, // uses Logo component
    title: 'Welcome to\nNeverForget',
    subtitle: 'The to-do app with a memory as strong as an elephant.',
    accent: GOLD,
  },
  {
    emoji: '🐘',
    title: 'Tasks carry over\nautomatically',
    subtitle: "Didn't finish today? No problem — incomplete tasks roll into tomorrow so nothing slips through.",
    accent: GOLD,
  },
  {
    emoji: '🎯',
    title: 'Stay focused,\nyour way',
    subtitle: 'Set priorities, due dates, reminders, and choose from 4 beautiful themes to match your style.',
    accent: GOLD,
  },
];

export default function OnboardingScreen({ onDone }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  function goTo(index) {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setCurrent(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  }

  async function finish() {
    await AsyncStorage.setItem('onboarding_done', '1');
    onDone();
  }

  const slide = SLIDES[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      {/* Skip button */}
      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slide content */}
      <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
        {/* Illustration */}
        <View style={styles.illustrationArea}>
          {slide.icon === null ? (
            <Logo size={140} color={GOLD} />
          ) : (
            <Text style={styles.emoji}>{slide.emoji}</Text>
          )}
        </View>

        {/* Text */}
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </Animated.View>

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => goTo(i)}>
              <View style={[
                styles.dot,
                { backgroundColor: i === current ? GOLD : 'rgba(196,160,0,0.3)', width: i === current ? 24 : 8 }
              ]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => isLast ? finish() : goTo(current + 1)}
          activeOpacity={0.85}
        >
          <Text style={styles.nextText}>
            {isLast ? "Let's go 🐘" : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1, backgroundColor: BG, alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 60, paddingHorizontal: 32,
  },
  skipBtn: { alignSelf: 'flex-end', padding: 8 },
  skipText: { color: 'rgba(196,160,0,0.5)', fontSize: 15 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, width: '100%' },
  illustrationArea: {
    width: 180, height: 180, alignItems: 'center', justifyContent: 'center',
    borderRadius: 90, borderWidth: 1, borderColor: 'rgba(196,160,0,0.2)',
    backgroundColor: 'rgba(196,160,0,0.05)', marginBottom: 10,
  },
  emoji: { fontSize: 80 },
  title: {
    fontSize: 32, fontWeight: '800', color: GOLD,
    textAlign: 'center', letterSpacing: 0.5, lineHeight: 40,
  },
  subtitle: {
    fontSize: 16, color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', lineHeight: 24, maxWidth: 320,
  },
  bottom: { width: '100%', alignItems: 'center', gap: 28 },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    backgroundColor: GOLD, borderRadius: 30,
    paddingVertical: 16, paddingHorizontal: 48, width: '100%', alignItems: 'center',
  },
  nextText: { color: '#000', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
