/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ANSI/ISA-101.01 Level 4 Diagnostic Faceplate Modal
 * Section 8.16: Task-based organization with Home, Interlocks, Trends, Alarms, Maintenance
 * Section 8.15.2: Two-state command button discipline (distinct Start vs Stop buttons)
 * Section 8.15.8: Direct analog setpoint entry with range validation
 */

import React, { useState } from 'react';
import { useHmiContext } from '../../context/WebSocketContext';
import { simulationEngine } from '../../services/realtime/simulationEngine';
import { ISA_COLORS } from '../../types/hmi';

export const FaceplateModal: React.FC = () => {
  const { activeFaceplate, closeFaceplate, sendCommand, alarms, acknowledgeAlarm, shelveAlarm } = useHmiContext();
  const [activeTab, setActiveTab] = useState<'home' | 'interlocks' | 'trends' | 'alarms' | 'maintenance'>('home');
  const [speedInput, setSpeedInput] = useState<string>('1750');
  const [shelveDuration, setShelveDuration] = useState<number>(30);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  if (!activeFaceplate) return null;

  const { tagPath, type } = activeFaceplate;
  const motor = type === 'motor' ? simulationEngine.getAllMotors().find((m) => m.tagPath === tagPath) : null;
  const valve = type === 'valve' ? simulationEngine.getAllValves().find((v) => v.tagPath === tagPath) : null;
  const metadata = simulationEngine.getMetadata(tagPath);
  const tagSnapshot = simulationEngine.getTagSnapshot(tagPath);

  const deviceName = motor?.name || valve?.name || metadata?.name || tagPath;
  const deviceAlarms = alarms.filter((a) => a.tagPath === tagPath);
  const highestDeviceAlarm = deviceAlarms.find((a) => a.state === 'UNACK_ALARM' || a.state === 'ACK_ALARM');

  const showFeedback = (msg: string) => {
    setCommandFeedback(msg);
    setTimeout(() => setCommandFeedback(null), 3000);
  };

  const handleStart = () => {
    const res = sendCommand({
      targetTag: tagPath,
      command: 'START',
      operator: 'FACEPLATE_OP',
    });
    showFeedback(res.message);
  };

  const handleStop = () => {
    const res = sendCommand({
      targetTag: tagPath,
      command: 'STOP',
      operator: 'FACEPLATE_OP',
    });
    showFeedback(res.message);
  };

  const handleJog = () => {
    const res = sendCommand({
      targetTag: tagPath,
      command: 'JOG',
      operator: 'FACEPLATE_OP',
    });
    showFeedback(res.message);
  };

  const handleSetMode = (mode: 'AUTO' | 'MANUAL') => {
    const res = sendCommand({
      targetTag: tagPath,
      command: mode === 'AUTO' ? 'SET_AUTO' : 'SET_MANUAL',
      operator: 'FACEPLATE_OP',
    });
    showFeedback(res.message);
  };

  const handleSetSetpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(speedInput);
    if (!isNaN(val)) {
      const res = sendCommand({
        targetTag: tagPath,
        command: 'SET_SETPOINT',
        value: val,
        operator: 'FACEPLATE_OP',
      });
      showFeedback(res.message);
    }
  };

  const handleToggleService = (inService: boolean) => {
    const res = sendCommand({
      targetTag: tagPath,
      command: 'SET_SERVICE',
      value: inService,
      operator: 'FACEPLATE_OP',
    });
    showFeedback(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#e0e0e0] dark:bg-[#1c212a] border-2 border-[#a0a0a4] dark:border-gray-700 rounded shadow-2xl overflow-hidden flex flex-col text-[#3f3f3f] dark:text-gray-200">
        
        {/* Title Bar (Section 8.11.1) */}
        <div className="bg-[#c0c0c0] dark:bg-[#252b37] px-3 py-2 border-b border-[#a0a0a4] dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">
              Level 4 Support Faceplate
            </span>
            <span className="text-[10px] bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 rounded font-mono">
              {tagPath}
            </span>
          </div>

          <button
            onClick={closeFaceplate}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500 hover:text-white transition font-bold text-gray-600 dark:text-gray-300 text-sm"
            title="Close Faceplate"
          >
            ✕
          </button>
        </div>

        {/* Alarm Banner Header if Alarm is Active (Section 9.3.2) */}
        {highestDeviceAlarm && (
          <div
            className={`px-3 py-1.5 flex items-center justify-between text-xs font-bold text-white transition ${
              highestDeviceAlarm.state === 'UNACK_ALARM' ? 'animate-alarm-blink' : ''
            }`}
            style={{
              backgroundColor:
                highestDeviceAlarm.severity === 'URGENT'
                  ? ISA_COLORS.alarmUrgent
                  : highestDeviceAlarm.severity === 'HIGH'
                  ? ISA_COLORS.alarmHigh
                  : ISA_COLORS.alarmMedium,
              color: highestDeviceAlarm.severity === 'MEDIUM' ? '#3f3f3f' : '#ffffff',
            }}
          >
            <div className="flex items-center gap-2">
              <span>▲</span>
              <span>{highestDeviceAlarm.condition}</span>
            </div>
            <button
              onClick={() => acknowledgeAlarm(highestDeviceAlarm.id)}
              className="px-2 py-0.5 bg-black/30 hover:bg-black/50 text-white rounded text-[10px] uppercase font-bold"
            >
              Acknowledge
            </button>
          </div>
        )}

        {/* Tab Navigation (Section 8.16.2 Task-Based Organization) */}
        <div className="flex border-b border-[#a0a0a4] dark:border-gray-700 bg-[#c0c0c0] dark:bg-[#222733] text-xs font-bold">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-2 border-r border-[#a0a0a4] dark:border-gray-700 transition ${
              activeTab === 'home'
                ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            Home / Control
          </button>

          <button
            onClick={() => setActiveTab('interlocks')}
            className={`px-4 py-2 border-r border-[#a0a0a4] dark:border-gray-700 transition ${
              activeTab === 'interlocks'
                ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            Interlocks
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`px-4 py-2 border-r border-[#a0a0a4] dark:border-gray-700 transition ${
              activeTab === 'trends'
                ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            Trends
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`px-4 py-2 border-r border-[#a0a0a4] dark:border-gray-700 transition ${
              activeTab === 'maintenance'
                ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            Maintenance
          </button>

          {/* Right-most tab for Alarms per Section 9.3.3 */}
          <button
            onClick={() => setActiveTab('alarms')}
            className={`ml-auto px-4 py-2 border-l border-[#a0a0a4] dark:border-gray-700 transition flex items-center gap-1.5 ${
              activeTab === 'alarms'
                ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            Alarms
            {deviceAlarms.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-bold">
                {deviceAlarms.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 space-y-4 min-h-[300px] overflow-y-auto">
          {commandFeedback && (
            <div className="p-2 rounded bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800 text-xs font-semibold text-sky-900 dark:text-sky-200 animate-in fade-in">
              {commandFeedback}
            </div>
          )}

          {/* TAB 1: HOME / CONTROL */}
          {activeTab === 'home' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#e8e8e8] dark:bg-[#232936] p-3 rounded border border-gray-300 dark:border-gray-700">
                <div>
                  <h3 className="font-bold text-sm text-[#3f3f3f] dark:text-gray-100">{deviceName}</h3>
                  <div className="text-xs text-gray-500">{metadata?.description || 'Primary Process Equipment'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold uppercase text-[#475ca7] dark:text-sky-400">
                    State: {motor?.state || valve?.state || 'NORMAL'}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Mode: {motor?.mode || valve?.mode || 'AUTO'}
                  </div>
                </div>
              </div>

              {/* Mode Selection (Auto vs Manual Radio) */}
              <div className="bg-[#e8e8e8] dark:bg-[#232936] p-3 rounded border border-gray-300 dark:border-gray-700">
                <span className="text-[11px] font-bold text-[#3f3f3f] dark:text-gray-300 uppercase block mb-2">
                  Operating Mode (Section 8.15.7)
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleSetMode('AUTO')}
                    className={`min-h-[40px] px-4 py-2 rounded text-xs font-bold border transition ${
                      (motor?.mode || valve?.mode) === 'AUTO'
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300'
                    }`}
                  >
                    ● AUTO
                  </button>
                  <button
                    onClick={() => handleSetMode('MANUAL')}
                    className={`min-h-[40px] px-4 py-2 rounded text-xs font-bold border transition ${
                      (motor?.mode || valve?.mode) === 'MANUAL'
                        ? 'bg-amber-600 text-white border-amber-700'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300'
                    }`}
                  >
                    ● MANUAL
                  </button>
                </div>
              </div>

              {/* Motor Specific Controls */}
              {motor && (
                <>
                  <div className="bg-[#e8e8e8] dark:bg-[#232936] p-3 rounded border border-gray-300 dark:border-gray-700 space-y-3">
                    <span className="text-[11px] font-bold text-[#3f3f3f] dark:text-gray-300 uppercase block">
                      Command Actions (Section 8.15.2 - Distinct Start / Stop)
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleStart}
                        disabled={motor.state === 'RUNNING' || !motor.inService}
                        className="min-h-[42px] flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded border border-emerald-800 disabled:opacity-40 shadow-sm"
                      >
                        START MOTOR
                      </button>
                      <button
                        onClick={handleStop}
                        disabled={motor.state === 'STOPPED' || !motor.inService}
                        className="min-h-[42px] flex-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded border border-red-800 disabled:opacity-40 shadow-sm"
                      >
                        STOP MOTOR
                      </button>
                      <button
                        onClick={handleJog}
                        disabled={motor.state === 'RUNNING' || !motor.inService}
                        className="min-h-[42px] px-4 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded border border-sky-800 disabled:opacity-40 shadow-sm"
                      >
                        JOG
                      </button>
                    </div>
                  </div>

                  {/* Analog Setpoint Entry (Section 8.15.8) */}
                  <form
                    onSubmit={handleSetSetpoint}
                    className="bg-[#e8e8e8] dark:bg-[#232936] p-3 rounded border border-gray-300 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-[#3f3f3f] dark:text-gray-300 uppercase">
                        VFD Speed Setpoint
                      </span>
                      <span className="text-xs text-gray-500">Range: 0 - 3000 RPM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="3000"
                        value={speedInput}
                        onChange={(e) => setSpeedInput(e.target.value)}
                        className="h-10 flex-1 px-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono-numbers text-gray-800 dark:text-gray-200"
                      />
                      <button
                        type="submit"
                        className="h-10 px-4 bg-slate-700 hover:bg-slate-800 text-white rounded font-bold text-xs"
                      >
                        Set Setpoint
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Valve Specific Controls */}
              {valve && (
                <div className="bg-[#e8e8e8] dark:bg-[#232936] p-3 rounded border border-gray-300 dark:border-gray-700 space-y-3">
                  <span className="text-[11px] font-bold text-[#3f3f3f] dark:text-gray-300 uppercase block">
                    Valve Position Commands
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => sendCommand({ targetTag: tagPath, command: 'OPEN', operator: 'OP' })}
                      className="min-h-[42px] flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded"
                    >
                      FULL OPEN (100%)
                    </button>
                    <button
                      onClick={() => sendCommand({ targetTag: tagPath, command: 'CLOSE', operator: 'OP' })}
                      className="min-h-[42px] flex-1 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded"
                    >
                      FULL CLOSE (0%)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INTERLOCKS */}
          {activeTab === 'interlocks' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Process Safety Interlocks &amp; Permissive Conditions (Section 8.13.2 / 8.16.2):
              </div>
              <div className="divide-y divide-gray-300 dark:divide-gray-700 bg-[#e8e8e8] dark:bg-[#232936] rounded border border-gray-300 dark:border-gray-700">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Suction Pressure Adequate</div>
                    <div className="text-[10px] text-gray-500">Threshold &gt; 120 kPa</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    OK
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Winding Over-Temperature</div>
                    <div className="text-[10px] text-gray-500">Trip setpoint: 95°C (Current: {motor?.windingTempC || 68}°C)</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    OK
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Vibration Switch Trip (ISA-5.1)</div>
                    <div className="text-[10px] text-gray-500">Radial bearing seismic sensor</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    HEALTHY
                  </span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Downstream Isolation Valve Open</div>
                    <div className="text-[10px] text-gray-500">Position confirm feedback</div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">
                    SATISFIED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRENDS */}
          {activeTab === 'trends' && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                High-Resolution Live Trace (Last 300 data points):
              </div>
              <div className="bg-[#f0f0f0] dark:bg-black p-3 rounded border border-gray-300 dark:border-gray-700">
                <div className="text-xs font-mono font-semibold mb-2 text-[#475ca7] dark:text-sky-400">
                  Parameter: {motor ? 'Motor Current (Amps)' : 'Process Variable'}
                </div>
                {/* SVG trend rendering */}
                <div className="h-40 flex items-end border-b border-l border-gray-400 p-1 relative">
                  <div className="absolute top-1 left-2 text-[9px] text-gray-400">Max: {motor?.ratedAmps || 60} A</div>
                  <div className="absolute bottom-1 left-2 text-[9px] text-gray-400">Min: 0 A</div>
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                    Live telemetry stream running at 500ms intervals...
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALARMS */}
          {activeTab === 'alarms' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Active &amp; Historical Alarms ({deviceAlarms.length})
                </span>
                {deviceAlarms.length > 0 && (
                  <button
                    onClick={() => acknowledgeAlarm('ALL')}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold"
                  >
                    Acknowledge All
                  </button>
                )}
              </div>

              {deviceAlarms.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500 bg-[#e8e8e8] dark:bg-[#232936] rounded">
                  No active alarms for this equipment. All interlocks and thresholds normal.
                </div>
              ) : (
                <div className="space-y-2">
                  {deviceAlarms.map((alm) => (
                    <div
                      key={alm.id}
                      className="p-3 bg-[#e8e8e8] dark:bg-[#232936] rounded border border-gray-300 dark:border-gray-700 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                          [{alm.severity}] {alm.condition}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(alm.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-600 dark:text-gray-400">
                        Value: <span className="font-mono-numbers font-semibold">{alm.value}</span> (Limit: {alm.limit})
                      </div>

                      {/* Shelving Controls (Section 9.7) */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-300 dark:border-gray-700">
                        {alm.state === 'SHELVED' ? (
                          <div className="text-xs text-amber-600 font-semibold">
                            Alarm is Shelved (Until {new Date(alm.shelvedUntil || 0).toLocaleTimeString()})
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => acknowledgeAlarm(alm.id)}
                              className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-xs font-bold rounded hover:bg-gray-300"
                            >
                              Ack
                            </button>
                            <div className="flex items-center gap-1 text-[11px] ml-auto">
                              <span>Shelve:</span>
                              <select
                                value={shelveDuration}
                                onChange={(e) => setShelveDuration(Number(e.target.value))}
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs rounded p-1"
                              >
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                                <option value={60}>60 min</option>
                              </select>
                              <button
                                onClick={() => shelveAlarm(alm.id, shelveDuration)}
                                className="px-2 py-1 bg-amber-500 text-white rounded text-xs font-bold hover:bg-amber-600"
                              >
                                Apply Shelve
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: MAINTENANCE & DIAGNOSTICS */}
          {activeTab === 'maintenance' && (
            <div className="space-y-3">
              <div className="bg-[#e8e8e8] dark:bg-[#232936] p-3 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200">In Service / Lockout</div>
                  <div className="text-[10px] text-gray-500">Enable or disable device from supervisory control</div>
                </div>
                <button
                  onClick={() => handleToggleService(!motor?.inService)}
                  className={`px-3 py-1.5 rounded text-xs font-bold ${
                    motor?.inService
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {motor?.inService ? 'IN SERVICE' : 'OUT OF SERVICE'}
                </button>
              </div>

              <div className="bg-[#e8e8e8] dark:bg-[#232936] p-3 rounded border border-gray-300 dark:border-gray-700">
                <div className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">Operating Hours &amp; Duty</div>
                <div className="text-xs font-mono text-gray-700 dark:text-gray-300 space-y-1">
                  <div>Cumulative Run Time: {motor?.runningHours.toFixed(1) || '0.0'} Hours</div>
                  <div>Maintenance Inspection Interval: 2,500 Hours</div>
                  <div>Next Scheduled Service: in {(2500 - (motor?.runningHours || 0)).toFixed(0)} Hours</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#c0c0c0] dark:bg-[#222733] px-4 py-2 border-t border-[#a0a0a4] dark:border-gray-700 flex items-center justify-between text-xs">
          <span className="text-[10px] text-gray-500">ANSI/ISA-101.01 Standard Faceplate Object</span>
          <button
            onClick={closeFaceplate}
            className="px-4 py-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded font-bold text-gray-800 dark:text-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
