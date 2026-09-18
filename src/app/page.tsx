'use client';

import React, { useState } from 'react';
import { useGardenStore } from '@/store/useGardenStore';
import { AppView, PlantRecord } from '@/types/garden';
import { Header } from '@/components/ui/Header';
import { IntentionSelector } from '@/components/timer/IntentionSelector';
import { FocusTimer } from '@/components/timer/FocusTimer';
import { VisibilityBanner } from '@/components/timer/VisibilityBanner';
import { GardenGrid } from '@/components/garden/GardenGrid';
import { AnalyticsBar } from '@/components/garden/AnalyticsBar';
import { PlantCardModal } from '@/components/garden/PlantCardModal';
import { SettingsModal } from '@/components/ui/SettingsModal';

export default function Home() {
  const {
    state,
    activeSession,
    isLoaded,
    startSession,
    pauseSession,
    resumeSession,
    cancelSession,
    updateSettings,
    updateJournalNote,
    deletePlant,
    clearAllData,
    exportData,
    importData,
  } = useGardenStore();

  const [currentView, setCurrentView] = useState<AppView>('timer');
  const [selectedInspectPlant, setSelectedInspectPlant] = useState<PlantRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-950 text-emerald-100 font-mono text-sm">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mb-3" />
        <span>Hydrating sanctuary... 🌱</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-sanctuary-light dark:bg-sanctuary-dark text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Header Navigation */}
      <Header
        currentView={currentView}
        onSelectView={setCurrentView}
        currentStreak={state.currentStreak}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Tab Grace Countdown Banner */}
      {activeSession && (
        <VisibilityBanner
          isGraceActive={activeSession.isGraceActive}
          graceTimeRemaining={activeSession.graceTimeRemaining}
        />
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        {currentView === 'timer' && (
          <div className="w-full flex flex-col items-center justify-center">
            {activeSession ? (
              <FocusTimer
                session={activeSession}
                onPause={pauseSession}
                onResume={resumeSession}
                onGiveUp={() => cancelSession('give_up')}
                ambientSound={state.settings.ambientSound}
                onSelectAmbientSound={(snd) => updateSettings({ ambientSound: snd })}
              />
            ) : (
              <IntentionSelector
                onStartSession={startSession}
                defaultDuration={state.settings.defaultDuration}
              />
            )}
          </div>
        )}

        {currentView === 'garden' && (
          <GardenGrid
            plants={state.plants}
            onSelectPlant={(plant) => setSelectedInspectPlant(plant)}
            onStartNewSession={() => setCurrentView('timer')}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsBar
            plants={state.plants}
            currentStreak={state.currentStreak}
            longestStreak={state.longestStreak}
            totalFocusedMinutes={state.totalFocusedMinutes}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200/40 dark:border-slate-800/40">
        Focus Garden • Time is Water • Growth & Sanctuary Focus App • Created by Saqib Ahmad Siddiqui • <a href="https://www.linkedin.com/in/saqib-ahmad-siddiqui/" target="_blank" rel="noopener noreferrer" className="underline">LinkedIn</a> • <a href="https://github.com/saqibahmadsiddiqui/" target="_blank" rel="noopener noreferrer" className="underline">Github</a>
      </footer>

      {/* Plant Card Inspector Modal */}
      <PlantCardModal
        plant={selectedInspectPlant}
        onClose={() => setSelectedInspectPlant(null)}
        onSaveJournalNote={updateJournalNote}
        onDeletePlant={deletePlant}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.settings}
        onUpdateSettings={updateSettings}
        onClearAllData={clearAllData}
        onExportData={exportData}
        onImportData={importData}
      />
    </div>
  );
}
