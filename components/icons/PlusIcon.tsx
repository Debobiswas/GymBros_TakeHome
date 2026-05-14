import React from 'react';
import Svg, { Line } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/** Thin + — cart quantity plus (Figma-style SF Symbol weight). */
export function PlusIcon({ size = 14, color = '#FFFFFF', strokeWidth = 1.35 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Line
        x1="8"
        y1="3.5"
        x2="8"
        y2="12.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="3.5"
        y1="8"
        x2="12.5"
        y2="8"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
