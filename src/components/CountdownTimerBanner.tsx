import React from 'react';
import { Clock, ShieldAlert, Calculator, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCountdown } from '../utils/countdown';

interface CountdownTimerBannerProps {
  onNavigate?: (page: string) => void;
}

export const CountdownTimerBanner: React.FC<CountdownTimerBannerProps> = ({ onNavigate }) => {
  const countdown = useCountdown();

  if (countdown.isExpired) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-200" />
            <div>
              <h3 className="text-lg sm:text-xl font-black">Application Portal is Live!</h3>
              <p className="text-xs sm:text-sm text-emerald-100">
                Loan applications are now open for both Individual and SME business borrowers.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate?.('apply-wizard')}
            className="px-6 py-2.5 bg-white text-emerald-800 font-extrabold rounded-full text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow-md"
          >
            Apply Now
          </button>
        </div>
      </div>
    );
  }

  // Timer units dynamically constructed:
  // If weeks > 0, include WW. Once < 1 week remaining, WW is removed showing [DD, HH, MM, SS].
  const units = [
    ...(countdown.showWeeks
      ? [
          {
            key: 'ww',
            code: 'WW',
            label: 'WEEKS',
            value: countdown.formatted.ww,
          },
        ]
      : []),
    {
      key: 'dd',
      code: 'DD',
      label: 'DAYS',
      value: countdown.formatted.dd,
    },
    {
      key: 'hh',
      code: 'HH',
      label: 'HOURS',
      value: countdown.formatted.hh,
    },
    {
      key: 'mm',
      code: 'MM',
      label: 'MINS',
      value: countdown.formatted.mm,
    },
    {
      key: 'ss',
      code: 'SS',
      label: 'SECS',
      value: countdown.formatted.ss,
    },
  ];

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-14" aria-label="Application Countdown Timer">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0B0B0F] via-[#121624] to-[#0B0B0F] border border-blue-500/30 shadow-2xl p-6 sm:p-10 lg:p-12 text-white">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2D62FF]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-bold tracking-wide shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="uppercase tracking-wider">OFFICIAL APPLICATION PORTAL OPENS OCTOBER 21</span>
          </div>

          {/* Headline & Description */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Applications Launch in{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                October 21, 2026
              </span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Our partner bank underwriting intake is currently undergoing annual institutional integration. 
              <strong className="text-white font-semibold"> All loan calculators, product guides, and requirement checklists are 100% active for you to explore.</strong>
            </p>
          </div>

          {/* DYNAMIC TIMER BLOCKS [WW, DD, HH, MM, SS] -> [DD, HH, MM, SS] */}
          <div className="w-full max-w-3xl pt-2">
            <div className={`grid gap-2.5 sm:gap-4 ${countdown.showWeeks ? 'grid-cols-5' : 'grid-cols-4'} items-center justify-center`}>
              {units.map((unit) => (
                <div
                  key={unit.key}
                  className="group relative flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 backdrop-blur-md transition-all duration-200 shadow-lg"
                >
                  {/* Unit Tag: [WW], [DD], [HH], etc. */}
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-blue-400/90 mb-1 tracking-widest">
                    [{unit.code}]
                  </span>

                  {/* Digit Box */}
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm">
                    {unit.value}
                  </span>

                  {/* Unit Label */}
                  <span className="text-[9px] sm:text-[11px] font-extrabold text-slate-400 tracking-wider mt-1.5 uppercase">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Sub-label showing behavior */}
            <p className="text-[11px] sm:text-xs text-slate-400 mt-3 font-medium">
              {countdown.showWeeks ? (
                <span>Format: <strong className="text-slate-300 font-mono">[WW, DD, HH, MM, SS]</strong> • Drops to <strong className="text-slate-300 font-mono">[DD, HH, MM, SS]</strong> under 7 days</span>
              ) : (
                <span>Format: <strong className="text-slate-300 font-mono">[DD, HH, MM, SS]</strong> • Less than 1 week remaining</span>
              )}
            </p>
          </div>

          {/* Status Alert Banner */}
          <div className="w-full max-w-2xl bg-blue-950/60 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex items-start sm:items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-300 leading-snug">
              <span className="font-bold text-white block mb-0.5">Loan Applications Currently Paused</span>
              You can browse all terms, check SME or Personal loan criteria, and calculate your exact monthly repayments right now. Submissions unlock automatically on October 21.
            </div>
          </div>

          {/* Quick Exploratory Actions (Users can browse and use calculators) */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-1">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('calculator');
                else window.location.hash = 'calculator';
              }}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#2D62FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Explore Loan Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('how-it-works');
                else window.location.hash = 'how-it-works';
              }}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>View Requirements & Process</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
