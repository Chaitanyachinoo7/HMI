/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Level 2 Display: Process Unit Operating Graphics
 * Section 3.2 & 4.1.4 of Rockwell Process HMI Style Guide
 * Replicating modern Ignition Perspective & PlantPAx synoptic graphics
 * 
 * Includes:
 * - Animated SVG process pipelines with fluid flow
 * - Interactive MotorWidgets (LB01 Lead, LB02 Lag)
 * - Interactive ValveWidgets (FCV-101 Modulating, XV-102 Chemical, BV-103 Bypass)
 * - Process Vessels (Settling Basin Clarifier, Finished Water Clearwell Reservoir)
 * - Inline analog readouts and click-to-command dispatching
 */

import React from 'react';
import { MotorWidget } from '../industrial/MotorWidget';
import { ValveWidget } from '../industrial/ValveWidget';
import { ProcessVessel } from '../industrial/ProcessVessel';
import { AnalogIndicator } from '../industrial/AnalogIndicator';
import { ProcessFlowLine } from '../industrial/ProcessFlowLine';
import { useTagBinding, useHmiContext } from '../../context/WebSocketContext';

export const Level2OperatingGraphics: React.FC = () => {
  const { openFaceplate } = useHmiContext();

  const flowTag = useTagBinding<number>('Plant1/Water/Total/Flow');
  const pressTag = useTagBinding<number>('Plant1/Water/Discharge/Pressure');
  const lb01Motor = useTagBinding<number>('Plant1/Booster/LB01');

  const isFlowing = (flowTag.value as number) > 5;

  return (
    <div className="space-y-4">
      {/* Unit Sub-Header Banner */}
      <div className="bg-[#e8e8e8] dark:bg-[#1a1f29] p-3 rounded border border-[#a0a0a4] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Level 2 Display: Process Unit Operating Graphic
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
              OPERATING UNIT: WTP-AREA-01
            </span>
          </div>
          <h1 className="text-lg font-black text-[#3f3f3f] dark:text-gray-100 tracking-tight">
            Treatment Plant 1: Intake, Clarifier &amp; Distribution Booster
          </h1>
        </div>

        {/* Operating Summary Badges */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 font-mono-numbers">
            <span className="text-gray-500 mr-1.5">Header Pressure:</span>
            <span className="font-bold text-[#475ca7] dark:text-sky-400">
              {typeof pressTag.value === 'number' ? pressTag.value.toFixed(1) : '--'} kPa
            </span>
          </div>
          <div className="bg-white dark:bg-gray-800 px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 font-mono-numbers">
            <span className="text-gray-500 mr-1.5">Discharge Flow:</span>
            <span className="font-bold text-[#475ca7] dark:text-sky-400">
              {typeof flowTag.value === 'number' ? flowTag.value.toFixed(1) : '--'} L/s
            </span>
          </div>
        </div>
      </div>

      {/* Main Synoptic P&ID Canvas Area */}
      <div className="relative w-full bg-[#e0e0e0] dark:bg-[#13161c] border-2 border-[#a0a0a4] dark:border-gray-800 rounded p-4 min-h-[580px] overflow-x-auto shadow-inner">
        {/* Background Grid Pattern (Section 6.8 Physical Layout and Alignment) */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #666 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Synoptic Piping Backbone */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ minWidth: '950px', minHeight: '560px' }}
        >
          {/* Main Raw Water Intake Pipe from Left into Settling Clarifier */}
          <ProcessFlowLine
            d="M 20 180 L 120 180 L 120 220 L 220 220"
            isPrimary={true}
            isActive={isFlowing}
          />

          {/* Clarifier to Clearwell Reservoir Pipe */}
          <ProcessFlowLine
            d="M 330 220 L 420 220 L 420 200 L 480 200"
            isPrimary={true}
            isActive={isFlowing}
          />

          {/* Clearwell Reservoir Outflow split into Booster Pumps LB01 & LB02 */}
          <ProcessFlowLine
            d="M 590 240 L 640 240 L 640 160 L 680 160"
            isPrimary={true}
            isActive={isFlowing}
          />
          <ProcessFlowLine
            d="M 640 240 L 640 330 L 680 330"
            isPrimary={true}
            isActive={isFlowing}
          />

          {/* Booster Discharge into Common Header */}
          <ProcessFlowLine
            d="M 760 160 L 800 160 L 800 240 L 840 240"
            isPrimary={true}
            isActive={isFlowing}
          />
          <ProcessFlowLine
            d="M 760 330 L 800 330 L 800 240"
            isPrimary={true}
            isActive={isFlowing}
          />

          {/* Discharge through Control Valve FCV-101 into Municipal Distribution */}
          <ProcessFlowLine
            d="M 840 240 L 980 240"
            isPrimary={true}
            isActive={isFlowing}
          />

          {/* Dosing Chemical Line (Secondary 1.5px) */}
          <ProcessFlowLine
            d="M 535 80 L 535 150"
            isPrimary={false}
            isActive={true}
          />

          {/* Filter Bypass Line */}
          <ProcessFlowLine
            d="M 120 180 L 120 370 L 420 370 L 420 240"
            isPrimary={false}
            isActive={false}
            strokeColor="#999"
          />

          {/* Directional Flow Arrows per ISA-5.5 */}
          <polygon points="70,176 80,180 70,184" fill="#666" />
          <polygon points="370,216 380,220 370,224" fill="#666" />
          <polygon points="655,156 665,160 655,164" fill="#666" />
          <polygon points="655,326 665,330 655,334" fill="#666" />
          <polygon points="910,236 920,240 910,244" fill="#666" />
        </svg>

        {/* Synoptic Process Objects Layer */}
        <div className="relative z-10 flex flex-col justify-between min-w-[950px] min-h-[540px]">
          
          {/* Top Row: Chemical Dosing & Process Parameters */}
          <div className="flex items-start justify-between">
            {/* Raw Water Feed Inlet Label */}
            <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-2 rounded border border-[#a0a0a4] dark:border-gray-700 shadow-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Inlet Source</span>
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Raw Aquifer Feed</span>
              <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Stream Active</div>
            </div>

            {/* Chemical Dosing Skid (Chlorine & Disinfection) */}
            <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700 flex items-center gap-4 shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Disinfection Skid</span>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">NaOCl Chlorine Dosing</span>
              </div>
              <ValveWidget
                valvePath="Plant1/Valves/XV102"
                label="XV-102 Dosing Valve"
                showInlineControls={false}
              />
              <div className="text-left text-xs font-mono-numbers">
                <div>Free: <span className="font-bold text-[#475ca7] dark:text-sky-400">1.82</span> mg/L</div>
                <div>Total: <span className="font-bold text-gray-700 dark:text-gray-300">2.28</span> mg/L</div>
              </div>
            </div>

            {/* High-Level Effluent Gauge */}
            <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-2 rounded border border-[#a0a0a4] dark:border-gray-700 shadow-xs">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">Header Quality</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Potable Certified</span>
            </div>
          </div>

          {/* Middle Row: Vessels and Pumps */}
          <div className="flex items-center justify-between my-auto py-6">
            {/* Settling Basin Clarifier */}
            <div className="flex flex-col items-center">
              <ProcessVessel
                tagPath="Plant1/Water/Settling/Turbidity"
                name="Settling Basin 1"
                capacityLiters={80000}
                width={120}
                height={160}
              />
              <div className="mt-1 text-[10px] font-mono-numbers bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-300 dark:border-gray-700">
                Turb: <span className="font-bold text-amber-600">0.45 NTU</span>
              </div>
            </div>

            {/* Clearwell Finished Water Reservoir */}
            <div className="flex flex-col items-center">
              <ProcessVessel
                tagPath="Plant1/Water/Reservoir/Level"
                name="Clearwell Reservoir"
                capacityLiters={150000}
                width={140}
                height={175}
              />
            </div>

            {/* Booster Pumping Station (LB01 & LB02) */}
            <div className="flex flex-col gap-5 bg-[#e8e8e8]/80 dark:bg-[#1a1f29]/80 p-3 rounded border border-dashed border-[#a0a0a4] dark:border-gray-700">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Dual Booster Pump Skid
              </div>
              <MotorWidget
                motorPath="Plant1/Booster/LB01"
                label="LB01 Booster (Lead)"
                showInlineControls={true}
              />
              <MotorWidget
                motorPath="Plant1/Booster/LB02"
                label="LB02 Booster (Standby)"
                showInlineControls={true}
              />
            </div>

            {/* Discharge Control & Final Header Flow */}
            <div className="flex flex-col items-center gap-3">
              <ValveWidget
                valvePath="Plant1/Valves/FCV101"
                label="FCV-101 Flow Control"
                showInlineControls={true}
              />
              <div className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-700 text-center">
                <span className="text-[10px] text-gray-500 uppercase block">Municipal Header</span>
                <span className="text-sm font-bold font-mono-numbers text-[#475ca7] dark:text-sky-400">
                  {typeof flowTag.value === 'number' ? flowTag.value.toFixed(1) : '--'} L/s
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Bypass Valve & Analog Bar Overviews */}
          <div className="flex items-center justify-between pt-2 border-t border-[#d8d8d8] dark:border-gray-800">
            {/* Filter Backwash Bypass */}
            <div className="flex items-center gap-3">
              <ValveWidget
                valvePath="Plant1/Valves/BV103"
                label="BV-103 Filter Bypass"
                showInlineControls={false}
              />
              <span className="text-[10px] text-gray-500">Normally Closed Maintenance Bypass</span>
            </div>

            {/* Quick Context Tip */}
            <div className="text-[11px] text-gray-500 italic">
              💡 Tip: Click any pump, valve, or vessel to inspect its Level 4 diagnostic faceplate and interlocks.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
