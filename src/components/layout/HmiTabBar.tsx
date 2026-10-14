/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Standard HMI Template Button Bars
 * Section 4.1.2 of Rockwell Process HMI Style Guide
 */

import React from 'react';

interface HmiTabBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const HmiTabBar: React.FC<HmiTabBarProps> = ({ currentView, onNavigate }) => {
  const level2Tabs = [
    { id: 'level1', label: 'Level 1: Plant Overview', badge: 'KPIs' },
    { id: 'level2', label: 'Level 2: Unit Synoptic (P&ID)', badge: 'Control' },
    { id: 'level3', label: 'Level 3: Process Diagnostics', badge: 'Loops' },
    { id: 'trends', label: 'Time-Series Historian', badge: 'ECharts' },
    { id: 'architecture', label: 'Technical Deliverables', badge: 'Docs' },
  ];

  return (
    <div className="bg-[#c6c6c6] dark:bg-[#1f242d] border-b border-[#a0a0a4] dark:border-gray-800 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
      {/* Primary Display Tabs (Section 4.1.2 Level 2 Button Bar) */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-gray-500 mr-1 hidden sm:inline">
          Navigation:
        </span>
        {level2Tabs.map((tab) => {
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`min-h-[34px] px-3.5 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                isActive
                  ? 'bg-[#e0e0e0] dark:bg-[#2d3442] text-[#475ca7] dark:text-sky-300 border-[#475ca7] dark:border-sky-500'
                  : 'bg-[#d8d8d8] dark:bg-[#161a22] text-[#3f3f3f] dark:text-gray-300 border-gray-400 dark:border-gray-700 hover:bg-[#eaeaea] dark:hover:bg-gray-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Status Breadcrumb */}
      <div className="hidden xl:flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-400 font-mono">
        <span>Standard: ANSI/ISA-101.01 &bull; ANSI/ISA-18.2</span>
      </div>
    </div>
  );
};
