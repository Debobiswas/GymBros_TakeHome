import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props { size?: number; color?: string }

// SF Symbol: magnifyingglass — Figma node 1:45, native 20 × 20
export function SearchIcon({ size = 20, color = '#fafeff' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path
        fill={color}
        fillRule="evenodd"
        d="M 8.5 1 C 4.36 1 1 4.36 1 8.5 C 1 12.64 4.36 16 8.5 16 C 10.28 16 11.94 15.37 13.24 14.31 L 18.47 19.53 C 18.76 19.82 19.24 19.82 19.53 19.53 C 19.82 19.24 19.82 18.76 19.53 18.47 L 14.31 13.24 C 15.37 11.94 16 10.28 16 8.5 C 16 4.36 12.64 1 8.5 1 Z M 8.5 3 A 5.5 5.5 0 1 1 8.5 14 A 5.5 5.5 0 1 1 8.5 3 Z"
      />
    </Svg>
  );
}
