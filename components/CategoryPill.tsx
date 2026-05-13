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
  // Upper glow shadow layer (Figma: rgba(43,52,69,0.5), y=-20, r=30)
  pillGlow: {
    shadowColor: '#2b3445',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 0,
  },
  pill: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Figma stroke: 1pt white→black @ 60% OVERLAY — approximate with hairline white edge.
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 10,
  },
  // Inactive pill — gradient fill matching Figma (#353f54→#222834), no flat bg color
  pillInactive: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 5,
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
