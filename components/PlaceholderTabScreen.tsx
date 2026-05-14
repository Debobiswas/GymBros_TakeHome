/**
 * Minimal shell for non–Discover stack routes that still show the Figma tab bar.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DiscoverBottomNav } from './DiscoverBottomNav';
import { COLORS, FONT, GRADIENTS, RADIUS, TAB_BAR_FRAME_HEIGHT_PT } from '../constants/theme';
import type { TabName } from './BottomTabBar';

export interface PlaceholderTabScreenProps {
  title: string;
  activeTab: TabName;
}

export function PlaceholderTabScreen({ title, activeTab }: PlaceholderTabScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = width / 390;
  const tabBarChrome = TAB_BAR_FRAME_HEIGHT_PT * scale + insets.bottom;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={GRADIENTS.accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backBtn}
          >
            <Text style={styles.backChevron}>‹</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={[styles.body, { paddingBottom: tabBarChrome + 24 * scale }]}>
        <Text style={styles.kicker}>Coming soon</Text>
        <Text style={styles.sub}>This section is under construction.</Text>
      </View>

      <DiscoverBottomNav
        activeTab={activeTab}
        onCartPress={() => router.push('/cart')}
        style={styles.tabBar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  backChevron: {
    fontSize: 26,
    color: COLORS.white,
    lineHeight: 28,
    marginTop: -2,
  },
  headerTitle: {
    flex: 1,
    fontFamily: FONT.bold,
    fontSize: 20,
    lineHeight: 30,
    color: COLORS.white,
    letterSpacing: -0.3,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  kicker: {
    fontFamily: FONT.semibold,
    fontSize: 17,
    color: COLORS.white,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textLo,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
});
