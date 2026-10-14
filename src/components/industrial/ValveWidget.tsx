/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Industrial SCADA Component - ValveWidget
 * 
 * Supports discrete open/close and analog modulating control valves.
 * Features ISA-5.5 bowtie symbols, travel animation, dynamic state colors,
 * and command dispatching over WebSockets.
 */

import React, { useState } from 'react';
import { useValveBinding, useHmiContext } from '../../context/WebSocketContext';
import { ISA_COLORS } from '../../types/hmi';

interface ValveWidgetProps {
  valvePath: string;
  label?: string;
  showInlineControls?: boolean;
  className?: string;
}

export const ValveWidget: React.FC<ValveWidgetProps> = ({
  valvePath,
  label,
  showInlineControls = true,
  className = '',
}) => {
  const { valve, sendValveCommand, openFaceplate } = useValveBinding(valvePath);
  const { alarms } = useHmiContext();
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Check active alarms
  const activeAlarm = alarms.find(
    (a) => a.tagPath === valvePath && (a.state === 'UNACK_ALARM' || a.state === 'ACK_ALARM')
  );
  const isUnack = activeAlarm?.state === 'UNACK_ALARM';
  const alarmSeverity = activeAlarm?.severity;

  const getValveColor = () => {
    switch (valve.state) {
      case 'OPEN':
        return '#f0f0f0';
      case 'OPENING':
      case 'CLOSING':
        return '#93c2e4'; // Transition color
      case 'FAULT':
        return '#000000';
      case 'CLOSED':
      default:
        return '#808080';
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = sendValveCommand('OPEN');
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = sendValveCommand('CLOSE');
    setFeedbackMsg(res.message);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div
      onClick={openFaceplate}
      className={`relative inline-flex flex-col bg-[#e8e8e8] dark:bg-[#1f242e] border-2 rounded p-2.5 transition-all cursor-pointer shadow-sm hover:shadow-md ${
        activeAlarm
          ? isUnack
            ? 'border-red-500 animate-alarm-blink'
            : 'border-red-500'
          : 'border-[#a0a0a4]'
      } ${className}`}
      style={{ minWidth: '170px' }}
      title={`${valve.name} - Click to open Faceplate`}
    >
      {/* Alarm Badge */}
      {activeAlarm && (
        <div
          className="absolute -top-3 -left-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow"
          style={{ backgroundColor: ISA_COLORS.alarmUrgent }}
        >
          <span>▲</span>
          <span>{alarmSeverity || 'ALARM'}</span>
        </div>
      )}

      {/* Tag Label and Mode */}
      <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-[#d8d8d8] dark:border-gray-700">
        <span className="text-[11px] font-bold text-[#3f3f3f] dark:text-gray-200 truncate" title={valve.name}>
          {label || valve.name}
        </span>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 text-[#3f3f3f] dark:text-gray-300 rounded">
          {valve.mode}
        </span>
      </div>

      {/* ISA Standard Valve Bowtie Graphic & Position */}
      <div className="flex items-center gap-3 my-1">
        <svg width="48" height="40" viewBox="0 0 48 40" className="drop-shadow-sm">
          {/* Left triangle */}
          <polygon
            points="6,8 24,20 6,32"
            fill={getValveColor()}
            stroke="#555"
            strokeWidth="2"
          />
          {/* Right triangle */}
          <polygon
            points="42,8 24,20 42,32"
            fill={getValveColor()}
            stroke="#555"
            strokeWidth="2"
          />
          {/* Actuator stem & diaphragm head */}
          <line x1="24" y1="20" x2="24" y2="6" stroke="#444" strokeWidth="2.5" />
          <path d="M 16 6 Q 24 2 32 6" fill="none" stroke="#444" strokeWidth="2.5" />
          <circle cx="24" cy="6" r="3" fill={valve.state === 'OPEN' ? '#10b981' : '#64748b'} />
        </svg>

        <div className="flex-1 text-left">
          <div className="text-[12px] font-bold text-[#3f3f3f] dark:text-gray-100 uppercase">
            {valve.state}
          </div>
          <div className="text-[11px] text-[#475ca7] dark:text-sky-400 font-mono-numbers font-semibold">
            {valve.positionPercent.toFixed(0)} <span className="text-[9px] text-[#919191]">% OPEN</span>
          </div>
          <div className="text-[9px] text-[#919191] dark:text-gray-400">
            DP: {(valve.inletPressureKPa - valve.outletPressureKPa).toFixed(0)} kPa
          </div>
        </div>
      </div>

      {/* Progress fill bar for modulating valves */}
      {valve.isModulating && (
        <div className="w-full bg-gray-300 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden my-1">
          <div
            className="bg-sky-600 dark:bg-sky-400 h-full transition-all duration-300"
            style={{ width: `${valve.positionPercent}%` }}
          />
        </div>
      )}

      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 p-1 rounded mt-1 border border-emerald-200">
          {feedbackMsg}
        </div>
      )}

      {/* Command Buttons */}
      {showInlineControls && (
        <div className="mt-2 pt-1.5 border-t border-[#d8d8d8] dark:border-gray-700 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleOpen}
            disabled={valve.state === 'OPEN' || !valve.inService}
            className="min-h-[36px] flex-1 px-2 py-1 text-xs font-bold rounded border shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 hover:bg-slate-200 text-gray-800 border-gray-400 dark:bg-gray-800 dark:text-gray-200"
            title="Open Valve"
          >
            OPEN
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={valve.state === 'CLOSED' || !valve.inService}
            className="min-h-[36px] flex-1 px-2 py-1 text-xs font-bold rounded border shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-slate-100 hover:bg-slate-200 text-gray-800 border-gray-400 dark:bg-gray-800 dark:text-gray-200"
            title="Close Valve"
          >
            CLOSE
          </button>
        </div>
      )}

      <div className="mt-1 text-[8px] text-right text-gray-500 hover:underline">
        Faceplate ↗
      </div>
    </div>
  );
};
