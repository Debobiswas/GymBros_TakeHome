/**
 * CardBackground — pixel-perfect SVG reconstruction of Figma's Rectangle 166/167.
 *
 * The Figma vector is a ROUNDED PARALLELOGRAM, not a skewY'd rectangle.
 * Corners are true bezier arcs. Using skewY on a borderRadius View distorts
 * the corners into rhombus points — this SVG approach renders them correctly.
 *
 * Source: Figma node 1:70 (Rectangle 166), exported SVG 245×375
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
 * Two Figma drop shadows:
 *   1. Below:  dy=+20, blur=30, color #10141c  (full opacity)
 *   2. Above:  dy=-20, blur=20, color #2b3445  (50% opacity)
 *
 * Height parameterisation: y-coordinates are scaled by (cardHeight / BASE_H).
 * Corner curves are also scaled — at ±10pt variance (<5%) distortion is negligible.
 *
 * Right column: the path is mirrored (x → 205 - x) so the LEFT side rises instead.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Filter,
  FeGaussianBlur,
  FeOffset,
  FeFlood,
  FeComposite,
  FeMerge,
  FeMergeNode,
} from 'react-native-svg';

// ── Design constants ──────────────────────────────────────────────────────────
const SVG_W       = 245;   // viewBox width (shape 165 + 40 pad each side)
const BASE_H      = 235;   // Figma height of the reference card (Items 1, left col)
const SVG_BASE_H  = 375;   // viewBox height for BASE_H card (60 top + 235 + 80 bottom)
const PAD_X       = 40;    // horizontal shadow bleed on each side
const PAD_TOP     = 60;    // vertical shadow bleed above shape
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the rounded-parallelogram path, y-scaled for non-235pt cards.
 * All x coordinates are fixed; only y coordinates are multiplied by `sy`.
 */
function buildPath(sy: number, col: 'left' | 'right'): string {
  const y = (v: number) => (v * sy).toFixed(3);

  if (col === 'left') {
    // Right side rises 15.15pt above left side
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

  // Right column — mirror x → (205 - x): left side now rises
  return (
    `M185 ${y(95.1543)}` +
    `C185 ${y(85.0394)} 177.448 ${y(76.5167)} 167.407 ${y(75.2996)}` +
    `L42.407 ${y(60.1481)}` +
    `C30.494 ${y(58.7041)} 20 ${y(68.0027)} 20 ${y(80.0028)}` +
    `V${y(259.71)}` +
    `C20 ${y(269.825)} 27.552 ${y(278.348)} 37.593 ${y(279.565)}` +
    `L162.593 ${y(294.716)}` +
    `C174.506 ${y(296.16)} 185 ${y(286.862)} 185 ${y(274.861)}` +
    `V${y(95.1543)}Z`
  );
}

interface CardBackgroundProps {
  col: 'left' | 'right';
  /** Figma card height in design pts (235 / 219 / 233 / 255 / 245 / 223) */
  baseCardH: number;
  /** Scale factor: colW / 165 */
  s: number;
}

export function CardBackground({ col, baseCardH, s }: CardBackgroundProps) {
  const sy       = baseCardH / BASE_H;
  const svgViewH = SVG_BASE_H * sy;

  // Screen-pixel dimensions
  const pxW = SVG_W      * s;
  const pxH = svgViewH   * s;

  const path = buildPath(sy, col);

  // Gradient anchor points (y-scaled)
  // Fill: paint0_linear — x1=79.5 y1=121.167 → x2=115.716 y2=262.152
  const fy1 = 121.167 * sy;
  const fy2 = 262.152 * sy;
  // Border: paint1_linear — x1=38.5 y1=66.3948 → x2=168.663 y2=154.032
  const by1 = 66.3948 * sy;
  const by2 = 154.032 * sy;

  // Unique gradient IDs per card type to avoid cross-SVG collisions
  const uid      = `${col}_${baseCardH}`;
  const fillId   = `cf_${uid}`;
  const borderId = `cb_${uid}`;

  // Fill: left col = Rectangle 166 (#353F54→#222834, opaque)
  //        right col = Rectangle 167 (#363E51→#191E26, 0.6 glass)
  const fillColor0  = col === 'left' ? '#353F54' : '#363E51';
  const fillColor1  = col === 'left' ? '#222834' : '#191E26';
  const fillOpacity = col === 'left' ? 1 : 0.6;

  // Unique filter id per card to avoid SVG id collisions across instances
  const shadowId = `cs_${uid}`;

  return (
    <View
      style={[
        styles.outer,
        {
          left:   -PAD_X     * s,
          top:    -PAD_TOP   * sy * s,
          width:  pxW,
          height: pxH,
        },
      ]}
    >
      <Svg
        width={pxW}
        height={pxH}
        viewBox={`0 0 ${SVG_W} ${svgViewH}`}
      >
        <Defs>
          {/* Drop shadow filter — Figma: dy=+20 blur=30 #10141c (below)
              + dy=-20 blur=20 #2b3445 @50% (above) */}
          <Filter id={shadowId} x="-30%" y="-25%" width="160%" height="150%">
            <FeGaussianBlur in="SourceAlpha" stdDeviation="15" result="b1" />
            <FeOffset in="b1" dx="0" dy="20" result="o1" />
            <FeFlood floodColor="#10141c" floodOpacity="1" result="c1" />
            <FeComposite in="c1" in2="o1" operator="in" result="s1" />
            <FeGaussianBlur in="SourceAlpha" stdDeviation="10" result="b2" />
            <FeOffset in="b2" dx="0" dy="-20" result="o2" />
            <FeFlood floodColor="#2b3445" floodOpacity="0.5" result="c2" />
            <FeComposite in="c2" in2="o2" operator="in" result="s2" />
            <FeMerge>
              <FeMergeNode in="s1" />
              <FeMergeNode in="s2" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
          {/* Fill gradient: left #353F54→#222834 @1.0, right #363E51→#191E26 @0.6 */}
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

          {/* Border gradient: white → transparent (paint1_linear, 20% opacity stroke) */}
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

        {/* Rounded parallelogram — fill + hairline border highlight + SVG drop shadow */}
        <Path
          d={path}
          fill={`url(#${fillId})`}
          fillOpacity={fillOpacity}
          stroke={`url(#${borderId})`}
          strokeOpacity={0.2}
          strokeWidth={2}
          filter={`url(#${shadowId})`}
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
