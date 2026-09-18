'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface VisibilityBannerProps {
  isGraceActive: boolean;
  graceTimeRemaining: number;
}

export const VisibilityBanner: React.FC<VisibilityBannerProps> = ({
  isGraceActive,
  graceTimeRemaining,
}) => {
  return (
    <AnimatePresence>
      {isGraceActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] px-4 py-3 rounded-2xl bg-amber-500 text-slate-950 shadow-2xl border border-amber-300 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 animate-bounce text-slate-950" />
            <div>
              <p className="text-xs font-bold leading-snug">Your plant is thirsty! 🌱</p>
              <p className="text-[11px] font-medium opacity-90">
                Returned to focus sanctuary. Return full focus before time runs out.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-950 text-amber-400 font-extrabold text-sm border border-amber-400/40">
            {graceTimeRemaining}s
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
