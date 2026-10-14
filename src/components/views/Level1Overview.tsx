/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Level 1 Display: Process Overview
 * Section 3.1 & 4.1.3 of Rockwell Process HMI Style Guide
 * 
 * Overview of the operator's entire span of responsibility:
 * - High-level Key Performance Indicators (KPIs)
 * - Top 2 or 3 highest priority alarms
 * - Normalized multi-variable comparison bar graphs (straight horizontal line = good)
 * - Major equipment status
 * - Overall trends of important parameters
 */

import React from 'react';
import { useTagBinding, useHmiContext } from '../../context/WebSocketContext';
import { AnalogIndicator } from '../industrial/AnalogIndicator';
import { ProcessTrendChart } from '../trends/ProcessTrendChart';
import { ISA_COLORS } from '../../types/hmi';

interface Level1OverviewProps {
  onNavigateToUnit: (unit: string) => void;
}

export const Level1Overview: React.FC<Level1OverviewProps> = ({ onNavigateToUnit }) => {
  const { openFaceplate, alarms } = useHmiContext();

  const resLevel = useTagBinding<number>('Plant1/Water/Reservoir/Level');
  const pressure = useTagBinding<number>('Plant1/Water/Discharge/Pressure');
  const flow = useTagBinding<number>('Plant1/Water/Total/Flow');
  const freeChlorine = useTagBinding<number>('Plant1/Water/Chlorine/Free');
  const turbidity = useTagBinding<number>('Plant1/Water/Settling/Turbidity');

  return (
    <div className="space-y-4">
      {/* Top Banner: Process Area Title and Status Card */}
      <div className="bg-[#e8e8e8] dark:bg-[#1a1f29] p-3 rounded border border-[#a0a0a4] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Level 1 Display: Overview
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              FACILITY ONLINE
            </span>
          </div>
          <h1 className="text-xl font-black text-[#3f3f3f] dark:text-gray-100 tracking-tight">
            Regional Water Treatment Facility &amp; Booster Station 01
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Plant-wide supervisory overview covering raw intake, clarification, disinfection, and distribution headers.
          </p>
        </div>

        {/* Quick Nav to Level 2 Units */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToUnit('booster')}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded text-xs font-bold transition shadow-xs"
          >
            Open Level 2 Graphic →
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => openFaceplate('Plant1/Water/Total/Flow', 'analog')}
          className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700 cursor-pointer hover:shadow-md transition"
        >
          <div className="text-[10px] uppercase font-bold text-[#919191] dark:text-gray-400">Total Plant Discharge</div>
          <div className="text-2xl font-black text-[#475ca7] dark:text-sky-400 font-mono-numbers my-1">
            {typeof flow.value === 'number' ? flow.value.toFixed(1) : '--'}
            <span className="text-xs font-normal text-gray-500 ml-1">L/s</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ● Normal Demand Window (65 - 140 L/s)
          </div>
        </div>

        <div
          onClick={() => openFaceplate('Plant1/Water/Discharge/Pressure', 'analog')}
          className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700 cursor-pointer hover:shadow-md transition"
        >
          <div className="text-[10px] uppercase font-bold text-[#919191] dark:text-gray-400">Main Distribution Pressure</div>
          <div className="text-2xl font-black text-[#475ca7] dark:text-sky-400 font-mono-numbers my-1">
            {typeof pressure.value === 'number' ? pressure.value.toFixed(1) : '--'}
            <span className="text-xs font-normal text-gray-500 ml-1">kPa</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ● Regulated Header (380 - 480 kPa)
          </div>
        </div>

        <div
          onClick={() => openFaceplate('Plant1/Water/Reservoir/Level', 'analog')}
          className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700 cursor-pointer hover:shadow-md transition"
        >
          <div className="text-[10px] uppercase font-bold text-[#919191] dark:text-gray-400">Clearwell Storage Level</div>
          <div className="text-2xl font-black text-[#475ca7] dark:text-sky-400 font-mono-numbers my-1">
            {typeof resLevel.value === 'number' ? resLevel.value.toFixed(1) : '--'}
            <span className="text-xs font-normal text-gray-500 ml-1">%</span>
          </div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400">
            Storage: ~38,400 L finished water
          </div>
        </div>

        <div
          onClick={() => openFaceplate('Plant1/Water/Chlorine/Free', 'analog')}
          className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700 cursor-pointer hover:shadow-md transition"
        >
          <div className="text-[10px] uppercase font-bold text-[#919191] dark:text-gray-400">Disinfection Residual</div>
          <div className="text-2xl font-black text-[#475ca7] dark:text-sky-400 font-mono-numbers my-1">
            {typeof freeChlorine.value === 'number' ? freeChlorine.value.toFixed(2) : '--'}
            <span className="text-xs font-normal text-gray-500 ml-1">mg/L</span>
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ● Compliance Target (1.2 - 2.2 mg/L)
          </div>
        </div>
      </div>

      {/* Normalized Analog Bar Grouping (Section 6.5 & 8.12.5) */}
      <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700">
        <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#d8d8d8] dark:border-gray-700">
          <div>
            <h2 className="text-xs font-bold text-[#3f3f3f] dark:text-gray-100 uppercase tracking-wide">
              Normalized Process Parameters Array (Section 6.5 Grouping)
            </h2>
            <p className="text-[10px] text-gray-500">
              ISA-101 Principle: When all needles align horizontally within the white band, the process is operating in nominal equilibrium.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-around">
          <AnalogIndicator tagPath="Plant1/Water/Reservoir/Level" height={130} />
          <AnalogIndicator tagPath="Plant1/Water/Discharge/Pressure" height={130} />
          <AnalogIndicator tagPath="Plant1/Water/Total/Flow" height={130} />
          <AnalogIndicator tagPath="Plant1/Water/Chlorine/Free" height={130} />
          <AnalogIndicator tagPath="Plant1/Water/Settling/Turbidity" height={130} />
          <AnalogIndicator tagPath="Plant1/Water/Header/Temperature" height={130} />
        </div>
      </div>

      {/* Overview Trend & Unit Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Plant Overview Trend */}
        <div className="lg:col-span-2">
          <ProcessTrendChart
            initialPenPaths={[
              'Plant1/Water/Discharge/Pressure',
              'Plant1/Water/Total/Flow',
              'Plant1/Water/Reservoir/Level',
            ]}
            height="320px"
          />
        </div>

        {/* Major Equipment & Unit Summary List */}
        <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-1 mb-2 border-b border-gray-300 dark:border-gray-700">
              <span className="text-xs font-bold uppercase text-gray-700 dark:text-gray-200">
                Major Process Units
              </span>
              <span className="text-[10px] text-gray-500">Area 1</span>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => onNavigateToUnit('booster')}
                className="p-2 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#3f3f3f] dark:text-gray-200">Booster Pumping Station</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                    LB01 LEAD RUNNING
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Pumps: LB01 (Lead), LB02 (Standby) | Header: 420 kPa
                </div>
              </div>

              <div
                onClick={() => onNavigateToUnit('clarifier')}
                className="p-2 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#3f3f3f] dark:text-gray-200">Clarifier &amp; Filtration</span>
                  <span className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.5 rounded">
                    CHECK TURBIDITY
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Settling Tank 1 | Turbidity: {typeof turbidity.value === 'number' ? turbidity.value.toFixed(2) : '--'} NTU
                </div>
              </div>

              <div
                onClick={() => onNavigateToUnit('chemical')}
                className="p-2 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-[#3f3f3f] dark:text-gray-200">Disinfection &amp; Chlorine</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                    COMPLIANT
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  Free: {typeof freeChlorine.value === 'number' ? freeChlorine.value.toFixed(2) : '--'} mg/L | Dosing Valve: OPEN
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-300 dark:border-gray-700 text-center">
            <button
              onClick={() => onNavigateToUnit('booster')}
              className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded transition"
            >
              Navigate to Process Unit Graphics (Level 2) →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
