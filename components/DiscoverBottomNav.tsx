/**
 * Discover screen bottom navigation — composes `BottomTabBar` (Figma 1:146)
 * with this screen’s routing behavior. Edit tab actions here; edit geometry
 * and visuals in `BottomTabBar.tsx`.
 */
import React from 'react';
import type { ViewStyle } from 'react-native';
import { router, usePathname } from 'expo-router';
import { BottomTabBar, type TabName } from './BottomTabBar';

export interface DiscoverBottomNavProps {
  onCartPress: () => void;
  activeTab?: TabName;
  style?: ViewStyle;
}

type PlaceholderPath = '/map' | '/profile' | '/docs';

function isDiscoverPath(pathname: string) {
  return pathname === '/' || pathname === '/index' || pathname === '';
}

export function DiscoverBottomNav({
  onCartPress,
  activeTab = 'discover',
  style,
}: DiscoverBottomNavProps) {
  const pathname = usePathname();

  function goPlaceholder(path: PlaceholderPath) {
    if (pathname === path) return;
    if (isDiscoverPath(pathname)) router.push(path);
    else router.replace(path);
  }

  return (
    <BottomTabBar
      activeTab={activeTab}
      onTabPress={(tab) => {
        if (tab === 'discover') {
          if (!isDiscoverPath(pathname)) router.replace('/');
          return;
        }
        if (tab === 'cart') {
          if (pathname !== '/cart') onCartPress();
          return;
        }
        if (tab === 'map') {
          goPlaceholder('/map');
          return;
        }
        if (tab === 'profile') {
          goPlaceholder('/profile');
          return;
        }
        if (tab === 'docs') {
          goPlaceholder('/docs');
          return;
        }
      }}
      style={style}
    />
  );
}
