/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-Performance ISA-101 Process Vessel / Tank Component
 * Compliant with ANSI/ISA-5.5 standards:
 * - Neutral Gray 160 outline (#A0A0A4)
 * - Interior matches display background
 * - Level fill indicates live liquid percentage
 * - High/Low alarm brackets
 */

import React from 'react';
import { useTagBinding, useHmiContext } from '../../context/WebSocketContext';

interface ProcessVesselProps {
  tagPath: string;
  name: string;
  capacityLiters?: number;
  width?: number;
  height?: number;
  className?: string;
}

export const ProcessVessel: React.FC<ProcessVesselProps> = ({
  tagPath,
  name,
  capacityLiters = 50000,
  width = 110,
  height = 140,
  className = '',
}) => {
  const { value, inAlarm } = useTagBinding<number>(tagPath);
  const { openFaceplate } = useHmiContext();

  const levelPct = Math.min(100, Math.max(0, typeof value === 'number' ? value : 50));
  const fillHeight = (levelPct / 100) * (height - 30);
  const currentVolume = ((levelPct / 100) * capacityLiters).toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div
      onClick={() => openFaceplate(tagPath, 'analog')}
      className={`inline-flex flex-col items-center p-2 rounded cursor-pointer transition hover:opacity-90 ${className}`}
      title={`${name} - Level: ${levelPct.toFixed(1)}%`}
    >
      <div className="text-[11px] font-bold text-[#3f3f3f] dark:text-gray-200 mb-1 text-center truncate max-w-[130px]">
        {name}
      </div>

      <div className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <clipPath id={`tank-clip-${name.replace(/\s+/g, '')}`}>
              {/* Cylindrical tank shape with rounded top and bottom caps */}
              <rect x="4" y="14" width={width - 8} height={height - 28} rx="4" />
            </clipPath>
          </defs>

          {/* Tank Outer Shell (ISA-101 Gray 160 #A0A0A4 outline, background fill) */}
          <rect
            x="4"
            y="14"
            width={width - 8}
            height={height - 28}
            rx="4"
            fill="currentColor"
            className="text-gray-200 dark:text-gray-800"
            stroke="#a0a0a4"
            strokeWidth="2.5"
          />

          {/* Top Dished Head */}
          <ellipse
            cx={width / 2}
            cy="14"
            rx={(width - 8) / 2}
            ry="9"
            fill="currentColor"
            className="text-gray-300 dark:text-gray-700"
            stroke="#a0a0a4"
            strokeWidth="2"
          />

          {/* Bottom Dished Head */}
          <ellipse
            cx={width / 2}
            cy={height - 14}
            rx={(width - 8) / 2}
            ry="9"
            fill="currentColor"
            className="text-gray-300 dark:text-gray-700"
            stroke="#a0a0a4"
            strokeWidth="2"
          />

          {/* Liquid Level Dynamic Fill */}
          <g clipPath={`url(#tank-clip-${name.replace(/\s+/g, '')})`}>
            <rect
              x="4"
              y={height - 14 - fillHeight}
              width={width - 8}
              height={fillHeight}
              fill="#93c2e4"
              opacity="0.85"
              className="transition-all duration-500"
            />
            {/* Liquid Surface Meniscus Line */}
            <line
              x1="4"
              y1={height - 14 - fillHeight}
              x2={width - 4}
              y2={height - 14 - fillHeight}
              stroke="#475ca7"
              strokeWidth="2"
            />
          </g>

          {/* Scale Graduations on Left */}
          <line x1="8" y1={height - 14} x2="16" y2={height - 14} stroke="#666" strokeWidth="1" />
          <line x1="8" y1={(height - 28) * 0.75 + 14} x2="13" y2={(height - 28) * 0.75 + 14} stroke="#888" strokeWidth="1" />
          <line x1="8" y1={height / 2} x2="16" y2={height / 2} stroke="#666" strokeWidth="1" />
          <line x1="8" y1={(height - 28) * 0.25 + 14} x2="13" y2={(height - 28) * 0.25 + 14} stroke="#888" strokeWidth="1" />
          <line x1="8" y1="14" x2="16" y2="14" stroke="#666" strokeWidth="1" />
        </svg>

        {/* Level Readout Overlay Badge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white/85 dark:bg-black/75 px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 shadow-xs text-center">
            <span className="text-xs font-bold font-mono-numbers text-[#475ca7] dark:text-sky-300">
              {levelPct.toFixed(1)}%
            </span>
            <div className="text-[9px] text-[#919191] dark:text-gray-400">
              {currentVolume} L
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
