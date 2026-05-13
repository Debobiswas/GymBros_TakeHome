import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT, GRADIENTS, RADIUS } from '../constants/theme';
import type { CategoryKey } from '../types';

type IconComponent = React.ComponentType<{ size: number; color: string }>;

interface CategoryPillProps {
  label: CategoryKey;
  icon?: IconComponent;
  isActive: boolean;
  onPress: (label: CategoryKey) => void;
}

const ICON_SIZE = 28;

export function CategoryPill({ label, icon: Icon, isActive, onPress }: CategoryPillProps) {
  if (isActive) {
    return (
      <View style={styles.pillGlow}>
        <TouchableOpacity onPress={() => onPress(label)} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pill}
          >
            {Icon ? (
              <Icon size={ICON_SIZE} color={COLORS.white} />
            ) : (
              <Text style={styles.labelActive}>{label}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // Inactive pill uses same dark gradient as card backgrounds (Figma: #353f54 → #222834)
  return (
    <View style={styles.pillGlow}>
      <TouchableOpacity onPress={() => onPress(label)} activeOpacity={0.85}>
        <LinearGradient
          colors={['#353f54', '#222834']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.pillInactive}
        >
          {Icon ? (
            <Icon size={ICON_SIZE} color={COLORS.textLo} />
          ) : (
            <Text style={styles.labelInactive}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Upper shadow — Figma: #2b3445 @ 50%, dy=-20, stdDev=30
  pillGlow: {
    shadowColor: '#2b3445',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 0,
  },
  // Active pill — Figma: 48×48, accent gradient, border 0.6 opacity, shadow below
  pill: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 14,
  },
  // Inactive pill — Figma: 50×50, dark gradient, dual shadow (dy=+20 below, dy=-20 above)
  pillInactive: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  labelActive: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.white,
  },
  labelInactive: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.textLo,
  },
});
