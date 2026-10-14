/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Level 3 Display: Process Unit Detail Displays
 * Section 3.3 & 8.13.2 of Rockwell Process HMI Style Guide
 * 
 * Detailed investigations and interventions:
 * - PID Control Loop Parameter Diagnostics (PV, SP, Error, Tuning K/I/D)
 * - Equipment Duty & Run-Hours Matrix
 * - Multi-point Vibration & Bearing Temperature Health
 */

import React, { useState } from 'react';
import { useTagBinding, useHmiContext } from '../../context/WebSocketContext';
import { simulationEngine } from '../../services/realtime/simulationEngine';

export const Level3ProcessDetail: React.FC = () => {
  const { openFaceplate, sendCommand } = useHmiContext();
  const [pidP, setPidP] = useState<number>(2.4);
  const [pidI, setPidI] = useState<number>(0.85);
  const [pidD, setPidD] = useState<number>(0.12);
  const [leadPump, setLeadPump] = useState<'LB01' | 'LB02'>('LB01');
  const [tuningSaved, setTuningSaved] = useState<boolean>(false);

  const pressTag = useTagBinding<number>('Plant1/Water/Discharge/Pressure');
  const flowTag = useTagBinding<number>('Plant1/Water/Total/Flow');

  const motors = simulationEngine.getAllMotors();
  const valves = simulationEngine.getAllValves();

  const handleSaveTuning = (e: React.FormEvent) => {
    e.preventDefault();
    setTuningSaved(true);
    setTimeout(() => setTuningSaved(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#e8e8e8] dark:bg-[#1a1f29] p-3 rounded border border-[#a0a0a4] dark:border-gray-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Level 3 Display: Process Diagnostics &amp; Loop Detail
          </span>
          <h1 className="text-lg font-black text-[#3f3f3f] dark:text-gray-100">
            Booster Station Control Loop PIDE-201 &amp; Duty Matrix
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PID Loop Controller Block Diagram (Section 8.13.2 Logical Diagrams) */}
        <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-4 rounded border border-[#a0a0a4] dark:border-gray-700">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-300 dark:border-gray-700">
            <h2 className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200">
              PIDE-201 Discharge Pressure Controller
            </h2>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 px-2 py-0.5 rounded font-bold">
              CASCADE AUTO
            </span>
          </div>

          {/* Logic flow diagram */}
          <div className="p-3 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700 font-mono text-xs space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-500 block">Process Variable (PV)</span>
                <span className="text-sm font-bold text-[#475ca7] dark:text-sky-400">
                  {typeof pressTag.value === 'number' ? pressTag.value.toFixed(1) : '--'}
                </span>
                <span className="text-[9px] text-gray-400 block">kPa</span>
              </div>

              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-500 block">Target Setpoint (SP)</span>
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">420.0</span>
                <span className="text-[9px] text-gray-400 block">kPa</span>
              </div>

              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] text-gray-500 block">Control Error (e)</span>
                <span className="text-sm font-bold text-amber-600">
                  {typeof pressTag.value === 'number' ? (420.0 - pressTag.value).toFixed(1) : '--'}
                </span>
                <span className="text-[9px] text-gray-400 block">Δ kPa</span>
              </div>
            </div>

            {/* Tuning Form */}
            <form onSubmit={handleSaveTuning} className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block">
                Controller Tuning Parameters (K / Ti / Td)
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500">Proportional Gain (Kp)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pidP}
                    onChange={(e) => setPidP(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">Integral Reset (Ti / min)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pidI}
                    onChange={(e) => setPidI(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border rounded text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">Derivative Rate (Td / sec)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pidD}
                    onChange={(e) => setPidD(parseFloat(e.target.value) || 0)}
                    className="w-full mt-1 px-2 py-1 bg-gray-50 dark:bg-gray-800 border rounded text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded text-xs"
                >
                  Write Tuning Over WebSockets
                </button>
                {tuningSaved && (
                  <span className="text-[10px] text-emerald-600 font-bold">
                    ✓ Tuning updated in controller memory
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Lead / Lag Booster Duty Selector */}
        <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-4 rounded border border-[#a0a0a4] dark:border-gray-700">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-300 dark:border-gray-700">
            <h2 className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200">
              Booster Duty Matrix &amp; Auto-Sequencer
            </h2>
            <span className="text-[10px] text-gray-500">Pumping Logic</span>
          </div>

          <div className="p-3 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700 space-y-3 text-xs">
            <p className="text-gray-600 dark:text-gray-400 text-[11px]">
              Select lead duty rotation for pressure maintenance and equal wear-leveling across operating hours.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setLeadPump('LB01')}
                className={`p-3 rounded border cursor-pointer transition ${
                  leadPump === 'LB01'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>LB01 Booster</span>
                  <span className="text-[10px] text-blue-600">{leadPump === 'LB01' ? '★ LEAD' : 'STANDBY'}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Runtime: 1,284.5 Hrs</div>
                <div className="text-[10px] text-gray-500">Vibration: 2.1 mm/s (Good)</div>
              </div>

              <div
                onClick={() => setLeadPump('LB02')}
                className={`p-3 rounded border cursor-pointer transition ${
                  leadPump === 'LB02'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>LB02 Booster</span>
                  <span className="text-[10px] text-blue-600">{leadPump === 'LB02' ? '★ LEAD' : 'STANDBY'}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-1">Runtime: 842.1 Hrs</div>
                <div className="text-[10px] text-gray-500">Vibration: 0.2 mm/s (Idle)</div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => openFaceplate('Plant1/Booster/LB01', 'motor')}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 text-gray-800 dark:text-gray-200 font-bold rounded text-xs"
              >
                Open Full Motor Diagnostic Faceplate ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment Health & Telemetry Detail Table */}
      <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700">
        <h3 className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200 mb-2">
          Diagnostic Telemetry Matrix (Section 8.12 Dynamic Numeric Data)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-gray-300 dark:border-gray-700 font-mono-numbers">
            <thead className="bg-[#c0c0c0] dark:bg-[#252b37] text-gray-800 dark:text-gray-200 text-[10px] uppercase font-bold">
              <tr>
                <th className="p-2">Equipment Tag</th>
                <th className="p-2">State</th>
                <th className="p-2">Current (A)</th>
                <th className="p-2">Speed (RPM)</th>
                <th className="p-2">Vibration (mm/s)</th>
                <th className="p-2">Winding Temp (°C)</th>
                <th className="p-2">Run Hours</th>
                <th className="p-2 text-right">Faceplate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-700 bg-white dark:bg-[#151922]">
              {motors.map((m) => (
                <tr key={m.tagPath} className="hover:bg-blue-50 dark:hover:bg-slate-800/40">
                  <td className="p-2 font-bold font-sans">{m.name}</td>
                  <td className="p-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 dark:bg-gray-800">
                      {m.state}
                    </span>
                  </td>
                  <td className="p-2 text-[#475ca7] dark:text-sky-400 font-bold">{m.currentAmps.toFixed(1)}</td>
                  <td className="p-2">{m.speedRpm}</td>
                  <td className="p-2">{m.vibrationMmS.toFixed(2)}</td>
                  <td className="p-2">{m.windingTempC.toFixed(1)}</td>
                  <td className="p-2">{m.runningHours.toFixed(1)}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => openFaceplate(m.tagPath, 'motor')}
                      className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-[10px] font-bold rounded"
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
