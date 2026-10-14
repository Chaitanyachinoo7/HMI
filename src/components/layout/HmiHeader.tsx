/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standard HMI Template Header
 * Section 4.1.1 of Rockwell Process HMI Style Guide
 */

import React from 'react';
import { useHmiContext } from '../../context/WebSocketContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { ISA_COLORS } from '../../types/hmi';

interface HmiHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAlarmSummary: () => void;
}

export const HmiHeader: React.FC<HmiHeaderProps> = ({
  currentView,
  onNavigate,
  onOpenAlarmSummary,
}) => {
  const {
    connectionState,
    latencyMs,
    unackAlarmCount,
    highestAlarmSeverity,
    theme,
    toggleTheme,
    isAudioSilenced,
    toggleAudioSilence,
  } = useHmiContext();

  const getAlarmIconBg = () => {
    if (unackAlarmCount === 0 && !highestAlarmSeverity) return '#64748b';
    switch (highestAlarmSeverity) {
      case 'URGENT':
        return ISA_COLORS.alarmUrgent;
      case 'HIGH':
        return ISA_COLORS.alarmHigh;
      case 'MEDIUM':
        return ISA_COLORS.alarmMedium;
      case 'LOW':
      default:
        return ISA_COLORS.alarmLow;
    }
  };

  return (
    <header className="bg-[#c0c0c0] dark:bg-[#1a1d24] border-b-2 border-[#a0a0a4] dark:border-gray-800 text-[#3f3f3f] dark:text-gray-200 select-none shadow-xs">
      <div className="max-w-[1920px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Process Area */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onNavigate('level1')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-700 to-cyan-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              ⚡
            </div>
            <div>
              <div className="text-sm font-black tracking-tight leading-none text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                AegisHMI <span className="text-[10px] font-mono px-1 bg-gray-300 dark:bg-gray-800 rounded font-normal text-gray-600 dark:text-gray-300">SCADA</span>
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 font-semibold leading-tight">
                PlantPAx &bull; ISA-101 / 18.2 Perspective
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-gray-400 dark:bg-gray-700 hidden sm:block" />

          {/* Area Breadcrumb */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span className="text-gray-500">Facility:</span>
            <span className="bg-white/80 dark:bg-gray-800/80 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700 font-mono text-[11px]">
              Regional WTP-01
            </span>
          </div>
        </div>

        {/* Center: System Status & Health */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                connectionState === 'CONNECTED'
                  ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                  : connectionState === 'RECONNECTING'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-red-500'
              }`}
            />
            <span className="font-bold text-[11px] uppercase">
              {connectionState} ({latencyMs}ms)
            </span>
          </div>

          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            Pipeline: <span className="font-semibold text-gray-800 dark:text-gray-200">WebSocket / Sparkplug B</span>
          </div>
        </div>

        {/* Right: Alarms, Tools, PWA, User */}
        <div className="flex items-center gap-2">
          {/* ISA-18.2 Alarm Access Bell (Section 9.3.6) */}
          <button
            onClick={onOpenAlarmSummary}
            className={`min-h-[36px] px-3 rounded flex items-center gap-1.5 font-bold text-xs text-white transition shadow-xs ${
              unackAlarmCount > 0 ? 'animate-alarm-blink' : ''
            }`}
            style={{ backgroundColor: getAlarmIconBg() }}
            title="Open Alarm Summary"
          >
            <span>🔔</span>
            <span>Alarms</span>
            {unackAlarmCount > 0 && (
              <span className="px-1.5 py-0.2 bg-black/40 rounded-full text-[10px] font-black">
                {unackAlarmCount}
              </span>
            )}
          </button>

          {/* Horn Mute */}
          <button
            onClick={toggleAudioSilence}
            className={`w-9 h-9 flex items-center justify-center rounded border transition text-sm ${
              isAudioSilenced
                ? 'bg-red-900/30 border-red-500 text-red-500'
                : 'bg-white/80 dark:bg-gray-800 border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            }`}
            title={isAudioSilenced ? 'Audible Alarms Silenced' : 'Silence Horn'}
          >
            {isAudioSilenced ? '🔕' : '🔊'}
          </button>

          {/* Theme Toggle (ISA-101 Light Gray vs Modern Dark Control Room) */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded border border-gray-400 dark:border-gray-700 bg-white/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 text-xs font-bold"
            title="Toggle between ISA-101 Standard Light Gray and Control Room Dark Mode"
          >
            {theme === 'isa101-light' ? '🌙' : '☀️'}
          </button>

          {/* PWA In-App Install Button */}
          <PWAInstallButton />

          {/* User Badge */}
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-white/60 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold text-[11px]">OPERATOR</span>
          </div>
        </div>
      </div>
    </header>
  );
};
