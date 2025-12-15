import React from 'react';
import Svg, { Path } from 'react-native-svg';

type TrashIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export const TrashIcon: React.FC<TrashIconProps> = ({
  size = 22,
  color = '#ff3b30',
  strokeWidth = 2,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6H20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 6V4.5C10 3.67157 10.6716 3 11.5 3H12.5C13.3284 3 14 3.67157 14 4.5V6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 6L8 20H16L17 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 11V17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M12 11V17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M14 11V17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};
