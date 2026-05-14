/**
 * CardBackground — Figma Rectangle 166 (opaque) / 167 (glass), same bezier path.
 *
 * The Figma vector is a ROUNDED PARALLELOGRAM, not a skewY'd rectangle.
 * Corners are true bezier arcs. Using skewY on a borderRadius View distorts
 * the corners into rhombus points — this SVG approach renders them correctly.
 *
 * Source: Figma node 1:70 (Rectangle 166), exported SVG 245×375
 *
 * Fills (Dev Mode hex, `constants/theme.ts` → `FIGMA_PRODUCT_CARD`):
 *   Rectangle 166 — #353F54 → #222834 @ 100%
 *   Rectangle 167 — #363E51 → #191E26 @ 60% (glass on fill)
 *
 * Shape geometry (165pt wide, 235pt tall base card):
 *   Left side:  vertical at x=20,  y = 95.15 → 274.86  (right side is HIGHER)
 *   Right side: vertical at x=185, y = 80.00 → 259.71
 *   Parallelogram offset: right side rises 15.15pt above left side
 *   Corner bezier radius: ~18pt
 *
 * SVG canvas (245×375) includes shadow bleed:
 *   PAD_X = 40pt left/right   PAD_TOP = 60pt   PAD_BOTTOM = 80pt
 *
 * Figma had two drop shadows (Fe* filter). Native RN does not implement SVG filters;
 * depth is approximated with View shadow (below) + elevation on Android.
 *
 * Height parameterisation: y-coordinates are scaled by (cardHeight / BASE_H).
 * Corner curves are also scaled — at ±10pt variance (<5%) distortion is negligible.
 *
 * Both columns use the same path: Figma Items left/right share the same slant
 * (top edge falls left → right); fill is Rectangle 166 (opaque) vs 167 (glass).
 * Discover uses opaque only for the top-left grid card; other left cards use glass.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { FIGMA_PRODUCT_CARD } from '../constants/theme';

// ── Design constants ──────────────────────────────────────────────────────────
const SVG_W       = 245;   // viewBox width (shape 165 + 40 pad each side)
const BASE_H      = 235;   // Figma height of the reference card (Items 1, left col)
const SVG_BASE_H  = 375;   // viewBox height for BASE_H card (60 top + 235 + 80 bottom)
const PAD_X       = 40;    // horizontal shadow bleed on each side
const PAD_TOP     = 60;    // vertical shadow bleed above shape
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rounded-parallelogram path (Figma Rectangle 166), y-scaled for card height.
 * Used for both grid columns — same slant as the design file.
 */
function buildPath(sy: number): string {
  const y = (v: number) => (v * sy).toFixed(3);

  return (
    `M20 ${y(95.1543)}` +
    `C20 ${y(85.0394)} 27.552 ${y(76.5167)} 37.5934 ${y(75.2996)}` +
    `L162.593 ${y(60.1481)}` +
    `C174.506 ${y(58.7041)} 185 ${y(68.0027)} 185 ${y(80.0028)}` +
    `V${y(259.71)}` +
    `C185 ${y(269.825)} 177.448 ${y(278.348)} 167.407 ${y(279.565)}` +
    `L42.4067 ${y(294.716)}` +
    `C30.4938 ${y(296.16)} 20 ${y(286.862)} 20 ${y(274.861)}` +
    `V${y(95.1543)}Z`
  );
}

interface CardBackgroundProps {
  col: 'left' | 'right';
  /**
   * Rectangle 166 (opaque) vs 167 (60% glass). When omitted, left column uses
   * opaque and right uses glass — Discover overrides the first left row to opaque only.
   */
  fillStyle?: 'opaque' | 'glass';
  /** Figma card height in design pts (235 / 219 / 233 / 255 / 245 / 223) */
  baseCardH: number;
  /** Scale factor: colW / 165 */
  s: number;
}

export function CardBackground({ col, fillStyle, baseCardH, s }: CardBackgroundProps) {
  const sy       = baseCardH / BASE_H;
  const svgViewH = SVG_BASE_H * sy;

  // Screen-pixel dimensions
  const pxW = SVG_W      * s;
  const pxH = svgViewH   * s;

  const path = buildPath(sy);

  // Gradient anchor points (y-scaled) — same Figma paint0 / paint1 for both columns
  const fy1 = 121.167 * sy;
  const fy2 = 262.152 * sy;
  const by1 = 66.3948 * sy;
  const by2 = 154.032 * sy;

  const resolvedFill =
    fillStyle ?? (col === 'left' ? 'opaque' : 'glass');
  const fill =
    resolvedFill === 'opaque' ? FIGMA_PRODUCT_CARD.r166 : FIGMA_PRODUCT_CARD.r167;
  const fillColor0 = fill.fill0;
  const fillColor1 = fill.fill1;
  const fillOpacity = fill.fillOpacity;

  // Unique gradient ids per card instance (avoid SVG id collisions)
  const uid      = `${col}_${resolvedFill}_${baseCardH}`;
  const fillId   = `cf_${uid}`;
  const borderId = `cb_${uid}`;

  return (
    <View
      style={[
        styles.outer,
        {
          left:   -PAD_X     * s,
          top:    -PAD_TOP   * sy * s,
          width:  pxW,
          height: pxH,
          shadowColor:   FIGMA_PRODUCT_CARD.shadowHex,
          shadowOffset:  { width: 0, height: 20 * s },
          shadowOpacity: 0.85,
          shadowRadius:  15 * s,
          elevation:     6,
        },
      ]}
    >
      <Svg
        width={pxW}
        height={pxH}
        viewBox={`0 0 ${SVG_W} ${svgViewH}`}
      >
        <Defs>
          <SvgLinearGradient
            id={fillId}
            x1={79.5}
            y1={fy1}
            x2={115.716}
            y2={fy2}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0"  stopColor={fillColor0} stopOpacity={1} />
            <Stop offset="1"  stopColor={fillColor1} stopOpacity={1} />
          </SvgLinearGradient>

          <SvgLinearGradient
            id={borderId}
            x1={38.5}
            y1={by1}
            x2={168.663}
            y2={by2}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0"      stopColor="white" stopOpacity={1} />
            <Stop offset="0.845"  stopColor="white" stopOpacity={0} />
            <Stop offset="1"      stopColor="white" stopOpacity={0} />
          </SvgLinearGradient>
        </Defs>

        <Path
          d={path}
          fill={`url(#${fillId})`}
          fillOpacity={fillOpacity}
          stroke={`url(#${borderId})`}
          strokeOpacity={0.2}
          strokeWidth={2}
          opacity={1}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
  },
});
