import React from 'react';
import { Lock, Clock, Calculator, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center">
        
        {/* Top Dark Header */}
        <div className="bg-gradient-to-r from-[#0B0B0F] via-slate-900 to-[#1D61F2] p-8 text-white relative">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-blue-300" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
            <Clock className="w-4 h-4" />
            <span>Applications Open October 21, 2026</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Loan Submissions Are Currently Paused
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-lg mx-auto leading-relaxed">
            Direct application intake will unlock automatically on October 21. While our intake pipeline undergoes annual institutional integration, all site features, calculators, and rate comparisons remain fully accessible.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-10 space-y-8">
          
          {/* Live Countdown Display */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block mb-3">
              Official Portal Countdown
            </span>
            <div className={`grid ${countdown.showWeeks ? 'grid-cols-5' : 'grid-cols-4'} gap-2.5 sm:gap-4 max-w-lg mx-auto`}>
              {units.map((u) => (
                <div key={u.code} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900 block leading-tight">
                    {u.value}
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase mt-1.5 block">{u.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value props while waiting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-900">Explore Repayment Rates</h4>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Calculate monthly installments from ₦250k to ₦95M using our interactive calculator.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Prepare Requirements</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Check all documents needed for instant submission on October 21.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('calculator')}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#2D62FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Use Loan Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onReturnHome}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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
