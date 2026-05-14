/**
 * Discover / Product List Screen
 *
 * Figma: https://www.figma.com/design/VYIhA7NSt2WzRJEzZNSeNY/Design-To-Ship--Copy---Copy-?node-id=1-38
 * Frame node 1:38 — layout tokens scale from 390pt baseline (width / 390).
 * Masonry product grid: node 1:67 (Items) — https://www.figma.com/design/VYIhA7NSt2WzRJEzZNSeNY/Design-To-Ship--Copy---Copy-?node-id=1-67
 *
 *   • Dark navy bg (#242c3b) + full-height cyan accent (Figma 1:40) behind tab bar
 *   • Hero card with "30% Off" promo
 *   • Staggered diagonal category row (ascending right-to-left)
 *   • Two-column masonry grid with entrance animations
 *   • Fixed bottom tab bar
 *
 * MOTION:
 *   • Product cards: staggered fade + slide-up on mount
 *   • Category pills: smooth background/border transition via withTiming
 */
import React, { useMemo, useState, type ComponentType } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Polygon as SvgPolygon,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from 'react-native-svg';
import { CategoryPill } from '../components/CategoryPill';
import { DiscoverProductGrid } from '../components/DiscoverProductGrid';
import { DiscoverBottomNav } from '../components/DiscoverBottomNav';
import { HeroBackground, HERO_SHAPE_H } from '../components/HeroBackground';
import { COLORS, FONT, GRADIENTS, RADIUS, TAB_BAR_FRAME_HEIGHT_PT } from '../constants/theme';
import { CATEGORIES } from '../constants/products';
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
  const insets = useSafeAreaInsets();
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

  const scale = width / 390;
  // Cyan accent: clip to the full bottom chrome height (Figma tab bar + device home inset).
  const tabBarVisualPx = TAB_BAR_FRAME_HEIGHT_PT * scale;
  const tabBarLayoutPx = tabBarVisualPx + insets.bottom;
  // Safe-area: symmetric pad so L/R cutouts don’t skew content.
  const layoutPadH = Math.max(insets.left, insets.right);
  const innerWidth = width - 2 * layoutPadH;
  // Figma Discover 1:38 — content strip: 20pt margin + 350pt band + 20pt (frame 390 wide).
  const marginH = 20 * scale;
  const cardW = Math.min(350 * scale, innerWidth - 2 * marginH);
  const heroH   = HERO_SHAPE_H * (cardW / 350);
  // Hero section scale — maps Figma's 350pt card width to actual pixels
  const hs = cardW / 350;

  const lx = useMemo(
    () => ({
      padTop:       16 * scale,
      headerMb:     18 * scale,
      titleSize:    20 * scale,
      titleLh:      30 * scale,
      searchIcon:   20 * scale,
      searchBtn:    44 * scale,
      searchRadius: RADIUS.md * scale,
      // Figma 1:38 — tight hero ↔ categories ↔ grid; negative margin tucks row under hero lip
      heroMb:       2 * scale,
      promoSize:    26 * scale,
      promoLh:      39 * scale,
      catScrollMb:  0,
      catPv:        0,
      catPullUp:    8 * scale,
      catPr:        10 * scale,
      catPl:        10 * scale,
      /** 50pt pill + 4× stagger — keep in sync with `staggerStep`. */
      catMinH:      82 * scale,
      staggerStep:  8 * scale,
      // Figma 1:46 Categories: pill pitch 70pt → 50px pill + 20px gap (30→100→170…)
      pillGap:      20 * scale,
      // Tab bar is overlaid (see `DiscoverBottomNav`); reserve full chrome height + inset
      // so the last grid rows clear the opaque sheet; the masked wedge can show scroll content.
      scrollBottom: tabBarLayoutPx + 16 * scale,
      shadowUp:     20 * scale,
      shadowBlur:   30 * scale,
    }),
    [scale, tabBarLayoutPx],
  );

  // Blue geometric accent polygon — Figma node 1:40 (Rectangle 474).
  // Path (SVG-local): M262.5,167.5 L342,0 L413.5,59.5 V720.5 L0,705 Z
  // Frame offset (-20, 149) → 390pt-wide screen-space; lowest vertex y = 869.5.
  // Figma runs this to the physical bottom (behind tab chrome); stretch Y so the
  // same holds on any aspect ratio (x still scales with width only).
  const FIGMA_ACCENT_BOTTOM_Y = 869.5;
  const accentYStretch = height / (FIGMA_ACCENT_BOTTOM_Y * scale);
  const ay = (yPt: number) => yPt * scale * accentYStretch;
  const bgPolyPts = [
    `${322   * scale},${ay(149)}`,
    `${393.5 * scale},${ay(208.5)}`,
    `${393.5 * scale},${ay(869.5)}`,
    `${-20   * scale},${ay(854)}`,
    `${242.5 * scale},${ay(316.5)}`,
  ].join(' ');
  // Figma gradient (userSpaceOnUse): diagonal cyan→indigo
  //   SVG-local (188.5, 0.5) → (392.499, 720.5)
  //   Screen-space (frame offset −20, 149): (168.5, 149.5) → (372.5, 869.5)
  const gradX1 = 168.5 * scale;
  const gradY1 = ay(149.5);
  const gradX2 = 372.5 * scale;
  const gradY2 = ay(869.5);

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      {/* ─── Blue accent (1:40) — full height per Figma; tab bar draws on top */}
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
            <Stop offset="0" stopColor={GRADIENTS.accent[0]} stopOpacity="1" />
            <Stop offset="1" stopColor={GRADIENTS.accent[1]} stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <SvgPolygon points={bgPolyPts} fill="url(#bgAccent)" />
      </Svg>

      {/* ─── Scrollable content ──────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: lx.padTop,
          paddingBottom: 8,
          width,
          minWidth: width,
          alignItems: 'stretch',
        }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Full window width + symmetric padding so the band centers (ScrollView + shrink-wrap was biasing L). */}
        <View style={{ width, paddingHorizontal: layoutPadH, alignItems: 'center' }}>
        <View style={{ width: cardW }}>
        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <View style={[styles.header, { marginBottom: lx.headerMb }]}>
          <Text
            style={[
              styles.headerTitle,
              { fontSize: lx.titleSize, lineHeight: lx.titleLh },
            ]}
          >
            Choose Your Bike
          </Text>
          <View
            style={[
              styles.searchBtnGlow,
              {
                shadowOffset: { width: 0, height: -lx.shadowUp },
                shadowRadius: lx.shadowBlur,
              },
            ]}
          >
            <TouchableOpacity onPress={handleCartPress} activeOpacity={0.85}>
              <View
                style={[
                  {
                    position:     'relative',
                    width:        lx.searchBtn,
                    height:       lx.searchBtn,
                    borderRadius: lx.searchRadius,
                  },
                  {
                    shadowColor:   '#10141c',
                    shadowOffset:  { width: 0, height: lx.shadowUp },
                    shadowOpacity: 1,
                    shadowRadius:  lx.shadowBlur,
                    elevation:     10,
                  },
                ]}
              >
                <View
                  style={[
                    StyleSheet.absoluteFillObject,
                    { borderRadius: lx.searchRadius, overflow: 'hidden' },
                  ]}
                >
                  <LinearGradient
                    colors={GRADIENTS.accent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={[styles.searchBtnIconLayer, { borderRadius: lx.searchRadius }]}>
                    <SearchIcon size={lx.searchIcon} color="#fafeff" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── HERO CARD ──────────────────────────────────────────────────────── */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/detail')}
          style={[styles.heroCard, { width: cardW, height: heroH, marginBottom: lx.heroMb }]}
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
            <Text
              style={[
                styles.heroPromoText,
                { fontSize: lx.promoSize, lineHeight: lx.promoLh },
              ]}
            >
              30% Off
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── CATEGORIES ─────────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[
            styles.categoryScroll,
            { marginTop: -lx.catPullUp, marginBottom: lx.catScrollMb },
          ]}
          contentContainerStyle={[
            styles.categoryContent,
            {
              paddingVertical: lx.catPv,
              paddingLeft:  lx.catPl,
              paddingRight: lx.catPr,
              minHeight:    lx.catMinH,
            },
          ]}
        >
          {CATEGORIES.map((cat, i) => (
            <View
              key={cat}
              // Ascending stagger: first (All) is lowest, last (Accessory) is highest
              style={{
                marginTop: (CATEGORIES.length - 1 - i) * lx.staggerStep,
                marginRight: lx.pillGap,
              }}
            >
              <CategoryPill
                label={cat}
                icon={categoryIcons[cat]}
                isActive={activeCategory === cat}
                frosted={i >= CATEGORIES.length - 2}
                onPress={setActiveCategory}
              />
            </View>
          ))}
        </ScrollView>

        <DiscoverProductGrid
          bandWidth={cardW}
          onProductPress={handleProductPress}
          leftColumnTopOffset={22}
        />

        {/* Scroll padding so last items aren't hidden behind tab bar */}
        <View style={{ height: lx.scrollBottom }} />
        </View>
        </View>
      </ScrollView>

      <DiscoverBottomNav
        onCartPress={handleCartPress}
        style={{
          position: 'absolute',
          left:      0,
          right:     0,
          bottom:    0,
          zIndex:    10,
        }}
      />
    </View>
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

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: FONT.bold,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  // Upper glow layer — Figma: #2B3445 @ 0.5, offset y=-20, radius 30 (scaled inline)
  searchBtnGlow: {
    shadowColor: '#2b3445',
    shadowOpacity: 0.5,
    elevation: 0,
  },
  // Bottom drop shadow on outer shell (Figma ~1:44) — gradient clipped inside so shadow isn’t cut off.
  searchBtnIconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems:     'center',
    justifyContent: 'center',
    borderWidth:    1,
    borderColor:    'rgba(255,255,255,0.35)',
  },

  // ── Hero Card ────────────────────────────────────────────────────────────────
  // Figma: Top Card node 1:139 — 350×~237pt with electric bike + "30% Off"
  // height is now dynamic (heroH), shadow lives in HeroBackground SVG component
  heroCard: {
    overflow: 'visible',
  },
  heroPromoText: {
    fontFamily: FONT.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: -0.3,
  },

  // ── Categories ───────────────────────────────────────────────────────────────
  categoryScroll: {},
  categoryContent: {
    alignItems: 'flex-start',
    // minHeight / padding scaled inline — 90pt strip = 50 pill + 40 stagger at 390
  },

});
