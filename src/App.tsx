/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AegisHMI - Open-Source Industrial SCADA & Perspective HMI
 * Compliant with ANSI/ISA-101.01-2015 and ANSI/ISA-18.2-2016.
 */

import React, { useState } from 'react';
import { WebSocketProvider, useHmiContext } from './context/WebSocketContext';
import { HmiHeader } from './components/layout/HmiHeader';
import { HmiTabBar } from './components/layout/HmiTabBar';
import { AlarmBanner } from './components/industrial/AlarmBanner';
import { AlarmSummaryModal } from './components/industrial/AlarmSummaryModal';
import { FaceplateModal } from './components/industrial/FaceplateModal';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

import { Level1Overview } from './components/views/Level1Overview';
import { Level2OperatingGraphics } from './components/views/Level2OperatingGraphics';
import { Level3ProcessDetail } from './components/views/Level3ProcessDetail';
import { TrendAnalysisView } from './components/views/TrendAnalysisView';
import { ArchitectureGuideView } from './components/views/ArchitectureGuideView';

const HmiMainContent: React.FC = () => {
  const { theme } = useHmiContext();
  const [currentView, setCurrentView] = useState<string>('level1');
  const [isAlarmSummaryOpen, setIsAlarmSummaryOpen] = useState<boolean>(false);

  return (
    <div className={`min-h-screen ${theme === 'control-room-dark' ? 'dark bg-[#111317] text-gray-200' : 'bg-[#e0e0e0] text-[#222]'}`}>
      {/* 1. Standard PlantPAx / Ignition Perspective Header (Section 4.1.1) */}
      <HmiHeader
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenAlarmSummary={() => setIsAlarmSummaryOpen(true)}
      />

      {/* 2. Docked ISA-18.2 Alarm Banner (Section 9.3.4) */}
      <AlarmBanner onOpenAlarmSummary={() => setIsAlarmSummaryOpen(true)} />

      {/* 3. Level 2 & 3 Navigation Button Bar (Section 4.1.2) */}
      <HmiTabBar currentView={currentView} onNavigate={setCurrentView} />

      {/* 4. Main Display View Canvas */}
      <main className="max-w-[1920px] mx-auto p-3 sm:p-4 pb-12">
        {currentView === 'level1' && (
          <Level1Overview onNavigateToUnit={() => setCurrentView('level2')} />
        )}
        {currentView === 'level2' && <Level2OperatingGraphics />}
        {currentView === 'level3' && <Level3ProcessDetail />}
        {currentView === 'trends' && <TrendAnalysisView />}
        {currentView === 'architecture' && <ArchitectureGuideView />}
      </main>

      {/* 5. Level 4 Diagnostic Faceplate Modal (Section 8.16) */}
      <FaceplateModal />

      {/* 6. Comprehensive ISA-18.2 Alarm Summary Modal (Section 9.1 & 9.7) */}
      <AlarmSummaryModal
        isOpen={isAlarmSummaryOpen}
        onClose={() => setIsAlarmSummaryOpen(false)}
      />

      {/* 7. PWA Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <WebSocketProvider>
      <HmiMainContent />
    </WebSocketProvider>
  );
}
