/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-Performance ISA-101 Analog Indicator & Sparkline Bar Graph
 * Section 8.12.5 & 8.12.8 of Rockwell Process HMI Style Guide
 * 
 * Includes:
 * - Scale range (EU Min to EU Max)
 * - Normal operating range band
 * - Alarm threshold markers (Hi-Hi, Hi, Lo, Lo-Lo)
 * - Current value needle indicator with dynamic alarm border
 * - Right-justified numeric value with engineering unit
 * - Integrated historical sparkline trace
 */

import React, { useMemo } from 'react';
import { useTagBinding, useHmiContext } from '../../context/WebSocketContext';
import { simulationEngine } from '../../services/realtime/simulationEngine';
import { ISA_COLORS } from '../../types/hmi';

interface AnalogIndicatorProps {
  tagPath: string;
  height?: number;
  showSparkline?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const AnalogIndicator: React.FC<AnalogIndicatorProps> = ({
  tagPath,
  height = 140,
  showSparkline = true,
  orientation = 'vertical',
  className = '',
}) => {
  const { value, metadata, inAlarm, alarm } = useTagBinding<number>(tagPath);
  const { openFaceplate } = useHmiContext();

  const numVal = typeof value === 'number' ? value : 0;
  const min = metadata?.euMin ?? 0;
  const max = metadata?.euMax ?? 100;
  const range = Math.max(0.0001, max - min);

  // Normalize position 0 to 100%
  const percent = Math.min(100, Math.max(0, ((numVal - min) / range) * 100));

  // Normal band
  const normMinPct = metadata ? ((metadata.normalMin - min) / range) * 100 : 35;
  const normMaxPct = metadata ? ((metadata.normalMax - min) / range) * 100 : 75;

  // Limits
  const hiPct = metadata?.highLimit !== undefined ? ((metadata.highLimit - min) / range) * 100 : null;
  const hiHiPct = metadata?.highHighLimit !== undefined ? ((metadata.highHighLimit - min) / range) * 100 : null;
  const loPct = metadata?.lowLimit !== undefined ? ((metadata.lowLimit - min) / range) * 100 : null;
  const loLoPct = metadata?.lowLowLimit !== undefined ? ((metadata.lowLowLimit - min) / range) * 100 : null;

  // Fetch sparkline points from simulation buffer
  const sparklineHistory = useMemo(() => {
    const raw = simulationEngine.getTrendHistory(tagPath);
    if (!raw || raw.length === 0) return '';
    // Sample 25 points
    const step = Math.max(1, Math.floor(raw.length / 25));
    const sampled = raw.filter((_, idx) => idx % step === 0).slice(-25);
    const width = 64;
    const h = 26;

    const coords = sampled.map((pt, i) => {
      const x = (i / (sampled.length - 1)) * width;
      const yNorm = Math.min(1, Math.max(0, (pt.value - min) / range));
      const y = h - yNorm * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    return coords.join(' ');
  }, [tagPath, min, range, value]);

  const alarmBorder = inAlarm
    ? alarm?.state === 'UNACK_ALARM'
      ? 'border-[#e22028] animate-alarm-blink'
      : 'border-[#e22028]'
    : 'border-[#a0a0a4]';

  return (
    <div
      onClick={() => openFaceplate(tagPath, 'analog')}
      className={`relative inline-flex flex-col bg-[#e8e8e8] dark:bg-[#1f242e] border-2 rounded p-2 transition shadow-sm cursor-pointer hover:shadow-md ${alarmBorder} ${className}`}
      title={`${metadata?.name || tagPath} - Click for Faceplate`}
    >
      {/* Label and Alarm icon */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[10px] font-bold text-[#3f3f3f] dark:text-gray-200 truncate max-w-[130px]">
          {metadata?.name || tagPath.split('/').pop()}
        </span>
        {inAlarm && (
          <span
            className="text-[9px] font-bold px-1 rounded text-white"
            style={{ backgroundColor: ISA_COLORS.alarmUrgent }}
          >
            !
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Vertical Bar Graph */}
        <div
          className="relative w-6 bg-[#d4d4d4] dark:bg-gray-800 border border-[#a0a0a4] rounded-sm"
          style={{ height: `${height}px` }}
        >
          {/* Normal Operating Range Band */}
          <div
            className="absolute left-0 right-0 bg-white/70 dark:bg-slate-600/40 border-y border-dashed border-gray-400"
            style={{
              bottom: `${normMinPct}%`,
              height: `${normMaxPct - normMinPct}%`,
            }}
            title={`Normal Range: ${metadata?.normalMin} - ${metadata?.normalMax} ${metadata?.engineeringUnits}`}
          />

          {/* Hi-Hi Alarm Line */}
          {hiHiPct !== null && (
            <div
              className="absolute left-0 right-0 border-t-2 border-[#e22028] z-10"
              style={{ bottom: `${hiHiPct}%` }}
              title={`Hi-Hi: ${metadata?.highHighLimit}`}
            />
          )}

          {/* Hi Alarm Line */}
          {hiPct !== null && (
            <div
              className="absolute left-0 right-0 border-t border-[#ec8629] z-10"
              style={{ bottom: `${hiPct}%` }}
              title={`Hi: ${metadata?.highLimit}`}
            />
          )}

          {/* Lo Alarm Line */}
          {loPct !== null && (
            <div
              className="absolute left-0 right-0 border-t border-[#f5e11b] z-10"
              style={{ bottom: `${loPct}%` }}
              title={`Lo: ${metadata?.lowLimit}`}
            />
          )}

          {/* Lo-Lo Alarm Line */}
          {loLoPct !== null && (
            <div
              className="absolute left-0 right-0 border-t-2 border-[#916aad] z-10"
              style={{ bottom: `${loLoPct}%` }}
              title={`Lo-Lo: ${metadata?.lowLowLimit}`}
            />
          )}

          {/* Current Value Needle / Indicator Pointer (ISA-101 triangle arrow) */}
          <div
            className="absolute -right-2 transform translate-y-1/2 z-20 transition-all duration-300"
            style={{ bottom: `${percent}%` }}
          >
            <div
              className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[8px] border-r-[#3f3f3f] dark:border-r-white"
            />
          </div>
        </div>

        {/* Right Info: Readout, limits, and sparkline */}
        <div className="flex flex-col justify-between py-1 text-left" style={{ height: `${height}px` }}>
          <div>
            <div className="text-[9px] text-[#919191]">{max}</div>
            {hiHiPct !== null && <div className="text-[8px] text-red-600 font-semibold">HH: {metadata?.highHighLimit}</div>}
          </div>

          <div className="my-auto">
            {/* Sparkline */}
            {showSparkline && sparklineHistory && (
              <div className="mb-1.5 p-0.5 bg-white/40 dark:bg-black/30 rounded border border-gray-300 dark:border-gray-700">
                <svg width="64" height="26" className="overflow-visible">
                  <polyline
                    fill="none"
                    stroke="#475ca7"
                    strokeWidth="1.8"
                    points={sparklineHistory}
                  />
                </svg>
              </div>
            )}

            {/* Live Numeric Readout (Tabular Right-Aligned Number + Left-Aligned Units) */}
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold font-mono-numbers text-[#475ca7] dark:text-sky-400">
                {numVal.toFixed(1)}
              </span>
              <span className="text-[10px] text-[#919191] dark:text-gray-400 font-medium">
                {metadata?.engineeringUnits || ''}
              </span>
            </div>
          </div>

          <div>
            {loLoPct !== null && <div className="text-[8px] text-purple-600 font-semibold">LL: {metadata?.lowLowLimit}</div>}
            <div className="text-[9px] text-[#919191]">{min}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
