'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GardenSettings, StrictnessLevel } from '@/types/garden';
import { X, Shield, Volume2, Trash2, Moon, Sun } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GardenSettings;
  onUpdateSettings: (partial: Partial<GardenSettings>) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllData,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Sanctuary Settings</span>
              <span>⚙️</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Strictness Level Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Anti-Distraction Policy</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gentle', label: 'Gentle', desc: '15s Grace' },
                { id: 'strict', label: 'Strict Monk', desc: 'Instant Wilt' },
                { id: 'zen', label: 'Zen Flow', desc: 'No Wilt' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onUpdateSettings({ strictness: item.id as StrictnessLevel })}
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    settings.strictness === item.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500/30'
                      : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <p className="text-xs">{item.label}</p>
                  <p className="text-[10px] text-slate-400 font-normal">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Bloom Sound & Audio FX
              </span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative p-1 ${
                settings.soundEffectsEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Clear Data Danger Zone */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button
              type="button"
              onClick={() => {
                onClearAllData();
                onClose();
              }}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Garden History</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
