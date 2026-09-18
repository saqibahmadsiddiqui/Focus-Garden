'use client';

import React, { useState } from 'react';
import { ActiveSession } from '@/store/useGardenStore';
import { PlantSVG } from '../plant/PlantSVG';
import { generatePlantColorSeed, getCategoryBadgeStyle } from '@/utils/colorGenerator';
import { Pause, Play, XCircle, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '@/utils/soundEngine';

interface FocusTimerProps {
  session: ActiveSession;
  onPause: () => void;
  onResume: () => void;
  onGiveUp: () => void;
  ambientSound: string | null;
  onSelectAmbientSound: (sound: 'rain' | 'forest' | 'waves' | 'lofi' | null) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  session,
  onPause,
  onResume,
  onGiveUp,
  ambientSound,
  onSelectAmbientSound,
}) => {
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const colorSeed = generatePlantColorSeed(session.species, session.timeOfDay);
  const categoryBadge = getCategoryBadgeStyle(session.categoryTag);

  const remainingSeconds = Math.max(0, session.targetSeconds - session.elapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = Math.min(100, Math.round((session.elapsedSeconds / session.targetSeconds) * 100));

  const handleGiveUpClick = () => {
    if (showGiveUpConfirm) {
      onGiveUp();
    } else {
      setShowGiveUpConfirm(true);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-between min-h-[500px] p-6 text-center select-none">
      {/* Top Intention Banner */}
      <div className="space-y-2 w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 backdrop-blur-md shadow-sm">
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}>
            {categoryBadge.icon} #{session.categoryTag}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-2">
            {session.strictness === 'gentle' ? 'Gentle Grace 15s' : 'Strict Monk'}
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 line-clamp-2 px-4">
          &ldquo;{session.intention}&rdquo;
        </h3>
      </div>

      {/* Center Plant Artwork */}
      <div className="relative my-4 w-full flex flex-col items-center">
        <PlantSVG
          species={session.species}
          elapsedSeconds={session.elapsedSeconds}
          targetSeconds={session.targetSeconds}
          isPaused={session.isPaused}
          colorSeed={colorSeed}
        />

        {/* Dynamic Growth Percentage Bar */}
        <div className="w-48 mt-2 space-y-1">
          <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
            <span>Hydrated</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-300/30 dark:border-slate-700/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Subdued Timer & Controls */}
      <div className="space-y-5 w-full max-w-xs">
        {/* Countdown Display */}
        <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-slate-800 dark:text-slate-100 opacity-90">
          {timeString}
        </div>

        {/* Ambient Sound Selector Pills */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => {
              if (ambientSound) {
                onSelectAmbientSound(null);
                if (soundEngine) soundEngine.stopAmbient();
              } else {
                onSelectAmbientSound('rain');
                if (soundEngine) soundEngine.startAmbient('rain');
              }
            }}
            className={`p-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
              ambientSound
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
            title="Toggle Ambient Focus Audio"
          >
            {ambientSound ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="capitalize">{ambientSound || 'Muted'}</span>
          </button>

          {['rain', 'forest', 'waves'].map((snd) => (
            <button
              key={snd}
              type="button"
              onClick={() => {
                onSelectAmbientSound(snd as 'rain' | 'forest' | 'waves');
                if (soundEngine) soundEngine.startAmbient(snd as 'rain' | 'forest' | 'waves');
              }}
              className={`px-2 py-1 rounded-lg text-[11px] capitalize border transition-all ${
                ambientSound === snd
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'bg-slate-100/30 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
            >
              {snd}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {session.isPaused ? (
            <button
              type="button"
              onClick={onResume}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume Focus</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="px-5 py-2.5 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition-all flex items-center gap-2 border border-slate-300/60 dark:border-slate-700/60"
            >
              <Pause className="w-4 h-4" />
              <span>Pause (Lock)</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleGiveUpClick}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              showGiveUpConfirm
                ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>{showGiveUpConfirm ? 'Confirm Wilt?' : 'Give Up'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
