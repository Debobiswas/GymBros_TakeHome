/**
 * Description / Specification tabs — Figma node 1:183 (Categories).
 *
 * Active (1:184): bg #323B4F, raised shadow −4/−4/10 #38445A + 4/4/10 #252B39,
 *   label Poppins Bold 15pt, text gradient ~#3CA4EB → #4286EE (solid midpoint in RN).
 * Inactive (1:186): bg #28303F, inset shadow simulation, label Regular @ white/60%.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FONT } from '../constants/theme';
import type { TabKey } from '../types';

const ACTIVE_BG = '#323b4f';
const INACTIVE_BG = '#28303f';
const RADIUS_PT = 10;

/** Inset neumorphic hint (Figma: inset shadows #364055 / #202633) — RN has no inset shadow. */
function TabInsetShade({ borderRadius }: { borderRadius: number }) {
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { borderRadius, overflow: 'hidden' }]}
    >
      <LinearGradient
        colors={['rgba(54, 64, 85, 0.45)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 0.85 }}
        style={StyleSheet.absoluteFillObject}
      />
      <LinearGradient
        colors={['transparent', 'rgba(32, 38, 51, 0.75)']}
        start={{ x: 0.15, y: 0.15 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
  scale: number;
}

function TabPill({ label, active, onPress, scale }: PillProps) {
  const padH = 20 * scale;
  const padV = 10 * scale;
  const br = RADIUS_PT * scale;
  const fs = 15 * scale;
  const ls = 0.35;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.touch}>
      <View
        style={[
          styles.pill,
          { paddingHorizontal: padH, paddingVertical: padV, borderRadius: br },
          active ? styles.pillRaised : styles.pillRecessed,
          active
            ? {
                shadowOffset: { width: 4 * scale, height: 4 * scale },
                shadowRadius: 10 * scale,
              }
            : null,
        ]}
      >
        {!active ? <TabInsetShade borderRadius={br} /> : null}
        <Text
          style={[
            styles.labelBase,
            {
              fontSize: fs,
              letterSpacing: ls,
            },
            active ? styles.labelActive : styles.labelInactive,
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export interface DetailTabSwitcherProps {
  tab: TabKey;
  onChange: (t: TabKey) => void;
  scale: number;
}

export function DetailTabSwitcher({ tab, onChange, scale }: DetailTabSwitcherProps) {
  return (
    <View style={[styles.row, { paddingHorizontal: 42 * scale, gap: 30 * scale, marginBottom: 27 * scale }]}>
      <TabPill
        label="Description"
        active={tab === 'description'}
        onPress={() => onChange('description')}
        scale={scale}
      />
      <TabPill
        label="Specification"
        active={tab === 'specification'}
        onPress={() => onChange('specification')}
        scale={scale}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  touch: {
    overflow: 'visible',
  },
  pill: {
    overflow: 'visible',
  },
  // Figma 1:184 — raised: light TL + dark BR (approximated with one shadow + hairline highlight)
  pillRaised: {
    backgroundColor: ACTIVE_BG,
    shadowColor: '#252b39',
    shadowOpacity: 1,
    elevation: 6,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
    borderLeftWidth: StyleSheet.hairlineWidth * 2,
    borderTopColor: 'rgba(90, 104, 132, 0.55)',
    borderLeftColor: 'rgba(90, 104, 132, 0.45)',
  },
  pillRecessed: {
    backgroundColor: INACTIVE_BG,
    elevation: 0,
  },
  labelBase: {
    textAlign: 'center',
  },
  // Figma 1:185 — gradient text → solid near midpoint of #3CA4EB / #4286EE
  labelActive: {
    fontFamily: FONT.bold,
    color: '#3b94ec',
  },
  labelInactive: {
    fontFamily: FONT.regular,
    color: 'rgba(255,255,255,0.6)',
  },
});
