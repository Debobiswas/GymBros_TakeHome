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
 * Figma used two feDropShadows; native uses View shadow + elevation instead (SVG Fe* unsupported).
 *
 * Frosted / diffusion (Figma glass): iOS + Android use `MaskedView` + `expo-blur` `BlurView`
 * clipped to the hero path, then the lifted hero tint gradient (`FIGMA_HERO.tint`) at
 * `overlayFillOpacity` × per-stop alpha; fill gradient is L→R so the right reads slightly clearer.
 * Web uses a single semi-opaque vector fill (`fillOpacityFlat`) — no reliable masked blur.
 *
 * Border: paint1_linear — white→transparent, 2pt stroke @ 20% opacity
 */

import { useId } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { BlurView } from 'expo-blur';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { FIGMA_HERO, FIGMA_PRODUCT_CARD } from '../constants/theme';

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

function HeroFillDefs({ id }: { id: string }) {
  return (
    <Defs>
      <SvgLinearGradient
        id={id}
        x1="24"
        y1="200"
        x2="366"
        y2="200"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0" stopColor={FIGMA_HERO.tint.fill0} stopOpacity={1} />
        <Stop
          offset="1"
          stopColor={FIGMA_HERO.tint.fill1}
          stopOpacity={FIGMA_HERO.gradientEndStopOpacity}
        />
      </SvgLinearGradient>
    </Defs>
  );
}

function HeroBorderDefs({ id }: { id: string }) {
  return (
    <Defs>
      <SvgLinearGradient
        id={id}
        x1="59.2424" y1="88.9627"
        x2="191.249" y2="277.494"
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset="0" stopColor="white" stopOpacity={1} />
        <Stop offset="1" stopColor="white" stopOpacity={0} />
      </SvgLinearGradient>
    </Defs>
  );
}

export function HeroBackground({ cardWidth }: HeroBackgroundProps) {
  const uid      = useId().replace(/:/g, '_');
  const fillId   = `heroFill_${uid}`;
  const borderId = `heroBorder_${uid}`;
  const fillIdWeb = `heroFillW_${uid}`;
  const borderIdWeb = `heroBorderW_${uid}`;

  const s   = cardWidth / DESIGN_SHAPE_W;
  const pxW = SVG_W * s;
  const pxH = SVG_H * s;

  const svgSize = { width: pxW, height: pxH };
  const viewBox = `0 0 ${SVG_W} ${SVG_H}`;

  const borderPath = (
    <Path
      d={SHAPE_PATH}
      fill="none"
      stroke={`url(#${borderId})`}
      strokeOpacity={0.2}
      strokeWidth={2}
    />
  );

  const webFill = (
    <Svg {...svgSize} viewBox={viewBox}>
      <HeroFillDefs id={fillIdWeb} />
      <HeroBorderDefs id={borderIdWeb} />
      <Path
        d={SHAPE_PATH}
        fill={`url(#${fillIdWeb})`}
        fillOpacity={FIGMA_HERO.fillOpacityFlat}
        stroke={`url(#${borderIdWeb})`}
        strokeOpacity={0.2}
        strokeWidth={2}
      />
    </Svg>
  );

  const nativeFrosted = (
    <>
      <MaskedView
        style={[svgSize, styles.clipStack]}
        maskElement={
          <Svg {...svgSize} viewBox={viewBox}>
            <Path d={SHAPE_PATH} fill="#FFFFFF" />
          </Svg>
        }
      >
        <BlurView
          intensity={FIGMA_HERO.blurIntensity}
          tint="dark"
          experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
          blurReductionFactor={Platform.OS === 'android' ? 3.2 : undefined}
          style={svgSize}
        />
        <Svg {...svgSize} viewBox={viewBox} style={StyleSheet.absoluteFillObject}>
          <HeroFillDefs id={fillId} />
          <Path
            d={SHAPE_PATH}
            fill={`url(#${fillId})`}
            fillOpacity={FIGMA_HERO.overlayFillOpacity}
          />
        </Svg>
      </MaskedView>
      <Svg {...svgSize} viewBox={viewBox} style={styles.borderLayer} pointerEvents="none">
        <HeroBorderDefs id={borderId} />
        {borderPath}
      </Svg>
    </>
  );

  return (
    <View
      style={[
        styles.outer,
        {
          left:   -PAD_X   * s,
          top:    -PAD_TOP * s,
          width:  pxW,
          height: pxH,
          shadowColor:   FIGMA_PRODUCT_CARD.shadowHex,
          shadowOffset:  { width: 0, height: 20 * s },
          shadowOpacity: 0.55,
          shadowRadius:  18 * s,
          elevation:     8,
        },
      ]}
    >
      {Platform.OS === 'web' ? webFill : nativeFrosted}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
  },
  clipStack: {
    overflow: 'hidden',
  },
  borderLayer: {
    ...StyleSheet.absoluteFillObject,
  },
});
