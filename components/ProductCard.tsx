import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, FONT } from '../constants/theme';
import { HeartOutlineIcon } from './icons';
import { CardBackground } from './CardBackground';
import type { Product } from '../types';

// ── Figma reference (165pt card width, 390pt baseline) ────────────────────────
//
//  Parallelogram path (Rectangle 166 / 167):
//    Left:  M 0 20 L 165 0 L 165 220 L 0 240  → top-right rises 20pt
//    Right: M 0 0  L 165 20 L 165 240 L 0 220 → top-left rises 20pt (mirror)
//    Skew: atan(20/165) ≈ 6.92°
//
//  Content positions (frame-relative, content view starts at SLANT):
//    Left column  (Items 1, frame 165×235):
//      imgPadTop = 32 - SLANT(20) = 12   image at frame y=32
//      imgPadH   = 22                     symmetric padding
//      textStart = 138 - SLANT(20) = 118  frame 45 at y=138
//      textZone  = 97                     63 text + 34 paddingBottom to card bottom
//      shadowW   = 114                    ground shadow node 1:71
//
//    Right column (Items 3, frame 165×219):
//      imgPadTop = 22 - SLANT(20) = 2
//      imgPadH   = 10
//      textStart = 135 - SLANT(20) = 115
//      textZone  = 84
//      shadowW   = 130
// ─────────────────────────────────────────────────────────────────────────────
const DESIGN_W = 165;
const SLANT    = 20;

const LAYOUT = {
  left: {
    imgPadH:   22,
    imgPadTop: 12,
    textPadL:  18,
    textPadR:  18,
    heartTop:  16,
    heartRight: 16,
    shadowW:   114,
    textZone:  97,
  },
  right: {
    imgPadH:   10,
    imgPadTop: 2,
    textPadL:  10,
    textPadR:  10,
    heartTop:  22,
    heartRight: 16,
    shadowW:   130,
    textZone:  84,
  },
} as const;

// Column gap must match app/index.tsx
const COL_GAP = 20;

interface ProductCardProps {
  product: Product;
  index: number;
  column?: 'left' | 'right';
  onPress: (product: Product) => void;
}

export function ProductCard({ product, index, column = 'left', onPress }: ProductCardProps) {
  const { width } = useWindowDimensions();
  const sidePad = Math.max(16, width * 0.05);
  const colW    = (width - sidePad * 2 - COL_GAP) / 2;
  const s       = colW / DESIGN_W;

  const translateY = useSharedValue(40);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    const delay = index * 80;
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
    opacity.value    = withDelay(delay, withTiming(1, { duration: 350 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const L = LAYOUT[column];

  // Explicit card height from Figma — drives masonry variation
  const cardH    = product.cardHeight * s;
  // Image area = space between content top (SLANT) and text section bottom
  const imgAreaH = cardH - SLANT * s - L.textZone * s;

  const priceStr = product.price < 1000
    ? `$ ${product.price}`
    : `$ ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <Animated.View style={[animStyle, { height: cardH, marginBottom: 0 }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(product)}
        style={{ flex: 1 }}
      >
        {/* ── 1: SVG rounded-parallelogram background (exact Figma bezier path) */}
        <CardBackground col={column} baseCardH={product.cardHeight} s={s} />

        {/* ── 2: Content (heart + image + shadow + text) */}
        <View style={{ position: 'absolute', top: SLANT * s, left: 0, right: 0, bottom: 0 }}>

          {/* Heart icon — Figma: 24×24, top-right of card */}
          <View
            style={{
              position: 'absolute',
              top:   L.heartTop * s,
              right: L.heartRight * s,
              zIndex: 1,
            }}
          >
            <HeartOutlineIcon size={24 * s} />
          </View>

          {/* Product image — fills the imgAreaH zone */}
          <View
            style={{
              height:            imgAreaH,
              paddingTop:        L.imgPadTop * s,
              paddingHorizontal: L.imgPadH * s,
            }}
          >
            <Image
              source={{ uri: product.image }}
              style={{ flex: 1 }}
              resizeMode="contain"
            />

            {/* Ground contact shadow — Figma node 1:71: 114×5.94pt oval beneath bike image */}
            <View
              style={{
                position:        'absolute',
                bottom:          4 * s,
                alignSelf:       'center',
                width:           L.shadowW * s,
                height:          6 * s,
                borderRadius:    100,
                backgroundColor: 'rgba(10, 14, 20, 0.45)',
                shadowColor:     '#0a0e14',
                shadowOffset:    { width: 0, height: 0 },
                shadowOpacity:   0.5,
                shadowRadius:    8 * s,
              }}
            />
          </View>

          {/* Text info */}
          <View
            style={{
              paddingLeft:   L.textPadL * s,
              paddingRight:  L.textPadR * s,
              paddingTop:    8 * s,
              paddingBottom: 12 * s,
              gap:           2,
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
  category: {
    fontFamily:    FONT.medium,
    fontSize:      13,
    color:         COLORS.textLo,
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
    color:         COLORS.textLo,
    letterSpacing: -0.2,
    marginTop:     2,
  },
});
