'use client';

import React from 'react';
import { PlantRecord, FocusCategory } from '@/types/garden';
import { Flame, Clock, Trophy, Target, PieChart } from 'lucide-react';
import { getCategoryBadgeStyle } from '@/utils/colorGenerator';

interface AnalyticsBarProps {
  plants: PlantRecord[];
  currentStreak: number;
  longestStreak: number;
  totalFocusedMinutes: number;
}

export const AnalyticsBar: React.FC<AnalyticsBarProps> = ({
  plants,
  currentStreak,
  longestStreak,
  totalFocusedMinutes,
}) => {
  const completedCount = plants.filter((p) => p.completed).length;
  const totalWilts = plants.filter((p) => !p.completed).length;
  const totalSessions = plants.length;
  const completionRate = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 100;
  const totalHours = (totalFocusedMinutes / 60).toFixed(1);

  // Category breakdown calculation
  const categoryCounts: Record<FocusCategory, number> = {
    coding: 0,
    reading: 0,
    writing: 0,
    design: 0,
    learning: 0,
    zen: 0,
  };

  plants.forEach((p) => {
    if (p.completed && categoryCounts[p.categoryTag] !== undefined) {
      categoryCounts[p.categoryTag] += p.durationMinutes;
    }
  });

  // Generate GitHub-style 30-day bloom activity grid
  const days: { dateStr: string; count: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = plants.filter(
      (p) => p.completed && new Date(p.plantedAt).toISOString().split('T')[0] === dateStr
    ).length;
    days.push({ dateStr, count });
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Focus & Botanical Analytics</span>
          <PieChart className="w-5 h-5 text-emerald-500" />
        </h2>
      </div>

      {/* Top Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        {/* Active Streak */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Streak
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        {/* Total Hours Hydrated */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Time Hydrated
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {totalHours} hrs
            </p>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/20 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bloom Rate
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {completionRate}%
            </p>
          </div>
        </div>

        {/* Best Streak */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Best Record
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </div>

      {/* GitHub-style Floral Heatmap Grid */}
      <div className="p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-3 shadow-sm">
        <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
          <span>30-Day Bloom Intensity Heatmap</span>
          <span className="text-[11px] text-slate-400 font-medium">Last 30 Days</span>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 pt-1">
          {days.map((day) => {
            let bgClass = 'bg-slate-100 dark:bg-slate-800/50';
            if (day.count >= 4) bgClass = 'bg-emerald-600 text-white';
            else if (day.count === 3) bgClass = 'bg-emerald-500 text-white';
            else if (day.count === 2) bgClass = 'bg-emerald-400 text-slate-900';
            else if (day.count === 1) bgClass = 'bg-emerald-300 dark:bg-emerald-800/60 text-slate-900 dark:text-emerald-200';

            return (
              <div
                key={day.dateStr}
                title={`${day.dateStr}: ${day.count} bloomed plants`}
                className={`w-full aspect-square rounded-lg ${bgClass} flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 cursor-default`}
              >
                {day.count > 0 ? day.count : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
