'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlantColorSeed, PlantStage } from '@/types/garden';

interface WildflowerSVGProps {
  stage: PlantStage;
  progress: number; // 0 to 1
  colorSeed: PlantColorSeed;
  isAnimatedPlayback?: boolean;
}

export const WildflowerSVG: React.FC<WildflowerSVGProps> = ({
  stage,
  progress,
  colorSeed,
}) => {
  const isWilt = stage === 'wilt';
  const isBloom = stage === 5 || progress >= 1;

  // Calculate dynamic stem height factor
  const stemScaleY = isWilt ? 0.6 : Math.max(0.05, Math.min(1, progress * 1.1));
  const leafOpacity = progress >= 0.15 ? Math.min(1, (progress - 0.15) * 2) : 0;
  const secondaryLeafOpacity = progress >= 0.4 ? Math.min(1, (progress - 0.4) * 2.5) : 0;
  const budScale = progress >= 0.75 ? Math.min(1, (progress - 0.75) * 4) : 0;
  const flowerScale = isBloom ? 1 : progress >= 0.95 ? (progress - 0.95) * 20 : 0;

  return (
    <svg viewBox="0 0 200 240" className="w-full h-full overflow-visible select-none">
      <defs>
        {/* Soft radial glow gradient */}
        <radialGradient id="flowerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colorSeed.flower} stopOpacity="0.4" />
          <stop offset="100%" stopColor={colorSeed.flower} stopOpacity="0" />
        </radialGradient>

        <linearGradient id="stemGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor={colorSeed.stem} />
        </linearGradient>

        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor={colorSeed.leaf} />
        </linearGradient>
      </defs>

      {/* Bloom background glow */}
      {isBloom && (
        <motion.circle
          cx="100"
          cy="70"
          r="45"
          fill="url(#flowerGlow)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        />
      )}

      {/* Terracotta Soil Pot */}
      <g id="pot">
        <path
          d="M 60,195 L 140,195 L 132,230 L 68,230 Z"
          fill={colorSeed.pot}
          stroke="#451a03"
          strokeWidth="2"
        />
        {/* Pot Rim */}
        <rect
          x="55"
          y="185"
          width="90"
          height="12"
          rx="4"
          fill={colorSeed.pot}
          stroke="#451a03"
          strokeWidth="2"
        />
        {/* Rich Damp Soil Mound */}
        <ellipse cx="100" cy="186" rx="42" ry="7" fill="#291d18" />
      </g>

      {/* Stage 0: Seed / Small Sprout Mound */}
      {stage === 0 && (
        <motion.g
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <circle cx="100" cy="184" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <path d="M 98,184 Q 100,180 102,184" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
      )}

      {/* Main Growing Stem */}
      {stage !== 0 && (
        <g id="plant-growth-group">
          {/* Stem container with scaleY anchor at pot level */}
          <motion.g
            animate={{
              scaleY: stemScaleY,
              rotate: isWilt ? 38 : 0,
              skewX: isWilt ? 15 : 0,
            }}
            transition={{ type: 'spring', stiffness: 60, damping: 15 }}
            style={{ transformOrigin: '100px 185px' }}
          >
            {/* Primary Curved Stem */}
            <path
              d="M 100,185 Q 96,130 100,70"
              fill="none"
              stroke="url(#stemGrad)"
              strokeWidth={isWilt ? "3.5" : "4.5"}
              strokeLinecap="round"
              style={{
                filter: isWilt ? 'grayscale(80%) brightness(0.6)' : 'none',
              }}
            />

            {/* First Pair of Leaves (Stage 2+) */}
            <g id="leaf-pair-1" opacity={leafOpacity}>
              {/* Left Leaf */}
              <motion.path
                d="M 98,150 Q 70,140 72,158 Q 90,162 98,150"
                fill="url(#leafGrad)"
                stroke="#047857"
                strokeWidth="1"
                animate={{ rotate: isWilt ? 40 : 0 }}
                style={{ transformOrigin: '98px 150px' }}
              />
              {/* Right Leaf */}
              <motion.path
                d="M 102,142 Q 130,132 128,150 Q 110,154 102,142"
                fill="url(#leafGrad)"
                stroke="#047857"
                strokeWidth="1"
                animate={{ rotate: isWilt ? -35 : 0 }}
                style={{ transformOrigin: '102px 142px' }}
              />
            </g>

            {/* Second Pair of Higher Foliage Leaves (Stage 3+) */}
            <g id="leaf-pair-2" opacity={secondaryLeafOpacity}>
              <path
                d="M 99,115 Q 75,100 78,118 Q 92,122 99,115"
                fill="url(#leafGrad)"
                stroke="#047857"
                strokeWidth="1"
              />
              <path
                d="M 101,105 Q 125,92 122,110 Q 108,114 101,105"
                fill="url(#leafGrad)"
                stroke="#047857"
                strokeWidth="1"
              />
            </g>

            {/* Unopened Flower Bud (Stage 4) */}
            {budScale > 0 && !isBloom && !isWilt && (
              <motion.g
                transform="translate(100, 70)"
                animate={{ scale: budScale }}
                style={{ transformOrigin: '0px 0px' }}
              >
                <path
                  d="M -6,0 C -12,-15 0,-22 0,-22 C 0,-22 12,-15 6,0 Z"
                  fill={colorSeed.flower}
                  stroke="#be123c"
                  strokeWidth="1"
                />
                <path
                  d="M -8,2 C -10,-8 -2,-12 -2,-12 M 8,2 C 10,-8 2,-12 2,-12"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </motion.g>
            )}

            {/* Full Blooming Petal Assembly (Stage 5 Bloom) */}
            {isBloom && !isWilt && (
              <g transform="translate(100, 70)">
                <motion.g
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: flowerScale, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 10 }}
                >
                  {/* Outer Petals Array (8 Petals) */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <motion.path
                      key={i}
                      d="M 0,0 Q -12,-32 0,-40 Q 12,-32 0,0"
                      fill={colorSeed.flower}
                      stroke={colorSeed.flowerAccent}
                      strokeWidth="1"
                      transform={`rotate(${angle})`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.4 }}
                    />
                  ))}

                  {/* Inner Petal Ring */}
                  {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
                    <path
                      key={`inner-${i}`}
                      d="M 0,0 Q -8,-22 0,-28 Q 8,-22 0,0"
                      fill={colorSeed.flowerAccent}
                      opacity="0.85"
                      transform={`rotate(${angle})`}
                    />
                  ))}

                  {/* Center Pistil Gold Core */}
                  <circle cx="0" cy="0" r="10" fill={colorSeed.flowerAccent} stroke="#d97706" strokeWidth="2" />
                  <circle cx="0" cy="0" r="6" fill="#78350f" opacity="0.4" />
                </motion.g>
              </g>
            )}

            {/* Wilted Drooping Flower */}
            {isWilt && (
              <g transform="translate(100, 70) rotate(70)">
                <path
                  d="M -4,0 Q -8,-15 0,-20 Q 8,-15 4,0"
                  fill="#78350f"
                  opacity="0.7"
                />
                <circle cx="0" cy="0" r="6" fill="#451a03" />
              </g>
            )}
          </motion.g>
        </g>
      )}
    </svg>
  );
};
