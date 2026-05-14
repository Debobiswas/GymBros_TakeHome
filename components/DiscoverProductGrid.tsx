/**
 * Two-column masonry product grid (Figma node 1:67 — “Items”).
 *
 * `bandWidth` must match the Discover content band (e.g. hero `cardW`) so column
 * widths stay aligned with `ProductCard`’s internal layout math.
 */
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { ProductCard } from './ProductCard';
import { LEFT_PRODUCTS, RIGHT_PRODUCTS } from '../constants/products';
import type { Product } from '../types';

const DESIGN_BASELINE = 390;
/** Must match `ProductCard` / `CardBackground` column design width (165pt). */
const COL_DESIGN_W = 165;

export interface DiscoverProductGridProps {
  /** Content column width in px (same as hero `cardW` on Discover). */
  bandWidth: number;
  onProductPress: (product: Product) => void;
  leftProducts?: Product[];
  rightProducts?: Product[];
  /** Left column `marginTop` in design pt @ 390 baseline (Figma: 31). */
  leftColumnTopOffset?: number;
  /** Horizontal gap between columns in design pt @ 390 baseline (Figma: 20). */
  columnGap?: number;
  style?: View['props']['style'];
}

export function DiscoverProductGrid({
  bandWidth,
  onProductPress,
  leftProducts = LEFT_PRODUCTS,
  rightProducts = RIGHT_PRODUCTS,
  leftColumnTopOffset = 31,
  columnGap = 20,
  style,
}: DiscoverProductGridProps) {
  const { width } = useWindowDimensions();
  const scale = width / DESIGN_BASELINE;
  const colGap = columnGap * scale;
  const colW = (bandWidth - colGap) / 2;
  const s = colW / COL_DESIGN_W;
  // CardBackground centers the 245pt SVG in the column, but the path sits at x=20–185
  // in the viewBox (20pt left pad vs 60pt right), so the parallelogram reads ~20·s left
  // of the column box — shift the row so the pair fills the band symmetrically (Figma 1:67).
  const gridOffsetX = 20 * s;

  return (
    <View
      style={[
        styles.grid,
        { gap: colGap, transform: [{ translateX: gridOffsetX }] },
        style,
      ]}
    >
      <View
        style={[
          styles.column,
          { width: colW, marginTop: leftColumnTopOffset * scale },
        ]}
      >
        {leftProducts.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i * 2}
            column="left"
            rowInColumn={i}
            bandWidth={bandWidth}
            onPress={onProductPress}
          />
        ))}
      </View>

      <View style={[styles.column, { width: colW }]}>
        {rightProducts.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i * 2 + 1}
            column="right"
            bandWidth={bandWidth}
            onPress={onProductPress}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'visible',
  },
  column: {
    flexDirection: 'column',
    overflow: 'visible',
  },
});
