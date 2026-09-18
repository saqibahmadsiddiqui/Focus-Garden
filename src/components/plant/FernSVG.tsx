'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlantColorSeed, PlantStage } from '@/types/garden';

interface FernSVGProps {
  stage: PlantStage;
  progress: number;
  colorSeed: PlantColorSeed;
}

export const FernSVG: React.FC<FernSVGProps> = ({
  stage,
  progress,
  colorSeed,
}) => {
  const isWilt = stage === 'wilt';
  const isBloom = stage === 5 || progress >= 1;
  const growthScale = Math.max(0.05, Math.min(1, progress * 1.15));

  return (
    <svg viewBox="0 0 200 240" className="w-full h-full overflow-visible select-none">
      {/* Terrarium Glass Pot */}
      <g id="pot">
        <path
          d="M 60,185 Q 50,225 100,230 Q 150,225 140,185 Z"
          fill="rgba(16, 185, 129, 0.15)"
          stroke="#059669"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="185" rx="40" ry="6" fill="#14532d" />
      </g>

      {stage !== 0 && (
        <motion.g
          animate={{
            scale: isWilt ? 0.6 : growthScale,
            rotate: isWilt ? 45 : 0,
          }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
          style={{ transformOrigin: '100px 185px' }}
        >
          {/* Center Main Frond */}
          <path
            d="M 100,185 Q 98,120 100,50"
            fill="none"
            stroke={colorSeed.stem}
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Left Frond */}
          <path
            d="M 100,185 Q 70,140 50,90"
            fill="none"
            stroke={colorSeed.stem}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Right Frond */}
          <path
            d="M 100,185 Q 130,140 150,90"
            fill="none"
            stroke={colorSeed.stem}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Fern Leaf Pinnae Along Fronds */}
          {[0.3, 0.5, 0.7, 0.85].map((factor, i) => {
            if (progress < factor) return null;
            return (
              <g key={i}>
                {/* Center pinnae */}
                <path d={`M 100,${185 - factor * 135} Q 80,${175 - factor * 135} 75,${180 - factor * 135}`} stroke={colorSeed.leaf} strokeWidth="3" fill="none" />
                <path d={`M 100,${185 - factor * 135} Q 120,${175 - factor * 135} 125,${180 - factor * 135}`} stroke={colorSeed.leaf} strokeWidth="3" fill="none" />
              </g>
            );
          })}

          {/* Purple Frond Tip Bloom Petals */}
          {isBloom && !isWilt && (
            <g id="fern-blooms">
              <circle cx="100" cy="50" r="10" fill={colorSeed.flower} opacity="0.9" />
              <circle cx="50" cy="90" r="8" fill={colorSeed.flower} opacity="0.9" />
              <circle cx="150" cy="90" r="8" fill={colorSeed.flower} opacity="0.9" />
            </g>
          )}
        </motion.g>
      )}
    </svg>
  );
};
