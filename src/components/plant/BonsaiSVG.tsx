'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlantColorSeed, PlantStage } from '@/types/garden';

interface BonsaiSVGProps {
  stage: PlantStage;
  progress: number;
  colorSeed: PlantColorSeed;
}

export const BonsaiSVG: React.FC<BonsaiSVGProps> = ({
  stage,
  progress,
  colorSeed,
}) => {
  const isWilt = stage === 'wilt';
  const isBloom = stage === 5 || progress >= 1;

  const trunkProgress = Math.max(0.05, Math.min(1, progress * 1.2));
  const cloud1Opacity = progress >= 0.3 ? Math.min(1, (progress - 0.3) * 2.5) : 0;
  const cloud2Opacity = progress >= 0.5 ? Math.min(1, (progress - 0.5) * 2.5) : 0;
  const cloud3Opacity = progress >= 0.7 ? Math.min(1, (progress - 0.7) * 3) : 0;

  return (
    <svg viewBox="0 0 220 240" className="w-full h-full overflow-visible select-none">
      <defs>
        <radialGradient id="bonsaiBloomGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Bloom background glow */}
      {isBloom && (
        <motion.ellipse
          cx="110"
          cy="85"
          rx="65"
          ry="45"
          fill="url(#bonsaiBloomGlow)"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        />
      )}

      {/* Ceramic Bonsai Container */}
      <g id="pot">
        <rect
          x="45"
          y="190"
          width="130"
          height="28"
          rx="6"
          fill={colorSeed.pot}
          stroke="#0f172a"
          strokeWidth="2.5"
        />
        {/* Pot Feet */}
        <rect x="58" y="218" width="16" height="8" rx="2" fill="#0f172a" />
        <rect x="146" y="218" width="16" height="8" rx="2" fill="#0f172a" />
        {/* Moss Soil Surface */}
        <ellipse cx="110" cy="190" rx="60" ry="8" fill="#14532d" />
      </g>

      {/* Stage 0 Seed / Small Sapling Sprout */}
      {stage === 0 && (
        <circle cx="110" cy="188" r="4" fill="#a16207" />
      )}

      {stage !== 0 && (
        <g id="bonsai-tree">
          <motion.g
            animate={{
              scaleY: isWilt ? 0.7 : trunkProgress,
              rotate: isWilt ? 35 : 0,
            }}
            transition={{ type: 'spring', stiffness: 50, damping: 14 }}
            style={{ transformOrigin: '110px 190px' }}
          >
            {/* Main Gnarled Wooden Trunk */}
            <path
              d="M 102,190 C 85,150 145,130 110,80 C 95,60 115,50 120,45"
              fill="none"
              stroke={colorSeed.stem}
              strokeWidth={isWilt ? "8" : "12"}
              strokeLinecap="round"
              style={{ filter: isWilt ? 'grayscale(90%)' : 'none' }}
            />

            {/* Left Branch */}
            <path
              d="M 102,135 Q 70,120 60,110"
              fill="none"
              stroke={colorSeed.stem}
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Right Branch */}
            <path
              d="M 115,100 Q 145,90 155,80"
              fill="none"
              stroke={colorSeed.stem}
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Foliage Cloud 1 (Left Lower) */}
            <g opacity={cloud1Opacity}>
              <motion.g
                animate={{ scale: isWilt ? 0.6 : 1 }}
                style={{ transformOrigin: '60px 110px' }}
              >
                <circle cx="60" cy="110" r="22" fill={colorSeed.leaf} />
                <circle cx="48" cy="106" r="16" fill="#047857" />
                <circle cx="72" cy="108" r="15" fill="#10b981" />
              </motion.g>
            </g>

            {/* Foliage Cloud 2 (Right Mid) */}
            <g opacity={cloud2Opacity}>
              <motion.g
                animate={{ scale: isWilt ? 0.6 : 1 }}
                style={{ transformOrigin: '155px 80px' }}
              >
                <circle cx="155" cy="80" r="24" fill={colorSeed.leaf} />
                <circle cx="142" cy="76" r="17" fill="#047857" />
                <circle cx="168" cy="78" r="16" fill="#10b981" />
              </motion.g>
            </g>

            {/* Foliage Cloud 3 (Top Apex Canopy) */}
            <g opacity={cloud3Opacity}>
              <motion.g
                animate={{ scale: isWilt ? 0.6 : 1 }}
                style={{ transformOrigin: '115px 50px' }}
              >
                <circle cx="115" cy="50" r="30" fill={colorSeed.leaf} />
                <circle cx="95" cy="48" r="20" fill="#047857" />
                <circle cx="135" cy="46" r="22" fill="#10b981" />
                <circle cx="115" cy="35" r="18" fill="#34d399" />
              </motion.g>
            </g>

            {/* Cherry Blossom Flowers on Bloom */}
            {isBloom && !isWilt && (
              <g id="cherry-blossoms">
                {[
                  { cx: 55, cy: 100 }, { cx: 70, cy: 115 }, { cx: 45, cy: 112 },
                  { cx: 150, cy: 75 }, { cx: 165, cy: 88 }, { cx: 140, cy: 70 },
                  { cx: 110, cy: 38 }, { cx: 125, cy: 45 }, { cx: 95, cy: 42 },
                  { cx: 130, cy: 30 }
                ].map((pos, i) => (
                  <motion.g
                    key={i}
                    transform={`translate(${pos.cx}, ${pos.cy})`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    {[0, 72, 144, 216, 288].map((angle, j) => (
                      <path
                        key={j}
                        d="M 0,0 Q -3,-8 0,-10 Q 3,-8 0,0"
                        fill={colorSeed.flower}
                        transform={`rotate(${angle})`}
                      />
                    ))}
                    <circle cx="0" cy="0" r="2" fill="#fbbf24" />
                  </motion.g>
                ))}
              </g>
            )}
          </motion.g>
        </g>
      )}
    </svg>
  );
};
