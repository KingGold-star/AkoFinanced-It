import React, { useState } from 'react';
import {
  Check,
  Copy,
  ArrowRight
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ConfettiCelebration } from './ConfettiCelebration';

interface ConfirmationScreenProps {
  referenceNumber: string;
  onReturnHome?: () => void;
  // Keep optional props for backward compatibility
  applicationData?: any;
  onAccountCreated?: (user: any, token: string) => void;
  onSignInClick?: () => void;
  user?: any;
  onGoToDashboard?: () => void;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  referenceNumber,
  onReturnHome,
  onGoToDashboard
}) => {
  const [copied, setCopied] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    // Add an extra subtle burst when user copies reference
    setConfettiBurst((prev) => prev + 1);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleHomeClick = onReturnHome || onGoToDashboard;

  return (
    <>
      {/* Gentle multi-origin celebratory confetti from different parts of screen */}
      <ConfettiCelebration triggerKey={`${referenceNumber}-${confettiBurst}`} />

      <div className="max-w-2xl mx-auto bg-white rounded-[12px] border border-slate-200 shadow-2xl p-6 sm:p-10 my-12 animate-fadeIn text-center font-sans relative z-10">
        
        {/* Official Website Brand Logo */}
        <div className="flex items-center justify-center mx-auto mb-6">
          <BrandLogo size={56} className="shadow-md rounded-[12px]" />
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#0B0B0F] mb-3 tracking-tight">
          Application Received
        </h2>

        {/* Reference Card with Dynamic Application Reference */}
        <div className="bg-slate-50 border-2 border-[#2D62FF] p-6 rounded-[12px] mb-6 space-y-3">
          <p className="text-sm sm:text-base text-[#0B0B0F]">
            Your application is being processed under reference{' '}
            <span className="font-black text-[#2D62FF] tracking-wider">{referenceNumber}</span>.
          </p>
          
          <div className="flex items-center justify-center pt-1">
            <button
              onClick={handleCopy}
              id="btn-copy-ref-code"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] bg-white border border-slate-200 text-xs font-bold text-[#0B0B0F] hover:bg-gray-50 shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-[#2D62FF]" /> : <Copy className="w-4 h-4 text-[#8F95A5]" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Reference'}</span>
            </button>
          </div>

          <p className="text-xs text-[#8F95A5] pt-1 leading-relaxed">
            <strong className="text-[#5A5F71]">Important:</strong> Please save or copy your personalized reference code to identify your application during future communications.
          </p>
        </div>

        {/* Reassurance Message */}
        <p className="text-sm text-[#5A5F71] max-w-lg mx-auto mb-8 leading-relaxed">
          We'll assess your application and keep you informed about important updates and any additional information we may need.
        </p>

        {/* Return to Home Action Button */}
        {handleHomeClick && (
          <button
            onClick={handleHomeClick}
            id="btn-return-home"
            className="px-6 py-3.5 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-xs shadow-md hover:bg-[#1a4edf] transition-all inline-flex items-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Return to Home</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
        )}

      </div>
    </>
  );
};
