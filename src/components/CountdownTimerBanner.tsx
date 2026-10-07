import React from 'react';
import { Clock, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
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

          {/* DYNAMIC TIMER BLOCKS */}
          <div className="w-full max-w-3xl pt-2">
            <div className={`grid gap-2.5 sm:gap-4 ${countdown.showWeeks ? 'grid-cols-5' : 'grid-cols-4'} items-center justify-center`}>
              {units.map((unit) => (
                <div
                  key={unit.key}
                  className="group relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/40 backdrop-blur-md transition-all duration-200 shadow-lg"
                >
                  {/* Digit Box */}
                  <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-sm">
                    {unit.value}
                  </span>

                  {/* Unit Label */}
                  <span className="text-[10px] sm:text-xs font-extrabold text-slate-400 tracking-wider mt-2 uppercase">
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (onNavigate) onNavigate('calculator');
                else window.location.hash = 'calculator';
              }}
              className="px-6 py-3 rounded-full bg-[#2D62FF] hover:bg-blue-600 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              <span>Explore Loan Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
