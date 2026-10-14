/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ISA-101 Process & Connector Flow Lines
 * Section 8.4: Primary process lines 3px (#A0A0A4), Secondary lines 1px.
 * Dynamic animated flow dashes indicate active fluid transit.
 */

import React from 'react';

interface ProcessFlowLineProps {
  d: string;
  isPrimary?: boolean;
  isActive?: boolean;
  className?: string;
  strokeColor?: string;
}

export const ProcessFlowLine: React.FC<ProcessFlowLineProps> = ({
  d,
  isPrimary = true,
  isActive = true,
  className = '',
  strokeColor = '#a0a0a4',
}) => {
  const strokeWidth = isPrimary ? 3 : 1.5;

  return (
    <g className={className}>
      {/* Base Solid Process Pipe */}
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Animated Liquid Flow Overlay (dashed) */}
      {isActive && (
        <path
          d={d}
          fill="none"
          stroke="#475ca7"
          strokeWidth={strokeWidth - 0.5}
          strokeDasharray="6,8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pipe-flow opacity-70"
        />
      )}
    </g>
  );
};
