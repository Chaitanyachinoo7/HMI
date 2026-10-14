/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Full-Scale Industrial Time-Series Trending Dashboard
 * Section 8.12.7 Trends (Rockwell Process HMI Style Guide)
 * 
 * Powered by Apache ECharts with historical buffer integration (TimescaleDB / InfluxDB).
 */

import React, { useState } from 'react';
import { ProcessTrendChart } from '../trends/ProcessTrendChart';
import { simulationEngine } from '../../services/realtime/simulationEngine';

export const TrendAnalysisView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<'all' | 'hydraulics' | 'quality'>('hydraulics');

  const presets: Record<string, string[]> = {
    hydraulics: [
      'Plant1/Water/Discharge/Pressure',
      'Plant1/Water/Total/Flow',
      'Plant1/Water/Reservoir/Level',
    ],
    quality: [
      'Plant1/Water/Chlorine/Free',
      'Plant1/Water/Chlorine/Total',
      'Plant1/Water/Settling/Turbidity',
    ],
    all: Array.from(simulationEngine.metadataRegistry.keys()),
  };

  const exportCsv = () => {
    const keys = presets[selectedPreset];
    let csv = 'Timestamp,' + keys.map((k) => `"${k}"`).join(',') + '\n';
    const sample = simulationEngine.getTrendHistory(keys[0]);
    sample.forEach((pt, index) => {
      const line = [new Date(pt.timestamp).toISOString()];
      keys.forEach((k) => {
        const hist = simulationEngine.getTrendHistory(k);
        line.push(hist[index]?.value?.toString() || '');
      });
      csv += line.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scada_trends_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#e8e8e8] dark:bg-[#1a1f29] p-3 rounded border border-[#a0a0a4] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Historical Data &amp; Real-Time Analytics
          </span>
          <h1 className="text-lg font-black text-[#3f3f3f] dark:text-gray-100">
            Industrial Time-Series Historian (Apache ECharts)
          </h1>
          <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>TimescaleDB / InfluxDB Pipeline: Streaming sub-second pushes</span>
          </div>
        </div>

        {/* Preset & Export Buttons */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded flex gap-1 text-xs font-bold">
            <button
              onClick={() => setSelectedPreset('hydraulics')}
              className={`px-3 py-1 rounded transition ${
                selectedPreset === 'hydraulics' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Hydraulics
            </button>
            <button
              onClick={() => setSelectedPreset('quality')}
              className={`px-3 py-1 rounded transition ${
                selectedPreset === 'quality' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              Water Quality
            </button>
            <button
              onClick={() => setSelectedPreset('all')}
              className={`px-3 py-1 rounded transition ${
                selectedPreset === 'all' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              All Tags
            </button>
          </div>

          <button
            onClick={exportCsv}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded transition flex items-center gap-1 shadow-xs"
          >
            <span>📥 Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main High-Performance Chart */}
      <ProcessTrendChart
        key={selectedPreset}
        initialPenPaths={presets[selectedPreset]}
        height="500px"
        showControls={true}
      />

      {/* Historian Architectural Note */}
      <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-3 rounded border border-[#a0a0a4] dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300">
        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1">
          High-Performance Trending Architecture Notes:
        </h4>
        <ul className="list-disc pl-5 space-y-1 text-[11px]">
          <li>
            <strong>Canvas Rendering Engine:</strong> Apache ECharts uses an optimized HTML5 Canvas pipeline capable of rendering 100,000+ data points smoothly at 60 FPS without DOM thrashing.
          </li>
          <li>
            <strong>TimescaleDB / InfluxDB Chunking:</strong> Time-series data is ingested via continuous aggregates (time-bucket downsampling) for ultra-fast historical queries across months and years.
          </li>
          <li>
            <strong>ISA-101 Threshold Integration:</strong> High-High and Low-Low alarm limits are visually marked directly on the axis grid (`markLine`), giving operators instant situational context for process excursions.
          </li>
        </ul>
      </div>
    </div>
  );
};
