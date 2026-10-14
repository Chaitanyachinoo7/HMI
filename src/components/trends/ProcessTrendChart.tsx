/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * High-Performance Industrial Time-Series Trending Component
 * Powered by Apache ECharts, replicating Ignition Perspective Historical Trends
 * Connected to simulated TimescaleDB / InfluxDB buffer with real-time push.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { simulationEngine } from '../../services/realtime/simulationEngine';
import { useHmiContext } from '../../context/WebSocketContext';

interface ProcessTrendChartProps {
  initialPenPaths?: string[];
  height?: string | number;
  showControls?: boolean;
}

export const ProcessTrendChart: React.FC<ProcessTrendChartProps> = ({
  initialPenPaths = [
    'Plant1/Water/Discharge/Pressure',
    'Plant1/Water/Total/Flow',
    'Plant1/Water/Reservoir/Level',
  ],
  height = '420px',
  showControls = true,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { theme } = useHmiContext();

  const [activePens, setActivePens] = useState<string[]>(initialPenPaths);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sampleWindow, setSampleWindow] = useState<number>(300); // 300 points = ~2.5 mins

  const penColors: Record<string, string> = {
    'Plant1/Water/Discharge/Pressure': '#0284c7', // Sky Blue
    'Plant1/Water/Total/Flow': '#10b981',         // Emerald Green
    'Plant1/Water/Reservoir/Level': '#8b5cf6',     // Violet
    'Plant1/Water/Settling/Turbidity': '#f59e0b',  // Amber
    'Plant1/Water/Chlorine/Free': '#ec4899',       // Pink
  };

  const allAvailablePens = Array.from(simulationEngine.metadataRegistry.keys());

  // Initialize and configure ECharts instance
  useEffect(() => {
    if (!chartRef.current) return;

    const isDark = theme === 'control-room-dark';
    const chart = echarts.init(chartRef.current, isDark ? 'dark' : undefined, {
      renderer: 'canvas',
    });
    chartInstance.current = chart;

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartInstance.current = null;
    };
  }, [theme]);

  // Update chart data series on a smooth interval
  useEffect(() => {
    const updateChart = () => {
      if (isPaused || !chartInstance.current) return;

      const series: echarts.SeriesOption[] = [];
      const isDark = theme === 'control-room-dark';

      activePens.forEach((path) => {
        const meta = simulationEngine.getMetadata(path);
        const history = simulationEngine.getTrendHistory(path).slice(-sampleWindow);
        const data = history.map((pt) => [pt.timestamp, pt.value]);
        const color = penColors[path] || '#475ca7';

        series.push({
          name: meta ? `${meta.name} (${meta.engineeringUnits})` : path,
          type: 'line',
          showSymbol: false,
          smooth: true,
          lineStyle: {
            width: 2,
            color,
          },
          itemStyle: {
            color,
          },
          data,
          markLine: meta?.highHighLimit
            ? {
                silent: true,
                symbol: 'none',
                data: [
                  {
                    yAxis: meta.highHighLimit,
                    lineStyle: { color: '#e22028', type: 'dashed', width: 1.5 },
                    label: { formatter: 'Hi-Hi', position: 'end' },
                  },
                ],
              }
            : undefined,
        });
      });

      chartInstance.current.setOption(
        {
          backgroundColor: 'transparent',
          animation: false,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              lineStyle: { color: isDark ? '#94a3b8' : '#64748b' },
            },
            formatter: (params: any) => {
              if (!Array.isArray(params) || params.length === 0) return '';
              const time = new Date(params[0].value[0]).toLocaleTimeString();
              let html = `<div style="font-family: monospace; font-size: 11px;"><strong>${time}</strong><br/>`;
              params.forEach((p) => {
                html += `<span style="color:${p.color}">●</span> ${p.seriesName}: <b>${Number(p.value[1]).toFixed(2)}</b><br/>`;
              });
              html += '</div>';
              return html;
            },
          },
          legend: {
            show: true,
            top: 5,
            textStyle: {
              color: isDark ? '#cbd5e1' : '#334155',
              fontSize: 11,
            },
          },
          grid: {
            top: 45,
            left: 55,
            right: 40,
            bottom: 45,
          },
          xAxis: {
            type: 'time',
            splitLine: {
              show: true,
              lineStyle: { color: isDark ? '#262d3d' : '#e2e8f0' },
            },
            axisLabel: {
              formatter: '{HH}:{mm}:{ss}',
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: 10,
            },
          },
          yAxis: {
            type: 'value',
            scale: true,
            splitLine: {
              show: true,
              lineStyle: { color: isDark ? '#262d3d' : '#e2e8f0' },
            },
            axisLabel: {
              color: isDark ? '#94a3b8' : '#64748b',
              fontSize: 10,
            },
          },
          dataZoom: [
            {
              type: 'inside',
              xAxisIndex: 0,
            },
          ],
          series,
        },
        { notMerge: false }
      );
    };

    updateChart();
    const interval = setInterval(updateChart, 1000);
    return () => clearInterval(interval);
  }, [activePens, isPaused, sampleWindow, theme]);

  const togglePen = (path: string) => {
    setActivePens((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  return (
    <div className="w-full bg-[#f4f4f4] dark:bg-[#161a22] border border-[#a0a0a4] dark:border-gray-800 rounded p-3 flex flex-col shadow-xs">
      {/* Trend Controls Bar */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-gray-300 dark:border-gray-700 text-xs">
          {/* Pen Toggles */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-gray-700 dark:text-gray-300 mr-1 text-[11px]">Active Pens:</span>
            {allAvailablePens.map((path) => {
              const meta = simulationEngine.getMetadata(path);
              const isActive = activePens.includes(path);
              const color = penColors[path] || '#475ca7';
              return (
                <button
                  key={path}
                  onClick={() => togglePen(path)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-400'
                      : 'bg-gray-200 dark:bg-gray-800/40 text-gray-400 border-transparent opacity-60'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: color }}
                  />
                  <span>{meta?.name || path.split('/').pop()}</span>
                </button>
              );
            })}
          </div>

          {/* Time & Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                isPaused
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}
            >
              {isPaused ? '▶ Resume Live' : '❚❚ Pause Stream'}
            </button>

            <select
              value={sampleWindow}
              onChange={(e) => setSampleWindow(Number(e.target.value))}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs text-gray-700 dark:text-gray-300 font-medium"
            >
              <option value={60}>Window: 1 Minute</option>
              <option value={150}>Window: 2.5 Minutes</option>
              <option value={300}>Window: 5 Minutes</option>
            </select>
          </div>
        </div>
      )}

      {/* Chart Canvas Container */}
      <div ref={chartRef} style={{ width: '100%', height }} />
    </div>
  );
};
