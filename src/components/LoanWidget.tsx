import React, { useState } from 'react';
import { ArrowRight, Award } from 'lucide-react';

interface LoanWidgetProps {
  onStartApplication: (data: {
    applicantType: 'INDIVIDUAL' | 'BUSINESS';
    amount: number;
    firstName: string;
    lastName: string;
    email: string;
    purpose?: string;
  }) => void;
}

export const LoanWidget: React.FC<LoanWidgetProps> = ({ onStartApplication }) => {
  const [currency] = useState<'USD' | 'NGN'>('NGN');
  const [amount, setAmount] = useState<number>(5000000);
  const [inputValue, setInputValue] = useState<string>('5,000,000');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('Business Expansion & Growth');

  // Multipliers for USD vs NGN
  const isUSD = currency === 'USD';
  const minAmount = isUSD ? 100 : 250000;
  const maxAmount = isUSD ? 1500 : 95000000;
  const stepAmount = isUSD ? 50 : 250000;

  const presetsUSD = [250, 500, 750, 1000, 1500];
  const presetsNGN = [250000, 15000000, 35000000, 65000000, 95000000];
  const presets = isUSD ? presetsUSD : presetsNGN;

  // Synchronize text input with amount state when not actively editing
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

  // Monthly estimate calculation
  const monthlyRate = 0.065 / 12;
  const terms = 36;
  const calculatedMonthly = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, terms)) /
      (Math.pow(1 + monthlyRate, terms) - 1)
  );

  const formatAmount = (val: number) => {
    if (isUSD) {
      return `$${val.toLocaleString()}`;
    }
    return `₦${val.toLocaleString()}`;
  };

  const formatPresetLabel = (val: number) => {
    if (isUSD) {
      return val >= 1000 ? `$${val / 1000}k` : `$${val}`;
    }
    return val >= 1000000 ? `₦${val / 1000000}M` : `₦${val / 1000}k`;
  };

  // Calculate position along quadratic bezier curve for arc slider
  const rawPct = (amount - minAmount) / (maxAmount - minAmount || 1);
  const pct = Math.min(Math.max(rawPct, 0), 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartApplication({
      applicantType: purpose.includes('Personal') ? 'INDIVIDUAL' : 'BUSINESS',
      amount: Math.min(Math.max(amount, minAmount), maxAmount),
      firstName,
      lastName,
      email,
      purpose,
    });
  };

  return (
    <div className="relative max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto w-full py-2 sm:py-4 px-1.5 xs:px-2 sm:px-0 transition-all duration-300">
      
      {/* 1. Tilted Vibrant Blue Card Layer (Background Stack) */}
      <div className="absolute inset-1 sm:inset-0 bg-[#1D61F2] rounded-[22px] xs:rounded-[26px] sm:rounded-[30px] md:rounded-[34px] transform rotate-[1.5deg] sm:rotate-[2.5deg] md:rotate-[3deg] scale-[0.985] sm:scale-[0.99] translate-y-1 sm:translate-y-1.5 shadow-xl sm:shadow-2xl pointer-events-none transition-transform duration-300" />

      {/* 2. Main Foreground White Card */}
      <div className="relative bg-white rounded-[22px] xs:rounded-[26px] sm:rounded-[30px] md:rounded-[34px] p-3.5 xs:p-4.5 sm:p-6 md:p-8 shadow-2xl border border-slate-100 text-left w-full text-slate-800 z-10 transition-all duration-300">
        
        {/* Header Title */}
        <div className="text-center mb-3 sm:mb-5">
          <h3 className="text-base xs:text-lg sm:text-2xl md:text-[28px] lg:text-3xl font-normal text-slate-900 tracking-tight leading-snug">
            How much would you like to <span className="font-extrabold text-slate-900">borrow?</span>
          </h3>
        </div>

        {/* Amount Slider Section */}
        <div className="mb-3.5 sm:mb-5 space-y-1.5 sm:space-y-2">
          
          {/* Top Row: Minimum, Floating Pill in center (Editable), Maximum */}
          <div className="flex items-center justify-between gap-1 xs:gap-2 relative px-0.5 sm:px-1">
            <div className="text-left shrink-0">
              <span className="block text-[7.5px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                MINIMUM
              </span>
              <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-extrabold text-slate-700 whitespace-nowrap">
                {formatAmount(minAmount)}
              </span>
            </div>

            {/* Floating Value Pill (Editable Input) */}
            <div className="bg-white border-2 border-blue-100 hover:border-blue-300 focus-within:border-[#1D61F2] focus-within:ring-4 focus-within:ring-[#1D61F2]/15 shadow-md shadow-blue-500/10 px-2 py-0.5 xs:px-3 xs:py-1 sm:px-4 sm:py-1.5 rounded-xl sm:rounded-2xl text-center transform -translate-y-0.5 sm:-translate-y-1 shrink-0 transition-all flex items-center justify-center gap-0.5 cursor-text group">
              <span className="text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-[#1D61F2] select-none">
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
                className="bg-transparent text-sm xs:text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-[#1D61F2] tracking-tight text-center focus:outline-none w-28 xs:w-32 sm:w-44 md:w-52 p-0 border-none"
                aria-label="Editable Loan Amount"
                title="Click to manually enter loan amount"
              />
            </div>

            <div className="text-right shrink-0">
              <span className="block text-[7.5px] xs:text-[9px] sm:text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                MAXIMUM
              </span>
              <span className="text-[10px] xs:text-xs sm:text-sm md:text-base font-extrabold text-slate-700 whitespace-nowrap">
                {formatAmount(maxAmount)}
              </span>
            </div>
          </div>

          {/* Curved Arc Slider Track */}
          <div className="relative w-full h-10 sm:h-12 flex items-center justify-center my-0.5 sm:my-1 select-none group">
            <svg
              className="w-full h-10 sm:h-12 overflow-visible pointer-events-none"
              viewBox="0 0 300 40"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="sliderGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1D61F2" floodOpacity="0.25" />
                </filter>
              </defs>
              
              {/* Gray Base Arc */}
              <path
                id="customSliderTrack"
                d="M 12 8 Q 150 48 288 8"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Active Blue Arc Progress */}
              <path
                id="customSliderProgress"
                d="M 12 8 Q 150 48 288 8"
                fill="none"
                stroke="#1D61F2"
                strokeWidth="3"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray={`${pct * 100} 100`}
                filter="url(#sliderGlow)"
              />
            </svg>

            {/* Perfect Circular Thumb (Rendered in DOM to prevent non-uniform SVG stretching & hover thrashing) */}
            <div
              id="customSliderThumb"
              className="absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#1D61F2] border-2 border-white shadow-[0_2px_8px_rgba(29,97,242,0.45)] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-150 ease-out group-hover:scale-110 group-active:scale-125"
              style={{
                left: `calc(12px + ${pct} * (100% - 24px))`,
                top: `calc(20% + 50% * ${4 * pct * (1 - pct)})`,
              }}
            />

            {/* Invisible Native Input Overlay (aligned with track insets for 1:1 precision) */}
            <input
              type="range"
              min={minAmount}
              max={maxAmount}
              step={stepAmount}
              value={amount}
              aria-label="Loan Amount Slider"
              onChange={(e) => setAmount(Number(e.target.value))}
              className="absolute inset-x-3 inset-y-0 opacity-0 cursor-pointer z-20 touch-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-5 gap-1 xs:gap-1.5 sm:gap-2 pt-0.5">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`py-1.5 px-0.5 xs:px-1 rounded-lg sm:rounded-xl text-[8px] xs:text-[9.5px] sm:text-xs md:text-sm font-extrabold transition-all text-center cursor-pointer truncate ${
                  amount === preset
                    ? 'bg-[#1D61F2] text-white shadow-xs scale-[1.02]'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 active:scale-95'
                }`}
              >
                {formatPresetLabel(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-800 mb-0.5 sm:mb-1">First Name:</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Adebayo"
                className="w-full px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#F0F2F5] border border-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1D61F2] focus:ring-2 focus:ring-[#1D61F2]/20 transition-all min-h-[40px] sm:min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-800 mb-0.5 sm:mb-1">Last Name:</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Adeleke"
                className="w-full px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#F0F2F5] border border-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1D61F2] focus:ring-2 focus:ring-[#1D61F2]/20 transition-all min-h-[40px] sm:min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-800 mb-0.5 sm:mb-1">Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adebayo@company.com"
              className="w-full px-2.5 py-2 sm:px-3.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#F0F2F5] border border-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#1D61F2] focus:ring-2 focus:ring-[#1D61F2]/20 transition-all min-h-[40px] sm:min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-800 mb-0.5 sm:mb-1">Borrowing Purpose:</label>
            <div className="relative">
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-2.5 py-2 sm:px-3.5 sm:py-2.5 pr-8 rounded-lg sm:rounded-xl bg-[#F0F2F5] border border-transparent text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:bg-white focus:border-[#1D61F2] focus:ring-2 focus:ring-[#1D61F2]/20 transition-all appearance-none cursor-pointer min-h-[40px] sm:min-h-[44px]"
              >
                <option value="Business Expansion & Growth">Business Expansion & Growth</option>
                <option value="Asset & Equipment Acquisition">Asset & Equipment Acquisition</option>
                <option value="Working Capital & Inventory">Working Capital & Inventory</option>
                <option value="Invoice & Contract Financing">Invoice & Contract Financing</option>
                <option value="Personal Loan & Individual Needs">Personal Loan & Individual Needs</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Estimated Monthly Payment Box */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl sm:rounded-2xl p-2.5 xs:p-3 sm:p-4 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="block text-[7.5px] xs:text-[8.5px] sm:text-[9.5px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5 truncate">
                ESTIMATED MONTHLY PAYMENT
              </span>
              <div className="text-sm xs:text-base sm:text-xl md:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">
                {formatAmount(calculatedMonthly)}
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500">/mo</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="inline-block bg-[#1D61F2]/10 text-[#1D61F2] text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-black px-2 sm:px-2.5 py-0.5 rounded-full mb-0.5 whitespace-nowrap">
                Est. 6.5% APR
              </span>
              <span className="block text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-medium text-slate-500 whitespace-nowrap">
                36 Months Term
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full py-2.5 xs:py-3 sm:py-3.5 rounded-full bg-[#1D61F2] hover:bg-[#1852cf] active:scale-[0.99] text-white font-extrabold text-xs xs:text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer min-h-[44px]"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Bottom Footnote & Badge */}
          <div className="text-center space-y-0.5 sm:space-y-1 pt-0.5">
            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-400 font-medium">
              (Does not impact your credit score)
            </p>
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[8.5px] xs:text-[9.5px] sm:text-[11px] text-slate-400 font-medium text-center">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
              <span>AkoFinanced It is a Licensed and Regulated Intermediary.</span>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

