'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlantRecord } from '@/types/garden';
import { PlantSVG } from '../plant/PlantSVG';
import { getCategoryBadgeStyle } from '@/utils/colorGenerator';
import { X, Play, Edit3, Trash2, Calendar, Clock } from 'lucide-react';

interface PlantCardModalProps {
  plant: PlantRecord | null;
  onClose: () => void;
  onSaveJournalNote: (id: string, note: string) => void;
  onDeletePlant: (id: string) => void;
}

export const PlantCardModal: React.FC<PlantCardModalProps> = ({
  plant,
  onClose,
  onSaveJournalNote,
  onDeletePlant,
}) => {
  const [isPlayingTimeLapse, setIsPlayingTimeLapse] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(1);
  const [journalNote, setJournalNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [loadedPlantId, setLoadedPlantId] = useState<string | null>(null);

  // Reset transient UI state whenever a different plant is opened. Adjusting state
  // directly during render (React's recommended pattern for "state depends on a changed
  // prop") avoids the extra render pass a useEffect-based reset would cause.
  if (plant && plant.id !== loadedPlantId) {
    setLoadedPlantId(plant.id);
    setJournalNote(plant.journalNote || '');
    setPlaybackProgress(1);
    setIsPlayingTimeLapse(false);
    setIsEditingNote(false);
  }

  // Handle 4-second time-lapse bloom animation playback
  useEffect(() => {
    if (!isPlayingTimeLapse) return;

    let start: number | null = null;
    const duration = 4000; // 4 seconds bloom playback

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(1, elapsed / duration);
      setPlaybackProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsPlayingTimeLapse(false);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlayingTimeLapse]);

  if (!plant) return null;

  const categoryBadge = getCategoryBadgeStyle(plant.categoryTag);
  const formattedDate = new Date(plant.plantedAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(plant.plantedAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSaveNote = () => {
    onSaveJournalNote(plant.id, journalNote);
    setIsEditingNote(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/20 shadow-2xl overflow-hidden"
        >
          {/* Top Header Controls */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}>
                {categoryBadge.icon} #{plant.categoryTag}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {plant.species}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close plant details"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Plant Visual Centerpiece */}
          <div className="relative p-6 flex flex-col items-center bg-gradient-to-b from-emerald-500/5 to-transparent">
            <div className="w-48 h-48">
              <PlantSVG
                species={plant.species}
                elapsedSeconds={plant.actualFocusedSeconds}
                targetSeconds={plant.durationMinutes * 60}
                isWilt={!plant.completed}
                isCompleted={plant.completed}
                colorSeed={plant.colorSeed}
                playbackProgressOverride={isPlayingTimeLapse ? playbackProgress : undefined}
              />
            </div>

            {/* Time-Lapse Playback Button */}
            {plant.completed && (
              <button
                type="button"
                onClick={() => {
                  setPlaybackProgress(0);
                  setIsPlayingTimeLapse(true);
                }}
                disabled={isPlayingTimeLapse}
                className="mt-2 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPlayingTimeLapse ? 'Replaying Bloom...' : 'Play Growth Time-Lapse'}</span>
              </button>
            )}
          </div>

          {/* Details & Reflection Note */}
          <div className="p-6 space-y-4">
            <div className="space-y-1 text-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                &ldquo;{plant.intention}&rdquo;
              </h3>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {plant.durationMinutes}m focus ({formattedTime})
                </span>
              </div>
            </div>

            {/* Reflection Note Field */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Session Reflection Note</span>
                {!isEditingNote && (
                  <button
                    type="button"
                    onClick={() => setIsEditingNote(true)}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingNote ? (
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={journalNote}
                    onChange={(e) => setJournalNote(e.target.value)}
                    placeholder="Write a quick reflection about what you accomplished..."
                    className="w-full p-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNote(false)}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveNote}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-sm"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/70 text-xs text-slate-700 dark:text-slate-300 italic min-h-[60px]">
                  {plant.journalNote || 'No reflection note recorded for this session.'}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Delete this plant record permanently?')) {
                    onDeletePlant(plant.id);
                    onClose();
                  }
                }}
                className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Plant</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
