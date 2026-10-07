import React, { useState } from 'react';
import {
  UserCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Briefcase,
  TrendingUp,
  AlertCircle,
  Zap,
  ChevronDown
} from 'lucide-react';
import { LoanWidget } from './LoanWidget';

interface PageProps {
  onStartApplication: (type: 'INDIVIDUAL' | 'BUSINESS') => void;
  onNavigate: (page: string) => void;
}

/* ================= INDIVIDUALS PAGE ================= */
export const IndividualsPage: React.FC<PageProps> = ({ onStartApplication, onNavigate }) => {
  return (
    <div className="space-y-16 py-12 animate-fadeIn">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#EFF4FF] border border-[#2D62FF]/30 text-[#2D62FF] text-xs font-extrabold">
          <UserCheck className="w-4 h-4 text-[#2D62FF]" />
          <span>Personal Advisory & Asset Financing Solutions</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0B0B0F] max-w-4xl mx-auto leading-tight">
          Tailored personal financing guidance for salaries, auto, and major life assets.
        </h1>
        <p className="text-base text-[#5A5F71] max-w-2xl mx-auto">
          We match salaried employees and individual earners with regulated Nigerian lending institutions offering competitive interest rates and flexible repayment schedules.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => onStartApplication('INDIVIDUAL')}
            className="px-8 py-4 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-sm shadow-xl hover:bg-[#1a4edf] flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Apply as Individual</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[12px] bg-white border border-slate-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#EFF4FF] text-[#2D62FF] flex items-center justify-center font-bold text-xl">
              🚗
            </div>
            <h3 className="text-xl font-bold text-[#0B0B0F]">Auto & Vehicle Financing</h3>
            <p className="text-xs text-[#5A5F71] leading-relaxed">
              Drive home personal or commercial vehicles with structured monthly payback aligned directly with your monthly income.
            </p>
          </div>

          <div className="p-8 rounded-[12px] bg-white border border-slate-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#EFF4FF] text-[#2D62FF] flex items-center justify-center font-bold text-xl">
              💻
            </div>
            <h3 className="text-xl font-bold text-[#0B0B0F]">Gadgets & Asset Acquisition</h3>
            <p className="text-xs text-[#5A5F71] leading-relaxed">
              Procure essential technology, solar power systems, or household appliances without draining your emergency savings.
            </p>
          </div>

          <div className="p-8 rounded-[12px] bg-white border border-slate-200 shadow-md space-y-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#EFF4FF] text-[#2D62FF] flex items-center justify-center font-bold text-xl">
              💼
            </div>
            <h3 className="text-xl font-bold text-[#0B0B0F]">Salary Advances & Cash Loans</h3>
            <p className="text-xs text-[#5A5F71] leading-relaxed">
              Bridge short-term cash flow needs or urgent personal expenses backed by verified employment income.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Widget */}
      <section className="max-w-4xl mx-auto px-4">
        <LoanWidget onStartApplication={onStartApplication} />
      </section>

      {/* Eligibility Requirements */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-[12px] p-8 sm:p-12 border border-slate-200 shadow-md">
        <h2 className="text-2xl font-extrabold text-[#0B0B0F] mb-6">Individual Eligibility Checklist</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#5A5F71]">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2D62FF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0B0B0F] block font-bold text-sm">Verified Monthly Income</strong>
              Regular employment salary or steady verifiable individual cash flow.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2D62FF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0B0B0F] block font-bold text-sm">Valid Government Identification</strong>
              NIN Slips, International Passport, Voters Card, or Drivers License.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2D62FF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0B0B0F] block font-bold text-sm">6 Months Official Bank Statement</strong>
              Stamped PDF statement from your primary salary/operating bank.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2D62FF] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#0B0B0F] block font-bold text-sm">Active Utility Bill / Proof of Residence</strong>
              Electric bill or tenancy agreement dated within the last 3 months.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};


/* ================= BUSINESSES PAGE ================= */
export const BusinessesPage: React.FC<PageProps> = ({ onStartApplication, onNavigate }) => {
  return (
    <div className="space-y-16 py-12 animate-fadeIn">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#0B0B0F] text-white text-xs font-bold">
          <Building2 className="w-4 h-4 text-[#2D62FF]" />
          <span>Commercial & SME Credit Advisory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#0B0B0F] max-w-4xl mx-auto leading-tight">
          Unlocking capital for Nigerian enterprise expansion, procurement, & contracts.
        </h1>
        <p className="text-base text-[#5A5F71] max-w-2xl mx-auto">
          From Local Purchase Order (LPO) funding to equipment procurement, our advisors prepare your financial file for institutional credit approval.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => onStartApplication('BUSINESS')}
            className="px-8 py-4 rounded-[12px] bg-[#2D62FF] text-white font-extrabold text-sm shadow-xl hover:bg-[#1a4edf] flex items-center gap-2 cursor-pointer transition-all"
          >
            <span>Apply as Business / SME</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </section>

      {/* Corporate Solutions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[12px] bg-[#0B0B0F] text-white space-y-4 shadow-xl">
            <Briefcase className="w-8 h-8 text-[#2D62FF]" />
            <h3 className="text-xl font-bold">LPO & Contract Financing</h3>
            <p className="text-xs text-[#8F95A5] leading-relaxed">
              Execute high-value corporate or government purchase orders without straining operational liquidity.
            </p>
          </div>

          <div className="p-8 rounded-[12px] bg-[#0B0B0F] text-white space-y-4 shadow-xl">
            <TrendingUp className="w-8 h-8 text-[#2D62FF]" />
            <h3 className="text-xl font-bold">Working Capital Loans</h3>
            <p className="text-xs text-[#8F95A5] leading-relaxed">
              Smooth out seasonal inventory demands and manage daily operational expenditures cleanly.
            </p>
          </div>

          <div className="p-8 rounded-[12px] bg-[#0B0B0F] text-white space-y-4 shadow-xl">
            <Zap className="w-8 h-8 text-[#2D62FF]" />
            <h3 className="text-xl font-bold">Asset & Fleet Leasing</h3>
            <p className="text-xs text-[#8F95A5] leading-relaxed">
              Acquire heavy machinery, commercial logistics fleets, or office infrastructure with structured payback.
            </p>
          </div>
        </div>
      </section>

      {/* Business Calculator */}
      <section className="max-w-4xl mx-auto px-4">
        <LoanWidget onStartApplication={onStartApplication} />
      </section>
    </div>
  );
};


/* ================= HOW IT WORKS PAGE ================= */
export { HowItWorksPage } from './HowItWorksPage';


/* ================= ABOUT PAGE ================= */
export { AboutUsPage as AboutPage } from './AboutUsPage';


/* ================= FAQS PAGE ================= */
export { FAQsPage } from './FAQsPage';


/* ================= CONTACT PAGE ================= */
export { ContactPage } from './ContactPage';


/* ================= LEGAL / DISCLAIMER PAGE ================= */
export const LegalPage: React.FC<PageProps> = () => {
  return (
    <div className="py-12 animate-fadeIn max-w-4xl mx-auto px-4 space-y-8 text-xs text-[#5A5F71] leading-relaxed">
      <h1 className="text-2xl font-black text-[#0B0B0F]">Legal, Privacy & Non-Lending Disclaimer</h1>

      <div className="p-6 rounded-[12px] bg-white border border-slate-200 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-[#0B0B0F]">1. Non-Lending Advisory Statement</h3>
        <p>
          AkoFinanced It operates strictly as an intermediary financial advisory service and credit matchmaking platform. AkoFinanced It is not a licensed bank, mortgage institution, or direct lender. All financing product terms, interest rates, fees, and approval decisions are issued independently by our partner financial institutions.
        </p>
      </div>

      <div className="p-6 rounded-[12px] bg-white border border-slate-200 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-[#0B0B0F]">2. Privacy Policy & Data Protection</h3>
        <p>
          We respect your privacy. Information submitted during the application process is strictly used to evaluate credit eligibility and route requests to authorized partner financial institutions. We implement AES encryption and compliance with Nigerian data protection frameworks.
        </p>
      </div>

      <div className="p-6 rounded-[12px] bg-white border border-slate-200 space-y-4 shadow-sm">
        <h3 className="font-bold text-sm text-[#0B0B0F]">3. Terms of Service</h3>
        <p>
          By submitting an application or reference code on AkoFinanced It, you affirm that all financial details provided are truthful and accurate. Providing fraudulent documents or false representations is strictly prohibited under federal regulations.
        </p>
      </div>
    </div>
  );
};
