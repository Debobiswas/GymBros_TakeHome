/**
 * Product Detail Screen — Figma node 1:557
 *
 * Layout:
 *   • Diagonal SVG polygon accent (#37B6E9 → #4B4CED) — dark navy visible left, blue right
 *   • Back button: 44×44 r=10 gradient pill with shadow
 *   • Bike image centred in hero (Figma ~1:176 — scales from ~358×286 @ 390), 3-dot carousel below
 *   • Bottom sheet: y=394, h=450, r=30 top corners, detailSheet gradient (darker base → GRADIENTS.detailSheet)
 *   • Tab switcher at sheet y=32 — Figma 1:183 (Categories): neumorphic raised / inset
 *   • Content at sheet y=102: description title + body, or API spec table
 *   • Buy bar at sheet y=346: h=104, r=50 top, bg=#262E3D (no box shadow — RN clips badly vs r=50)
 *     price (#3D9CEA, 24pt Regular) + Add to Cart button (gradient, 160×44, r=10)
 *
 * MOTION:
 *   • Bottom sheet entrance: translateY +80→0 withSpring, opacity 0→1
 *   • Add to Cart: scale 0.93 on press withSpring
 *   • Tab switch: instant style swap (neumorphic states from Figma 1:183)
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon as SvgPolygon, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useApiData } from '../hooks/useApiData';
import { DetailTabSwitcher } from '../components/DetailTabSwitcher';
import { COLORS, FONT, GRADIENTS, RADIUS } from '../constants/theme';
import { IMAGES } from '../constants/images';
import type { TabKey } from '../types';

const PRODUCT_DESCRIPTION =
  "The LR01 uses the same design as the most iconic bikes from PEUGEOT Cycles' " +
  "130-year history and combines it with agile, dynamic performance that's " +
  "perfectly suited to navigating today's cities. As well as a lugged steel " +
  "frame and iconic PEUGEOT black-and-white chequer design, this city bike " +
  'also features a 16-speed Shimano Claris drivetrain.';

export default function DetailScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const { width, height } = useWindowDimensions();
  const scale = width / 390;
  /** Hero bike — Figma ~1:176 @ 390pt baseline; scales with `width / 390`. */
  const DETAIL_BIKE_W_PT = 358;
  const DETAIL_BIKE_H_PT = 286;
  const bikeW = Math.min(DETAIL_BIKE_W_PT * scale, width - 12);
  const bikeH = DETAIL_BIKE_H_PT * scale;
  const [tab, setTab] = useState<TabKey>('description');
  const { data: apiSpecs, loading: apiLoading, error: apiError } = useApiData();

  // Figma node 1:560 "Rectangle 475" — diagonal accent polygon
  // Vector path at position (8, -80): screen coords = local + offset
  const bgPolyPts = [
    `${270.5 * scale},${87.5 * scale}`,
    `${350 * scale},${-80 * scale}`,
    `${421.5 * scale},${-20.5 * scale}`,
    `${421.5 * scale},${640.5 * scale}`,
    `${8 * scale},${625 * scale}`,
  ].join(' ');

  // ── Bottom-sheet entrance ──────────────────────────────────────────────────
  const sheetY   = useSharedValue(80);
  const sheetOpa = useSharedValue(0);
  useEffect(() => {
    sheetY.value   = withSpring(0, { damping: 20, stiffness: 120 });
    sheetOpa.value = withTiming(1, { duration: 400 });
  }, []);
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value }],
    opacity: sheetOpa.value,
  }));

  // ── Add to Cart press ──────────────────────────────────────────────────────
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const cartTap = Gesture.Tap()
    .onBegin(() => { 'worklet'; btnScale.value = withSpring(0.93, { damping: 14, stiffness: 200 }); })
    .onFinalize(() => { 'worklet'; btnScale.value = withSpring(1, { damping: 14, stiffness: 200 }); });

  const productTitle = (name ?? 'PEUGEOT - LR01').toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Diagonal accent polygon (Figma 1:560) — dark navy left, blue right ── */}
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <SvgGradient id="detailBg" x1="0.4" y1="1" x2="0.55" y2="0">
            <Stop offset="0" stopColor="#37B6E9" stopOpacity="1" />
            <Stop offset="1" stopColor="#4B4CED" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <SvgPolygon points={bgPolyPts} fill="url(#detailBg)" />
      </Svg>

      {/* ── Top navigation (Figma: x=20, y=60, back btn 44×44 r=10) ───────── */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backBtn}
          >
            <Text style={styles.backChevron}>‹</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>{productTitle}</Text>
      </View>

      {/* ── Product image + dots ──────────────────────────────────────────── */}
      <View style={styles.imageSection}>
        <Image
          source={{ uri: IMAGES.detailBike }}
          style={[styles.bikeImage, { width: bikeW, height: bikeH }]}
          resizeMode="contain"
        />
        <Image
          source={{ uri: IMAGES.bikeShadow }}
          style={[
            styles.bikeShadow,
            { width: bikeW * 0.88, marginTop: -10 * scale },
          ]}
          resizeMode="contain"
        />
        {/* Dots — Figma: 3 circles 5.4pt, active=white, inactive=white@20% */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* ── Bottom sheet (Figma: y=394, h=450, r=30 top) ─────────────────── */}
      <Animated.View style={[styles.sheet, sheetStyle]}>

        {/* Main content area with gradient bg */}
        <LinearGradient
          colors={[...GRADIENTS.detailSheet]}
          locations={[0, 0.48, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.sheetGradient}
        >
          <DetailTabSwitcher tab={tab} onChange={setTab} scale={scale} />

          {/* Content — Figma: x=27 in sheet, y=102 in sheet */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentPad}
            showsVerticalScrollIndicator={false}
          >
            {tab === 'description' ? (
              <>
                <Text style={styles.descTitle}>{productTitle}</Text>
                <Text style={styles.descBody}>{PRODUCT_DESCRIPTION}</Text>
              </>
            ) : apiLoading ? (
              <ActivityIndicator color={COLORS.accentA} size="large" style={styles.loader} />
            ) : apiError ? (
              <Text style={styles.errorText}>Could not load specs: {apiError}</Text>
            ) : (
              <View style={styles.specTable}>
                {apiSpecs.slice(0, 1).map((item) =>
                  item.data
                    ? Object.entries(item.data).map(([key, val]) => (
                        <View key={key} style={styles.specRow}>
                          <Text style={styles.specKey}>{key.replace(/_/g, ' ').toUpperCase()}</Text>
                          <Text style={styles.specVal}>{String(val)}</Text>
                        </View>
                      ))
                    : null,
                )}
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>FRAME</Text>
                  <Text style={styles.specVal}>Lugged Steel</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>DRIVETRAIN</Text>
                  <Text style={styles.specVal}>Shimano Claris 16-speed</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>WEIGHT</Text>
                  <Text style={styles.specVal}>9.8 kg</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>TIRE SIZE</Text>
                  <Text style={styles.specVal}>700 × 28c</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </LinearGradient>

        {/* Buy bar — overlaps sheet gradient by r=xxl so rounded top corners are not transparent over gap */}
        <View style={styles.buyBar}>
          <Text style={styles.priceText}>$ 1,999.99</Text>
          <GestureDetector gesture={cartTap}>
            <Animated.View style={btnStyle}>
              {/* Shadow on outer wrapper; inner clip keeps blur from bleeding past r=10 */}
              <View style={styles.addToCartBtnShadow}>
                <View style={styles.addToCartBtnClip}>
                  <LinearGradient
                    colors={GRADIENTS.accent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addToCartBtnFill}
                  >
                    <Text style={styles.addToCartLabel}>Add to Cart</Text>
                  </LinearGradient>
                </View>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── Navigation ─────────────────────────────────────────────────────────────
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 16,
  },
  // Back button: 44×44, r=10, gradient, shadow y=+20 r=30 + glow y=-20 r=30
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#101420',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 10,
  },
  backChevron: {
    fontSize: 26,
    color: COLORS.white,
    lineHeight: 28,
    marginTop: -2,
  },
  // Title: Poppins Bold 20pt, white, letterSpacing -0.3
  navTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 30,
    color: COLORS.white,
    letterSpacing: -0.3,
    flex: 1,
  },

  // ── Product image ───────────────────────────────────────────────────────────
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  bikeImage: {
    alignSelf: 'center',
  },
  bikeShadow: {
    height: 16,
    opacity: 0.45,
    alignSelf: 'center',
  },
  // Dots: 3 circles 6pt, gap 7pt. Active = white, inactive = white @ 20%
  dots: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
  },

  // ── Bottom sheet ────────────────────────────────────────────────────────────
  // Figma: y=394, h=450, cornerRadius=30 top, shadow y=-20 r=60 black@25%
  sheet: {
    height: 450,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.25,
    shadowRadius: 60,
    elevation: 20,
  },
  // Sheet gradient bg: #353F54 → #222834
  sheetGradient: {
    flex: 1,
    flexDirection: 'column',
    paddingTop: 32, // tabs at sheet y=32
  },

  // ── Content area ────────────────────────────────────────────────────────────
  // Figma: description frame x=27 in sheet
  contentScroll: { flex: 1 },
  contentPad: {
    flexGrow: 1,
    paddingHorizontal: 27,
    // Extra bottom space: buy bar overlaps gradient by RADIUS.xxl so rounded top clears the seam
    paddingBottom: RADIUS.xxl + 16,
  },
  // Description title: Poppins Bold ~17pt, white
  descTitle: {
    fontFamily: FONT.bold,
    fontSize: 17,
    color: COLORS.white,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  // Description body: Poppins Regular 13pt, white @ 60%, lineHeight 22
  descBody: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textLo,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  loader: { marginTop: 24 },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: 'rgba(255,80,80,0.75)',
    textAlign: 'center',
    marginTop: 20,
  },
  specTable: { gap: 10 },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    paddingBottom: 8,
  },
  specKey: {
    fontFamily: FONT.semibold,
    fontSize: 11,
    color: COLORS.textLo,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  specVal: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.textHi,
    textAlign: 'right',
    flex: 1,
  },

  // ── Buy bar ─────────────────────────────────────────────────────────────────
  // Figma: h=104, bg=#262E3D, r=50 top (native box shadow omitted vs. large r)
  // Content row: paddingH=35 (Figma x=35 for price/button row)
  buyBar: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    backgroundColor: '#262E3D',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.detailBuyBarTopBorder,
    // Pull up so sheet gradient paints behind the transparent top-corner caps of the rounded rect
    marginTop: -RADIUS.xxl,
  },
  // Price: Poppins Regular 24pt, #3D9CEA blue, letterSpacing -0.3
  priceText: {
    fontFamily: FONT.regular,
    fontSize: 24,
    color: COLORS.priceBlue,
    letterSpacing: -0.3,
  },
  // Button: 160×44, r=10 — shadow on sibling shell (see addToCartBtnShadow)
  addToCartBtnShadow: {
    borderRadius: RADIUS.md,
    backgroundColor: '#262E3D',
    shadowColor: '#101420',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 1,
    shadowRadius: 60,
    elevation: 10,
  },
  addToCartBtnClip: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  addToCartBtnFill: {
    width: 160,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Button label: Poppins Medium 15pt, white, letterSpacing -0.3
  addToCartLabel: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
});
