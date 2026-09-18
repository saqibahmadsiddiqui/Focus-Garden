'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlantColorSeed, PlantStage } from '@/types/garden';

interface LotusSVGProps {
  stage: PlantStage;
  progress: number;
  colorSeed: PlantColorSeed;
}

export const LotusSVG: React.FC<LotusSVGProps> = ({
  stage,
  progress,
  colorSeed,
}) => {
  const isWilt = stage === 'wilt';
  const isBloom = stage === 5 || progress >= 1;
  const growthScale = Math.max(0.05, Math.min(1, progress * 1.1));

  return (
    <svg viewBox="0 0 220 240" className="w-full h-full overflow-visible select-none">
      {/* Water Basin / Lily Pad Soil */}
      <g id="pot">
        <ellipse cx="110" cy="205" rx="75" ry="18" fill="rgba(6, 182, 212, 0.25)" stroke="#0891b2" strokeWidth="2" />
        {/* Lily Pad Base */}
        <path d="M 50,205 Q 110,220 170,205 Q 150,192 110,192 Q 70,192 50,205 Z" fill="#047857" stroke="#065f46" strokeWidth="1.5" />
      </g>

      {stage !== 0 && (
        <motion.g
          animate={{
            scale: isWilt ? 0.6 : growthScale,
            rotate: isWilt ? 40 : 0,
          }}
          transition={{ type: 'spring', stiffness: 60, damping: 14 }}
          style={{ transformOrigin: '110px 198px' }}
        >
          {/* Stem */}
          <path
            d="M 110,198 Q 106,140 110,85"
            fill="none"
            stroke={colorSeed.stem}
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Lotus Bud */}
          {!isBloom && !isWilt && (
            <path
              d="M 110,85 Q 90,65 110,45 Q 130,65 110,85"
              fill={colorSeed.flower}
              stroke="#d97706"
              strokeWidth="2"
            />
          )}

          {/* Golden Lotus Bloom */}
          {isBloom && !isWilt && (
            <g transform="translate(110, 75)">
              <motion.g
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                  <path
                    key={i}
                    d="M 0,0 Q -15,-35 0,-48 Q 15,-35 0,0"
                    fill={colorSeed.flower}
                    stroke={colorSeed.flowerAccent}
                    strokeWidth="1"
                    transform={`rotate(${angle})`}
                  />
                ))}
                <circle cx="0" cy="0" r="14" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
              </motion.g>
            </g>
          )}

          {isWilt && (
            <path d="M 110,85 Q 95,95 100,105" fill="none" stroke="#78350f" strokeWidth="4" />
          )}
        </motion.g>
      )}
    </svg>
  );
};
