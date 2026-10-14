/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ISA-18.2 Alarm Banner Component
 * Section 9.3.4: Docked banner displaying the latest, highest-priority alarms.
 * Features unacknowledged border blinking, audio silence button, and quick Ack.
 */

import React from 'react';
import { useHmiContext } from '../../context/WebSocketContext';
import { ISA_COLORS } from '../../types/hmi';

interface AlarmBannerProps {
  onOpenAlarmSummary?: () => void;
}

export const AlarmBanner: React.FC<AlarmBannerProps> = ({ onOpenAlarmSummary }) => {
  const {
    alarms,
    unackAlarmCount,
    highestAlarmSeverity,
    acknowledgeAlarm,
    isAudioSilenced,
    toggleAudioSilence,
    triggerSimulatedAlarm,
  } = useHmiContext();

  const activeAlarms = alarms.filter((a) => a.state === 'UNACK_ALARM' || a.state === 'ACK_ALARM');
  const latestAlarm = activeAlarms[0];

  const getSeverityBg = (sev?: string) => {
    switch (sev) {
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
    <div className="w-full bg-[#3f3f3f] text-white px-3 py-1.5 flex items-center justify-between text-xs border-b border-gray-600 shadow-sm z-30">
      {/* Left: Latest alarm message */}
      <div className="flex items-center gap-3 overflow-hidden">
        {latestAlarm ? (
          <div
            onClick={onOpenAlarmSummary}
            className={`flex items-center gap-2 cursor-pointer px-2 py-0.5 rounded border transition ${
              latestAlarm.state === 'UNACK_ALARM'
                ? 'border-yellow-300 animate-alarm-blink'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: getSeverityBg(latestAlarm.severity) }}
          >
            <span className="font-black text-sm">▲</span>
            <span className="font-bold text-[11px] uppercase tracking-wide">
              [{latestAlarm.severity}] {latestAlarm.tagDescription}:
            </span>
            <span className="font-medium text-[11px] truncate max-w-md">
              {latestAlarm.condition} (Val: {latestAlarm.value})
            </span>
            <span className="text-[10px] opacity-80 font-mono ml-1">
              {new Date(latestAlarm.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-300 text-[11px]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Plant Alarms Normal - All process parameters within operational thresholds</span>
          </div>
        )}
      </div>

      {/* Right Action Tools: Ack, Silence, Summary, and Sim trigger */}
      <div className="flex items-center gap-2 shrink-0">
        {latestAlarm && latestAlarm.state === 'UNACK_ALARM' && (
          <button
            onClick={() => acknowledgeAlarm(latestAlarm.id)}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-[11px] rounded shadow-xs transition uppercase"
            title="Acknowledge this alarm"
          >
            Acknowledge
          </button>
        )}

        <button
          onClick={toggleAudioSilence}
          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition flex items-center gap-1 ${
            isAudioSilenced
              ? 'bg-red-800/80 border-red-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600 border-gray-500 text-gray-200'
          }`}
          title={isAudioSilenced ? 'Alarm Horn Silenced' : 'Silence Alarm Horn'}
        >
          {isAudioSilenced ? '🔕 Silenced' : '🔔 Horn On'}
        </button>

        <button
          onClick={onOpenAlarmSummary}
          className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold text-[11px] rounded border border-gray-500 flex items-center gap-1"
        >
          <span>Summary</span>
          {unackAlarmCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white">
              {unackAlarmCount}
            </span>
          )}
        </button>

        <button
          onClick={() => triggerSimulatedAlarm('URGENT')}
          className="hidden sm:inline-flex px-2 py-1 bg-slate-800 hover:bg-slate-700 text-gray-300 text-[10px] font-mono rounded border border-gray-600"
          title="Inject simulated alarm condition to test ISA-18.2 response"
        >
          + Test Alarm
        </button>
      </div>
    </div>
  );
};
