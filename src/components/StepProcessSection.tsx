import React, { useState } from 'react';
import { FileText, SearchCheck, Cpu, Bell, Headset, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

interface StepProcessSectionProps {
  onApplyClick: () => void;
}

export const StepProcessSection: React.FC<StepProcessSectionProps> = ({ onApplyClick }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      num: '01',
      title: 'Tell Us What You Need',
      summary: 'Fill out our fast, mobile-friendly application form without signing up or logging in.',
      details: 'Tell us if you are an individual or registered business, your desired financing amount, monthly cash flow, and financing purpose (asset acquisition, working capital, salary advance, or invoice discounting). Takes less than 3 minutes.',
      icon: FileText,
      badge: 'Step 1 • Express Request'
    },
    {
      num: '02',
      title: 'We’ll Assess You',
      summary: 'Our financial advisory team conducts a preliminary eligibility evaluation.',
      details: 'We analyze your income/revenue capacity, debt service ratio, and document completeness to establish your baseline credit readiness before presenting your file to lending partners.',
      icon: SearchCheck,
      badge: 'Step 2 • Advisory Assessment'
    },
    {
      num: '03',
      title: 'We’ll Process Your Application',
      summary: 'We package your documentation into institutional loan submission files.',
      details: 'We format your financial statements, verify your identity & CAC records, and match your application with top licensed banks, microfinance providers, and institutional lenders.',
      icon: Cpu,
      badge: 'Step 3 • Loan Packaging'
    },
    {
      num: '04',
      title: 'We’ll Keep You Informed',
      summary: 'Receive real-time timeline updates and transparent status logs on your dashboard.',
      details: 'Create your account post-submission to track status milestones (Under Review -> Documents Required -> Lender Match -> Submitted -> Decision) and chat directly with your assigned loan officer.',
      icon: Bell,
      badge: 'Step 4 • Real-Time Tracking'
    },
    {
      num: '05',
      title: 'We’ll Follow Up For You',
      summary: 'Our dedicated staff actively pushes credit committee reviews and disbursement checks.',
      details: 'We eliminate lender delays by conducting daily follow-ups with credit desk managers, ensuring your application receives priority evaluation and clear feedback.',
      icon: Headset,
      badge: 'Step 5 • Dedicated Advocacy'
    }
  ];

  return (
    <div className="py-20 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#EFF4FF] text-[#2D62FF] text-xs font-bold uppercase tracking-wider mb-4 border border-[#2D62FF]/20">
            How AkoFinanced It Works
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B0B0F] tracking-tight">
            Our 5-Step Advisory & Application Process
          </h2>
          <p className="text-base text-[#5A5F71] mt-3">
            From preliminary cash flow assessment to lender disbursement follow-up, we guide your financing journey with human care and institutional speed.
          </p>
        </div>

        {/* Process Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-12">
          {steps.map((step, idx) => {
            const IconComponent = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-[12px] p-6 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0B0B0F] text-white border-[#0B0B0F] shadow-xl scale-[1.02]'
                    : 'bg-white text-[#0B0B0F] border-slate-200 hover:border-[#2D62FF]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-2xl font-black ${
                        isSelected ? 'text-[#2D62FF]' : 'text-[#8F95A5]'
                      }`}
                    >
                      {step.num}
                    </span>
                    <div
                      className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#2D62FF] text-white'
                          : 'bg-[#EFF4FF] text-[#2D62FF]'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg leading-snug mb-2">
                    {step.title}
                  </h3>
                  <p
                    className={`text-xs leading-relaxed ${
                      isSelected ? 'text-[#8F95A5]' : 'text-[#5A5F71]'
                    }`}
                  >
                    {step.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between text-xs font-semibold">
                  <span className={isSelected ? 'text-[#2D62FF]' : 'text-[#0B0B0F]'}>
                    {isSelected ? 'Viewing details' : 'Click to expand'}
                  </span>
                  {isSelected ? <ChevronUp className="w-4 h-4 text-[#2D62FF]" /> : <ChevronDown className="w-4 h-4 text-[#8F95A5]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Step Details Panel */}
        <div className="bg-[#0B0B0F] text-white rounded-[12px] p-6 sm:p-8 border border-[#0B0B0F] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2D62FF]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-bold text-[#2D62FF] uppercase tracking-widest bg-[#2D62FF]/15 border border-[#2D62FF]/30 px-3 py-1 rounded-[12px]">
                {steps[activeStep].badge}
              </span>
              <h3 className="text-2xl font-extrabold text-white">
                {steps[activeStep].num}. {steps[activeStep].title}
              </h3>
              <p className="text-sm text-[#8F95A5] leading-relaxed">
                {steps[activeStep].details}
              </p>
            </div>

            <button
              onClick={onApplyClick}
              className="px-6 py-3.5 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-sm shadow-lg hover:bg-[#1a4edf] transition-all flex items-center gap-2 whitespace-nowrap self-stretch md:self-auto justify-center cursor-pointer"
            >
              <span>Start Step 1 Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
