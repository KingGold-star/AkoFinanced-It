import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  FileText,
  DollarSign,
  User,
  Users,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Eraser,
  PenTool,
  ShieldCheck,
  Check,
  Briefcase,
  Home,
  MapPin,
  Calendar,
  Lock,
  Loader2,
  Eye,
  Trash2,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';

interface SmeLoanWizardProps {
  initialData?: any;
  onCompleted?: (refNum: string, appData: any) => void;
  onCancel?: () => void;
  onSwitchToIndividual?: () => void;
}

const NIGERIAN_COMMERCIAL_BANKS = [
  'Access Bank Plc',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank Plc',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'FCMB (First City Monument Bank)',
  'Stanbic IBTC Bank',
  'Fidelity Bank Plc',
  'Union Bank of Nigeria',
  'Sterling Bank Plc',
  'Polaris Bank',
  'Wema Bank Plc',
  'Ecobank Nigeria',
  'Keystone Bank',
  'Standard Chartered Bank Nigeria',
  'Citibank Nigeria',
  'Taj Bank',
  'Jaiz Bank',
  'Lotus Bank',
  'Optimus Bank',
  'Signature Bank',
  'Other Commercial Bank'
];

const UTILITY_BILL_TYPES = [
  'EKEDC (Eko Electricity)',
  'IKEDC (Ikeja Electric)',
  'AEDC (Abuja Electricity)',
  'EEDC (Enugu Electricity)',
  'IBEDC (Ibadan Electricity)',
  'KEDCO (Kano Electricity)',
  'PHED (Port Harcourt Electricity)',
  'State Water Corporation / Water Bill',
  'Lagos State Waste Management (LAWMA) / Waste Receipt',
  'Tenancy Agreement / Lease Receipt'
];

export const SmeLoanWizard: React.FC<SmeLoanWizardProps> = ({
  initialData,
  onCompleted,
  onCancel,
  onSwitchToIndividual
}) => {
  const [step, setStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'stepper' | 'single'>('stepper');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ================= 26 SME LOAN (LIMITED LIABILITY) FIELDS =================
  // Section 1: Business Identity & Operations
  const [businessName, setBusinessName] = useState<string>(initialData?.businessName || initialData?.business_name || '');
  const [cacNumber, setCacNumber] = useState<string>(initialData?.cacNumber || initialData?.cac_number || '');
  const [natureOfBusiness, setNatureOfBusiness] = useState<string>(initialData?.natureOfBusiness || initialData?.nature_of_business || '');
  const [businessPeriodYears, setBusinessPeriodYears] = useState<number | string>(initialData?.yearsOperating || initialData?.business_period_years || 3);
  const [businessBranches, setBusinessBranches] = useState<number | string>(initialData?.business_branches || 1);
  const [numberOfEmployees, setNumberOfEmployees] = useState<number | string>(initialData?.number_of_employees || 8);
  const [premisesStatus, setPremisesStatus] = useState<string>(initialData?.premises_status || 'Rented');
  const [businessAddress, setBusinessAddress] = useState<string>(initialData?.business_address || '');

  // Section 2: Loan Requirements
  const [amount, setAmount] = useState<number | string>(initialData?.amount || 5000000);
  const [purposeForLoan, setPurposeForLoan] = useState<string>(initialData?.financingPurpose || initialData?.purpose_for_loan || '');

  // Section 3: Applicant & Director KYC
  const [contactName, setContactName] = useState<string>(
    initialData?.contact_name ||
    (initialData?.firstName ? `${initialData.firstName} ${initialData?.lastName || ''}`.trim() : '')
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(initialData?.phone || '');
  const [email, setEmail] = useState<string>(initialData?.email || '');
  const [dob, setDob] = useState<string>(initialData?.dob || '');
  const [applicantNin, setApplicantNin] = useState<string>(initialData?.applicant_nin || '');
  const [applicantTin, setApplicantTin] = useState<string>(initialData?.applicant_tin || '');
  const [bvn, setBvn] = useState<string>(initialData?.bvn || '');
  const [residentialAddress, setResidentialAddress] = useState<string>(initialData?.residential_address || '');

  // Section 4: Guarantor & Next of Kin
  const [guarantorNin, setGuarantorNin] = useState<string>(initialData?.guarantor_nin || '');
  const [nextOfKinName, setNextOfKinName] = useState<string>(initialData?.next_of_kin_name || '');
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState<string>(initialData?.next_of_kin_relationship || 'Spouse');
  const [nextOfKinPhone, setNextOfKinPhone] = useState<string>(initialData?.next_of_kin_phone || '');
  const [nextOfKinAddress, setNextOfKinAddress] = useState<string>(initialData?.next_of_kin_address || '');

  // Section 5: Banking & Utility Bill
  const [commercialBank, setCommercialBank] = useState<string>(initialData?.commercial_bank || 'Guaranty Trust Bank (GTBank)');
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>(initialData?.account_number || '');
  const [accountName, setAccountName] = useState<string>(initialData?.account_name || '');
  const [alertPhoneNumber, setAlertPhoneNumber] = useState<string>(initialData?.alert_phone_number || '');
  const [utilityBillType, setUtilityBillType] = useState<string>(initialData?.utility_bill_type || 'EKEDC (Eko Electricity)');
  const [utilityBillFileName, setUtilityBillFileName] = useState<string>(initialData?.utility_bill_file_name || '');
  const [utilityBillData, setUtilityBillData] = useState<string>(initialData?.utility_bill || '');

  // Section 6: Digital Signature & Declaration
  const [typedSignature, setTypedSignature] = useState<string>('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const totalSteps = 6;

  // Initialize signature canvas events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#0B0B0F';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [step, viewMode]);

  const handleStartDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureDataUrl(canvas.toDataURL('image/png'));
    }
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  // Utility Bill File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Uploaded file exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setUtilityBillFileName(`${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    const reader = new FileReader();
    reader.onload = () => {
      setUtilityBillData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step Validations
  const validateStep = (currentStep: number): boolean => {
    setErrorMsg(null);

    if (currentStep === 1) {
      if (!businessName.trim()) {
        setErrorMsg('Please enter your registered Business Name.');
        return false;
      }
      if (!cacNumber.trim()) {
        setErrorMsg('Please enter your CAC Registration Number (RC Number).');
        return false;
      }
      if (!natureOfBusiness.trim() || natureOfBusiness.trim().length < 5) {
        setErrorMsg('Please explain the Nature of Business in details (at least 5 characters).');
        return false;
      }
      if (!businessAddress.trim()) {
        setErrorMsg('Please enter your physical Business Address.');
        return false;
      }
    }

    if (currentStep === 2) {
      const numAmount = Number(amount);
      if (!numAmount || isNaN(numAmount) || numAmount < 100000) {
        setErrorMsg('Please enter a valid loan amount (Minimum ₦100,000 for SME Loan).');
        return false;
      }
      if (!purposeForLoan.trim() || purposeForLoan.trim().length < 5) {
        setErrorMsg('Please state the Purpose for Loan in details.');
        return false;
      }
    }

    if (currentStep === 3) {
      if (!contactName.trim()) {
        setErrorMsg('Please enter the primary Contact Name / Director Name.');
        return false;
      }
      if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
        setErrorMsg('Please enter a valid Phone Number (at least 8 digits).');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        setErrorMsg('Please enter a valid Email address.');
        return false;
      }
      if (!dob) {
        setErrorMsg('Please specify the Date of Birth for the applicant / director.');
        return false;
      }
      if (!bvn.trim() || bvn.trim().length !== 11) {
        setErrorMsg('Please enter an 11-digit Bank Verification Number (BVN).');
        return false;
      }
      if (!applicantNin.trim() || applicantNin.trim().length !== 11) {
        setErrorMsg('Please enter an 11-digit Applicant NIN.');
        return false;
      }
      if (!applicantTin.trim()) {
        setErrorMsg('Please enter the Applicant Tax Identification Number (TIN).');
        return false;
      }
      if (!residentialAddress.trim()) {
        setErrorMsg('Please enter the Residential Address of the applicant.');
        return false;
      }
    }

    if (currentStep === 4) {
      if (!guarantorNin.trim() || guarantorNin.trim().length !== 11) {
        setErrorMsg("Please enter an 11-digit Guarantor's NIN.");
        return false;
      }
      if (!nextOfKinName.trim()) {
        setErrorMsg('Please provide the Next of Kin Name.');
        return false;
      }
      if (!nextOfKinRelationship.trim()) {
        setErrorMsg('Please specify the Next of Kin Relationship.');
        return false;
      }
      if (!nextOfKinPhone.trim()) {
        setErrorMsg('Please provide the Next of Kin Phone Number.');
        return false;
      }
      if (!nextOfKinAddress.trim()) {
        setErrorMsg('Please provide the Next of Kin Residential Address.');
        return false;
      }
    }

    if (currentStep === 5) {
      const activeBank = commercialBank === 'Other Commercial Bank' ? customBankName : commercialBank;
      if (!activeBank.trim()) {
        setErrorMsg('Please select or specify your Commercial Bank.');
        return false;
      }
      if (!accountNumber.trim() || accountNumber.trim().length !== 10) {
        setErrorMsg('Please enter a valid 10-digit NUBAN Account Number.');
        return false;
      }
      if (!accountName.trim()) {
        setErrorMsg('Please provide the Account Name registered with the bank.');
        return false;
      }
      if (!alertPhoneNumber.trim()) {
        setErrorMsg('Please provide the Alert Phone Number linked to the account.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Submission handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Validate all sections
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }

    // Validate Signature
    const activeSignature = signatureDataUrl || typedSignature.trim();
    if (!activeSignature) {
      setErrorMsg('Please provide your Signature (either draw on the canvas or type your legal full name).');
      return;
    }

    // Validate Consent
    if (!privacyConsent) {
      setErrorMsg('Please confirm the declaration and NDPR authorization check below.');
      return;
    }

    setLoading(true);

    const activeBank = commercialBank === 'Other Commercial Bank' ? (customBankName.trim() || 'Other Commercial Bank') : commercialBank;
    const nameParts = contactName.trim().split(' ');
    const firstName = nameParts[0] || 'Applicant';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const numericAmount = Number(amount) || 5000000;

    const payload = {
      applicant_type: 'BUSINESS' as const,
      requested_amount: numericAmount,
      applicant_info: {
        first_name: firstName,
        last_name: lastName,
        contact_name: contactName.trim(),
        email: email.trim(),
        phone: phoneNumber.trim(),
        state_location: 'Lagos State',
        loan_category: 'Requirement for SME Loan (Limited Liability)',
        financing_purpose: purposeForLoan.trim(),
        additional_notes: `Nature of business: ${natureOfBusiness.trim()}`,
        // SME Loan (Limited Liability) Specific Fields
        business_name: businessName.trim(),
        cac_number: cacNumber.trim(),
        business_type: 'LTD',
        nature_of_business: natureOfBusiness.trim(),
        purpose_for_loan: purposeForLoan.trim(),
        amount: numericAmount,
        bvn: bvn.trim(),
        dob: dob,
        signature: activeSignature,
        signature_type: signatureDataUrl ? 'drawn' : 'typed',
        guarantor_nin: guarantorNin.trim(),
        business_address: businessAddress.trim(),
        residential_address: residentialAddress.trim(),
        business_branches: Number(businessBranches) || 1,
        number_of_employees: Number(numberOfEmployees) || 1,
        business_period_years: Number(businessPeriodYears) || 1,
        years_operating: Number(businessPeriodYears) || 1,
        premises_status: premisesStatus,
        applicant_nin: applicantNin.trim(),
        applicant_tin: applicantTin.trim(),
        next_of_kin_name: nextOfKinName.trim(),
        next_of_kin_relationship: nextOfKinRelationship.trim(),
        next_of_kin_phone: nextOfKinPhone.trim(),
        next_of_kin_address: nextOfKinAddress.trim(),
        utility_bill: utilityBillData || utilityBillType,
        utility_bill_file_name: utilityBillFileName || `${utilityBillType}.pdf`,
        commercial_bank: activeBank,
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        alert_phone_number: alertPhoneNumber.trim()
      }
    };

    // Forward to Formspree endpoint with clear labeled questions
    const sendToFormspree = async (refNumber: string) => {
      try {
        const formspreePayload = {
          reference_number: refNumber,
          loan_category: 'Requirement for SME Loan (Limited Liability)',
          'Business Name': businessName.trim(),
          'CAC Number': cacNumber.trim(),
          'Contact Name': contactName.trim(),
          'Phone Number': phoneNumber.trim(),
          'Email': email.trim(),
          'Amount': `₦${numericAmount.toLocaleString()}`,
          'Purpose for Loan (in details)': purposeForLoan.trim(),
          'Nature of Business (in details)': natureOfBusiness.trim(),
          'BVN': bvn.trim(),
          'Date of birth': dob,
          'Signature': activeSignature ? (signatureDataUrl ? 'Drawn Signature Provided' : `Typed: ${typedSignature}`) : 'None',
          "guarantor's NIN": guarantorNin.trim(),
          'Business Address': businessAddress.trim(),
          'Residential Address': residentialAddress.trim(),
          'Number of Business Branches': businessBranches,
          'Number of Employees': numberOfEmployees,
          'Business Period (Years)': businessPeriodYears,
          'Is your business premises rented or owned': premisesStatus,
          'Applicant NIN': applicantNin.trim(),
          'Applicant TIN': applicantTin.trim(),
          'Next of kin Name': nextOfKinName.trim(),
          'Next of kin Relationship': nextOfKinRelationship.trim(),
          'Next of kin phone number': nextOfKinPhone.trim(),
          'Next of kin Address': nextOfKinAddress.trim(),
          'Utility Bill': utilityBillFileName || utilityBillType,
          'Commercial Bank': activeBank,
          'Account Number': accountNumber.trim(),
          'Account Name': accountName.trim(),
          'Alert Phone Number': alertPhoneNumber.trim(),
          'Submitted At': new Date().toLocaleString(),
          'Portal Source': 'AkoFinanced It - SME Loan (Limited Liability) Application Portal'
        };

        await fetch('https://formspree.io/f/xoeaydaz', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(formspreePayload)
        });
      } catch (err) {
        console.warn('[Formspree Notice]', err);
      }
    };

    try {
      const res = await api.submitApplication(payload);
      // Trigger Formspree webhook asynchronously in background so applicant is not delayed
      sendToFormspree(res.reference_number).catch((e) => console.warn('[Formspree async]', e));
      setLoading(false);
      if (onCompleted) {
        onCompleted(res.reference_number, res.application || payload);
      }
    } catch (apiErr: any) {
      // Offline fallback: generate reference code and proceed to confirmation
      try {
        const fallbackRef = `AKO-${Math.floor(100000 + Math.random() * 900000)}`;
        sendToFormspree(fallbackRef).catch((e) => console.warn('[Formspree async]', e));
        setLoading(false);
        if (onCompleted) {
          onCompleted(fallbackRef, payload);
        }
      } catch (fallbackErr) {
        setLoading(false);
        setErrorMsg(apiErr?.message || 'Failed to submit application. Please check your network connection.');
      }
    }
  };

  const stepsList = [
    { num: 1, title: 'Business Profile', icon: Building2 },
    { num: 2, title: 'Loan Details', icon: DollarSign },
    { num: 3, title: 'Applicant KYC', icon: User },
    { num: 4, title: 'Guarantor & Kin', icon: Users },
    { num: 5, title: 'Bank & Utility', icon: CreditCard },
    { num: 6, title: 'Signature', icon: PenTool }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[16px] border border-slate-200 shadow-2xl p-6 sm:p-10 my-6 font-sans">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[#EFF4FF] border border-[#2D62FF]/30 text-[#2D62FF] text-xs font-bold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-[#2D62FF]" />
            <span>Corporate Credit Facility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B0B0F] tracking-tight">
            Requirement for SME Loan (Limited Liability)
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5F71] mt-1.5 leading-relaxed max-w-2xl">
            Please complete the following corporate underwriting questionnaire and KYC verification details for your Limited Liability entity.
          </p>
        </div>

        {/* View Mode Toggle / Switch */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          {onSwitchToIndividual && (
            <button
              type="button"
              onClick={onSwitchToIndividual}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold text-[#5A5F71] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Apply as Individual
            </button>
          )}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'stepper' ? 'single' : 'stepper')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-bold text-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF]/15 transition-colors cursor-pointer border border-[#2D62FF]/20"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{viewMode === 'stepper' ? 'View All Fields' : 'Step-by-Step Flow'}</span>
          </button>
        </div>
      </div>

      {/* Stepper Progress Navigation (Visible in Stepper Mode) */}
      {viewMode === 'stepper' && (
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isPassed = step > s.num;
              const isCurrent = step === s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num <= step) setStep(s.num);
                  }}
                  className={`p-2.5 rounded-[12px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'border-[#2D62FF] bg-[#EFF4FF] ring-2 ring-[#2D62FF]/20 shadow-xs'
                      : isPassed
                      ? 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
                      : 'border-slate-200 bg-white opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#8F95A5]">0{s.num}</span>
                    {isPassed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#2D62FF]' : 'text-[#8F95A5]'}`} />
                    )}
                  </div>
                  <span className={`text-[11px] font-bold truncate ${isCurrent ? 'text-[#2D62FF]' : 'text-[#0B0B0F]'}`}>
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2D62FF] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 font-semibold">{errorMsg}</div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        
        {/* ================= STEP 1: BUSINESS IDENTITY & OPERATIONS ================= */}
        {(viewMode === 'single' || step === 1) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">1. Business Profile & Corporate Information</h2>
                <p className="text-xs text-[#5A5F71]">Official Registered Company Data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Business Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Tech Solutions Ltd"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  CAC Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cacNumber}
                  onChange={(e) => setCacNumber(e.target.value)}
                  placeholder="e.g. RC-1849204"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm font-mono text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Nature of Business (in details): <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={natureOfBusiness}
                  onChange={(e) => setNatureOfBusiness(e.target.value)}
                  placeholder="Describe your core commercial operations, products/services, clients, and industry in details..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs sm:text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Business Period (Years): <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={businessPeriodYears}
                  onChange={(e) => setBusinessPeriodYears(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Number of Business Branches: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={businessBranches}
                  onChange={(e) => setBusinessBranches(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Number of Employees: <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={numberOfEmployees}
                  onChange={(e) => setNumberOfEmployees(e.target.value)}
                  placeholder="e.g. 12"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Is your business premises rented or owned: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Rented', 'Owned', 'Leased'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPremisesStatus(opt)}
                      className={`py-3 px-2 rounded-[10px] text-xs font-bold border transition-all cursor-pointer ${
                        premisesStatus === opt
                          ? 'border-[#2D62FF] bg-[#EFF4FF] text-[#2D62FF]'
                          : 'border-slate-200 bg-white text-[#5A5F71] hover:border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Business Address: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Registered physical office / facility location..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs sm:text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: LOAN AMOUNT & PURPOSE ================= */}
        {(viewMode === 'single' || step === 2) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">2. Loan Amount & Deployment Purpose</h2>
                <p className="text-xs text-[#5A5F71]">Facility size and operational requirements</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Amount: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-base font-bold text-[#0B0B0F]">₦</span>
                  <input
                    type="number"
                    min={100000}
                    step={100000}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="5,000,000"
                    className="w-full pl-8 pr-4 py-3 rounded-[10px] border border-slate-200 text-lg font-black text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[2000000, 5000000, 10000000, 20000000, 50000000].map((quickAmt) => (
                    <button
                      key={quickAmt}
                      type="button"
                      onClick={() => setAmount(quickAmt)}
                      className="px-2.5 py-1 rounded-[8px] bg-slate-100 hover:bg-[#EFF4FF] hover:text-[#2D62FF] text-[11px] font-bold text-[#5A5F71] transition-colors cursor-pointer"
                    >
                      ₦{quickAmt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Purpose for Loan (in details): <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={purposeForLoan}
                  onChange={(e) => setPurposeForLoan(e.target.value)}
                  placeholder="Detail exactly how the requested financing will be utilized (e.g. inventory stocking, industrial equipment purchase, contract execution, working capital)..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs sm:text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: APPLICANT & DIRECTOR KYC ================= */}
        {(viewMode === 'single' || step === 3) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">3. Applicant & Director KYC Verification</h2>
                <p className="text-xs text-[#5A5F71]">Identity records of the principal applicant / director</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Contact Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Full legal name of Director / Applicant"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Phone Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="08012345678"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Email: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@business.com"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Date of birth: <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  BVN: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                  placeholder="11-digit Bank Verification Number"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm font-mono text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Applicant NIN: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={applicantNin}
                  onChange={(e) => setApplicantNin(e.target.value.replace(/\D/g, ''))}
                  placeholder="11-digit National Identity Number"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm font-mono text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Applicant TIN: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={applicantTin}
                  onChange={(e) => setApplicantTin(e.target.value)}
                  placeholder="Tax Identification Number (FIRS/JTB)"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm font-mono text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Residential Address: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={residentialAddress}
                  onChange={(e) => setResidentialAddress(e.target.value)}
                  placeholder="Residential address of director / applicant..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs sm:text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: GUARANTOR & NEXT OF KIN ================= */}
        {(viewMode === 'single' || step === 4) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">4. Guarantor & Next of Kin Information</h2>
                <p className="text-xs text-[#5A5F71]">Credit guarantor and emergency contact requirements</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Guarantor's NIN: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={guarantorNin}
                  onChange={(e) => setGuarantorNin(e.target.value.replace(/\D/g, ''))}
                  placeholder="11-digit NIN of corporate guarantor"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm font-mono text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-xs font-extrabold text-[#0B0B0F] uppercase tracking-wider text-[#2D62FF]">
                  Next of Kin Details:
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Next of kin Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nextOfKinName}
                  onChange={(e) => setNextOfKinName(e.target.value)}
                  placeholder="Full name of Next of Kin"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Next of kin Relationship: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nextOfKinRelationship}
                  onChange={(e) => setNextOfKinRelationship(e.target.value)}
                  placeholder="e.g. Spouse, Sibling, Child, Business Partner"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Next of kin Phone number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={nextOfKinPhone}
                  onChange={(e) => setNextOfKinPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Next of kin Address: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={nextOfKinAddress}
                  onChange={(e) => setNextOfKinAddress(e.target.value)}
                  placeholder="Residential address of next of kin..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs sm:text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: BANKING & UTILITY BILL ================= */}
        {(viewMode === 'single' || step === 5) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">5. Commercial Bank & Utility Verification</h2>
                <p className="text-xs text-[#5A5F71]">Operating corporate bank account and utility bill proof of address</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Commercial Bank: <span className="text-red-500">*</span>
                </label>
                <select
                  value={commercialBank}
                  onChange={(e) => setCommercialBank(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                >
                  {NIGERIAN_COMMERCIAL_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {commercialBank === 'Other Commercial Bank' && (
                <div>
                  <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                    Specify Bank Name: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Enter name of commercial bank"
                    className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Account Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit NUBAN Corporate Account"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm font-mono text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Account Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Account name matching CAC registration"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Alert Phone Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={alertPhoneNumber}
                  onChange={(e) => setAlertPhoneNumber(e.target.value)}
                  placeholder="Phone number registered for account alerts"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              {/* Utility Bill Section */}
              <div className="sm:col-span-2 pt-2 border-t border-slate-200/60 space-y-3">
                <label className="block text-xs font-bold text-[#0B0B0F]">
                  Utility Bill: <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5F71] mb-1">Bill Category</label>
                    <select
                      value={utilityBillType}
                      onChange={(e) => setUtilityBillType(e.target.value)}
                      className="w-full p-2.5 rounded-[10px] border border-slate-200 text-xs text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                    >
                      {UTILITY_BILL_TYPES.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5A5F71] mb-1">
                      Upload Utility Document (PDF, PNG, JPG)
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full p-2.5 rounded-[10px] border border-dashed border-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF]/15 text-xs font-bold text-[#2D62FF] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{utilityBillFileName ? 'Replace Uploaded Bill' : 'Select / Upload Utility Bill'}</span>
                    </button>
                  </div>
                </div>

                {utilityBillFileName && (
                  <div className="flex items-center justify-between p-3 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">{utilityBillFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUtilityBillFileName('');
                        setUtilityBillData('');
                      }}
                      className="text-red-600 hover:text-red-800 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: SIGNATURE & DECLARATION ================= */}
        {(viewMode === 'single' || step === 6) && (
          <div className="space-y-6 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <PenTool className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">6. Digital Signature & Legal Affirmation</h2>
                <p className="text-xs text-[#5A5F71]">Official authorization and regulatory underwriting consent</p>
              </div>
            </div>

            {/* Quick Summary Review Card */}
            <div className="bg-white p-5 rounded-[12px] border border-slate-200 text-xs space-y-2.5 shadow-xs">
              <h3 className="font-extrabold text-sm text-[#0B0B0F] pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Application Summary Overview</span>
                <span className="text-xs font-bold text-[#2D62FF] bg-[#EFF4FF] px-2.5 py-0.5 rounded-full">
                  Limited Liability (LTD)
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
                <div><strong>Business:</strong> {businessName || '—'} (RC: {cacNumber || '—'})</div>
                <div><strong>Requested Amount:</strong> ₦{Number(amount).toLocaleString()}</div>
                <div><strong>Director / Contact:</strong> {contactName || '—'} ({phoneNumber || '—'})</div>
                <div><strong>Bank:</strong> {commercialBank === 'Other Commercial Bank' ? customBankName : commercialBank} ({accountNumber || '—'})</div>
                <div><strong>BVN:</strong> {bvn || '—'} • <strong>NIN:</strong> {applicantNin || '—'}</div>
                <div><strong>Guarantor NIN:</strong> {guarantorNin || '—'}</div>
                <div><strong>Next of Kin:</strong> {nextOfKinName || '—'} ({nextOfKinRelationship || '—'})</div>
                <div><strong>Utility Bill:</strong> {utilityBillFileName || utilityBillType}</div>
              </div>
            </div>

            {/* Digital Signature Pad */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#0B0B0F]">
                Signature: <span className="text-red-500">*</span>
              </label>

              <div className="bg-white p-4 rounded-[12px] border border-slate-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#5A5F71] flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-[#2D62FF]" />
                    <span>Draw your digital signature below:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearSignature}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span>Clear Pad</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-[10px] bg-slate-50/50 overflow-hidden relative touch-none">
                  <canvas
                    ref={canvasRef}
                    width={560}
                    height={160}
                    onMouseDown={handleStartDraw}
                    onMouseMove={handleDraw}
                    onMouseUp={handleStopDraw}
                    onMouseLeave={handleStopDraw}
                    onTouchStart={handleStartDraw}
                    onTouchMove={handleDraw}
                    onTouchEnd={handleStopDraw}
                    className="w-full h-36 bg-white cursor-crosshair block"
                  />
                  {!signatureDataUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-semibold">
                      Sign here with finger, mouse, or stylus
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] font-bold text-[#5A5F71] mb-1">
                    Or Type Authorized Director Full Legal Name as Electronic Signature:
                  </label>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="e.g. Chief Babatunde Adeleke"
                    className="w-full p-2.5 rounded-[8px] border border-slate-200 text-xs font-semibold text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                  />
                </div>
              </div>
            </div>

            {/* NDPR & Truthfulness Consent */}
            <label className="flex items-start gap-3 p-4 rounded-[12px] bg-[#EFF4FF] border border-[#2D62FF]/30 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#2D62FF] rounded accent-[#2D62FF] shrink-0"
              />
              <span className="text-xs text-[#5A5F71] leading-relaxed">
                I hereby declare that all information provided in this <strong>Requirement for SME Loan (Limited Liability)</strong> application is authentic, valid, and lawful under the laws of the Federal Republic of Nigeria. I authorize AkoFinanced It and its licensed institutional financing partners to verify the BVN, NIN, CAC registration, and financial details provided in compliance with the Nigeria Data Protection Act (NDPA) and NDPR guidelines.
              </span>
            </label>
          </div>
        )}

        {/* Action Controls & Navigation */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
          {viewMode === 'stepper' && step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] border border-slate-200 text-xs font-semibold text-[#5A5F71] hover:bg-gray-50 cursor-pointer active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            onCancel ? (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-[#5A5F71] hover:text-[#0B0B0F] cursor-pointer"
              >
                Cancel
              </button>
            ) : <div />
          )}

          {viewMode === 'stepper' && step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#2D62FF] text-white text-xs font-bold shadow-md hover:bg-[#1a4edf] cursor-pointer transition-all active:scale-95"
            >
              <span>Continue to Step 0{step + 1}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => handleSubmit(e)}
              disabled={loading}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-[12px] font-extrabold text-sm shadow-xl transition-all cursor-pointer ${
                privacyConsent && !loading
                  ? 'bg-[#2D62FF] text-white hover:bg-[#1a4edf] hover:shadow-2xl active:scale-95'
                  : 'bg-[#2D62FF]/85 text-white hover:bg-[#2D62FF] active:scale-95 ring-2 ring-[#2D62FF]/30'
              } ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Submitting SME Application...</span>
                </>
              ) : (
                <>
                  <span>Submit SME Loan Application</span>
                  <Check className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>

      </form>

    </div>
  );
};
