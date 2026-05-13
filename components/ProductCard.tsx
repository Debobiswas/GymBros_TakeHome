import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT, RADIUS } from '../constants/theme';
import { HeartOutlineIcon } from './icons';
import type { Product } from '../types';

// ── Figma reference (165pt card width) ────────────────────────────────────────
//
//  Left column  (Items 1 / Rectangle 166  165×235 frame):
//    image:      x=22, y=32, w=121, h=89
//    text frame: x=18, y=138, w=112, h=63
//    heart:      x=125, y=16  (right=16, top=16)
//    font:       category=13/500, name=15/700, price=13/500
//
//  Right column (Items 3 / Rectangle 167  165×219 group):
//    image:      x=10, y=22, w=135, h=104
//    text frame: x=10, y=135, w=104, h=63
//    heart:      x=125, y=22 (right=16, top=22)
//    font:       same as left
//
//  Figma: Rectangle 166 (left, 1:70) and Rectangle 167 (right, 1:97) are MIRRORED
//  parallelogram vectors — different names indicate different paths.
//
//  Left column:  M 0 20 L 165 0 L 165 (h-20) L 0 h Z      → top-right rises
//  Right column: M 0 0  L 165 20 L 165 h    L 0 (h-20) Z  → top-left rises
//
//  Skew angle: atan(20/165) ≈ 6.92°. Sign mirrors per column.
// ─────────────────────────────────────────────────────────────────────────────
const DESIGN_W  = 165;
const SLANT     = 20;
const CARD_SKEW = {
  left:  '-6.92deg',  // right side rises  (negative skewY)
  right: '6.92deg',   // left side rises   (positive skewY — mirror)
} as const;

const CARD_COLORS = {
  left:  { start: '#353f54', end: '#222834' },
  right: { start: '#363e51', end: '#191e26' },
} as const;

// Per-column layout metrics at the Figma 165pt baseline
const LAYOUT = {
  left: {
    imgPadH:    22,   // horizontal padding around image
    imgPadTop:  32,   // from card content top to image top
    imgH:       89,   // image render height
    textPadL:   18,   // text frame left inset
    textPadR:   18,   // symmetric
    heartTop:   16,
    heartRight: 16,
  },
  right: {
    imgPadH:    10,
    imgPadTop:  22,
    imgH:       104,
    textPadL:   10,
    textPadR:   10,
    heartTop:   22,
    heartRight: 16,
  },
} as const;

interface ProductCardProps {
  product: Product;
  index: number;
  column?: 'left' | 'right';
  onPress: (product: Product) => void;
}

export function ProductCard({ product, index, column = 'left', onPress }: ProductCardProps) {
  const { width } = useWindowDimensions();
  const sidePad   = Math.max(16, width * 0.05);
  const colW      = (width - sidePad * 2 - 8) / 2;
  const s         = colW / DESIGN_W;   // scale factor

  const translateY = useSharedValue(40);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    const delay = index * 80;
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
    opacity.value    = withDelay(delay, withTiming(1,  { duration: 350 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const L      = LAYOUT[column];
  const colors = CARD_COLORS[column];
  const skew   = CARD_SKEW[column];

  const priceStr = product.price < 1000
    ? `$ ${product.price}`
    : `$ ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <Animated.View style={[animStyle, styles.wrapper]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(product)}
        style={styles.outer}
      >
        {/* ── Shadow layer — skewed to cast parallelogram shadow ── */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              top: SLANT,
              borderRadius: RADIUS.lg,
              backgroundColor: 'rgba(40,48,63,0.01)',
              transform: [{ skewY: skew }],
              shadowColor: '#10141c',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.6,
              shadowRadius: 18,
            },
          ]}
        />

        {/* ── Parallelogram gradient background ── */}
        <LinearGradient
          colors={[colors.start, colors.end]}
          start={{ x: 0.8, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            StyleSheet.absoluteFillObject,
            {
              top: SLANT,
              borderRadius: RADIUS.lg,
              transform: [{ skewY: skew }],
              elevation: 10,
            },
          ]}
        />

        {/* ── Content — upright, starts at SLANT offset ── */}
        <View style={{ marginTop: SLANT }}>

          {/* Heart */}
          <View
            style={{
              position: 'absolute',
              top:   L.heartTop,
              right: L.heartRight * s,
              zIndex: 1,
            }}
          >
            <HeartOutlineIcon size={20} />
          </View>

          {/* Product image */}
          <View
            style={{
              paddingTop:        L.imgPadTop * s,
              paddingHorizontal: L.imgPadH * s,
              height:            (L.imgPadTop + L.imgH) * s,
            }}
          >
            <Image
              source={{ uri: product.image }}
              style={{ width: '100%', height: L.imgH * s }}
              resizeMode="contain"
            />
          </View>

          {/* Text info */}
          <View
            style={{
              paddingLeft:   L.textPadL * s,
              paddingRight:  L.textPadR * s,
              paddingTop:    8,
              paddingBottom: 16,
              gap: 2,
            }}
          >
            <Text style={styles.category}>{product.category}</Text>
            <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
            <Text style={styles.price}>{priceStr}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  outer: {},

  // Text — font sizes match Figma (13/15/13pt)
  category: {
    fontFamily:    FONT.medium,
    fontSize:      13,
    color:         'rgba(255,255,255,0.6)',
    letterSpacing: -0.2,
  },
  name: {
    fontFamily:    FONT.bold,
    fontSize:      15,
    color:         COLORS.white,
    letterSpacing: -0.3,
    marginTop:     2,
  },
  price: {
    fontFamily:    FONT.medium,
    fontSize:      13,
    color:         'rgba(255,255,255,0.6)',
    letterSpacing: -0.2,
    marginTop:     2,
  },
});
