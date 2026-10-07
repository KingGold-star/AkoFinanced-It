import React, { useState } from 'react';
import {
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  Clock,
  User as UserIcon,
  CreditCard,
  Building2,
  FileCheck2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ConfettiCelebration } from './ConfettiCelebration';

export interface ConfirmationScreenProps {
  referenceNumber: string;
  onReturnHome?: () => void;
  applicationData?: any;
  user?: any;
  onGoToDashboard?: () => void;
  onAccountCreated?: (user: any, token: string) => void;
  onSignInClick?: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  referenceNumber = 'AKO-229062',
  onReturnHome,
  applicationData,
  user,
  onGoToDashboard,
  onSignInClick
}) => {
  const [copied, setCopied] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(referenceNumber);
      }
    } catch {
      // Fallback if clipboard permission is restricted or window is unfocused
    }
    setCopied(true);
    setConfettiBurst((prev) => prev + 1);
    setTimeout(() => setCopied(false), 3000);
  };

  // Safely extract applicant summary info
  const applicantInfo = applicationData?.applicant_info || {};
  const applicantName =
    applicantInfo.contact_name ||
    (applicantInfo.first_name ? `${applicantInfo.first_name} ${applicantInfo.last_name || ''}`.trim() : '') ||
    user?.full_name ||
    'Applicant';

  const requestedAmount =
    applicationData?.requested_amount ||
    applicantInfo.amount ||
    1500000;

  const formattedAmount =
    typeof requestedAmount === 'number'
      ? `₦${requestedAmount.toLocaleString()}`
      : String(requestedAmount).startsWith('₦')
      ? requestedAmount
      : `₦${Number(requestedAmount || 0).toLocaleString()}`;

  const loanCategory =
    applicantInfo.loan_category ||
    (applicationData?.applicant_type === 'BUSINESS' ? 'SME Loan (Limited Liability)' : 'Personal Loan');

  const bankName =
    applicantInfo.commercial_bank ||
    applicantInfo.bank_name ||
    applicantInfo.salary_bank_name ||
    'Commercial Bank';

  const handleDashboardClick = onGoToDashboard || onSignInClick;
  const handleHomeClick = onReturnHome || (() => { window.location.href = '/'; });

  return (
    <>
      {/* Gentle celebratory confetti burst across the screen */}
      <ConfettiCelebration triggerKey={`${referenceNumber}-${confettiBurst}`} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 font-sans animate-fadeIn relative z-10">
        
        {/* Main Card Container */}
        <div className="bg-white rounded-[20px] border border-slate-200/90 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#2D62FF] via-[#38BDF8] to-[#10B981]" />

          {/* Official Brand Logo */}
          <div className="flex items-center justify-center mx-auto mb-6 pt-2">
            <BrandLogo size={52} className="shadow-md rounded-[14px]" />
          </div>

          {/* Success Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Application Submitted Successfully</span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B0B0F] tracking-tight mb-2">
            Application Received!
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5F71] max-w-lg mx-auto leading-relaxed mb-6 font-medium">
            Thank you, <strong className="text-[#0B0B0F] font-bold">{applicantName}</strong>. Your loan application has been received and queued for immediate qualification assessment.
          </p>

          {/* Reference Card with High-Visibility Reference Code */}
          <div className="bg-slate-50/90 border-2 border-[#2D62FF] p-5 sm:p-6 rounded-[16px] mb-8 space-y-3.5 text-center shadow-xs">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#5A5F71]">
              Your Official Application Reference
            </span>
            
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-[#2D62FF] tracking-wider font-mono">
                {referenceNumber}
              </span>

              <button
                type="button"
                onClick={handleCopy}
                id="btn-copy-ref-code"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-white border border-slate-200 text-xs font-bold text-[#0B0B0F] hover:bg-slate-100 hover:border-slate-300 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4 text-[#8F95A5]" />}
                <span className={copied ? 'text-[#10B981]' : ''}>
                  {copied ? 'Copied to Clipboard!' : 'Copy Code'}
                </span>
              </button>
            </div>

            <p className="text-xs text-[#8F95A5] pt-1 max-w-md mx-auto leading-relaxed">
              <strong className="text-[#5A5F71]">Important:</strong> Please save or copy this personalized reference code to track your status and for any inquiries with our advisory team.
            </p>
          </div>

          {/* Submitted Summary Overview */}
          <div className="bg-white border border-slate-200 rounded-[16px] p-5 sm:p-6 mb-8 text-left space-y-4 shadow-xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5A5F71] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Application Summary</span>
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold normal-case">
                <Clock className="w-3.5 h-3.5" />
                Under Initial Review
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <span className="text-[#8F95A5] font-medium block">Applicant Name</span>
                <span className="font-bold text-[#0B0B0F] flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#2D62FF]" />
                  {applicantName}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[#8F95A5] font-medium block">Requested Loan Amount</span>
                <span className="font-black text-[#2D62FF] text-base">
                  {formattedAmount}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[#8F95A5] font-medium block">Loan Category</span>
                <span className="font-bold text-[#0B0B0F] flex items-center gap-1.5">
                  {loanCategory.includes('SME') ? (
                    <Building2 className="w-3.5 h-3.5 text-[#2D62FF]" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5 text-[#2D62FF]" />
                  )}
                  {loanCategory}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[#8F95A5] font-medium block">Receiving Bank</span>
                <span className="font-bold text-[#0B0B0F]">
                  {bankName}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps Timeline */}
          <div className="border border-slate-100 bg-slate-50/60 rounded-[16px] p-5 sm:p-6 mb-8 text-left space-y-3">
            <h4 className="text-xs font-extrabold text-[#0B0B0F] uppercase tracking-wider">
              What Happens Next:
            </h4>
            
            <div className="space-y-3 text-xs sm:text-sm text-[#5A5F71]">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#2D62FF]/10 text-[#2D62FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-[#0B0B0F]">Underwriting Review:</strong> Our banking partners and automated assessment engine review your eligibility within 24 to 48 hours.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#2D62FF]/10 text-[#2D62FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-[#0B0B0F]">Notification:</strong> You will receive an SMS and email notification with your pre-approval status and disbursement schedule.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#2D62FF]/10 text-[#2D62FF] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-[#0B0B0F]">Disbursement:</strong> Upon final document sign-off, approved funds are wired directly to your designated commercial bank account.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            {user && handleDashboardClick ? (
              <>
                <button
                  type="button"
                  onClick={handleDashboardClick}
                  id="btn-go-to-dashboard"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-xs sm:text-sm shadow-md hover:bg-[#1a4edf] hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                <button
                  type="button"
                  onClick={handleHomeClick}
                  id="btn-return-home"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-slate-100 text-[#0B0B0F] font-bold text-xs sm:text-sm hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Return to Home</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleHomeClick}
                  id="btn-return-home"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-xs sm:text-sm shadow-md hover:bg-[#1a4edf] hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Return to Home</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                {handleDashboardClick && (
                  <button
                    type="button"
                    onClick={handleDashboardClick}
                    id="btn-track-application"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-slate-100 text-[#0B0B0F] font-bold text-xs sm:text-sm hover:bg-slate-200 transition-colors inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Track Status in Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#5A5F71]" />
                  </button>
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </>
  );
};
