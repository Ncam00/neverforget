import React, { useEffect, useRef, useContext } from 'react';
import { Animated, StyleSheet, Text, Dimensions, View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { ThemeContext } from '../../App';

const { width } = Dimensions.get('window');

// Three small running elephant silhouettes in a row
function RunningElephant({ color, size = 48 }) {
  const s = size / 120;
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 240 132">
      <G scale={s} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path
          d="M 20 110 C 20 110 15 92 18 74 C 21 56 35 40 58 34 C 80 28 105 30 125 36 C 148 43 162 58 164 76 C 166 92 158 106 150 114"
          stroke={color} strokeWidth="5"
        />
        <Path
          d="M 58 34 C 46 30 34 24 26 16 C 18 8 17 2 21 0 C 26 -2 33 4 35 12 C 37 20 38 28 46 32"
          stroke={color} strokeWidth="4.5"
        />
        <Path d="M 21 0 C 16 -2 12 2 12 8 C 12 14 17 18 22 14" stroke={color} strokeWidth="4" />
        <Path
          d="M 58 34 C 62 20 70 10 82 6 C 94 2 104 8 106 20 C 108 32 98 42 86 44 C 74 46 62 40 58 34"
          stroke={color} strokeWidth="4"
        />
        <Path d="M 72 100 C 70 110 69 120 70 128" stroke={color} strokeWidth="4.5" />
        <Path d="M 96 104 C 95 114 95 122 96 128" stroke={color} strokeWidth="4.5" />
        <Path d="M 132 106 C 130 116 129 124 130 128" stroke={color} strokeWidth="4.5" />
        <Path d="M 152 100 C 152 110 153 120 154 128" stroke={color} strokeWidth="4.5" />
        <Path d="M 164 76 C 172 74 178 78 180 86 C 182 94 178 102 172 100" stroke={color} strokeWidth="3.5" />
      </G>
    </Svg>
  );
}

export default function ElephantCelebration({ visible }) {
  const theme = useContext(ThemeContext);
  const translateX = useRef(new Animated.Value(-300)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0);
      textOpacity.setValue(0);
      translateX.setValue(-300);
      translateY.setValue(0);
      return;
    }

    // Fade in
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();

    // Bounce across screen
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: width + 300,
        duration: 3000,
        useNativeDriver: true,
      }),
      // Hopping: 6 hops across the screen
      Animated.sequence(
        Array.from({ length: 6 }, () =>
          Animated.sequence([
            Animated.timing(translateY, { toValue: -18, duration: 240, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }),
          ])
        )
      ),
    ]).start(() => {
      Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }).start();
    });

    // Show "All done!" text
    setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start(() => {
        setTimeout(() => {
          Animated.timing(textOpacity, { toValue: 0, duration: 600, useNativeDriver: true }).start();
        }, 2000);
      });
    }, 500);
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="none">
      {/* Elephants running */}
      <Animated.View style={[styles.herd, { opacity, transform: [{ translateX }, { translateY }] }]}>
        <RunningElephant color={theme.primary} size={44} />
        <RunningElephant color={theme.primary + 'BB'} size={38} />
        <RunningElephant color={theme.primary + '77'} size={32} />
      </Animated.View>

      {/* Celebration text */}
      <Animated.Text style={[styles.text, { color: theme.primary, opacity: textOpacity }]}>
        🎉 All tasks complete!
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  herd: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  text: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 10,
    textAlign: 'center',
  },
});
