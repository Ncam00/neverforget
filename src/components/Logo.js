import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

// Gold wire-outline elephant silhouette inspired by the reference image
// Single elephant in continuous gold outline style on black
export default function Logo({ size = 120 }) {
  const scale = size / 120;

  return (
    <View style={[styles.container, { width: size, height: size * 0.65 }]}>
      <Svg
        width={size}
        height={size * 0.65}
        viewBox="0 0 240 156"
      >
        <G scale={scale} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Elephant body outline - continuous gold stroke */}
          {/* Main back arch */}
          <Path
            d="M 20 130
               C 20 130 15 110 18 90
               C 21 70 30 55 50 45
               C 70 35 95 30 120 32
               C 145 34 165 38 180 50
               C 195 62 200 75 200 90
               C 200 105 195 118 190 128"
            stroke="#C4A000"
            strokeWidth="4.5"
          />
          {/* Head and trunk */}
          <Path
            d="M 50 45
               C 38 42 28 38 22 30
               C 16 22 15 14 18 8
               C 21 2 30 4 34 10
               C 38 16 36 24 38 30
               C 40 36 44 40 50 45"
            stroke="#C4A000"
            strokeWidth="4.5"
          />
          {/* Trunk curl at bottom */}
          <Path
            d="M 18 8
               C 14 4 10 6 8 12
               C 6 18 10 24 16 22"
            stroke="#C4A000"
            strokeWidth="4"
          />
          {/* Ear */}
          <Path
            d="M 50 45
               C 55 32 60 20 72 16
               C 84 12 95 18 98 30
               C 101 42 92 52 80 55
               C 68 58 55 52 50 45"
            stroke="#C4A000"
            strokeWidth="4"
          />
          {/* Front legs */}
          <Path
            d="M 80 115 C 78 125 76 138 77 148"
            stroke="#C4A000"
            strokeWidth="4.5"
          />
          <Path
            d="M 100 118 C 100 128 100 138 101 148"
            stroke="#C4A000"
            strokeWidth="4.5"
          />
          {/* Hind legs */}
          <Path
            d="M 155 120 C 153 130 151 140 152 148"
            stroke="#C4A000"
            strokeWidth="4.5"
          />
          <Path
            d="M 175 116 C 175 126 176 136 177 148"
            stroke="#C4A000"
            strokeWidth="4.5"
          />
          {/* Tail */}
          <Path
            d="M 200 90 C 208 88 215 92 218 100 C 221 108 216 115 210 112"
            stroke="#C4A000"
            strokeWidth="3.5"
          />
          {/* Tusk */}
          <Path
            d="M 34 10 C 28 6 20 8 16 14 C 12 20 16 28 22 26"
            stroke="#C4A000"
            strokeWidth="3"
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
