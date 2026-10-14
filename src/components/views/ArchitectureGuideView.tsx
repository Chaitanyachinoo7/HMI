/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Interactive Technical Architecture & Deliverables Guide
 * Comprehensive documentation of the 4 deliverables requested by the user.
 */

import React, { useState } from 'react';

export const ArchitectureGuideView: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<'directory' | 'websocket' | 'component' | 'pwa'>('directory');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-[#e8e8e8] dark:bg-[#1a1f29] p-4 rounded border border-[#a0a0a4] dark:border-gray-800">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Architecture Deliverables
        </span>
        <h1 className="text-xl font-black text-[#3f3f3f] dark:text-gray-100">
          Industrial SCADA &amp; Perspective HMI Technical Architecture
        </h1>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Complete engineering blueprint for open-source, vendor-agnostic, high-performance web HMI adhering to ISA-101.01 and ISA-18.2 standards.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#a0a0a4] dark:border-gray-700 bg-[#c0c0c0] dark:bg-[#222733] text-xs font-bold">
        <button
          onClick={() => setSelectedSection('directory')}
          className={`px-4 py-2.5 border-r border-[#a0a0a4] dark:border-gray-700 transition ${
            selectedSection === 'directory'
              ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          1. Recommended Directory Structure
        </button>
        <button
          onClick={() => setSelectedSection('websocket')}
          className={`px-4 py-2.5 border-r border-[#a0a0a4] dark:border-gray-700 transition ${
            selectedSection === 'websocket'
              ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          2. Core WebSocket State Context &amp; Hook
        </button>
        <button
          onClick={() => setSelectedSection('component')}
          className={`px-4 py-2.5 border-r border-[#a0a0a4] dark:border-gray-700 transition ${
            selectedSection === 'component'
              ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          3. Boilerplate Industrial Component
        </button>
        <button
          onClick={() => setSelectedSection('pwa')}
          className={`px-4 py-2.5 border-r border-[#a0a0a4] dark:border-gray-700 transition ${
            selectedSection === 'pwa'
              ? 'bg-[#e0e0e0] dark:bg-[#1c212a] text-[#475ca7] dark:text-sky-400 border-t-2 border-t-[#475ca7]'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
          }`}
        >
          4. PWA &amp; Build Configuration
        </button>
      </div>

      {/* Tab 1: Directory Structure */}
      {selectedSection === 'directory' && (
        <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-5 rounded border border-[#a0a0a4] dark:border-gray-700 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Deliverable 1: Recommended Production Directory Structure
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            This modular directory structure is tailored for enterprise SCADA/HMI platforms matching Ignition Perspective’s separation of concerns, supporting multi-screen control rooms, synoptic graphics, alarms, and offline caching:
          </p>

          <pre className="p-4 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`project-root/
├── public/
│   ├── icon.svg                      # Scalable brand vector
│   ├── favicon.ico                   # Browser favicon
│   ├── apple-touch-icon.png          # iOS Safari touch icon (180x180)
│   ├── pwa-192x192.png               # Android PWA home icon
│   ├── pwa-512x512.png               # Android high-res splash icon
│   └── pwa-maskable-512x512.png      # Android adaptive maskable icon
├── src/
│   ├── types/
│   │   ├── hmi.ts                    # Tag, TagQuality, AlarmSeverity, DeviceState
│   │   ├── security.ts               # RBAC (Operator, Maintenance, Engineer)
│   │   └── synoptic.ts               # Graphic coordinate & pipe vector schemas
│   ├── services/
│   │   ├── realtime/
│   │   │   ├── webSocketService.ts   # Auto-reconnecting socket multiplexer
│   │   │   ├── mqttService.ts        # Sparkplug B / MQTT-over-WebSocket bridge
│   │   │   └── simulationEngine.ts   # In-browser simulated PLC tag provider
│   │   ├── api/
│   │   │   └── timeseriesApi.ts      # TimescaleDB / InfluxDB REST client
│   │   └── soundService.ts           # ANSI/ISA-18.2 Web Audio tone generator
│   ├── context/
│   │   ├── WebSocketContext.tsx      # Core tag subscription & command context
│   │   ├── SecurityContext.tsx       # Role-based access control (RBAC)
│   │   └── DisplayNavigationContext.tsx # Level 1-4 display yoking & multi-screen
│   ├── hooks/
│   │   ├── useTagBinding.ts          # Sub-second live tag hook with deadband
│   │   ├── useMotorBinding.ts        # Motor telemetry & command dispatcher
│   │   ├── useValveBinding.ts        # Modulating / discrete valve hook
│   │   ├── useAlarms.ts              # ISA-18.2 active alarm manager
│   │   └── usePWAInstall.ts          # In-app native install prompt hook
│   ├── components/
│   │   ├── layout/
│   │   │   ├── HmiHeader.tsx         # PlantPAx top header & alarm summary bell
│   │   │   ├── HmiTabBar.tsx         # Level 2 / Level 3 button bars
│   │   │   └── ScreenYokingGrid.tsx  # Multi-monitor 1920x1080 / 4K layout grid
│   │   ├── industrial/
│   │   │   ├── MotorWidget.tsx       # ISA-101 motor component (>= 40px touch)
│   │   │   ├── ValveWidget.tsx       # ISA-5.5 bowtie valve with % open bar
│   │   │   ├── AnalogIndicator.tsx   # Normalized bar with normal band & sparkline
│   │   │   ├── ProcessVessel.tsx     # Tanks / clarifiers with fluid level fill
│   │   │   ├── ProcessFlowLine.tsx   # Animated primary (3px) and secondary pipes
│   │   │   ├── FaceplateModal.tsx    # Level 4 Diagnostic Faceplate (Home/Alarms/Trends)
│   │   │   └── AlarmBanner.tsx       # Docked top banner with unack blinking
│   │   ├── trends/
│   │   │   └── ProcessTrendChart.tsx # Apache ECharts multi-pen historian
│   │   └── pwa/
│   │       ├── PWAInstallButton.tsx  # In-app PWA install trigger
│   │       └── OfflineIndicator.tsx  # Network status toast banner
│   ├── views/
│   │   ├── Level1Overview.tsx        # High-level KPI & whole plant overview
│   │   ├── Level2OperatingGraphics.tsx # Primary synoptic P&ID operating screen
│   │   ├── Level3ProcessDetail.tsx   # Sub-unit diagnostics & PID loop tuning
│   │   └── TrendAnalysisView.tsx     # Fullscreen historian & CSV export
│   ├── App.tsx                       # Root view orchestrator & providers
│   ├── index.css                     # Tailwind v4 + ISA-101 color variables
│   └── main.tsx                      # React 19 entry point
├── vite.config.ts                    # VitePWA plugin & asset precaching
├── tsconfig.json                     # TypeScript compiler & PWA client types
└── metadata.json                     # AI Studio metadata & capabilities`}
          </pre>
        </div>
      )}

      {/* Tab 2: WebSocket State Context & Hook */}
      {selectedSection === 'websocket' && (
        <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-5 rounded border border-[#a0a0a4] dark:border-gray-700 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Deliverable 2: Core WebSocket State Context &amp; `useTagBinding` Hook
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            The WebSocket state pipeline guarantees sub-second telemetry delivery, reference-counted tag multiplexing, automatic backoff reconnection, and graceful fallback to local PLC simulation when disconnected.
          </p>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200">
              Usage Example in Any Component:
            </h3>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`import { useTagBinding } from '@/context/WebSocketContext';

export function PressureReadout() {
  const { 
    value, 
    quality, 
    metadata, 
    inAlarm, 
    writeValue 
  } = useTagBinding<number>('Plant1/Water/Discharge/Pressure', {
    deadband: 0.5,      // Ignore micro-fluctuations under 0.5 kPa
    rateLimitMs: 200,   // Prevent DOM thrashing during rapid pushes
  });

  return (
    <div className={\`p-3 border \${inAlarm ? 'border-red-500 animate-alarm-blink' : 'border-gray-300'}\`}>
      <span className="text-xs font-bold text-gray-600">{metadata?.name}</span>
      <div className="text-xl font-bold font-mono text-blue-600">
        {value.toFixed(1)} <span className="text-xs text-gray-500">{metadata?.engineeringUnits}</span>
      </div>
      <button onClick={() => writeValue(420.0)} className="mt-2 text-xs bg-slate-700 text-white px-2 py-1 rounded">
        Reset to SP (420 kPa)
      </button>
    </div>
  );
}`}
            </pre>

            <h3 className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200 mt-4">
              Key Engineering Attributes of `useTagBinding`:
            </h3>
            <ul className="list-disc pl-5 text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <li><strong>Reference Counted Subscription:</strong> If 10 widgets subscribe to the same tag path, only 1 subscription frame is sent across the socket.</li>
              <li><strong>Deadband Filtering:</strong> Configurable numeric deadband prevents unnecessary React re-renders when fluctuations are within instrument noise tolerance.</li>
              <li><strong>ISA-18.2 Alarm Integration:</strong> Returns `inAlarm` and the associated `alarm` object so the component can immediately apply blinking border styles without extra boilerplate.</li>
              <li><strong>Optimistic Write API:</strong> `writeValue` dispatches a validated command over WebSockets with operator auditing.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Boilerplate Industrial Component */}
      {selectedSection === 'component' && (
        <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-5 rounded border border-[#a0a0a4] dark:border-gray-700 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Deliverable 3: Boilerplate Industrial Component (Motor / Valve)
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Derived directly from the Rockwell Automation Process HMI Style Guide (PROCES-WP023A-EN-P) and ISA-101.01 standards:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700">
              <h3 className="font-bold text-xs uppercase text-gray-800 dark:text-gray-200 mb-2">
                1. Touch Hit Zone Requirements (Section 8.15.1)
              </h3>
              <ul className="list-disc pl-4 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li><strong>Command Buttons:</strong> Minimum visible hit zone of <strong>40 x 40 pixels</strong> for operator touch.</li>
                <li><strong>Command Spacing:</strong> <strong>10 pixels spacing</strong> between command buttons to prevent inadvertent actuation.</li>
                <li><strong>Navigation Buttons:</strong> 35 x 35 pixels minimum with 2 pixels spacing.</li>
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700">
              <h3 className="font-bold text-xs uppercase text-gray-800 dark:text-gray-200 mb-2">
                2. Command Button Discipline (Section 8.15.2)
              </h3>
              <ul className="list-disc pl-4 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li><strong>No Single Toggle Buttons:</strong> Two-state buttons for equipment control MUST be avoided.</li>
                <li>Provide separate <strong>START</strong> and <strong>STOP</strong> buttons in distinct physical positions.</li>
                <li>Button labels must reflect the <em>action to be initiated</em>, not the current state.</li>
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700">
              <h3 className="font-bold text-xs uppercase text-gray-800 dark:text-gray-200 mb-2">
                3. Color Conventions (Section 8.1 &amp; 8.7)
              </h3>
              <ul className="list-disc pl-4 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li><strong>Stopped / Off:</strong> Muted Gray (#808080).</li>
                <li><strong>Running / On:</strong> Off-White (#F0F0F0) or crisp light contrast. Never bright green!</li>
                <li><strong>Transition / Jog:</strong> Light Blue (#93C2E4).</li>
                <li><strong>Fault / Program Error:</strong> Black (#000000) with white text.</li>
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-[#151922] rounded border border-gray-300 dark:border-gray-700">
              <h3 className="font-bold text-xs uppercase text-gray-800 dark:text-gray-200 mb-2">
                4. Alarm Depiction (Section 9.2)
              </h3>
              <ul className="list-disc pl-4 text-xs text-gray-600 dark:text-gray-300 space-y-1">
                <li>Color is reserved for alarms and live data.</li>
                <li><strong>Unacknowledged Alarm:</strong> Border blinks between alarm priority color and gray border. Text and background NEVER blink.</li>
                <li><strong>Acknowledged Alarm:</strong> Border remains solid alarm priority color until cleared.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: PWA & Build Configuration */}
      {selectedSection === 'pwa' && (
        <div className="bg-[#e8e8e8] dark:bg-[#1f242e] p-5 rounded border border-[#a0a0a4] dark:border-gray-700 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
            Deliverable 4: PWA &amp; Build Configuration
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Industrial control rooms and field operators using iPads or rugged tablets require offline-first asset caching and standalone window execution. Below is the configuration implemented in this application:
          </p>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200">
              `vite.config.ts` (VitePWA configuration):
            </h3>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded text-xs font-mono overflow-x-auto leading-relaxed border border-slate-700">
{`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon.svg'],
      manifest: {
        id: '/',
        name: 'AegisHMI - Industrial SCADA & Perspective HMI',
        short_name: 'AegisHMI',
        description: 'High-performance, open-source industrial HMI and SCADA dashboard compliant with ISA-101 and ISA-18.2 standards.',
        theme_color: '#1e222b',
        background_color: '#111317',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\\/\\/fonts\\.googleapis\\.com\\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 31536000 } }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ]
});`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
