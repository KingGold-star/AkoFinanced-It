import React from 'react';
import { Lock, Calculator, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCountdown } from '../utils/countdown';

interface ApplicationLockedScreenProps {
  onReturnHome: () => void;
  onNavigate: (page: string) => void;
}

export const ApplicationLockedScreen: React.FC<ApplicationLockedScreenProps> = ({
  onReturnHome,
  onNavigate,
}) => {
  const countdown = useCountdown();

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
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="relative w-full max-w-lg bg-[#0B0B0F] border border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 text-center text-white overflow-hidden">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#2D62FF]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Minimal Lock Icon */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Applications Open October 21
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Online loan applications will officially open on October 21, 2026. Explore our terms and repayment options below.
            </p>
          </div>

          {/* Clean Countdown Grid */}
          <div className={`grid ${countdown.showWeeks ? 'grid-cols-5' : 'grid-cols-4'} gap-2.5 pt-1`}>
            {units.map((u, i) => (
              <div
                key={i}
                className="bg-white/[0.04] border border-white/10 rounded-2xl py-3.5 px-2 flex flex-col items-center justify-center shadow-xs"
              >
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white tabular-nums">
                  {u.value}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                  {u.label}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('calculator')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2D62FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Use Loan Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onReturnHome}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white border border-white/10 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Homepage</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
