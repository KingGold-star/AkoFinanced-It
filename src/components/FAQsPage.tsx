import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ArrowRight } from 'lucide-react';

interface FAQsPageProps {
  onStartApplication?: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
  onNavigate?: (page: string) => void;
}

export const FAQsPage: React.FC<FAQsPageProps> = ({ onStartApplication, onNavigate }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      id: 1,
      question: '1. What services does AkoFinanced It provide?',
      answer:
        'We offer rapid personal loans, emergency salary-bridge financing, SME working capital solutions, and automated credit matchmaking. Every active loan also automatically qualifies you for our signature weekly cash-prize rebate draws.'
    },
    {
      id: 2,
      question: '2. How long does it take to get approved and funded?',
      answer:
        'Our automated underwriting assessment takes less than 15 minutes. Once your documents are verified and approved, loan disbursement is initiated directly to your verified Nigerian bank account.'
    },
    {
      id: 3,
      question: '3. How does the weekly cash rebate draw work?',
      answer:
        'We believe in sharing lending profits with our borrowers! A portion of our revenue is placed into a dedicated prize pool, and every customer with an active loan in good standing is automatically entered into our Friday cash draws.'
    },
    {
      id: 4,
      question: '4. Are there any hidden fees or upfront costs?',
      answer:
        'None at all. Applying through AkoFinanced It is 100% free with no upfront assessment charges. All interest rates, repayment amounts, and terms are transparently displayed before you accept.'
    },
    {
      id: 5,
      question: '5. Can I repay my loan early without penalty?',
      answer:
        'Yes, you can settle your loan early at any time with zero prepayment penalties. Early repayment also enhances your credit rating for higher limits in the future.'
    },
    {
      id: 6,
      question: '6. What documents do I need to apply?',
      answer:
        'Individual applicants only need a valid government-issued ID (NIN, Driver’s License, or Voter’s Card) and recent bank statement verification. Business applicants provide CAC registration details.'
    },
    {
      id: 7,
      question: '7. Is my financial and personal data secure?',
      answer:
        'We enforce 256-bit bank-grade SSL/TLS encryption across all communications and adhere strictly to NDPR regulations to ensure your identity and financial data remain completely private.'
    },
    {
      id: 8,
      question: '8. How can I start an application today?',
      answer:
        'Simply click the Apply Now button anywhere on our site, select Individual or Business loan, fill in your details in less than 3 minutes, and submit for instant review.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full bg-[#F8FAFC] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        
        {/* ================= LEFT COLUMN: HEADER & CTA CARD ================= */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
          {/* Header Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B0B0F] tracking-tight leading-tight">
              Frequently asked questions
            </h1>
            <p className="text-sm sm:text-base text-[#5A5F71] leading-relaxed">
              Find quick answers to common questions about the platform, pricing, and security.
            </p>
          </div>

          {/* Blue Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-[28px] bg-gradient-to-b from-[#2D62FF] to-[#1E4ECC] text-white p-7 sm:p-8 shadow-xl shadow-[#2D62FF]/15 space-y-6 relative overflow-hidden"
          >
            {/* Avatars Stack */}
            <div className="flex items-center -space-x-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="Support Agent 1"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                alt="Support Agent 2"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120"
                alt="Support Agent 3"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
              <div className="h-10 px-3 rounded-full bg-white text-[#0B0B0F] text-xs font-black flex items-center justify-center border-2 border-[#2D62FF] shadow-sm">
                + You
              </div>
            </div>

            {/* Card Text */}
            <div className="space-y-1">
              <h2 className="text-xl font-black text-white tracking-tight">
                Still have questions?
              </h2>
              <p className="text-xs sm:text-sm text-blue-100/90">
                Reach out, and our team will guide you.
              </p>
            </div>

            {/* Talk to our team pill button */}
            <div>
              <button
                onClick={() => (onNavigate ? onNavigate('contact') : null)}
                className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-4 px-6 py-3.5 rounded-full bg-[#0B0B0F] hover:bg-[#1A1A24] text-white text-xs sm:text-sm font-extrabold shadow-lg transition-all cursor-pointer group"
              >
                <span>Talk to our team</span>
                <span className="w-6 h-6 rounded-full bg-white text-[#0B0B0F] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* ================= RIGHT COLUMN: FAQS ACCORDION ================= */}
        <div className="lg:col-span-7 space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.id}
                initial={false}
                animate={{
                  backgroundColor: isOpen ? '#18181B' : '#FFFFFF',
                  color: isOpen ? '#FFFFFF' : '#0B0B0F'
                }}
                transition={{ duration: 0.2 }}
                className={`rounded-[20px] transition-shadow duration-200 overflow-hidden ${
                  isOpen
                    ? 'shadow-xl border border-zinc-800'
                    : 'shadow-sm hover:shadow-md border border-slate-200/80 bg-white'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <span
                    className={`text-sm sm:text-base font-extrabold tracking-tight leading-snug transition-colors ${
                      isOpen ? 'text-white' : 'text-[#0B0B0F]'
                    }`}
                  >
                    {faq.question}
                  </span>

                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isOpen ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
