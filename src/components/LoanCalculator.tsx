import React, { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, HelpCircle, CheckCircle2, TrendingUp, Calendar, DollarSign, RefreshCw, Zap, Percent } from 'lucide-react';
import { motion } from 'motion/react';

interface LoanCalculatorProps {
  onStartApplication?: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
  onNavigate?: (page: string) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({ onStartApplication, onNavigate }) => {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [amount, setAmount] = useState<number>(10000000); // ₦10,000,000 default
  const [inputValue, setInputValue] = useState<string>('10,000,000');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [termMonths, setTermMonths] = useState<number>(12); // 12 months default
  const [tier, setTier] = useState<'PRIME' | 'GROWTH' | 'STANDARD'>('PRIME');
  const [applicantType, setApplicantType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');

  const isUSD = currency === 'USD';
  const minAmount = isUSD ? 500 : 250000;
  const maxAmount = isUSD ? 100000 : 95000000;
  const stepAmount = isUSD ? 500 : 250000;

  React.useEffect(() => {
    if (!isEditing) {
      setInputValue(amount ? amount.toLocaleString('en-US') : '');
    }
  }, [amount, isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputValue(rawVal);
    const cleanDigits = rawVal.replace(/[^0-9]/g, '');
    if (cleanDigits) {
      const parsed = parseInt(cleanDigits, 10);
      setAmount(parsed);
    } else {
      setAmount(0);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const cleanDigits = inputValue.replace(/[^0-9]/g, '');
    let parsed = parseInt(cleanDigits, 10);
    if (isNaN(parsed) || parsed < minAmount) {
      parsed = minAmount;
    } else if (parsed > maxAmount) {
      parsed = maxAmount;
    }
    setAmount(parsed);
    setInputValue(parsed.toLocaleString('en-US'));
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setInputValue(amount ? amount.toString() : '');
  };

  // Annual Interest rates per tier
  const annualRates = {
    PRIME: 0.12,     // 12% per annum
    GROWTH: 0.16,    // 16% per annum
    STANDARD: 0.21,  // 21% per annum
  };

  const annualRate = annualRates[tier];
  const monthlyRate = annualRate / 12;

  // Amortized Monthly Payment formula: P * (r * (1 + r)^n) / ((1 + r)^n - 1)
  const monthlyPayment = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
  );

  const totalRepayment = monthlyPayment * termMonths;
  const totalInterest = Math.max(0, totalRepayment - amount);
  const monthlyInterestEstimate = Math.round(totalInterest / termMonths);

  const formatCurrency = (val: number) => {
    if (isUSD) {
      return `$${val.toLocaleString('en-US')}`;
    }
    return `₦${val.toLocaleString('en-NG')}`;
  };

  const presetsNGN = [1000000, 5000000, 10000000, 25000000, 50000000, 95000000];
  const presetsUSD = [2500, 5000, 10000, 25000, 50000, 100000];
  const currentPresets = isUSD ? presetsUSD : presetsNGN;

  const handleApplyClick = () => {
    if (onStartApplication) {
      onStartApplication(applicantType);
    } else if (onNavigate) {
      onNavigate('apply-wizard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D62FF]/10 border border-[#2D62FF]/20 text-[#2D62FF] text-xs font-bold tracking-wide">
          <Calculator className="w-4 h-4" />
          <span>Interactive Loan Estimation Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B0B0F] tracking-tight">
          Calculate Your Loan & Repayment Plan
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Estimate your monthly interest, total repayment costs, and flexible terms before applying. Zero hidden charges, 100% transparent bank matching.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Input Controls */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-xl space-y-8">
          
          {/* Top Controls: Currency & Applicant Type */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            {/* Applicant Category Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setApplicantType('INDIVIDUAL')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  applicantType === 'INDIVIDUAL'
                    ? 'bg-white text-[#0B0B0F] shadow-xs'
                    : 'text-slate-500 hover:text-[#0B0B0F]'
                }`}
              >
                Personal Loan
              </button>
              <button
                type="button"
                onClick={() => setApplicantType('BUSINESS')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  applicantType === 'BUSINESS'
                    ? 'bg-white text-[#0B0B0F] shadow-xs'
                    : 'text-slate-500 hover:text-[#0B0B0F]'
                }`}
              >
                Commercial Loan
              </button>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCurrency('NGN');
                  setAmount(10000000);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currency === 'NGN'
                    ? 'bg-[#0B0B0F] text-white shadow-xs'
                    : 'text-slate-500 hover:text-[#0B0B0F]'
                }`}
              >
                NGN (₦)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrency('USD');
                  setAmount(25000);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-[#0B0B0F] text-white shadow-xs'
                    : 'text-slate-500 hover:text-[#0B0B0F]'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>

          {/* Amount Slider & Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#2D62FF]" />
                Desired Capital Amount
              </label>
              
              <div className="bg-slate-50 border-2 border-slate-200 focus-within:border-[#2D62FF] focus-within:ring-2 focus-within:ring-[#2D62FF]/20 px-3 py-1.5 rounded-2xl text-right transition-all flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black text-[#2D62FF] select-none">
                  {isUSD ? '$' : '₦'}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={isEditing ? inputValue : amount ? amount.toLocaleString('en-US') : ''}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="bg-transparent text-xl sm:text-2xl font-black text-[#2D62FF] tracking-tight text-right focus:outline-none w-36 sm:w-48 p-0 border-none"
                  aria-label="Editable Desired Capital Amount"
                />
              </div>
            </div>

            <input
              type="range"
              min={minAmount}
              max={maxAmount}
              step={stepAmount}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2D62FF]"
            />

            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>{formatCurrency(minAmount)}</span>
              <span>{formatCurrency(maxAmount)}</span>
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap gap-2 pt-2">
              {currentPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    amount === preset
                      ? 'bg-[#2D62FF] text-white border-[#2D62FF] shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {formatCurrency(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Loan Duration / Term Slider */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2D62FF]" />
                Repayment Duration
              </label>
              <div className="text-2xl font-black text-[#0B0B0F] tracking-tight">
                {termMonths} {termMonths === 1 ? 'Month' : 'Months'}
              </div>
            </div>

            <input
              type="range"
              min={3}
              max={60}
              step={3}
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2D62FF]"
            />

            <div className="grid grid-cols-5 gap-2 pt-1">
              {[6, 12, 24, 36, 60].map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setTermMonths(months)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    termMonths === months
                      ? 'bg-[#0B0B0F] text-white border-[#0B0B0F]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {months} Mos
                </button>
              ))}
            </div>
          </div>

          {/* Credit Risk Tier Option */}
          <div className="space-y-3 pt-2">
            <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2D62FF]" />
              Borrower Risk Profile Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'PRIME', name: 'Prime Tier', rate: '12% p.a.', desc: 'Strong credit / cashflow' },
                { id: 'GROWTH', name: 'Growth Tier', rate: '16% p.a.', desc: 'Moderate turnover history' },
                { id: 'STANDARD', name: 'Standard Tier', rate: '21% p.a.', desc: 'Early stage / new profile' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTier(t.id as any)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    tier === t.id
                      ? 'bg-[#2D62FF]/5 border-[#2D62FF] ring-2 ring-[#2D62FF]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-extrabold text-xs text-[#0B0B0F]">{t.name}</span>
                    <span className="text-[11px] font-bold text-[#2D62FF]">{t.rate}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column - Results Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0B0B0F] rounded-[32px] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Background Glow Elements */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-[#2D62FF]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-[#00D68F]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Estimated Summary</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold border border-emerald-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Direct Wire
                </span>
              </div>

              {/* Main Estimated Monthly Repayment */}
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold">Estimated Monthly Repayment</span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formatCurrency(monthlyPayment)}
                  <span className="text-xs text-slate-400 font-normal"> / mo</span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Principal Amount</span>
                  <div className="text-lg font-extrabold text-white">{formatCurrency(amount)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Total Interest</span>
                  <div className="text-lg font-extrabold text-[#00D68F]">{formatCurrency(totalInterest)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Est. Monthly Interest</span>
                  <div className="text-base font-bold text-blue-300">{formatCurrency(monthlyInterestEstimate)}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[11px] text-slate-400 font-medium">Total Cost of Loan</span>
                  <div className="text-base font-bold text-white">{formatCurrency(totalRepayment)}</div>
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span>Principal ({Math.round((amount / totalRepayment) * 100)}%)</span>
                  <span>Interest ({Math.round((totalInterest / totalRepayment) * 100)}%)</span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#2D62FF]"
                    style={{ width: `${(amount / totalRepayment) * 100}%` }}
                  />
                  <div
                    className="h-full bg-[#00D68F]"
                    style={{ width: `${(totalInterest / totalRepayment) * 100}%` }}
                  />
                </div>
              </div>

              {/* Action CTA Button */}
              <button
                type="button"
                onClick={handleApplyClick}
                className="w-full py-4 rounded-full bg-[#2D62FF] hover:bg-blue-600 text-white font-extrabold text-sm transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply for {formatCurrency(amount)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center pt-1">
                <ShieldCheck className="w-4 h-4 text-[#00D68F]" />
                <span>No hard credit check required to pre-qualify</span>
              </div>

            </div>
          </div>

          {/* Quick FAQ / Note Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-[#2D62FF]" />
              <span>How are these rates determined?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Calculations are estimates based on standard bank underwriting parameters. Final interest rates and approval terms depend on partner bank risk assessment, cashflow verifications, and creditworthiness.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
