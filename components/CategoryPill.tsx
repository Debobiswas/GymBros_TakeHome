import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FIGMA_PRODUCT_CARD, FONT, GRADIENTS, RADIUS } from '../constants/theme';
import type { CategoryKey } from '../types';

type IconComponent = React.ComponentType<{ size: number; color: string }>;

interface CategoryPillProps {
  label: CategoryKey;
  icon?: IconComponent;
  isActive: boolean;
  /** Mountain & Accessory — semi-transparent R166 tint (not solid, not fully clear). */
  frosted?: boolean;
  onPress: (label: CategoryKey) => void;
}

/** Figma Discover 1:38 / Categories 1:46 — 50×50 pills, 28pt icon at 390pt baseline */
const ICON_BASE = 28;

/** Same stops as R166 (`FIGMA_PRODUCT_CARD.r166`), with alpha so canvas bleeds through. */
const UNAVAILABLE_GRADIENT = [
  'rgba(53, 63, 84, 0.5)',
  'rgba(34, 40, 52, 0.5)',
] as const;

export function CategoryPill({ label, icon: Icon, isActive, frosted = false, onPress }: CategoryPillProps) {
  const { width } = useWindowDimensions();
  const scale = width / 390;

  const sx = useMemo(
    () => ({
      up:    20 * scale,
      blur:  30 * scale,
      r:     RADIUS.md * scale,
      icon:  ICON_BASE * scale,
      fs:    13 * scale,
      wAct:  50 * scale,
      hAct:  50 * scale,
      wIn:   50 * scale,
      hIn:   50 * scale,
      iconShY:    3 * scale,
      iconShRad:  4 * scale,
      labelShY:   2 * scale,
      labelShRad: 3 * scale,
    }),
    [scale],
  );

  const glowWrap = {
    shadowColor: '#2b3445' as const,
    shadowOffset: { width: 0, height: -sx.up },
    shadowOpacity: 0.5,
    shadowRadius: sx.blur,
    elevation: 0 as const,
  };

  const dropBelow = {
    shadowColor: FIGMA_PRODUCT_CARD.shadowHex,
    shadowOffset: { width: 0, height: sx.up },
    shadowOpacity: 1,
    shadowRadius: sx.blur,
  };

  const pillSize = {
    width:  isActive ? sx.wAct : sx.wIn,
    height: isActive ? sx.hAct : sx.hIn,
    borderRadius: sx.r,
  };

  const clipStyle = { borderRadius: sx.r, overflow: 'hidden' as const };

  if (isActive) {
    return (
      <View style={glowWrap}>
        <TouchableOpacity onPress={() => onPress(label)} activeOpacity={1}>
          <View style={[pillSize, dropBelow, { elevation: 14 }]}>
            <View style={[StyleSheet.absoluteFillObject, clipStyle]}>
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.pillCenterOverlay} pointerEvents="box-none">
                {Icon ? (
                  <Icon size={sx.icon} color={COLORS.white} />
                ) : (
                  <Text style={[styles.labelActive, { fontSize: sx.fs }]}>{label}</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // Unavailable — semi-transparent pill (R166 hue); background is not opaque, not fully clear
  if (frosted) {
    const inner = Icon ? (
      <Icon size={sx.icon} color="rgba(255,255,255,0.72)" />
    ) : (
      <Text style={[styles.labelUnavailable, { fontSize: sx.fs }]}>{label}</Text>
    );

    return (
      <TouchableOpacity onPress={() => onPress(label)} activeOpacity={1}>
        <View style={[pillSize, clipStyle]} pointerEvents="box-none">
          <LinearGradient
            colors={[...UNAVAILABLE_GRADIENT]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.pillCenterOverlay} pointerEvents="box-none">
            {inner}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const solidIconShadow = {
    shadowColor:   FIGMA_PRODUCT_CARD.shadowHex,
    shadowOffset:  { width: 0, height: sx.iconShY },
    shadowOpacity: 0.65,
    shadowRadius:  sx.iconShRad,
    elevation:     8 as const,
  };

  const solidLabelShadow = {
    textShadowColor:   'rgba(16, 20, 28, 0.65)',
    textShadowOffset:  { width: 0, height: sx.labelShY },
    textShadowRadius:  sx.labelShRad,
  };

  return (
    <View style={glowWrap}>
      <TouchableOpacity onPress={() => onPress(label)} activeOpacity={1}>
        <View style={[pillSize, dropBelow, { elevation: 10 }]}>
          <View style={[StyleSheet.absoluteFillObject, clipStyle]}>
            <LinearGradient
              colors={[FIGMA_PRODUCT_CARD.r166.fill0, FIGMA_PRODUCT_CARD.r166.fill1]}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.pillCenterOverlay} pointerEvents="box-none">
              {Icon ? (
                <View style={[styles.iconCrispWrap, solidIconShadow]}>
                  <Icon size={sx.icon} color={COLORS.white} />
                </View>
              ) : (
                <Text
                  style={[
                    styles.labelAvailable,
                    solidLabelShadow,
                    { fontSize: sx.fs },
                  ]}
                >
                  {label}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  iconCrispWrap: {
    backgroundColor: 'transparent',
  },

  pillCenterOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
  },
  labelActive: {
    fontFamily: FONT.medium,
    color:      COLORS.white,
  },
  labelAvailable: {
    fontFamily: FONT.medium,
    color:      COLORS.white,
  },
  labelUnavailable: {
    fontFamily: FONT.medium,
    color:      'rgba(255,255,255,0.72)',
  },
});
