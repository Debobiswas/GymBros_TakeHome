/**
 * BottomTabBar — Pixel-perfect reconstruction from Figma node 1:146
 *
 * ═══════════════════════════════════════════════════════════════
 * FIGMA DATA ANALYSIS  (nodes 1:146 → 1:148 → 1:149 → TabBar-items)
 * ═══════════════════════════════════════════════════════════════
 *
 *  Icons (all SF Symbol filled paths, no stroke):
 *    1:151 bicycle      27.39 × 17.83
 *    1:155 map.fill     18.53 × 17.38
 *    1:159 cart.fill    20.43 × 17.53
 *    1:163 person.fill  14.85 × 15.89
 *    1:167 doc.text.fill (component 1:21)  15.10 × 19.05
 *
 *  Active pill (Selected Button 1:172 / Rectangle 481 1:173):
 *    Bounding box   60 × 60 pt
 *    Vector path    M 0 12 L 60 0 L 60 48 L 0 60 L 0 12 Z
 *    → vertical left/right sides, slanted top/bottom
 *    → correct CSS transform: skewY(-11.3deg)  [NOT skewX]
 *    → skew angle: atan(12/60) = 11.31°
 *    Gradient fill  #34C8E8 → #4E4AF2  (GRADIENTS.accent ✓)
 *    Stroke         gradient white→black (approximated as semi-white border)
 *    Drop shadow    rgba(16, 20, 28, 0.6)  y=20  radius=30  (dark, NOT cyan)
 *    Corner radius  0  (sharp corners — vector path has no curves)
 *
 *  Background (Rectangle 24, 1:147):
 *    Vector polygon with slanted top-left notch.
 *
 *  Tab slot geometry:
 *    5 tabs × 75 pt each in a 390 pt frame.
 *    Tabs frame: 390 × 49.  HomeIndicator frame: 375 × 34.
 * ═══════════════════════════════════════════════════════════════
 */
import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  BikeIcon,
  MapIcon,
  CartIcon,
  PersonIcon,
  DocIcon,
} from './icons';
import { COLORS, GRADIENTS } from '../constants/theme';

// ── Tab definitions ───────────────────────────────────────────────────────────
export type TabName = 'discover' | 'map' | 'cart' | 'profile' | 'docs';

type TabIcon = React.ComponentType<{ size: number; color: string }>;

interface TabDef {
  name: TabName;
  Icon: TabIcon;
  sizeActive: number;
  sizeInactive: number;
}

const TABS: TabDef[] = [
  { name: 'discover', Icon: BikeIcon,   sizeActive: 24, sizeInactive: 20 },
  { name: 'map',      Icon: MapIcon,    sizeActive: 22, sizeInactive: 19 },
  { name: 'cart',     Icon: CartIcon,   sizeActive: 22, sizeInactive: 19 },
  { name: 'profile',  Icon: PersonIcon, sizeActive: 22, sizeInactive: 18 },
  { name: 'docs',     Icon: DocIcon,    sizeActive: 22, sizeInactive: 19 },
];

// ── Figma constants (design baseline = 390 pt wide) ─────────────────────────
const DESIGN_W    = 390;
const BAR_TOTAL   = 103.5;  // full frame height
const ICONS_TOP   = 20.5;   // y-offset to icons row (Tab Bar frame → Tabs frame)
const ICONS_H     = 49;     // Tabs frame height
const HOME_H      = 34;
const HOME_W      = 134;
const HOME_PH     = 5;
const HOME_BOTTOM = 8;

// Active pill — exact Figma values from node 1:173 (Rectangle 481)
// Path: M 0 12 L 60 0 L 60 48 L 0 60 → bounding box 60×60, cornerRadius=10
// Skew: vertical sides → skewY, angle = atan(12/60) = 11.31°
const PILL_H      = 60;     // Figma bounding box height
const PILL_W_BASE = 60;     // Figma bounding box width
const PILL_SKEW   = '-11.3deg'; // skewY angle (negative = right side rises)
const PILL_RADIUS = 10;     // Figma cornerRadius on Rectangle 481
const PILL_TOP    = 0;

// Slanted background geometry — Figma node 1:147: M 0 20 L 390 0 L 390 103.5 L 0 103.5 Z
const SLANT_DEPTH = 20;

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  activeTab?: TabName;
  onTabPress?: (tab: TabName) => void;
  style?: ViewStyle;
}

export function BottomTabBar({ activeTab = 'discover', onTabPress, style }: Props) {
  const { width } = useWindowDimensions();

  const scale  = width / DESIGN_W;
  const slotW  = width / TABS.length;
  const pillW  = PILL_W_BASE * scale;
  const pillH  = PILL_H * scale;

  function slotCenter(index: number) {
    return (index + 0.5) * slotW;
  }

  const activeIndex = TABS.findIndex((t) => t.name === activeTab);
  const ActiveIcon  = TABS[activeIndex]?.Icon ?? BikeIcon;
  const activeSz    = (TABS[activeIndex]?.sizeActive ?? 24) * scale;

  // ── Slide animation ─────────────────────────────────────────────────────────
  const pilTranslateX = useSharedValue(slotCenter(activeIndex) - pillW / 2);

  useEffect(() => {
    pilTranslateX.value = withSpring(slotCenter(activeIndex) - pillW / 2, {
      damping:   26,
      stiffness: 260,
      mass:      0.8,
    });
  }, [activeTab, width]);

  const pillAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pilTranslateX.value }],
  }));

  // ── SVG polygon points for the slanted background ──────────────────────────
  // Figma exact path: M 0 20 L 390 0 L 390 103.5 L 0 103.5 Z (full-width diagonal)
  const barH = BAR_TOTAL * scale;
  const pts = [
    `0,${SLANT_DEPTH * scale}`,
    `${width},0`,
    `${width},${barH}`,
    `0,${barH}`,
  ].join(' ');
  const borderPts = [
    `1,${SLANT_DEPTH * scale + 1}`,
    `${width - 1},1`,
    `${width - 1},${barH}`,
    `1,${barH}`,
  ].join(' ');

  return (
    <View style={[{ height: BAR_TOTAL * scale, width }, styles.outer, style]}>

      {/* ── Slanted polygon background ──────────────────────────────────── */}
      <Svg
        width={width}
        height={barH}
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <SvgGradient id="tabBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#363e51" stopOpacity="1" />
            <Stop offset="1" stopColor="#181c24" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <Polygon points={pts} fill="url(#tabBg)" />
        {/* Figma stroke: 2pt white→transparent linear gradient @ 20% opacity, OVERLAY blend.
            RN can't replicate OVERLAY exactly; approximate with a single flat hairline at the upper edge tint. */}
        <Polygon
          points={borderPts}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.5"
        />
      </Svg>

      {/* ── Animated parallelogram active pill ─────────────────────────── */}
      <Animated.View
        style={[
          styles.pillTrack,
          { top: PILL_TOP * scale, width: pillW, height: pillH },
          pillAnimStyle,
        ]}
        pointerEvents="none"
      >
        {/*  1 — Dark drop shadow layer (matches Figma: rgba(16,20,28,0.6), y=20, r=30) */}
        <View
          style={[
            styles.pillShadow,
            {
              width:  pillW,
              height: pillH,
              borderRadius: PILL_RADIUS * scale,
              transform: [{ skewY: PILL_SKEW }],
            },
          ]}
        />

        {/*  2 — Parallelogram gradient (skewY = vertical sides, slanted top/bottom).
              Figma gradient handles: start (0.05, 0) → end (1.0, 1.22), cyan→indigo.
              Border simulates Figma's 1pt white→black overlay stroke (white edge visible top-left). */}
        <View style={[styles.pillSkewWrap, { transform: [{ skewY: PILL_SKEW }] }]}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0.05, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.pillGradient,
              {
                width: pillW,
                height: pillH,
                borderRadius: PILL_RADIUS * scale,
              },
            ]}
          />
        </View>

        {/*  3 — Icon overlay, NOT skewed, centered in the pill bounding box */}
        <View style={[styles.pillIconLayer, { width: pillW, height: pillH }]}>
          <ActiveIcon size={activeSz} color={COLORS.white} />
        </View>
      </Animated.View>

      {/* ── Icons row ──────────────────────────────────────────────────── */}
      <View
        style={[
          styles.iconsRow,
          { top: ICONS_TOP * scale, height: ICONS_H * scale },
        ]}
      >
        {TABS.map((tab, index) => {
          const isActive = tab.name === activeTab;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.slot, { width: slotW, height: ICONS_H * scale }]}
              onPress={() => onTabPress?.(tab.name)}
              activeOpacity={0.65}
            >
              {!isActive && (
                <tab.Icon
                  size={tab.sizeInactive * scale}
                  color="rgba(255,255,255,0.48)"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Home indicator ──────────────────────────────────────────────── */}
      <View
        style={[
          styles.homeArea,
          { bottom: 0, height: HOME_H * scale, paddingBottom: HOME_BOTTOM * scale },
        ]}
      >
        <View style={[styles.homeBar, { width: HOME_W * scale, height: HOME_PH * scale }]} />
      </View>
    </View>
  );
}

// ── Static styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outer: {
    overflow: 'visible',
  },

  pillTrack: {
    position: 'absolute',
  },

  // Dark drop shadow — Figma: rgba(16,20,28,0.6), offset y=20, radius=30
  pillShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    // Near-transparent bg is required for iOS shadow to render
    backgroundColor: 'rgba(52, 200, 232, 0.01)',
    shadowColor: '#10141C',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 18,
  },

  // Skewed gradient — no overflow:hidden so skewY bleeds correctly
  pillSkewWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  pillGradient: {
    // Figma stroke: 1pt white→black @ 60% opacity, OVERLAY blend.
    // Approximate as a hairline white at low alpha — the highlight edge of the gradient.
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },

  pillIconLayer: {
    position: 'absolute',
    top:            0,
    left:           0,
    alignItems:     'center',
    justifyContent: 'center',
  },

  iconsRow: {
    position:      'absolute',
    left:          0,
    right:         0,
    flexDirection: 'row',
    alignItems:    'center',
  },

  slot: {
    alignItems:     'center',
    justifyContent: 'center',
  },

  homeArea: {
    position:       'absolute',
    left:           0,
    right:          0,
    alignItems:     'center',
    justifyContent: 'flex-end',
  },

  homeBar: {
    borderRadius:    100,
    backgroundColor: COLORS.white,
    opacity:         0.27,
  },
});
