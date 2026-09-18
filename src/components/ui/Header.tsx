'use client';

import React from 'react';
import { AppView } from '@/types/garden';
import { Sprout, Flower2, BarChart2, Flame, Settings } from 'lucide-react';

interface HeaderProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  currentStreak: number;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSelectView,
  currentStreak,
  onOpenSettings,
}) => {
  return (
    <header className="w-full sticky top-0 z-40 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-4 md:px-8 py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onSelectView('timer')}
          aria-label="Focus Garden home"
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
              Focus Garden
            </h1>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide uppercase">
              Time is Water 🌱
            </p>
          </div>
        </button>

        {/* View Switcher Navigation */}
        <nav className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          <button
            type="button"
            onClick={() => onSelectView('timer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'timer'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timer</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('garden')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'garden'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>Garden</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('analytics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentView === 'analytics'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Analytics</span>
          </button>
        </nav>

        {/* Right Streak Badge & Settings */}
        <div className="flex items-center gap-2">
          <div
            title={`${currentStreak} day focus streak!`}
            className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{currentStreak}d</span>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-2xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            title="Sanctuary Settings"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
