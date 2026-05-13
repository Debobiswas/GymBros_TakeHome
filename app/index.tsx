/**
 * Discover / Product List Screen
 *
 * Layout mirrors Figma node 1:38 exactly:
 *   • Dark navy bg (#242c3b)
 *   • Hero card with "30% Off" promo
 *   • Staggered diagonal category row (ascending right-to-left)
 *   • Two-column masonry grid with entrance animations
 *   • Fixed bottom tab bar
 *
 * MOTION:
 *   • Product cards: staggered fade + slide-up on mount
 *   • Category pills: smooth background/border transition via withTiming
 */
import React, { useState, type ComponentType } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon as SvgPolygon, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { CategoryPill } from '../components/CategoryPill';
import { ProductCard } from '../components/ProductCard';
import { BottomTabBar } from '../components/BottomTabBar';
import { COLORS, FONT, GRADIENTS, RADIUS } from '../constants/theme';
import { CATEGORIES, LEFT_PRODUCTS, RIGHT_PRODUCTS } from '../constants/products';
import {
  ElectricCategoryIcon,
  RoadCategoryIcon,
  MountainCategoryIcon,
  AccessoryCategoryIcon,
  SearchIcon,
} from '../components/icons';
import { IMAGES } from '../constants/images';
import type { CategoryKey, Product } from '../types';

export default function DiscoverScreen() {
  const { width, height } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('All');

  const categoryIcons: Record<string, ComponentType<{ size: number; color: string }> | undefined> = {
    All:       undefined,
    Electric:  ElectricCategoryIcon,
    Road:      RoadCategoryIcon,
    Mountain:  MountainCategoryIcon,
    Accessory: AccessoryCategoryIcon,
  };

  function handleProductPress(product: Product) {
    router.push({ pathname: '/detail', params: { id: product.id, name: product.name } });
  }

  function handleCartPress() {
    router.push('/cart');
  }

  // Responsive padding so it looks correct on all iPhones
  const sidePad = Math.max(16, width * 0.05);
  const colGap  = 8;
  const colW    = (width - sidePad * 2 - colGap) / 2;
  const scale   = width / 390;

  // Blue geometric accent polygon — Figma node 1:40
  // Screen-space path (390pt baseline): M 322 149 L 393.5 208.5 L 393.5 869.5 L -20 854 L 242.5 316.5 Z
  const bgPolyPts = [
    `${322 * scale},${149 * scale}`,
    `${393.5 * scale},${208.5 * scale}`,
    `${393.5 * scale},${869.5 * scale}`,
    `${-20 * scale},${854 * scale}`,
    `${242.5 * scale},${316.5 * scale}`,
  ].join(' ');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ─── Blue geometric accent polygon (behind everything) ───────────────── */}
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <SvgGradient id="bgAccent" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#37b6e9" stopOpacity="1" />
            <Stop offset="1" stopColor="#4b4ced" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <SvgPolygon points={bgPolyPts} fill="url(#bgAccent)" />
      </Svg>

      {/* ─── Scrollable content ──────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.contentContainer, { paddingHorizontal: sidePad }]}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Bike</Text>
          <View style={styles.searchBtnGlow}>
            <TouchableOpacity onPress={handleCartPress} activeOpacity={0.85}>
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.searchBtn}
              >
                <SearchIcon size={20} color="#fafeff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── HERO CARD ──────────────────────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/detail')}
          style={[styles.heroCard, { width: width - sidePad * 2 }]}
        >
          {/* Figma-accurate flat dark gradient (no photo bg → keeps text contrast intact) */}
          <LinearGradient
            colors={['#353f54', '#21282f']}
            start={{ x: 0.36, y: 0.27 }}
            end={{ x: 0.58, y: 0.85 }}
            style={StyleSheet.absoluteFillObject}
          />
          {/* Electric bike image */}
          <Image
            source={{ uri: IMAGES.electricBike }}
            style={styles.heroImage}
            resizeMode="contain"
          />
          {/* Promo text */}
          <View style={styles.heroPromo}>
            <Text style={styles.heroPromoText}>30% Off</Text>
          </View>
        </TouchableOpacity>

        {/* ── CATEGORIES ─────────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat, i) => (
            <View
              key={cat}
              // Ascending stagger: first (All) is lowest, last (Accessory) is highest
              style={{ marginTop: (CATEGORIES.length - 1 - i) * 10, marginRight: 16 }}
            >
              <CategoryPill
                label={cat}
                icon={categoryIcons[cat]}
                isActive={activeCategory === cat}
                onPress={setActiveCategory}
              />
            </View>
          ))}
        </ScrollView>

        {/* ── MASONRY PRODUCT GRID ───────────────────────────────────────────── */}
        <View style={[styles.grid, { gap: colGap }]}>
          {/* Left column — starts 31px lower per Figma */}
          <View style={[styles.column, { width: colW, marginTop: 31 }]}>
            {LEFT_PRODUCTS.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i * 2}
                column="left"
                onPress={handleProductPress}
              />
            ))}
          </View>

          {/* Right column */}
          <View style={[styles.column, { width: colW }]}>
            {RIGHT_PRODUCTS.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i * 2 + 1}
                column="right"
                onPress={handleProductPress}
              />
            ))}
          </View>
        </View>

        {/* Scroll padding so last items aren't hidden behind tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── FIXED BOTTOM TAB BAR ────────────────────────────────────────────── */}
      <BottomTabBar
        activeTab="discover"
        onTabPress={(tab) => {
          if (tab === 'cart') handleCartPress();
        }}
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 16,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 30,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  // Upper glow layer — Figma: #2B3445 @ 0.5, offset y=-20, radius 30
  searchBtnGlow: {
    shadowColor: '#2b3445',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 0,
  },
  // Bottom drop shadow + gradient pill.
  // Figma stroke: 1pt white→black @ 60% OVERLAY — approximate with hairline white.
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },

  // ── Hero Card ────────────────────────────────────────────────────────────────
  heroCard: {
    height: 200,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#1a2235',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  heroImage: {
    position: 'absolute',
    width: '90%',
    height: '85%',
    top: '5%',
    alignSelf: 'center',
  },
  heroPromo: {
    position: 'absolute',
    bottom: 16,
    left: 20,
  },
  heroPromoText: {
    fontFamily: FONT.bold,
    fontSize: 26,
    lineHeight: 39,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: -0.3,
  },

  // ── Categories ───────────────────────────────────────────────────────────────
  categoryScroll: {
    marginBottom: 12,
  },
  categoryContent: {
    paddingVertical: 4,
    paddingRight: 16,
    alignItems: 'flex-start',
    // Total height: 50 (pill) + 40 (max stagger) = 90
    minHeight: 90,
  },

  // ── Grid ─────────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    flexDirection: 'column',
  },

  // ── Tab Bar ──────────────────────────────────────────────────────────────────
  tabBar: {
    // BottomTabBar handles its own sizing; no extra style needed
  },
});
