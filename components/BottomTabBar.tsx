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
 *  Background sheet:
 *    Original slanted top + right vertical to y=53.5; flat bottom y=103.5 (no rounding).
 *    Solid fill COLORS.bg. Parent views stay transparent behind the top wedge so the
 *    diagonal reveals scroll content; only the home-indicator strip uses opaque COLORS.bg.
 *
 *  Tab slot geometry:
 *    5 tabs × 75 pt each in a 390 pt frame.
 *    Tabs frame: 390 × 49.
 * ═══════════════════════════════════════════════════════════════
 */
import React, { useEffect, useId } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Defs,
  Mask,
  Rect,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
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
import { COLORS, TAB_BAR_FRAME_HEIGHT_PT } from '../constants/theme';

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
const BAR_TOTAL   = TAB_BAR_FRAME_HEIGHT_PT;
const ICONS_TOP   = 20.5;   // y-offset to icons row (Tab Bar frame → Tabs frame)
const ICONS_H     = 49;     // Tabs frame height

// Active pill — exact Figma path from node 1:173 (Rectangle 481, SVG export).
// Vertical L/R sides at x=30 and x=90 (width 60), slanted top/bottom edges
// (top-right 8pt higher than top-left, bottom symmetrical), bezier corners ~r10.
// The path's bounding box is x:30-90, y:10.2-65.4 within a 120×115.6 SVG canvas
// (the extra space accommodates the drop shadow bleed).
const PILL_H      = 60;     // Figma bounding box height (Selected Button frame)
const PILL_W_BASE = 60;     // Figma bounding box width
const PILL_TOP    = 0;
const PILL_PATH =
  'M30 28.0034C30 23.2366 33.3646 19.1324 38.0388 18.1976' +
  'L78.0388 10.1976C84.2268 8.96001 90 13.6929 90 20.0034' +
  'V47.6073C90 52.3741 86.6354 56.4783 81.9612 57.4131' +
  'L41.9612 65.4131C35.7732 66.6507 30 61.9178 30 55.6073V28.0034Z';
const PILL_SVG_W  = 120;    // SVG canvas width (includes 30pt bleed each side)
const PILL_SVG_H  = 115.6;  // SVG canvas height (top:10pt, bottom:50pt for shadow)
const PILL_PATH_X = 30;     // path's left x in viewBox
const PILL_PATH_Y = 10;     // path's top y in viewBox

const TAB_DESIGN_W = 390;
const TAB_DESIGN_H = 103.5;
/** Original Figma top: slant (0,20)→(390,0), then vertical to y=53.5 before the old bottom curves. */
const TAB_TOP_DROP_Y = 53.5;
// Clear the wedge above the slanted top so scroll content shows through (Figma).
const TAB_TOP_CLEAR_WEDGE = 'M0 0L390 0L0 20Z';
// Same upper profile as original TAB_PATH; flat bottom y=TAB_DESIGN_H (no corner radius).
const TAB_PATH =
  `M0 20 L390 0 V${TAB_TOP_DROP_Y} L390 ${TAB_DESIGN_H} L0 ${TAB_DESIGN_H} V20 Z`;

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  activeTab?: TabName;
  onTabPress?: (tab: TabName) => void;
  style?: ViewStyle;
}

export function BottomTabBar({ activeTab = 'discover', onTabPress, style }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabTopClearMaskId = useId().replace(/:/g, '_');

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

  const barH = BAR_TOTAL * scale;
  const layoutH = barH + insets.bottom;

  return (
    <View
      pointerEvents="box-none"
      style={[
        {
          height: layoutH,
          width,
        },
        styles.outer,
        style,
      ]}
    >
      <View
        pointerEvents="box-none"
        style={[styles.barInner, { height: barH, width }]}
      >
      {/* ── Sheet: slanted top, flat bottom, solid app bg (matches system nav) ─ */}
      <Svg
        pointerEvents="none"
        width={width}
        height={barH}
        viewBox={`0 0 ${TAB_DESIGN_W} ${TAB_DESIGN_H}`}
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <Mask id={tabTopClearMaskId} maskUnits="userSpaceOnUse">
            <Rect x="0" y="0" width={TAB_DESIGN_W} height={TAB_DESIGN_H} fill="#FFFFFF" />
            <Path d={TAB_TOP_CLEAR_WEDGE} fill="#000000" />
          </Mask>
        </Defs>
        <Path d={TAB_PATH} fill={COLORS.bg} mask={`url(#${tabTopClearMaskId})`} />
      </Svg>

      {/* ── Animated active pill — SVG path with real parallelogram geometry ─ */}
      <Animated.View
        style={[
          styles.pillTrack,
          { top: PILL_TOP * scale, width: pillW, height: pillH },
          pillAnimStyle,
        ]}
        pointerEvents="none"
      >
        {/* Native shadow (SVG Fe* filters are not supported on iOS/Android — see Metro warn). */}
        <View
          style={{
            position: 'absolute',
            left:     -PILL_PATH_X * scale,
            top:      -PILL_PATH_Y * scale,
            width:    PILL_SVG_W * scale,
            height:   PILL_SVG_H * scale,
            shadowColor:     '#10141c',
            shadowOffset:    { width: 0, height: 20 * scale },
            shadowOpacity:   0.6,
            shadowRadius:    15 * scale,
            elevation:       12,
          }}
        >
          <Svg
            width={PILL_SVG_W * scale}
            height={PILL_SVG_H * scale}
            viewBox={`0 0 ${PILL_SVG_W} ${PILL_SVG_H}`}
          >
            <Defs>
              <SvgGradient
                id="pillFill"
                x1="33"    y1="7.80536"
                x2="74.79" y2="88.85"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor="#34C8E8" />
                <Stop offset="1" stopColor="#4E4AF2" />
              </SvgGradient>
              <SvgGradient
                id="pillBorder"
                x1="30"    y1="7.80536"
                x2="64.08" y2="80.04"
                gradientUnits="userSpaceOnUse"
              >
                <Stop offset="0" stopColor="#ffffff" stopOpacity={1} />
                <Stop offset="1" stopColor="#000000" stopOpacity={1} />
              </SvgGradient>
            </Defs>

            <Path
              d={PILL_PATH}
              fill="url(#pillFill)"
              stroke="url(#pillBorder)"
              strokeOpacity={0.6}
              strokeWidth={1}
            />
          </Svg>
        </View>

        {/* Icon overlay — unrotated, centered on the pill's visual centroid.
            Path centroid in viewBox = ((30+90)/2, (18+57.4)/2) ≈ (60, 37.8).
            Within the pill frame that's (30, 27.8) → close to center, slight up shift. */}
        <View style={[styles.pillIconLayer, { width: pillW, height: pillH, top: -2 * scale }]}>
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
      </View>

      {/* Home-indicator strip only — keep opaque so it matches system nav; don’t paint
          behind the top wedge or the diagonal reads as a flat bar. */}
      {insets.bottom > 0 ? (
        <View
          pointerEvents="none"
          style={{ height: insets.bottom, width, backgroundColor: COLORS.bg }}
        />
      ) : null}
    </View>
  );
}

// ── Static styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outer: {
    overflow: 'visible',
  },

  barInner: {
    position: 'relative',
    overflow: 'visible',
  },

  pillTrack: {
    position: 'absolute',
    overflow: 'visible',
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
});
