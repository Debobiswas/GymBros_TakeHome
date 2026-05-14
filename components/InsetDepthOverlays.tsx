/**
 * Fakes an inset / inner shadow on recessed panels (RN has no CSS inset box-shadow).
 * Parent must use `overflow: 'hidden'` + matching border radii so edges clip cleanly.
 */
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { INSET_DEPTH } from '../constants/theme';

interface InsetDepthOverlaysProps {
  /** Match the well’s corner radii (numbers or scaled). */
  style?: StyleProp<ViewStyle>;
}

export function InsetDepthOverlays({ style }: InsetDepthOverlaysProps) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={[INSET_DEPTH.top0, INSET_DEPTH.top1]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.42 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[INSET_DEPTH.bottom0, INSET_DEPTH.bottom1]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0.58 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
