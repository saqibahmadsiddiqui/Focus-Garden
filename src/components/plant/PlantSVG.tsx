'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlantSpecies, PlantColorSeed, PlantStage } from '@/types/garden';
import { WildflowerSVG } from './WildflowerSVG';
import { BonsaiSVG } from './BonsaiSVG';
import { FernSVG } from './FernSVG';
import { LotusSVG } from './LotusSVG';

interface PlantSVGProps {
  species: PlantSpecies;
  elapsedSeconds: number;
  targetSeconds: number;
  isPaused?: boolean;
  isWilt?: boolean;
  isCompleted?: boolean;
  colorSeed: PlantColorSeed;
  isAnimatedPlayback?: boolean;
  playbackProgressOverride?: number; // 0 to 1
}

export const PlantSVG: React.FC<PlantSVGProps> = ({
  species,
  elapsedSeconds,
  targetSeconds,
  isPaused = false,
  isWilt = false,
  isCompleted = false,
  colorSeed,
  playbackProgressOverride,
}) => {
  // Calculate exact percentage progress (0 to 1)
  let progress = targetSeconds > 0 ? Math.min(1, elapsedSeconds / targetSeconds) : 0;
  if (playbackProgressOverride !== undefined) {
    progress = playbackProgressOverride;
  }
  if (isCompleted) {
    progress = 1;
  }

  // Derive stage (0 to 5)
  let stage: PlantStage = 0;
  if (isWilt) {
    stage = 'wilt';
  } else if (progress >= 1) {
    stage = 5;
  } else if (progress >= 0.8) {
    stage = 4;
  } else if (progress >= 0.5) {
    stage = 3;
  } else if (progress >= 0.15) {
    stage = 2;
  } else if (progress > 0) {
    stage = 1;
  }

  const renderSpeciesSVG = () => {
    switch (species) {
      case 'bonsai':
        return <BonsaiSVG stage={stage} progress={progress} colorSeed={colorSeed} />;
      case 'fern':
        return <FernSVG stage={stage} progress={progress} colorSeed={colorSeed} />;
      case 'lotus':
        return <LotusSVG stage={stage} progress={progress} colorSeed={colorSeed} />;
      case 'wildflower':
      default:
        return <WildflowerSVG stage={stage} progress={progress} colorSeed={colorSeed} />;
    }
  };

  return (
    <div className="relative w-full max-w-[340px] aspect-square mx-auto flex items-center justify-center select-none">
      {/* Dynamic Terrarium Lock Shield on Pause */}
      {isPaused && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
        >
          {/* Terrarium Glass Dome Overlay */}
          <div className="w-[85%] h-[85%] rounded-t-full rounded-b-3xl border-2 border-white/40 bg-white/10 dark:bg-emerald-950/20 backdrop-blur-sm shadow-xl flex items-center justify-center">
            <div className="px-3 py-1.5 rounded-full bg-slate-900/80 text-white text-xs font-medium tracking-wide border border-white/20 shadow-md flex items-center gap-1.5">
              <span>🛡️</span>
              <span>Terrarium Locked (Paused)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Organic Gentle Idle Sway Animation Loop */}
      <motion.div
        className="w-full h-full flex items-center justify-center"
        animate={
          isPaused || isWilt
            ? { rotate: isWilt ? 8 : 0 }
            : {
                rotate: [-1.2, 1.2, -1.2],
                y: [0, -2, 0],
              }
        }
        transition={
          isPaused || isWilt
            ? { duration: 0.5 }
            : {
                repeat: Infinity,
                duration: 6,
                ease: 'easeInOut',
              }
        }
      >
        {renderSpeciesSVG()}
      </motion.div>
    </div>
  );
};
