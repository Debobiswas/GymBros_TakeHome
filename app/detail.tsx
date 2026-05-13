/**
 * Product Detail Screen
 *
 * Layout mirrors Figma node 1:557:
 *   • Full-bleed bike image against dark background
 *   • 3-dot image carousel indicator
 *   • Bottom sheet sliding up on mount with Description/Specification tabs
 *   • [FREE DATA] area populated from restful-api.dev
 *   • Price + "Add to Cart" gradient button (shrinks on press)
 *
 * MOTION:
 *   • Bottom sheet entrance: translateY from +80 → 0, opacity 0 → 1 (withSpring)
 *   • Add to Cart button: scale 0.93 on press (withSpring)
 *   • Tab switch: withTiming on border + text color
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useApiData } from '../hooks/useApiData';
import { COLORS, FONT, GRADIENTS, RADIUS } from '../constants/theme';
import { IMAGES } from '../constants/images';
import type { TabKey } from '../types';

const PRODUCT_DESCRIPTION =
  "The LR01 uses the same design as the most iconic bikes from PEUGEOT Cycles' " +
  '130-year history and combines it with agile, dynamic performance perfectly ' +
  "suited to navigating today's cities. Features a 16-speed Shimano Claris drivetrain.";

export default function DetailScreen() {
  const { name } = useLocalSearchParams<{ name?: string }>();
  const { width }  = useWindowDimensions();
  const [tab, setTab] = useState<TabKey>('description');

  // FREE DATA
  const { data: apiSpecs, loading: apiLoading, error: apiError } = useApiData();

  // ── Bottom-sheet entrance animation ────────────────────────────────────────
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

  // ── Add to Cart press animation ─────────────────────────────────────────────
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const cartTap = Gesture.Tap()
    .onBegin(() => {
      'worklet';
      btnScale.value = withSpring(0.93, { damping: 14, stiffness: 200 });
    })
    .onFinalize(() => {
      'worklet';
      btnScale.value = withSpring(1, { damping: 14, stiffness: 200 });
    });

  // ── Tab indicator animation ─────────────────────────────────────────────────
  const descProgress = useSharedValue(tab === 'description' ? 1 : 0);
  const specProgress = useSharedValue(tab === 'specification' ? 1 : 0);

  useEffect(() => {
    descProgress.value = withTiming(tab === 'description' ? 1 : 0, { duration: 220 });
    specProgress.value = withTiming(tab === 'specification' ? 1 : 0, { duration: 220 });
  }, [tab]);

  const descTabStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      descProgress.value, [0, 1], ['#28303f', '#323b4f'],
    ),
  }));
  const specTabStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      specProgress.value, [0, 1], ['#28303f', '#323b4f'],
    ),
  }));

  const productTitle = name ?? 'PEUGEOT - LR01';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Background gradient ─────────────────────────────────────────────── */}
      <LinearGradient
        colors={['#1a2235', COLORS.bg]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* ── Top navigation ──────────────────────────────────────────────────── */}
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
        <Text style={styles.navTitle} numberOfLines={1}>
          {productTitle}
        </Text>
      </View>

      {/* ── Product image ───────────────────────────────────────────────────── */}
      <View style={styles.imageSection}>
        <Image
          source={{ uri: IMAGES.detailBike }}
          style={[styles.bikeImage, { width: width * 0.75 }]}
          resizeMode="contain"
        />
        {/* Shadow under bike */}
        <Image
          source={{ uri: IMAGES.bikeShadow }}
          style={[styles.bikeShadow, { width: width * 0.75 }]}
          resizeMode="contain"
        />
        {/* Dot indicators */}
        <View style={styles.dots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </View>

      {/* ── Bottom sheet ────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.sheet, sheetStyle]}>
        <LinearGradient
          colors={GRADIENTS.sheet}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sheetGradient}
        >
          {/* ── Tab switcher ─────────────────────────────────────────────────── */}
          <View style={styles.tabs}>
            <TouchableOpacity onPress={() => setTab('description')} activeOpacity={0.85}>
              <Animated.View style={[styles.tabBtn, descTabStyle]}>
                <Text
                  style={[
                    styles.tabLabel,
                    tab === 'description' ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  Description
                </Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTab('specification')} activeOpacity={0.85}>
              <Animated.View style={[styles.tabBtn, specTabStyle]}>
                <Text
                  style={[
                    styles.tabLabel,
                    tab === 'specification' ? styles.tabLabelActive : styles.tabLabelInactive,
                  ]}
                >
                  Specification
                </Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* ── Content area (FREE DATA / Description) ───────────────────────── */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentPad}
            showsVerticalScrollIndicator={false}
          >
            {tab === 'description' ? (
              <Text style={styles.descriptionText}>{PRODUCT_DESCRIPTION}</Text>
            ) : (
              /* ── FREE DATA from restful-api.dev ─────────────────────────── */
              apiLoading ? (
                <ActivityIndicator color={COLORS.accentA} size="large" style={styles.loader} />
              ) : apiError ? (
                <Text style={styles.errorText}>Could not load specs: {apiError}</Text>
              ) : (
                <View style={styles.specTable}>
                  {apiSpecs.slice(0, 1).map((item) =>
                    item.data
                      ? Object.entries(item.data).map(([key, val]) => (
                          <View key={key} style={styles.specRow}>
                            <Text style={styles.specKey}>
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Text>
                            <Text style={styles.specVal}>{String(val)}</Text>
                          </View>
                        ))
                      : null,
                  )}
                  {/* Static bike specs padded alongside API data */}
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
              )
            )}
          </ScrollView>
        </LinearGradient>

        {/* ── Buy Now bar ─────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#262e3d', '#1e2531']}
          style={styles.buyBar}
        >
          <Text style={styles.priceText}>$ 1,999.99</Text>

          <GestureDetector gesture={cartTap}>
            <Animated.View style={btnStyle}>
              <LinearGradient
                colors={GRADIENTS.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addToCartBtn}
              >
                <Text style={styles.addToCartLabel}>Add to Cart</Text>
              </LinearGradient>
            </Animated.View>
          </GestureDetector>
        </LinearGradient>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ── Navigation ───────────────────────────────────────────────────────────────
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Figma stroke: 1pt white→black @ 60% OVERLAY — hairline white at ~35% alpha
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  backChevron: {
    fontSize: 26,
    color: COLORS.white,
    lineHeight: 28,
    marginTop: -2,
  },
  navTitle: {
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 30,
    color: COLORS.white,
    letterSpacing: -0.3,
    flex: 1,
  },

  // ── Product image ────────────────────────────────────────────────────────────
  imageSection: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 8,
    paddingBottom: 4,
  },
  bikeImage: {
    height: 200,
  },
  bikeShadow: {
    height: 14,
    opacity: 0.6,
    marginTop: -8,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 18,
    borderRadius: 3,
  },

  // ── Bottom sheet ─────────────────────────────────────────────────────────────
  sheet: {
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    height: 380,
  },
  sheetGradient: {
    flex: 1,
    paddingTop: 20,
  },

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  tabs: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  tabBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    shadowColor: '#202633',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: {
    fontFamily: FONT.regular,
    fontSize: 15,
    letterSpacing: 0.35,
  },
  tabLabelActive: {
    fontFamily: FONT.bold,
    color: COLORS.priceBlue,
  },
  tabLabelInactive: {
    color: COLORS.textLo,
  },

  // ── Content ──────────────────────────────────────────────────────────────────
  contentScroll: {
    flex: 1,
  },
  contentPad: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  descriptionText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textLo,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: 'rgba(255,80,80,0.75)',
    textAlign: 'center',
    marginTop: 20,
  },

  // ── Spec table (FREE DATA) ────────────────────────────────────────────────────
  specTable: {
    gap: 10,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
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

  // ── Buy Now bar ───────────────────────────────────────────────────────────────
  buyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255,255,255,0.10)',
  },
  priceText: {
    fontFamily: FONT.regular,
    fontSize: 24,
    color: COLORS.priceBlue,
    letterSpacing: -0.3,
  },
  addToCartBtn: {
    width: 160,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Match Figma's white→black 60% OVERLAY stroke — hairline white at 35% alpha
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#10141c',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  addToCartLabel: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
});
