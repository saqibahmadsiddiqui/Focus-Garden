'use client';

import React, { useState } from 'react';
import { PlantSpecies, FocusCategory } from '@/types/garden';
import { getCategoryBadgeStyle } from '@/utils/colorGenerator';
import { Sparkles, Clock, Sprout } from 'lucide-react';

interface IntentionSelectorProps {
  onStartSession: (
    durationMinutes: number,
    intention: string,
    category: FocusCategory,
    species: PlantSpecies
  ) => void;
  defaultDuration?: number;
}

const CATEGORIES: FocusCategory[] = ['coding', 'reading', 'writing', 'design', 'learning', 'zen'];
const DURATION_PRESETS = [15, 25, 45, 60, 90];
const SPECIES_OPTIONS: { id: PlantSpecies; name: string; icon: string; desc: string }[] = [
  { id: 'wildflower', name: 'Meadow Wildflower', icon: '🌸', desc: 'Fast, vibrant bloom for standard sprints.' },
  { id: 'bonsai', name: 'Japanese Bonsai', icon: '🪴', desc: 'Majestic gnarled trunk for deep work.' },
  { id: 'lotus', name: 'Golden Lotus', icon: '🪷', desc: 'Serene water lily for deep focus.' },
  { id: 'fern', name: 'Emerald Fern', icon: '🌿', desc: 'Recursive lush foliage fronds.' },
];

export const IntentionSelector: React.FC<IntentionSelectorProps> = ({
  onStartSession,
  defaultDuration = 25,
}) => {
  const [duration, setDuration] = useState<number>(defaultDuration);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [intention, setIntention] = useState<string>('');
  const [category, setCategory] = useState<FocusCategory>('coding');
  const [species, setSpecies] = useState<PlantSpecies>('wildflower');

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDuration = isCustom && customMinutes ? Math.max(1, parseInt(customMinutes, 10)) : duration;
    onStartSession(finalDuration, intention, category, species);
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 md:p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/20 dark:border-emerald-500/10 shadow-2xl backdrop-blur-xl transition-all">
      <form onSubmit={handleStart} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide">
            <Sprout className="w-3.5 h-3.5" />
            <span>Plant a Focus Seed</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            What will you nourish?
          </h2>
        </div>

        {/* Intention Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Session Goal / Intention
          </label>
          <div className="relative">
            <input
              type="text"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="e.g. Plant a habit: read one chapter, sketch a layout, learn a new topic..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm"
            />
            <Sparkles className="absolute right-3.5 top-3.5 w-4 h-4 text-emerald-500/50 pointer-events-none" />
          </div>
        </div>

        {/* Category Picker */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Category Tag
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const badge = getCategoryBadgeStyle(cat);
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? `${badge.bg} ${badge.text} ${badge.border} ring-2 ring-emerald-500/40 font-semibold shadow-sm`
                      : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 hover:border-emerald-500/30'
                  }`}
                >
                  <span>{badge.icon}</span>
                  <span className="capitalize">#{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Selection Chips */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Target Duration</span>
            </label>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {isCustom && customMinutes ? `${customMinutes} mins` : `${duration} mins`}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {DURATION_PRESETS.map((mins) => {
              const isSelected = !isCustom && duration === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setDuration(mins);
                    setIsCustom(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10'
                  }`}
                >
                  {mins}m
                </button>
              );
            })}
          </div>

          {/* Custom Minute Input Option */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className={`text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 underline underline-offset-2 ${
                isCustom ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''
              }`}
            >
              {isCustom ? 'Use preset chips' : 'Custom duration'}
            </button>
            {isCustom && (
              <input
                type="number"
                min="1"
                max="300"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="Custom mins..."
                className="px-3 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-28"
              />
            )}
          </div>
        </div>

        {/* Plant Species Choice */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Botanical Species
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {SPECIES_OPTIONS.map((spec) => {
              const isSelected = species === spec.id;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSpecies(spec.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 dark:border-emerald-500/80 ring-1 ring-emerald-500/50'
                      : 'bg-slate-100/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{spec.icon}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {spec.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {spec.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Focus Session Action */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base tracking-wide shadow-xl shadow-emerald-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span>Plant & Start Focus</span>
          <span>🌱</span>
        </button>
      </form>
    </div>
  );
};
