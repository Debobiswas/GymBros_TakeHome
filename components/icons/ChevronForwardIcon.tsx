import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** SF-style `chevron.forward` — cart checkout thumb (Figma 1:234, 28×28 @ baseline). */
export function ChevronForwardIcon({
  size = 28,
  color = '#FFFFFF',
  strokeWidth = 2.5,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      <Path
        d="M 11 9 L 17 14 L 11 19"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
