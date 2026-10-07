import React, { useState } from 'react';
import {
  User,
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Briefcase,
  FileText,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { api } from '../lib/api';
import { SmeLoanWizard } from './SmeLoanWizard';
import { PersonalLoanWizard } from './PersonalLoanWizard';

interface ApplicationWizardProps {
  initialType?: 'INDIVIDUAL' | 'BUSINESS';
  initialData?: {
    applicantType?: 'INDIVIDUAL' | 'BUSINESS';
    amount?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  onSubmitted?: (refNum: string, appData: any) => void;
  onCompleted?: (refNum: string, appData: any) => void;
  onCancel?: () => void;
  onSwitchToBusiness?: () => void;
}

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({
  initialType,
  initialData,
  onSubmitted,
  onCompleted,
  onCancel
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [applicantType, setApplicantType] = useState<'INDIVIDUAL' | 'BUSINESS'>(
    initialType || initialData?.applicantType || 'INDIVIDUAL'
  );
  const [financingPurpose, setFinancingPurpose] = useState<string>(
    applicantType === 'INDIVIDUAL' ? 'Personal Asset & Working Capital' : 'SME Working Capital & Inventory'
  );
  const [requestedAmount, setRequestedAmount] = useState<number>(
    initialData?.amount || (applicantType === 'INDIVIDUAL' ? 1000000 : 5000000)
  );

  // Individual fields
  const [employmentStatus, setEmploymentStatus] = useState<string>('Salaried');
  const [employerName, setEmployerName] = useState<string>('');
  const [monthlyIncome, setMonthlyIncome] = useState<number>(500000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(180000);
  const [existingLoans, setExistingLoans] = useState<number>(0);

  // Business fields
  const [businessName, setBusinessName] = useState<string>('');
  const [businessType, setBusinessType] = useState<string>('LTD');
  const [yearsOperating, setYearsOperating] = useState<number>(2);
  const [cacNumber, setCacNumber] = useState<string>('');
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(2500000);
  const [businessExpenses, setBusinessExpenses] = useState<number>(1500000);

  // Contact fields
  const [firstName, setFirstName] = useState<string>(initialData?.firstName || '');
  const [lastName, setLastName] = useState<string>(initialData?.lastName || '');
  const [email, setEmail] = useState<string>(initialData?.email || '');
  const [phone, setPhone] = useState<string>(initialData?.phone || '');
  const [stateLocation, setStateLocation] = useState<string>('Lagos State');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Consent
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);

  // If business applicant, delegate to the dedicated Requirement for SME Loan (Limited Liability) form
  if (applicantType === 'BUSINESS') {
    return (
      <SmeLoanWizard
        initialData={{
          ...initialData,
          businessName,
          cacNumber,
          firstName,
          lastName,
          contact_name: firstName || lastName ? `${firstName} ${lastName}`.trim() : undefined,
          email,
          phone,
          amount: requestedAmount,
          financingPurpose
        }}
        onCompleted={(ref, data) => {
          if (onCompleted) onCompleted(ref, data);
          if (onSubmitted) onSubmitted(ref, data);
        }}
        onCancel={onCancel}
        onSwitchToIndividual={() => setApplicantType('INDIVIDUAL')}
      />
    );
  }

  // If individual applicant, delegate to the dedicated Personal Loan requirements form
  if (applicantType === 'INDIVIDUAL') {
    return (
      <PersonalLoanWizard
        initialData={{
          ...initialData,
          fullName: firstName || lastName ? `${firstName} ${lastName}`.trim() : undefined,
          firstName,
          lastName,
          email,
          phone,
          amount: requestedAmount,
          employer_name: employerName,
          monthly_income: monthlyIncome
        }}
        onCompleted={(ref, data) => {
          if (onCompleted) onCompleted(ref, data);
          if (onSubmitted) onSubmitted(ref, data);
        }}
        onCancel={onCancel}
        onSwitchToBusiness={() => setApplicantType('BUSINESS')}
      />
    );
  }

  const totalSteps = 7;

  const handleNextStep = () => {
    setErrorMsg(null);

    if (step === 1) {
      if (!applicantType) {
        setErrorMsg('Please select whether you are an Individual or a Business.');
        return;
      }
    }

    if (step === 2) {
      if (!financingPurpose || financingPurpose.trim().length < 3) {
        setErrorMsg('Please select or specify your financing purpose.');
        return;
      }
    }

    if (step === 3) {
      if (!requestedAmount || requestedAmount < 10000) {
        setErrorMsg('Requested amount must be at least ₦10,000.');
        return;
      }
    }

    if (step === 4) {
      if (applicantType === 'INDIVIDUAL') {
        if (!monthlyIncome || monthlyIncome <= 0) {
          setErrorMsg('Please state your average monthly income.');
          return;
        }
      } else {
        if (!businessName || businessName.trim().length < 2) {
          setErrorMsg('Please enter your registered business name.');
          return;
        }
        if (!monthlyRevenue || monthlyRevenue <= 0) {
          setErrorMsg('Please state your average monthly business revenue.');
          return;
        }
      }
    }

    if (step === 5) {
      if (!firstName || !lastName) {
        setErrorMsg('Please enter your first and last name.');
        return;
      }
      if (!email || !email.includes('@')) {
        setErrorMsg('Please enter a valid email address.');
        return;
      }
      if (!phone || phone.length < 8) {
        setErrorMsg('Please enter a valid phone number.');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    // Pre-flight check: validate contact info
    if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
      setStep(5);
      setErrorMsg('Please enter your first and last name before submitting.');
      return;
    }
    if (!email || !email.includes('@')) {
      setStep(5);
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!phone || phone.trim().length < 7) {
      setStep(5);
      setErrorMsg('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    // Pre-flight check: validate applicant profile
    if (applicantType === 'BUSINESS') {
      if (!businessName || !businessName.trim()) {
        setStep(4);
        setErrorMsg('Please enter your registered business name.');
        return;
      }
      if (!monthlyRevenue || monthlyRevenue <= 0) {
        setStep(4);
        setErrorMsg('Please state your average monthly business revenue.');
        return;
      }
    } else {
      if (!monthlyIncome || monthlyIncome <= 0) {
        setStep(4);
        setErrorMsg('Please state your average monthly income.');
        return;
      }
    }

    // Pre-flight check: validate amount & purpose
    if (!requestedAmount || requestedAmount < 10000) {
      setStep(3);
      setErrorMsg('Requested financing amount must be at least ₦10,000.');
      return;
    }
    if (!financingPurpose || financingPurpose.trim().length < 3) {
      setStep(2);
      setErrorMsg('Please specify your financing purpose.');
      return;
    }

    // Consent check
    if (!privacyConsent) {
      setErrorMsg('Please check the consent box below to authorize NDPR credit review & partner matching.');
      return;
    }

    setLoading(true);

    const payload = {
      applicant_type: applicantType,
      requested_amount: requestedAmount,
      applicant_info: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        state_location: stateLocation || 'Lagos State',
        employment_status: applicantType === 'INDIVIDUAL' ? employmentStatus : undefined,
        employer_name: applicantType === 'INDIVIDUAL' ? employerName : undefined,
        monthly_income: applicantType === 'INDIVIDUAL' ? monthlyIncome : undefined,
        monthly_expenses: applicantType === 'INDIVIDUAL' ? monthlyExpenses : undefined,
        existing_loans: existingLoans,
        business_name: applicantType === 'BUSINESS' ? businessName.trim() : undefined,
        business_type: applicantType === 'BUSINESS' ? businessType : undefined,
        years_operating: applicantType === 'BUSINESS' ? yearsOperating : undefined,
        monthly_revenue: applicantType === 'BUSINESS' ? monthlyRevenue : undefined,
        business_expenses: applicantType === 'BUSINESS' ? businessExpenses : undefined,
        cac_number: applicantType === 'BUSINESS' ? cacNumber.trim() : undefined,
        financing_purpose: financingPurpose.trim(),
        additional_notes: additionalNotes.trim()
      }
    };

const FORMSPREE_FINANCING_ENDPOINT = 'https://formspree.io/f/xoeaydaz';

const sendToFormspree = async (referenceNumber: string, payloadData: any) => {
  try {
    const formspreePayload: Record<string, any> = {
      reference_number: referenceNumber,
      applicant_type: payloadData.applicant_type,
      requested_amount: `₦${Number(payloadData.requested_amount).toLocaleString()}`,
      financing_purpose: payloadData.applicant_info.financing_purpose,
      applicant_name: `${payloadData.applicant_info.first_name} ${payloadData.applicant_info.last_name}`,
      email: payloadData.applicant_info.email,
      phone: payloadData.applicant_info.phone,
      state_location: payloadData.applicant_info.state_location,
      notes: payloadData.applicant_info.additional_notes || 'None',
      submitted_at: new Date().toLocaleString(),
      portal_source: 'AkoFinanced It Web Financing Request Wizard'
    };

    if (payloadData.applicant_type === 'INDIVIDUAL') {
      formspreePayload.employment_status = payloadData.applicant_info.employment_status || 'N/A';
      formspreePayload.employer_name = payloadData.applicant_info.employer_name || 'N/A';
      formspreePayload.monthly_income = payloadData.applicant_info.monthly_income ? `₦${Number(payloadData.applicant_info.monthly_income).toLocaleString()}` : 'N/A';
      formspreePayload.monthly_expenses = payloadData.applicant_info.monthly_expenses ? `₦${Number(payloadData.applicant_info.monthly_expenses).toLocaleString()}` : 'N/A';
      formspreePayload.existing_monthly_loans = payloadData.applicant_info.existing_loans ? `₦${Number(payloadData.applicant_info.existing_loans).toLocaleString()}` : '0';
    } else {
      formspreePayload.business_name = payloadData.applicant_info.business_name || 'N/A';
      formspreePayload.business_type = payloadData.applicant_info.business_type || 'N/A';
      formspreePayload.cac_number = payloadData.applicant_info.cac_number || 'N/A';
      formspreePayload.years_operating = payloadData.applicant_info.years_operating || 'N/A';
      formspreePayload.monthly_revenue = payloadData.applicant_info.monthly_revenue ? `₦${Number(payloadData.applicant_info.monthly_revenue).toLocaleString()}` : 'N/A';
      formspreePayload.business_expenses = payloadData.applicant_info.business_expenses ? `₦${Number(payloadData.applicant_info.business_expenses).toLocaleString()}` : 'N/A';
    }

    await fetch(FORMSPREE_FINANCING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(formspreePayload)
    });
  } catch (e) {
    console.warn('[Formspree] Notice dispatching financing request:', e);
  }
};

    try {
      const res = await api.submitApplication(payload);
      // Dispatch full payload to Formspree delivery endpoint
      await sendToFormspree(res.reference_number, payload);

      setLoading(false);
      if (onSubmitted) {
        onSubmitted(res.reference_number, res.application);
      }
      if (onCompleted) {
        onCompleted(res.reference_number, res.application);
      }
    } catch (err: any) {
      // Fallback: If local API has connection issues, still deliver to Formspree
      try {
        const fallbackRef = `AKO-${Math.floor(100000 + Math.random() * 900000)}`;
        await sendToFormspree(fallbackRef, payload);
        setLoading(false);
        if (onSubmitted) {
          onSubmitted(fallbackRef, payload);
        }
        if (onCompleted) {
          onCompleted(fallbackRef, payload);
        }
        return;
      } catch (fallbackErr) {
        // Both failed
      }
      setLoading(false);
      setErrorMsg(err.message || 'Failed to submit financing application. Please check your network and retry.');
    }
  };

  const individualPurposes = [
    'Personal Asset & Vehicle Finance',
    'Salary Advance / Emergency Expenses',
    'Home Renovation / Appliance Acquisition',
    'Education & Professional Certification Fees',
    'Medical or Family Emergency Support'
  ];

  const businessPurposes = [
    'SME Working Capital & Inventory Purchase',
    'Invoice Discounting / Contract Pre-Financing',
    'Commercial Machinery & Equipment Purchase',
    'Retail Outlet Expansion & Facility Upgrade',
    'Trade Finance & Importation Support'
  ];

  const states = [
    'Lagos State',
    'Abuja (FCT)',
    'Rivers State',
    'Oyo State',
    'Ogun State',
    'Kano State',
    'Enugu State',
    'Delta State',
    'Kaduna State',
    'Edo State',
    'Anambra State',
    'Other State in Nigeria'
  ];

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[12px] border border-slate-200 shadow-2xl p-6 sm:p-10 my-8">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
        <div>
          <span className="text-xs font-bold text-[#2D62FF] bg-[#EFF4FF] px-3 py-1 rounded-[12px] uppercase tracking-wider">
            Step {step} of {totalSteps}
          </span>
          <h2 className="text-2xl font-extrabold text-[#0B0B0F] mt-2">
            Financing Application Support
          </h2>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-50 border border-slate-200 h-2.5 rounded-[12px] mb-8 overflow-hidden">
        <div
          className="bg-[#2D62FF] h-full transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={(e) => e.preventDefault()}>
        
        {/* STEP 1: Applicant Type */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F]">Step 1: Are you applying as an Individual or Business?</h3>
              <p className="text-xs text-[#5A5F71] mt-1">
                Select your category so we can match you with appropriate personal or corporate credit products.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setApplicantType('INDIVIDUAL')}
                className={`cursor-pointer rounded-[12px] p-6 border-2 transition-all flex flex-col justify-between ${
                  applicantType === 'INDIVIDUAL'
                    ? 'border-[#2D62FF] bg-[#EFF4FF] shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#8F95A5]'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-[12px] bg-[#0B0B0F] text-[#2D62FF] flex items-center justify-center mb-4">
                    <User className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-base text-[#0B0B0F]">Individual Applicant</h4>
                  <p className="text-xs text-[#5A5F71] mt-1">
                    For salaried employees, self-employed professionals, asset acquisition, or personal loans.
                  </p>
                </div>
                {applicantType === 'INDIVIDUAL' && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#2D62FF]">
                    <Check className="w-4 h-4" /> Selected
                  </div>
                )}
              </div>

              <div
                onClick={() => setApplicantType('BUSINESS')}
                className={`cursor-pointer rounded-[12px] p-6 border-2 transition-all flex flex-col justify-between ${
                  applicantType === 'BUSINESS'
                    ? 'border-[#2D62FF] bg-[#EFF4FF] shadow-md'
                    : 'border-slate-200 bg-white hover:border-[#8F95A5]'
                }`}
              >
                <div>
                  <div className="w-12 h-12 rounded-[12px] bg-[#0B0B0F] text-[#2D62FF] flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-base text-[#0B0B0F]">Registered Business / SME</h4>
                  <p className="text-xs text-[#5A5F71] mt-1">
                    For corporate working capital, inventory expansion, equipment leasing, or invoice discounting.
                  </p>
                </div>
                {applicantType === 'BUSINESS' && (
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#2D62FF]">
                    <Check className="w-4 h-4" /> Selected
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Financing Purpose */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F]">Step 2: What is your financing purpose?</h3>
              <p className="text-xs text-[#5A5F71] mt-1">
                Lenders evaluate financing requests based on specific use of funds.
              </p>
            </div>

            <div className="space-y-2.5">
              {(applicantType === 'INDIVIDUAL' ? individualPurposes : businessPurposes).map((purpose) => (
                <div
                  key={purpose}
                  onClick={() => setFinancingPurpose(purpose)}
                  className={`cursor-pointer p-4 rounded-[12px] border transition-all flex items-center justify-between ${
                    financingPurpose === purpose
                      ? 'border-[#2D62FF] bg-[#EFF4FF] font-bold text-[#0B0B0F]'
                      : 'border-slate-200 bg-white text-[#5A5F71] hover:border-[#8F95A5]'
                  }`}
                >
                  <span className="text-sm">{purpose}</span>
                  {financingPurpose === purpose && <Check className="w-5 h-5 text-[#2D62FF]" />}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A5F71] mb-1">
                Or describe custom financing requirements (Optional)
              </label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Give us a brief overview of your specific need..."
                className="w-full p-3 rounded-[12px] border border-slate-200 text-xs focus:outline-none focus:border-[#2D62FF]"
              ></textarea>
            </div>
          </div>
        )}

        {/* STEP 3: Requested Amount */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F]">Step 3: How much financing do you request?</h3>
              <p className="text-xs text-[#5A5F71] mt-1">
                State the amount in Nigerian Naira (₦).
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[12px] border border-slate-200 space-y-4">
              <label className="block text-xs font-bold text-[#8F95A5] uppercase">Requested Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-lg font-bold text-[#0B0B0F]">₦</span>
                <input
                  type="number"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-3 rounded-[12px] border border-slate-200 text-xl font-extrabold text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                />
              </div>

              <input
                type="range"
                min={applicantType === 'INDIVIDUAL' ? 50000 : 500000}
                max={applicantType === 'INDIVIDUAL' ? 10000000 : 100000000}
                step={applicantType === 'INDIVIDUAL' ? 50000 : 500000}
                value={requestedAmount}
                onChange={(e) => setRequestedAmount(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-[12px] appearance-none cursor-pointer accent-[#2D62FF]"
              />

              <div className="flex justify-between text-xs text-[#8F95A5]">
                <span>Min: ₦{(applicantType === 'INDIVIDUAL' ? 50000 : 500000).toLocaleString()}</span>
                <span>Max: ₦{(applicantType === 'INDIVIDUAL' ? 10000000 : 100000000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Financial & Profile Info */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F]">
                Step 4: {applicantType === 'INDIVIDUAL' ? 'Personal Financial Profile' : 'Business Financial Profile'}
              </h3>
              <p className="text-xs text-[#5A5F71] mt-1">
                This preliminary information helps calculate your debt service ratio and preliminary credit readiness.
              </p>
            </div>

            {applicantType === 'INDIVIDUAL' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Employment Status *</label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  >
                    <option value="Salaried">Salaried Employee (Private / Public)</option>
                    <option value="Self-Employed">Self-Employed Professional</option>
                    <option value="Business Owner">Small Business Owner</option>
                    <option value="Contractor">Contractor / Freelancer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Employer or Business Name</label>
                  <input
                    type="text"
                    value={employerName}
                    onChange={(e) => setEmployerName(e.target.value)}
                    placeholder="e.g. Acme Tech Nigeria"
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Average Monthly Income (₦) *</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm font-bold text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Monthly Expenses (₦)</label>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Existing Monthly Loan Repayments (₦)</label>
                  <input
                    type="number"
                    value={existingLoans}
                    onChange={(e) => setExistingLoans(Number(e.target.value))}
                    placeholder="0 if none"
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Registered Business Name *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Crown Bakery & Confectionery Ltd"
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Business Registration Type</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  >
                    <option value="LTD">Private Limited Company (LTD)</option>
                    <option value="Sole Proprietorship">Business Name / Sole Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Cooperative">Cooperative Society</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">CAC Registration No. (RC / BN)</label>
                  <input
                    type="text"
                    value={cacNumber}
                    onChange={(e) => setCacNumber(e.target.value)}
                    placeholder="e.g. RC-1849204"
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Years in Operation</label>
                  <input
                    type="number"
                    value={yearsOperating}
                    onChange={(e) => setYearsOperating(Number(e.target.value))}
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Average Monthly Revenue (₦) *</label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    className="w-full p-3 rounded-[12px] border border-slate-200 text-sm font-bold text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Contact Info */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F]">Step 5: Contact & Location Information</h3>
              <p className="text-xs text-[#5A5F71] mt-1">
                Where can our advisory team send application updates and lender matches?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A5F71] mb-1">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Emeka"
                  className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Okafor"
                  className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="emeka@example.com"
                  className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5A5F71] mb-1">Primary State Location in Nigeria</label>
                <select
                  value={stateLocation}
                  onChange={(e) => setStateLocation(e.target.value)}
                  className="w-full p-3 rounded-[12px] border border-slate-200 text-sm text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF] bg-white"
                >
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Initial Document Requirements */}
        {step === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F]">Step 6: Expected Information & Documents</h3>
              <p className="text-xs text-[#5A5F71] mt-1">
                You will be able to upload official PDFs or photos from your Customer Dashboard after submission.
              </p>
            </div>

            <div className="bg-[#EFF4FF] border border-[#2D62FF]/30 rounded-[12px] p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B0B0F]">
                <FileText className="w-5 h-5 text-[#2D62FF]" />
                <span>Required Checklist for {applicantType === 'INDIVIDUAL' ? 'Individual Loan' : 'Business SME Loan'}:</span>
              </div>
              <ul className="text-xs text-[#5A5F71] space-y-2 list-disc pl-5">
                {applicantType === 'INDIVIDUAL' ? (
                  <>
                    <li>6 months official bank statement showing monthly salary credits or business inflows.</li>
                    <li>Valid Government ID (NIN, Voter Card, Driver License, or International Passport).</li>
                    <li>Proof of employment or business registration.</li>
                  </>
                ) : (
                  <>
                    <li>12 months corporate bank statement.</li>
                    <li>CAC Registration Certificate & Status Report / MEMART.</li>
                    <li>Director Government Issued ID.</li>
                  </>
                )}
              </ul>
            </div>

            <div className="p-4 rounded-[12px] bg-gray-50 border border-gray-200 text-xs text-[#5A5F71] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#2D62FF] shrink-0" />
              <span>You don't need to upload files right now — submission generates your reference code immediately!</span>
            </div>
          </div>
        )}

        {/* STEP 7: Review & Consent */}
        {step === 7 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold text-[#0B0B0F]">Step 7: Final Review & Submission</h3>
              <p className="text-xs text-[#5A5F71] mt-1">
                Please verify your details before generating your unique reference number.
              </p>
            </div>

            {/* Application Summary Box */}
            <div className="bg-slate-50 p-5 rounded-[12px] border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-[#8F95A5]">Applicant Category:</span>
                <span className="font-bold text-[#0B0B0F]">{applicantType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-[#8F95A5]">Requested Financing:</span>
                <span className="font-extrabold text-[#2D62FF] text-sm">₦{requestedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-[#8F95A5]">Financing Purpose:</span>
                <span className="font-semibold text-[#0B0B0F]">{financingPurpose}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-[#8F95A5]">Applicant Name:</span>
                <span className="font-semibold text-[#0B0B0F]">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8F95A5]">Contact Email & Phone:</span>
                <span className="font-semibold text-[#0B0B0F]">{email} • {phone}</span>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 p-4 rounded-[12px] bg-[#EFF4FF] border border-[#2D62FF]/30 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#2D62FF] rounded accent-[#2D62FF]"
              />
              <span className="text-xs text-[#5A5F71] leading-relaxed">
                I acknowledge that AkoFinanced It is an advisory and application-support service, not a direct lender. I authorize AkoFinanced It to process my preliminary credit evaluation and present my information to relevant licensed financial partners in compliance with Nigeria Data Protection Regulation (NDPR).
              </span>
            </label>

          </div>
        )}

        {/* Bottom Error Display (Instant visibility right above buttons) */}
        {errorMsg && (
          <div className="mt-6 p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] border border-slate-200 text-xs font-semibold text-[#5A5F71] hover:bg-gray-50 cursor-pointer active:scale-95 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-3 rounded-[12px] bg-[#2D62FF] text-white text-xs font-bold shadow-md hover:bg-[#1a4edf] cursor-pointer transition-all active:scale-95"
            >
              <span>Continue</span>
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
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Submit Financing Request</span>
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
