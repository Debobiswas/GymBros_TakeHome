/**
 * HeroBackground — pixel-perfect SVG reconstruction of Figma node 1:140
 * (mikkel-bech-yjAFnkLtKY0-unsplash-removebg-preview 5)
 *
 * Shape: rounded top corners (r≈10), flat top, SLANTED bottom edge.
 *   Top:    y=80 horizontal, x=20..370 (350pt wide, r=10 bezier corners)
 *   Right:  vertical x=370, y=100..262.156
 *   Bottom: slants from (352.271, 282.026) → (42.271, 317.455), left side ~35pt lower
 *   Left:   vertical x=20, y=297.584..100
 *
 * SVG canvas: 390×398 at 390pt design baseline
 *   Horizontal bleed: 20pt each side  (shape x=20..370)
 *   Top bleed:        80pt            (shape top y=80)
 *   Bottom bleed:     ~80.5pt         (shape bottom y≈317.5, canvas=398)
 *
 * Two Figma drop shadows (feDropShadow):
 *   1. Below: dy=+20, stdDev=30, #10141c @ 60%
 *   2. Above: dy=-20, stdDev=30, #3a4760 @ 50%
 *
 * Fill:   paint0_linear — #353F54→#222834 @ 60% opacity
 * Border: paint1_linear — white→transparent, 2pt stroke @ 20% opacity
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

const DESIGN_SHAPE_W = 350;  // shape width at 390pt baseline (x=20..370)
const SVG_W          = 390;  // total SVG canvas width
const SVG_H          = 398;  // total SVG canvas height
const PAD_X          = 20;   // horizontal shadow bleed each side
const PAD_TOP        = 80;   // vertical shadow bleed above shape top

// Visible shape height = bottom of bounding box − top = 317.455 − 80 = 237.455
export const HERO_SHAPE_H = 237.455;

const SHAPE_PATH =
  'M20 100C20 88.9543 28.9543 80 40 80H350C361.046 80 370 88.9543 370 100' +
  'V262.156C370 272.323 362.372 280.872 352.271 282.026' +
  'L42.2709 317.455C30.4029 318.811 20 309.529 20 297.584V100Z';

interface HeroBackgroundProps {
  /** Width of the hero card in screen pixels (= width − sidePad×2) */
  cardWidth: number;
}

export function HeroBackground({ cardWidth }: HeroBackgroundProps) {
  const s   = cardWidth / DESIGN_SHAPE_W;
  const pxW = SVG_W * s;
  const pxH = SVG_H * s;

  return (
    <View
      style={[
        styles.outer,
        {
          left:   -PAD_X   * s,
          top:    -PAD_TOP * s,
          width:  pxW,
          height: pxH,
        },
      ]}
    >
      <Svg width={pxW} height={pxH} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        <Defs>
          {/* paint0_linear — fill: #353F54→#222834, x1=146 y1=144 → x2=164 y2=292 */}
          <SvgLinearGradient
            id="heroFill"
            x1="146.212" y1="143.734"
            x2="164.149" y2="291.851"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#353F54" stopOpacity={1} />
            <Stop offset="1" stopColor="#222834" stopOpacity={1} />
          </SvgLinearGradient>

          {/* paint1_linear — border: white→transparent */}
          <SvgLinearGradient
            id="heroBorder"
            x1="59.2424" y1="88.9627"
            x2="191.249" y2="277.494"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="white" stopOpacity={1} />
            <Stop offset="1" stopColor="white" stopOpacity={0} />
          </SvgLinearGradient>

          {/* Drop shadow filter — Figma effects: dy=+20 blur=30 #10141c @60%
              and dy=-20 blur=30 #3a4760 @50%, applied to the shape itself */}
          <Filter id="heroShadow" x="-20%" y="-30%" width="140%" height="160%">
            {/* Below shadow */}
            <FeGaussianBlur in="SourceAlpha" stdDeviation="15" result="b1" />
            <FeOffset in="b1" dx="0" dy="20" result="o1" />
            <FeFlood floodColor="#10141c" floodOpacity="0.6" result="c1" />
            <FeComposite in="c1" in2="o1" operator="in" result="s1" />
            {/* Above highlight-shadow */}
            <FeGaussianBlur in="SourceAlpha" stdDeviation="15" result="b2" />
            <FeOffset in="b2" dx="0" dy="-20" result="o2" />
            <FeFlood floodColor="#3a4760" floodOpacity="0.5" result="c2" />
            <FeComposite in="c2" in2="o2" operator="in" result="s2" />
            <FeMerge>
              <FeMergeNode in="s1" />
              <FeMergeNode in="s2" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>

        {/* Rounded-top, slanted-bottom shape */}
        <Path
          d={SHAPE_PATH}
          fill="url(#heroFill)"
          fillOpacity={0.6}
          stroke="url(#heroBorder)"
          strokeOpacity={0.2}
          strokeWidth={2}
          filter="url(#heroShadow)"
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
