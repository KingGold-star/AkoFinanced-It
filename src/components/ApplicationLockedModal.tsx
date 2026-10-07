import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Calculator, ArrowRight } from 'lucide-react';
import { useCountdown } from '../utils/countdown';

interface ApplicationLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  requestedType?: 'INDIVIDUAL' | 'BUSINESS';
}

export const ApplicationLockedModal: React.FC<ApplicationLockedModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const countdown = useCountdown();

  if (!isOpen) return null;

  const units = [
    ...(countdown.showWeeks
      ? [
          {
            label: 'WEEKS',
            value: countdown.formatted.ww,
          },
        ]
      : []),
    {
      label: 'DAYS',
      value: countdown.formatted.dd,
    },
    {
      label: 'HOURS',
      value: countdown.formatted.hh,
    },
    {
      label: 'MINS',
      value: countdown.formatted.mm,
    },
    {
      label: 'SECS',
      value: countdown.formatted.ss,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Soft dark blur backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B0B0F]/80 backdrop-blur-md cursor-pointer"
        />

        {/* Simple & Premium Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
          className="relative w-full max-w-md bg-[#0B0B0F] border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-8 text-center text-white z-10 overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#2D62FF]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative z-10 space-y-6">
            {/* Minimal Lock Icon */}
            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-inner">
              <Lock className="w-5 h-5" />
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-white">
                Applications Open October 21
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                Online loan applications will officially open on October 21, 2026. Explore our terms and repayment options below.
              </p>
            </div>

            {/* Clean Countdown Grid */}
            <div className={`grid ${countdown.showWeeks ? 'grid-cols-5' : 'grid-cols-4'} gap-2 pt-1`}>
              {units.map((u, i) => (
                <div
                  key={i}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl py-3 px-2 flex flex-col items-center justify-center shadow-xs"
                >
                  <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white tabular-nums">
                    {u.value}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                    {u.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions: One Primary + Dismiss */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('calculator');
                }}
                className="w-full py-3.5 px-5 rounded-full bg-[#2D62FF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Calculator className="w-4 h-4" />
                <span>Explore Loan Calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
