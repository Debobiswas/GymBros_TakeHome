import React, { useEffect, useMemo } from 'react';
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
//  Parallelogram (Rectangle 166 / 167): one bezier path; right column mirrors on x (see CardBackground).
//
//  Figma Items 1:67 — hearts share the same inset from the card frame; reference
//  comps use slightly tighter image padding (larger product) and left-aligned copy.
//
//  Content positions (frame-relative, content view starts at SLANT):
//    Left column  (Items 1, frame 165×235):
//      imgPadTop = 32 - SLANT(20) = 12   image at frame y=32
//      imgPadH   = 22                     symmetric padding
//      textZone  = 97
//
//    Right column (Items 3, frame 165×219):
//      imgPadTop = 22 - SLANT(20) = 2
//      imgPadH   = 10
//      textZone  = 84
//
//  Figma Items 1:67 — top-left card: gradient heart + opaque fill; other cards: white heart + glass fill.
//
//  CardBackground SVG viewBox is 245pt wide; the path spans x=20–185 (165pt). The canvas
//  is centered in the column with `left: -40·s`, so the drawable sits ~20·s left of the
//  column’s geometric center — shift the content layer by `-20·s` so image / text / heart
//  align with the shape (otherwise they read shifted right / “popping out” past the card).
const CONTENT_SHIFT_X = 20;
// ─────────────────────────────────────────────────────────────────────────────
const DESIGN_W = 165;
const SLANT    = 20;

const LAYOUT = {
  left: {
    /** Tighter than raw Figma 22 so the bike/helmet reads slightly larger on device. */
    imgPadH:    14,
    imgPadTop:  12,
    textPadL:   18,
    textPadR:   18,
    textZone:   97,
  },
  right: {
    imgPadH:    6,
    imgPadTop:  2,
    textPadL:   10,
    textPadR:   10,
    textZone:   84,
  },
} as const;

/** Same on both columns — 24×24 icon, uniform inset from top / right (Figma 1:79). */
const HEART = { top: 16, right: 16, size: 24 } as const;

/** Figma 1:75 / 1:89 — type sizes at 165pt card width; scale with `s` like paddings */
const TEXT = {
  categoryFs: 13,
  categoryLh: 18,
  nameFs:     15,
  nameLh:     22,
  priceFs:    13,
  priceLh:    18,
  stackGap:   4,
} as const;

interface ProductCardProps {
  product: Product;
  index: number;
  column?: 'left' | 'right';
  /** 0-based index down the column; only affects left-column fill + heart (first row opaque). */
  rowInColumn?: number;
  /** Same as Discover content `cardW` / grid `bandWidth` — drives column width. */
  bandWidth: number;
  onPress: (product: Product) => void;
}

export function ProductCard({
  product,
  index,
  column = 'left',
  rowInColumn,
  bandWidth,
  onPress,
}: ProductCardProps) {
  const { width } = useWindowDimensions();
  const scale  = width / 390;
  const colGap = 20 * scale;
  const colW   = (bandWidth - colGap) / 2;
  const s      = colW / DESIGN_W;

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

  const textStyle = useMemo(() => {
    const catFs = TEXT.categoryFs * s;
    const catLh = TEXT.categoryLh * s;
    const gap = TEXT.stackGap * s;
    const nameFs = TEXT.nameFs * s;
    const nameLh = TEXT.nameLh * s;
    const priceFs = TEXT.priceFs * s;
    const priceLh = TEXT.priceLh * s;
    const stackH =
      catLh + gap + nameLh + gap + priceLh;
    const padBottom = Math.max(0, L.textZone * s - stackH);
    return {
      category: { fontSize: catFs, lineHeight: catLh },
      name: { fontSize: nameFs, lineHeight: nameLh, marginTop: gap },
      price: { fontSize: priceFs, lineHeight: priceLh, marginTop: gap },
      padBottom,
    };
  }, [s, L.textZone]);

  // Explicit card height from Figma — drives masonry variation
  const cardH    = product.cardHeight * s;
  // Image area = space between content top (SLANT) and text section bottom
  const imgAreaH = cardH - SLANT * s - L.textZone * s;

  const priceStr = product.price < 1000
    ? `$ ${product.price}`
    : `$ ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const isTopLeftOpaque =
    column === 'left' && (rowInColumn ?? 0) === 0;
  const cardFillStyle: 'opaque' | 'glass' = isTopLeftOpaque ? 'opaque' : 'glass';
  const heartVariant = isTopLeftOpaque ? 'gradient' : 'white';

  return (
    <Animated.View style={[animStyle, { height: cardH, marginBottom: 0, overflow: 'visible' }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onPress(product)}
        style={{ flex: 1, overflow: 'visible' }}
      >
        {/* ── 1: SVG rounded-parallelogram background (exact Figma bezier path) */}
        <CardBackground
          col={column}
          fillStyle={cardFillStyle}
          baseCardH={product.cardHeight}
          s={s}
        />

        {/* ── 2: Content (heart + image + text), shifted to match parallelogram interior */}
        <View
          style={{
            position: 'absolute',
            top:        SLANT * s,
            left:       0,
            right:      0,
            bottom:     0,
            overflow:   'visible',
            transform:  [{ translateX: -CONTENT_SHIFT_X * s }],
          }}
        >

          {/* Heart — Figma 1:79 / 1:80: same top-right inset on every card */}
          <View
            style={{
              position: 'absolute',
              top:   HEART.top * s,
              right: HEART.right * s,
              zIndex: 1,
            }}
          >
            <HeartOutlineIcon
              size={HEART.size * s}
              variant={heartVariant}
            />
          </View>

          {/* Product image — centered in row; column-specific horizontal padding (Figma). */}
          <View
            style={{
              height:            imgAreaH,
              paddingTop:        L.imgPadTop * s,
              paddingHorizontal: L.imgPadH * s,
              alignItems:        'center',
              overflow:          'visible',
            }}
          >
            <Image
              source={{ uri: product.image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>

          {/* Text — left-aligned (Figma-style lower band) */}
          <View
            style={{
              height:         L.textZone * s,
              paddingLeft:    L.textPadL * s,
              paddingRight:   L.textPadR * s,
              paddingBottom:  textStyle.padBottom,
              justifyContent: 'flex-start',
              alignItems:     'flex-start',
            }}
          >
            <Text style={[styles.category, textStyle.category, styles.textRow]}>
              {product.category}
            </Text>
            <Text
              style={[styles.name, textStyle.name, styles.textRow]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {product.name}
            </Text>
            <Text style={[styles.price, textStyle.price, styles.textRow]}>{priceStr}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  category: {
    fontFamily:    FONT.medium,
    color:         COLORS.textLo,
    letterSpacing: -0.3,
  },
  name: {
    fontFamily:    FONT.bold,
    color:         COLORS.white,
    letterSpacing: -0.3,
  },
  price: {
    fontFamily:    FONT.medium,
    color:         COLORS.textLo,
    letterSpacing: -0.3,
  },
  /** Full row width so single-line name ellipsizes correctly when left-aligned. */
  textRow: {
    alignSelf:  'stretch',
    textAlign:  'left',
  },
});
