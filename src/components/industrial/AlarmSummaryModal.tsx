/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ANSI/ISA-18.2 Alarm Summary, Shelved Alarms & History
 * Section 9.1 & 9.7 of Rockwell Process HMI Style Guide
 */

import React, { useState, useMemo } from 'react';
import { useHmiContext } from '../../context/WebSocketContext';
import { AlarmSeverity, ISA_COLORS } from '../../types/hmi';

interface AlarmSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlarmSummaryModal: React.FC<AlarmSummaryModalProps> = ({ isOpen, onClose }) => {
  const { alarms, acknowledgeAlarm, shelveAlarm, unshelveAlarm } = useHmiContext();
  const [activeTab, setActiveTab] = useState<'active' | 'shelved' | 'history'>('active');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [shelveDurationMap, setShelveDurationMap] = useState<Record<string, number>>({});

  const filteredAlarms = useMemo(() => {
    return alarms.filter((alm) => {
      if (activeTab === 'active') {
        if (alm.state === 'SHELVED') return false;
      } else if (activeTab === 'shelved') {
        if (alm.state !== 'SHELVED') return false;
      }
      if (severityFilter !== 'ALL' && alm.severity !== severityFilter) {
        return false;
      }
      return true;
    });
  }, [alarms, activeTab, severityFilter]);

  if (!isOpen) return null;

  const getSeverityBadge = (sev: AlarmSeverity) => {
    let bg: string = ISA_COLORS.alarmLow;
    let text = '#ffffff';
    if (sev === 'URGENT') bg = ISA_COLORS.alarmUrgent;
    if (sev === 'HIGH') bg = ISA_COLORS.alarmHigh;
    if (sev === 'MEDIUM') {
      bg = ISA_COLORS.alarmMedium;
      text = '#3f3f3f';
    }

    return (
      <span
        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: bg, color: text }}
      >
        {sev}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-4xl bg-[#e0e0e0] dark:bg-[#1c212a] border-2 border-[#a0a0a4] dark:border-gray-700 rounded shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#c0c0c0] dark:bg-[#252b37] px-4 py-2.5 border-b border-[#a0a0a4] dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              ISA-18.2 Alarm Summary &amp; Management
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  activeTab === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Active Alarms ({alarms.filter((a) => a.state !== 'SHELVED').length})
              </button>
              <button
                onClick={() => setActiveTab('shelved')}
                className={`px-3 py-1 rounded text-xs font-bold transition ${
                  activeTab === 'shelved'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Shelved ({alarms.filter((a) => a.state === 'SHELVED').length})
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500 hover:text-white transition font-bold"
          >
            ✕
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-[#e8e8e8] dark:bg-[#202530] border-b border-gray-300 dark:border-gray-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600 dark:text-gray-300">Severity Filter:</span>
            {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  severityFilter === sev
                    ? 'bg-slate-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {activeTab === 'active' && (
            <button
              onClick={() => acknowledgeAlarm('ALL')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-xs"
            >
              Acknowledge All Alarms
            </button>
          )}
        </div>

        {/* Table of Alarms */}
        <div className="overflow-y-auto flex-1 p-3">
          {filteredAlarms.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              No alarms matching current criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-300 dark:border-gray-700">
                <thead className="bg-[#c0c0c0] dark:bg-[#252b37] text-gray-800 dark:text-gray-200 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-700">Severity</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-700">Event Time</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-700">Tag / Area</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-700">Condition &amp; Message</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-700">Value / Limit</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-700">Status</th>
                    <th className="p-2 border-b border-gray-300 dark:border-gray-700 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 dark:divide-gray-700 bg-white dark:bg-[#1a1f29] font-mono-numbers">
                  {filteredAlarms.map((alm) => {
                    const isUnack = alm.state === 'UNACK_ALARM';
                    return (
                      <tr
                        key={alm.id}
                        className={`hover:bg-blue-50 dark:hover:bg-slate-800/50 ${
                          isUnack ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold' : ''
                        }`}
                      >
                        <td className="p-2">{getSeverityBadge(alm.severity)}</td>
                        <td className="p-2 font-mono text-[11px] text-gray-600 dark:text-gray-400">
                          {new Date(alm.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-2">
                          <div className="font-bold text-gray-900 dark:text-gray-200">{alm.tagPath}</div>
                          <div className="text-[10px] text-gray-500">{alm.area}</div>
                        </td>
                        <td className="p-2 text-gray-800 dark:text-gray-200">{alm.condition}</td>
                        <td className="p-2">
                          <span className="text-[#475ca7] dark:text-sky-400 font-bold">{alm.value}</span>
                          {alm.limit !== undefined && <span className="text-gray-500"> / {alm.limit}</span>}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isUnack
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 animate-alarm-blink'
                                : alm.state === 'SHELVED'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {alm.state}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {alm.state === 'UNACK_ALARM' && (
                              <button
                                onClick={() => acknowledgeAlarm(alm.id)}
                                className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded text-[10px]"
                              >
                                Ack
                              </button>
                            )}

                            {alm.state === 'SHELVED' ? (
                              <button
                                onClick={() => unshelveAlarm(alm.id)}
                                className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded text-[10px]"
                              >
                                Unshelve
                              </button>
                            ) : (
                              <div className="flex items-center gap-1">
                                <select
                                  value={shelveDurationMap[alm.id] || 30}
                                  onChange={(e) =>
                                    setShelveDurationMap({
                                      ...shelveDurationMap,
                                      [alm.id]: Number(e.target.value),
                                    })
                                  }
                                  className="text-[10px] p-0.5 bg-gray-100 dark:bg-gray-800 border rounded"
                                >
                                  <option value={15}>15m</option>
                                  <option value={30}>30m</option>
                                  <option value={60}>1h</option>
                                </select>
                                <button
                                  onClick={() =>
                                    shelveAlarm(alm.id, shelveDurationMap[alm.id] || 30)
                                  }
                                  className="px-2 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded text-[10px]"
                                  title="Shelve alarm per Section 9.7"
                                >
                                  Shelve
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#c0c0c0] dark:bg-[#252b37] px-4 py-2 border-t border-[#a0a0a4] dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded font-bold text-xs"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};
