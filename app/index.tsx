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
import { HeroBackground, HERO_SHAPE_H } from '../components/HeroBackground';
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
  const sidePad  = Math.max(16, width * 0.05);
  const colGap   = 20;   // Figma: 20pt gap between columns
  const colW     = (width - sidePad * 2 - colGap) / 2;
  const scale    = width / 390;
  const cardW    = width - sidePad * 2;
  const heroH    = HERO_SHAPE_H * (cardW / 350);
  // Hero section scale — maps Figma's 350pt card width to actual pixels
  const hs       = cardW / 350;

  // Blue geometric accent polygon — Figma node 1:40 / Rectangle 474
  // Path (SVG-local): M262.5,167.5 L342,0 L413.5,59.5 V720.5 L0,705 Z
  // Frame offset (-20, 149) → screen-space:
  //   (242.5,316.5) → (322,149) → (393.5,208.5) → (393.5,869.5) → (-20,854)
  const bgPolyPts = [
    `${322   * scale},${149   * scale}`,
    `${393.5 * scale},${208.5 * scale}`,
    `${393.5 * scale},${869.5 * scale}`,
    `${-20   * scale},${854   * scale}`,
    `${242.5 * scale},${316.5 * scale}`,
  ].join(' ');
  // Figma gradient (userSpaceOnUse): diagonal cyan→indigo
  //   SVG-local (188.5, 0.5) → (392.499, 720.5)
  //   Screen-space (frame offset −20, 149): (168.5, 149.5) → (372.5, 869.5)
  const gradX1 = 168.5 * scale;
  const gradY1 = 149.5 * scale;
  const gradX2 = 372.5 * scale;
  const gradY2 = 869.5 * scale;

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
          <SvgGradient
            id="bgAccent"
            x1={gradX1} y1={gradY1}
            x2={gradX2} y2={gradY2}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#37B6E9" stopOpacity="1" />
            <Stop offset="1" stopColor="#4B4CED" stopOpacity="1" />
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
          style={[styles.heroCard, { width: cardW, height: heroH }]}
        >
          {/* Figma SVG background — rounded top, slanted bottom, dual shadow */}
          <HeroBackground cardWidth={cardW} />
          {/* Electric bike image — Figma node 1:141 at (37,166) size 316.8×153,
              relative to Top Card frame at (20,136) → (17, 30) size 317×153.
              Source asset is 2048×2048 square with transparent padding; use `cover`
              so the bike fills the rect width (contain would shrink to 153×153). */}
          <Image
            source={{ uri: IMAGES.electricBike }}
            style={{
              position: 'absolute',
              top:     30 * hs,
              left:    17 * hs,
              width:  317 * hs,
              height: 153 * hs,
            }}
            resizeMode="cover"
          />
          {/* Promo text — Figma node 1:142: screen y=313, shape top y=136 → 177pt from card top */}
          <View style={{ position: 'absolute', top: 177 * hs, left: 16 * hs }}>
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
        {/*
          Rectangle 480 (node 1:82): 355×67.5pt gradient strip bridging the
          categories section into the grid. Positioned 24.5pt above the grid
          (at top = 31-55.5 = -24.5 in grid coords). Creates a smooth dark
          fade that blends the background into the card tops.
        */}
        <View style={{ position: 'relative' }}>
          <LinearGradient
            colors={[COLORS.bg, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: 'absolute',
              top:      -24.5 * scale,
              left:     0,
              right:    0,
              height:   67.5 * scale,
              zIndex:   2,
            }}
            pointerEvents="none"
          />

          <View style={[styles.grid, { gap: colGap }]}>
            {/* Left column — starts 31pt lower per Figma (node 1:69 top=31) */}
            <View style={[styles.column, { width: colW, marginTop: 31 * scale }]}>
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

            {/* Right column — starts at y=0 */}
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
  // Figma: Top Card node 1:139 — 350×~237pt with electric bike + "30% Off"
  // height is now dynamic (heroH), shadow lives in HeroBackground SVG component
  heroCard: {
    marginBottom: 20,
    overflow: 'visible',
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
    overflow: 'visible',
  },
  column: {
    flexDirection: 'column',
    overflow: 'visible',
  },

  // ── Tab Bar ──────────────────────────────────────────────────────────────────
  tabBar: {
    // BottomTabBar handles its own sizing; no extra style needed
  },
});
