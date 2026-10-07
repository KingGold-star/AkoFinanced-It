import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Calculator, FileText, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
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
  requestedType,
}) => {
  const countdown = useCountdown();

  if (!isOpen) return null;

  const units = [
    ...(countdown.showWeeks
      ? [
          {
            code: 'WW',
            label: 'WEEKS',
            value: countdown.formatted.ww,
          },
        ]
      : []),
    {
      code: 'DD',
      label: 'DAYS',
      value: countdown.formatted.dd,
    },
    {
      code: 'HH',
      label: 'HOURS',
      value: countdown.formatted.hh,
    },
    {
      code: 'MM',
      label: 'MINS',
      value: countdown.formatted.mm,
    },
    {
      code: 'SS',
      label: 'SECS',
      value: countdown.formatted.ss,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 text-center"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0B0B0F] via-slate-900 to-[#1D61F2] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 mb-3 shadow-lg">
              <Lock className="w-6 h-6 text-blue-300" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Portal Calibration In Progress</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              Applications Open October 21
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              {requestedType === 'BUSINESS'
                ? 'SME Limited Liability loan applications will officially open on October 21, 2026.'
                : 'Personal loan applications will officially open on October 21, 2026.'}
            </p>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 text-left">
            
            {/* Live Mini Countdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">
                Live Countdown to Launch
              </span>
              <div className={`grid ${countdown.showWeeks ? 'grid-cols-5' : 'grid-cols-4'} gap-2 justify-center`}>
                {units.map((u) => (
                  <div key={u.code} className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs">
                    <span className="text-lg sm:text-xl font-black font-mono text-slate-900 block leading-tight">
                      {u.value}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 block">{u.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation Note */}
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-2">
              <p>
                During this countdown window, loan applications are temporarily paused while our partner Nigerian banks conduct annual intake calibration.
              </p>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>You can still browse all products, compare interest rates, and simulate repayments freely!</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onClose();
                  onNavigate('calculator');
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#2D62FF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Calculator className="w-4 h-4" />
                <span>Simulate Repayments on Calculator</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigate(requestedType === 'BUSINESS' ? 'businesses' : 'individuals');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Review Document Checklist</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
              >
                Continue Browsing Website
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
