'use client';

import React, { useState } from 'react';
import { PlantRecord, FocusCategory } from '@/types/garden';
import { PlantSVG } from '../plant/PlantSVG';
import { getCategoryBadgeStyle } from '@/utils/colorGenerator';
import { Leaf } from 'lucide-react';

interface GardenGridProps {
  plants: PlantRecord[];
  onSelectPlant: (plant: PlantRecord) => void;
  onStartNewSession: () => void;
}

export const GardenGrid: React.FC<GardenGridProps> = ({
  plants,
  onSelectPlant,
  onStartNewSession,
}) => {
  const [selectedTag, setSelectedTag] = useState<FocusCategory | 'all'>('all');
  const [showWiltsOnly, setShowWiltsOnly] = useState(false);

  const filteredPlants = plants.filter((p) => {
    if (showWiltsOnly) return !p.completed;
    if (selectedTag !== 'all' && p.categoryTag !== selectedTag) return false;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Your Personal Garden Sanctuary</span>
            <span>🪴</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {plants.filter((p) => p.completed).length} total bloomed flora planted permanently.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedTag('all');
              setShowWiltsOnly(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              selectedTag === 'all' && !showWiltsOnly
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Flora
          </button>

          {['coding', 'reading', 'writing', 'design', 'learning'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedTag(cat as FocusCategory);
                setShowWiltsOnly(false);
              }}
              disabled={showWiltsOnly}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize disabled:opacity-40 ${
                selectedTag === cat && !showWiltsOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-100/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              #{cat}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowWiltsOnly((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 ${
              showWiltsOnly
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-slate-100/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Leaf className="w-3 h-3" />
            <span>Wilted Only</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredPlants.length === 0 && (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl">
            🌱
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Your sanctuary plot is ready
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Plant your first focus seed to watch time transform into living SVG flora.
          </p>
          <button
            type="button"
            onClick={onStartNewSession}
            className="mt-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all"
          >
            Start Focus Session Now
          </button>
        </div>
      )}

      {/* Masonry / Responsive Visual Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredPlants.map((plant) => {
          const categoryBadge = getCategoryBadgeStyle(plant.categoryTag);
          const formattedDate = new Date(plant.plantedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <button
              key={plant.id}
              type="button"
              onClick={() => onSelectPlant(plant)}
              className="group relative p-4 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left flex flex-col justify-between overflow-hidden"
            >
              {/* Category Tag pill */}
              <div className="flex justify-between items-center w-full z-10">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoryBadge.bg} ${categoryBadge.text} ${categoryBadge.border}`}>
                  {categoryBadge.icon} #{plant.categoryTag}
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {formattedDate}
                </span>
              </div>

              {/* Plant Vector Art */}
              <div className="w-full h-32 my-1 flex items-center justify-center">
                <PlantSVG
                  species={plant.species}
                  elapsedSeconds={plant.actualFocusedSeconds}
                  targetSeconds={plant.durationMinutes * 60}
                  isWilt={!plant.completed}
                  isCompleted={plant.completed}
                  colorSeed={plant.colorSeed}
                />
              </div>

              {/* Intention & Duration */}
              <div className="w-full pt-1 z-10">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {plant.intention}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                  <span className="capitalize">{plant.species}</span>
                  <span>{plant.durationMinutes}m</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
