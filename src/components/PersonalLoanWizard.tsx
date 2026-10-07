import React, { useState, useRef } from 'react';
import {
  User,
  Briefcase,
  CreditCard,
  DollarSign,
  Users,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Building,
  Home,
  MapPin,
  Mail,
  Phone,
  Eye,
  Loader2,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';

interface PersonalLoanWizardProps {
  initialData?: any;
  onCompleted?: (refNum: string, appData: any) => void;
  onCancel?: () => void;
  onSwitchToBusiness?: () => void;
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

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

export const PersonalLoanWizard: React.FC<PersonalLoanWizardProps> = ({
  initialData,
  onCompleted,
  onCancel,
  onSwitchToBusiness
}) => {
  const [step, setStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'stepper' | 'single'>('stepper');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ================= 1. PERSONAL INFORMATION =================
  const [fullName, setFullName] = useState<string>(
    initialData?.fullName ||
    (initialData?.firstName ? `${initialData.firstName} ${initialData?.lastName || ''}`.trim() : '')
  );
  const [gender, setGender] = useState<string>(initialData?.gender || 'Male');
  const [bvn, setBvn] = useState<string>(initialData?.bvn || '');
  const [nin, setNin] = useState<string>(initialData?.nin || initialData?.applicant_nin || '');
  const [dob, setDob] = useState<string>(initialData?.dob || '');
  const [residentialAddress, setResidentialAddress] = useState<string>(initialData?.residential_address || '');
  const [nearestLandmark, setNearestLandmark] = useState<string>(initialData?.nearest_landmark || '');
  const [phoneNumber, setPhoneNumber] = useState<string>(initialData?.phone || '');
  const [emailAddress, setEmailAddress] = useState<string>(initialData?.email || '');
  const [maritalStatus, setMaritalStatus] = useState<string>(initialData?.marital_status || 'Single');
  const [lga, setLga] = useState<string>(initialData?.lga || '');
  const [stateName, setStateName] = useState<string>(initialData?.state || 'Lagos');
  const [residentialStatus, setResidentialStatus] = useState<string>(initialData?.residential_status || 'Rented');
  const [moveInDate, setMoveInDate] = useState<string>(initialData?.residence_move_date || '');

  // ================= 2. EMPLOYMENT DETAILS =================
  const [employerName, setEmployerName] = useState<string>(initialData?.employer_name || '');
  const [officeAddress, setOfficeAddress] = useState<string>(initialData?.office_address || '');
  const [employmentStartDate, setEmploymentStartDate] = useState<string>(initialData?.employment_start_date || '');
  const [monthlyNetSalary, setMonthlyNetSalary] = useState<number | string>(initialData?.monthly_income || 350000);
  const [workEmailAddress, setWorkEmailAddress] = useState<string>(initialData?.work_email || '');
  const [jobRoleOrStaffId, setJobRoleOrStaffId] = useState<string>(initialData?.staff_id_or_job_role || '');
  const [workPhoneNumber, setWorkPhoneNumber] = useState<string>(initialData?.work_phone || '');

  // ================= 3. SALARY ACCOUNT DETAILS =================
  const [bankName, setBankName] = useState<string>(initialData?.salary_bank_name || 'Guaranty Trust Bank (GTBank)');
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>(initialData?.salary_account_number || '');
  const [alertPhoneNumber, setAlertPhoneNumber] = useState<string>(initialData?.alert_phone_number || '');

  // ================= 4. LOAN DETAILS =================
  const [loanAmount, setLoanAmount] = useState<number | string>(initialData?.amount || 1500000);
  const [loanTenor, setLoanTenor] = useState<string>(initialData?.loan_tenor || '12 Months');

  // ================= 5. NEXT OF KIN DETAILS =================
  const [nextOfKinName, setNextOfKinName] = useState<string>(initialData?.next_of_kin_name || '');
  const [nextOfKinHouseAddress, setNextOfKinHouseAddress] = useState<string>(initialData?.next_of_kin_address || '');
  const [nextOfKinEmail, setNextOfKinEmail] = useState<string>(initialData?.next_of_kin_email || '');
  const [nextOfKinRelationship, setNextOfKinRelationship] = useState<string>(initialData?.next_of_kin_relationship || 'Spouse');
  const [nextOfKinPhone, setNextOfKinPhone] = useState<string>(initialData?.next_of_kin_phone || '');

  // ================= 6. REQUIRED DOCUMENTS =================
  const [utilityBillFile, setUtilityBillFile] = useState<{ name: string; data: string } | null>(null);
  const [govIdFile, setGovIdFile] = useState<{ name: string; data: string } | null>(null);
  const [workIdFile, setWorkIdFile] = useState<{ name: string; data: string } | null>(null);
  const [payslipOrStatementFile, setPayslipOrStatementFile] = useState<{ name: string; data: string } | null>(null);

  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);

  // File input refs
  const utilityBillInputRef = useRef<HTMLInputElement | null>(null);
  const govIdInputRef = useRef<HTMLInputElement | null>(null);
  const workIdInputRef = useRef<HTMLInputElement | null>(null);
  const payslipInputRef = useRef<HTMLInputElement | null>(null);

  const totalSteps = 6;

  // File Reader Helper
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<{ name: string; data: string } | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Uploaded file exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter({
        name: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        data: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  // Step Validation
  const validateStep = (s: number): boolean => {
    setErrorMsg(null);

    if (s === 1) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your Full Name.');
        return false;
      }
      if (!bvn.trim() || bvn.trim().length !== 11) {
        setErrorMsg('Please enter your 11-digit Bank Verification Number (BVN).');
        return false;
      }
      if (!nin.trim() || nin.trim().length !== 11) {
        setErrorMsg('Please enter your 11-digit National Identity Number (NIN).');
        return false;
      }
      if (!dob) {
        setErrorMsg('Please provide your Date of Birth.');
        return false;
      }
      if (!residentialAddress.trim()) {
        setErrorMsg('Please enter your Residential Address.');
        return false;
      }
      if (!nearestLandmark.trim()) {
        setErrorMsg('Please state your Nearest Landmark (e.g. Near Ikeja City Mall, Bus Stop).');
        return false;
      }
      if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
        setErrorMsg('Please enter a valid Phone Number.');
        return false;
      }
      if (!emailAddress.trim() || !emailAddress.includes('@')) {
        setErrorMsg('Please enter a valid Email Address.');
        return false;
      }
      if (!lga.trim()) {
        setErrorMsg('Please provide your Local Government Area (LGA).');
        return false;
      }
      if (!moveInDate.trim()) {
        setErrorMsg('Please specify the Date/Month you moved into your residence.');
        return false;
      }
    }

    if (s === 2) {
      if (!employerName.trim()) {
        setErrorMsg("Please provide your Employer's Name.");
        return false;
      }
      if (!officeAddress.trim()) {
        setErrorMsg('Please provide your Office Address.');
        return false;
      }
      if (!employmentStartDate) {
        setErrorMsg('Please state your Employment Start Date.');
        return false;
      }
      const numSalary = Number(monthlyNetSalary);
      if (!numSalary || isNaN(numSalary) || numSalary <= 0) {
        setErrorMsg('Please enter your Monthly Net Salary.');
        return false;
      }
      if (!workEmailAddress.trim() || !workEmailAddress.includes('@')) {
        setErrorMsg('Please enter your Work Email Address.');
        return false;
      }
      if (!jobRoleOrStaffId.trim()) {
        setErrorMsg('Please provide your Staff ID / Job Role / Position.');
        return false;
      }
      if (!workPhoneNumber.trim()) {
        setErrorMsg('Please provide your Work Phone Number.');
        return false;
      }
    }

    if (s === 3) {
      const activeBank = bankName === 'Other Commercial Bank' ? customBankName : bankName;
      if (!activeBank.trim()) {
        setErrorMsg('Please select your Salary Bank Name.');
        return false;
      }
      if (!accountNumber.trim() || accountNumber.trim().length !== 10) {
        setErrorMsg('Please enter a valid 10-digit NUBAN Account Number.');
        return false;
      }
      if (!alertPhoneNumber.trim()) {
        setErrorMsg('Please enter your Alert Phone Number.');
        return false;
      }
    }

    if (s === 4) {
      const numAmount = Number(loanAmount);
      if (!numAmount || isNaN(numAmount) || numAmount < 50000) {
        setErrorMsg('Loan Amount must be at least ₦50,000.');
        return false;
      }
      if (!loanTenor) {
        setErrorMsg('Please select your preferred Loan Tenor.');
        return false;
      }
    }

    if (s === 5) {
      if (!nextOfKinName.trim()) {
        setErrorMsg('Please provide Next of Kin Full Name.');
        return false;
      }
      if (!nextOfKinHouseAddress.trim()) {
        setErrorMsg('Please provide Next of Kin House Address.');
        return false;
      }
      if (!nextOfKinRelationship.trim()) {
        setErrorMsg('Please specify your Relationship with Next of Kin.');
        return false;
      }
      if (!nextOfKinPhone.trim() || nextOfKinPhone.trim().length < 8) {
        setErrorMsg('Please enter Next of Kin Phone Number.');
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

    // Validate all 5 previous steps
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }

    if (!privacyConsent) {
      setErrorMsg('Please confirm the authorization and NDPR compliance acknowledgment.');
      return;
    }

    setLoading(true);

    const activeBank = bankName === 'Other Commercial Bank' ? (customBankName.trim() || 'Other Commercial Bank') : bankName;
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || 'Applicant';
    const lastName = nameParts.slice(1).join(' ') || firstName;
    const numericAmount = Number(loanAmount) || 1500000;
    const numericSalary = Number(monthlyNetSalary) || 350000;

    const payload = {
      applicant_type: 'INDIVIDUAL' as const,
      requested_amount: numericAmount,
      applicant_info: {
        first_name: firstName,
        last_name: lastName,
        contact_name: fullName.trim(),
        email: emailAddress.trim(),
        phone: phoneNumber.trim(),
        state_location: stateName,
        financing_purpose: `Personal Loan - ${loanTenor} tenor`,
        additional_notes: `Employer: ${employerName} | Landmark: ${nearestLandmark}`,
        loan_category: 'Personal Loan Application',
        // Personal Information
        gender,
        bvn: bvn.trim(),
        nin: nin.trim(),
        applicant_nin: nin.trim(),
        dob,
        residential_address: residentialAddress.trim(),
        nearest_landmark: nearestLandmark.trim(),
        marital_status: maritalStatus,
        lga: lga.trim(),
        state: stateName,
        residential_status: residentialStatus,
        residence_move_date: moveInDate.trim(),
        // Employment Details
        employer_name: employerName.trim(),
        office_address: officeAddress.trim(),
        employment_start_date: employmentStartDate,
        monthly_income: numericSalary,
        monthly_net_salary: numericSalary,
        work_email: workEmailAddress.trim(),
        staff_id_or_job_role: jobRoleOrStaffId.trim(),
        work_phone: workPhoneNumber.trim(),
        // Salary Account Details
        salary_bank_name: activeBank,
        commercial_bank: activeBank,
        salary_account_number: accountNumber.trim(),
        account_number: accountNumber.trim(),
        alert_phone_number: alertPhoneNumber.trim(),
        // Loan Details
        amount: numericAmount,
        loan_tenor: loanTenor,
        // Next of Kin Details
        next_of_kin_name: nextOfKinName.trim(),
        next_of_kin_address: nextOfKinHouseAddress.trim(),
        next_of_kin_email: nextOfKinEmail.trim(),
        next_of_kin_relationship: nextOfKinRelationship.trim(),
        next_of_kin_phone: nextOfKinPhone.trim(),
        // Required Documents
        utility_bill: utilityBillFile?.data || '',
        utility_bill_file_name: utilityBillFile?.name || '',
        gov_id_document: govIdFile?.data || '',
        gov_id_file_name: govIdFile?.name || '',
        work_id_document: workIdFile?.data || '',
        work_id_file_name: workIdFile?.name || '',
        payslip_or_statement_document: payslipOrStatementFile?.data || '',
        payslip_or_statement_file_name: payslipOrStatementFile?.name || ''
      }
    };

    // Forward to Formspree endpoint with exact structured questions
    const sendToFormspree = async (refNumber: string) => {
      try {
        const formspreePayload = {
          reference_number: refNumber,
          loan_category: 'Personal Loan Application',
          // Personal Information
          'Full Name': fullName.trim(),
          'Gender': gender,
          'BVN': bvn.trim(),
          'NIN': nin.trim(),
          'Date of Birth': dob,
          'Residential Address': residentialAddress.trim(),
          'Nearest Landmark': nearestLandmark.trim(),
          'Phone Number': phoneNumber.trim(),
          'Email Address': emailAddress.trim(),
          'Marital Status': maritalStatus,
          'LGA': lga.trim(),
          'State': stateName,
          'Residential Status (Owned or Rented)': residentialStatus,
          'Date/Month you moved into your residence': moveInDate.trim(),
          // Employment Details
          "Employer's Name": employerName.trim(),
          'Office Address': officeAddress.trim(),
          'Employment Start Date': employmentStartDate,
          'Monthly Net Salary': `₦${numericSalary.toLocaleString()}`,
          'Work Email Address': workEmailAddress.trim(),
          'Staff ID/Job Role/Position': jobRoleOrStaffId.trim(),
          'Work Phone Number': workPhoneNumber.trim(),
          // Salary Account Details
          'Bank Name': activeBank,
          'Account Number': accountNumber.trim(),
          'Alert Phone Number': alertPhoneNumber.trim(),
          // Loan Details
          'Loan Amount': `₦${numericAmount.toLocaleString()}`,
          'Loan Tenor': loanTenor,
          // Next of Kin Details
          'Next of Kin Full Name': nextOfKinName.trim(),
          'Next of Kin House Address': nextOfKinHouseAddress.trim(),
          'Next of Kin Email Address': nextOfKinEmail.trim() || 'N/A',
          'Next of Kin Relationship': nextOfKinRelationship.trim(),
          'Next of Kin Phone Number': nextOfKinPhone.trim(),
          // Required Documents Attached
          'Recent Utility Bill': utilityBillFile?.name || 'Not attached',
          'Valid Government-Issued ID Card': govIdFile?.name || 'Not attached',
          'Screenshot of Work ID Card': workIdFile?.name || 'Not attached',
          'Bank Statement or 3 months Payslip': payslipOrStatementFile?.name || 'Not attached',
          'Submitted At': new Date().toLocaleString(),
          'Portal Source': 'AkoFinanced It - Personal Loan Portal'
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
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Employment', icon: Briefcase },
    { num: 3, title: 'Salary Bank', icon: CreditCard },
    { num: 4, title: 'Loan Details', icon: DollarSign },
    { num: 5, title: 'Next of Kin', icon: Users },
    { num: 6, title: 'Documents', icon: FileText }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[16px] border border-slate-200 shadow-2xl p-6 sm:p-10 my-6 font-sans">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[#EFF4FF] border border-[#2D62FF]/30 text-[#2D62FF] text-xs font-bold uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5 text-[#2D62FF]" />
            <span>Personal Loan Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B0B0F] tracking-tight">
            Requirements for your Personal Loan application
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5F71] mt-1.5 leading-relaxed max-w-2xl font-medium">
            Kindly fill in the details and send the required documents at your earliest convenience.
          </p>
        </div>

        {/* View Mode Toggle / Switch to Business */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          {onSwitchToBusiness && (
            <button
              type="button"
              onClick={onSwitchToBusiness}
              className="px-3 py-1.5 rounded-[10px] text-xs font-bold text-[#5A5F71] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Apply as Business / SME
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

      {/* Stepper Progress Navigation */}
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

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        
        {/* ================= 1. PERSONAL INFORMATION ================= */}
        {(viewMode === 'single' || step === 1) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">1. Personal Information</h2>
                <p className="text-xs text-[#5A5F71]">Basic biodata and residential profile</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Full Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Babatunde Emeka Adeleke"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Gender: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-3 px-2 rounded-[10px] text-xs font-bold border transition-all cursor-pointer ${
                        gender === g
                          ? 'border-[#2D62FF] bg-[#EFF4FF] text-[#2D62FF]'
                          : 'border-slate-200 bg-white text-[#5A5F71] hover:border-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
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
                  NIN: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={11}
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                  placeholder="11-digit National Identity Number"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm font-mono text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Date of Birth: <span className="text-red-500">*</span>
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
                  Marital Status: <span className="text-red-500">*</span>
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
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
                  Email Address: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="applicant@gmail.com"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  State: <span className="text-red-500">*</span>
                </label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  LGA (Local Government Area): <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  placeholder="e.g. Ikeja, Eti-Osa, Surulere"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Residential Status (Owned or Rented): <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Owned', 'Rented'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setResidentialStatus(st)}
                      className={`py-3 px-2 rounded-[10px] text-xs font-bold border transition-all cursor-pointer ${
                        residentialStatus === st
                          ? 'border-[#2D62FF] bg-[#EFF4FF] text-[#2D62FF]'
                          : 'border-slate-200 bg-white text-[#5A5F71] hover:border-slate-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Date/Month you moved into your residence: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={moveInDate}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  placeholder="e.g. January 2022 or MM/YYYY"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
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
                  placeholder="House number, Street name, Area/Estate..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs sm:text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Nearest Landmark: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nearestLandmark}
                  onChange={(e) => setNearestLandmark(e.target.value)}
                  placeholder="e.g. Opposite St. Jude's Church, Beside First Bank..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. EMPLOYMENT DETAILS ================= */}
        {(viewMode === 'single' || step === 2) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">2. Employment Details</h2>
                <p className="text-xs text-[#5A5F71]">Income verification and workplace credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Employer's Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  placeholder="e.g. Flutterwave, MTN, Ministry of Health..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Staff ID/Job Role/Position: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={jobRoleOrStaffId}
                  onChange={(e) => setJobRoleOrStaffId(e.target.value)}
                  placeholder="e.g. Senior Software Engineer / EMP-4892"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Employment Start Date: <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={employmentStartDate}
                  onChange={(e) => setEmploymentStartDate(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Monthly Net Salary: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-base font-bold text-[#0B0B0F]">₦</span>
                  <input
                    type="number"
                    min={10000}
                    step={10000}
                    value={monthlyNetSalary}
                    onChange={(e) => setMonthlyNetSalary(e.target.value)}
                    placeholder="350,000"
                    className="w-full pl-8 pr-4 py-3 rounded-[10px] border border-slate-200 text-sm font-bold text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Work Email Address: <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={workEmailAddress}
                  onChange={(e) => setWorkEmailAddress(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Work Phone Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={workPhoneNumber}
                  onChange={(e) => setWorkPhoneNumber(e.target.value)}
                  placeholder="Official office line or desk phone"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Office Address: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  placeholder="Company office address, building, street, city..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs sm:text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= 3. SALARY ACCOUNT DETAILS ================= */}
        {(viewMode === 'single' || step === 3) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">3. Salary Account Details</h2>
                <p className="text-xs text-[#5A5F71]">Disbursement and monthly salary inflow bank details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Bank Name: <span className="text-red-500">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                >
                  {NIGERIAN_COMMERCIAL_BANKS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {bankName === 'Other Commercial Bank' && (
                <div>
                  <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                    Specify Bank Name: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Enter commercial bank name"
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
                  placeholder="10-digit NUBAN Account Number"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm font-mono text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
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
                  placeholder="Phone number receiving transaction alerts"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= 4. LOAN DETAILS ================= */}
        {(viewMode === 'single' || step === 4) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">4. Loan Details</h2>
                <p className="text-xs text-[#5A5F71]">Facility amount and repayment tenor structure</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Loan Amount: <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-base font-bold text-[#0B0B0F]">₦</span>
                  <input
                    type="number"
                    min={50000}
                    max={10000000}
                    step={50000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="1,500,000"
                    className="w-full pl-8 pr-4 py-3 rounded-[10px] border border-slate-200 text-lg font-black text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[200000, 500000, 1000000, 2000000, 5000000, 10000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setLoanAmount(amt)}
                      className="px-2.5 py-1 rounded-[8px] bg-slate-100 hover:bg-[#EFF4FF] hover:text-[#2D62FF] text-[11px] font-bold text-[#5A5F71] transition-colors cursor-pointer"
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Loan Tenor: <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {['3 Months', '6 Months', '9 Months', '12 Months', '18 Months', '24 Months'].map((ten) => (
                    <button
                      key={ten}
                      type="button"
                      onClick={() => setLoanTenor(ten)}
                      className={`py-3 px-2 rounded-[10px] text-xs font-bold border transition-all cursor-pointer ${
                        loanTenor === ten
                          ? 'border-[#2D62FF] bg-[#EFF4FF] text-[#2D62FF] shadow-xs'
                          : 'border-slate-200 bg-white text-[#5A5F71] hover:border-slate-300'
                      }`}
                    >
                      {ten}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= 5. NEXT OF KIN DETAILS ================= */}
        {(viewMode === 'single' || step === 5) && (
          <div className="space-y-5 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">5. Next of Kin Details</h2>
                <p className="text-xs text-[#5A5F71]">Emergency contact and family representative</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Full Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nextOfKinName}
                  onChange={(e) => setNextOfKinName(e.target.value)}
                  placeholder="e.g. Folashade Adeleke"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Relationship: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nextOfKinRelationship}
                  onChange={(e) => setNextOfKinRelationship(e.target.value)}
                  placeholder="e.g. Spouse, Sibling, Parent, Child"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Phone Number: <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={nextOfKinPhone}
                  onChange={(e) => setNextOfKinPhone(e.target.value)}
                  placeholder="08023456789"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  Email Address:
                </label>
                <input
                  type="email"
                  value={nextOfKinEmail}
                  onChange={(e) => setNextOfKinEmail(e.target.value)}
                  placeholder="kin@example.com (Optional)"
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0B0B0F] mb-1.5">
                  House Address: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={nextOfKinHouseAddress}
                  onChange={(e) => setNextOfKinHouseAddress(e.target.value)}
                  placeholder="Next of kin physical residential address..."
                  className="w-full p-3 rounded-[10px] border border-slate-200 text-xs sm:text-sm text-[#0B0B0F] bg-white focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= 6. REQUIRED DOCUMENTS ================= */}
        {(viewMode === 'single' || step === 6) && (
          <div className="space-y-6 animate-fadeIn p-5 rounded-[14px] bg-slate-50/60 border border-slate-200/80">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
              <div className="w-8 h-8 rounded-[8px] bg-[#2D62FF]/10 text-[#2D62FF] flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0B0B0F]">6. Required Documents</h2>
                <p className="text-xs text-[#5A5F71]">Mandatory KYC verification attachments</p>
              </div>
            </div>

            {/* Document Upload Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Doc 1: Recent Utility Bill */}
              <div className="p-4 rounded-[12px] bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B0B0F]">
                  <Home className="w-4 h-4 text-[#2D62FF]" />
                  <span>Recent Utility Bill</span>
                </div>
                <p className="text-[11px] text-[#5A5F71]">
                  PHCN/NEPA bill, water receipt, or waste bill within last 3 months.
                </p>
                <input
                  type="file"
                  ref={utilityBillInputRef}
                  onChange={(e) => handleFileChange(e, setUtilityBillFile)}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                {utilityBillFile ? (
                  <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <span className="truncate">{utilityBillFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setUtilityBillFile(null)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => utilityBillInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-[8px] border border-dashed border-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF]/15 text-xs font-bold text-[#2D62FF] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Utility Bill</span>
                  </button>
                )}
              </div>

              {/* Doc 2: Valid Government-Issued ID Card */}
              <div className="p-4 rounded-[12px] bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B0B0F]">
                  <ShieldCheck className="w-4 h-4 text-[#2D62FF]" />
                  <span>Valid Government-Issued ID Card</span>
                </div>
                <p className="text-[11px] text-[#5A5F71]">
                  NIN Slip, Voter Card, Driver License, or International Passport.
                </p>
                <input
                  type="file"
                  ref={govIdInputRef}
                  onChange={(e) => handleFileChange(e, setGovIdFile)}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                {govIdFile ? (
                  <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <span className="truncate">{govIdFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setGovIdFile(null)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => govIdInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-[8px] border border-dashed border-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF]/15 text-xs font-bold text-[#2D62FF] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Government ID</span>
                  </button>
                )}
              </div>

              {/* Doc 3: Screenshot of Work ID Card */}
              <div className="p-4 rounded-[12px] bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B0B0F]">
                  <Briefcase className="w-4 h-4 text-[#2D62FF]" />
                  <span>Screenshot of Work ID Card</span>
                </div>
                <p className="text-[11px] text-[#5A5F71]">
                  Clear photo or scan of your official corporate staff identity card.
                </p>
                <input
                  type="file"
                  ref={workIdInputRef}
                  onChange={(e) => handleFileChange(e, setWorkIdFile)}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                {workIdFile ? (
                  <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <span className="truncate">{workIdFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setWorkIdFile(null)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => workIdInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-[8px] border border-dashed border-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF]/15 text-xs font-bold text-[#2D62FF] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Work ID Card</span>
                  </button>
                )}
              </div>

              {/* Doc 4: Bank Statement or 3 months Payslip */}
              <div className="p-4 rounded-[12px] bg-white border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0B0B0F]">
                  <CreditCard className="w-4 h-4 text-[#2D62FF]" />
                  <span>Bank Statement or 3 months Payslip</span>
                </div>
                <p className="text-[11px] text-[#5A5F71]">
                  Stamped 6 months bank statement or recent 3 months payslips.
                </p>
                <input
                  type="file"
                  ref={payslipInputRef}
                  onChange={(e) => handleFileChange(e, setPayslipOrStatementFile)}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                {payslipOrStatementFile ? (
                  <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <span className="truncate">{payslipOrStatementFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setPayslipOrStatementFile(null)}
                      className="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => payslipInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-[8px] border border-dashed border-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF]/15 text-xs font-bold text-[#2D62FF] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Statement / Payslip</span>
                  </button>
                )}
              </div>

            </div>

            {/* Reassurance prompt requested verbatim */}
            <div className="p-4 rounded-[12px] bg-blue-50/70 border border-[#2D62FF]/20 text-[#0B0B0F] text-xs flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#2D62FF] shrink-0" />
              <span className="font-semibold text-slate-800">
                Kindly fill in the details and send the required documents at your earliest convenience.
              </span>
            </div>

            {/* NDPR Consent */}
            <label className="flex items-start gap-3 p-4 rounded-[12px] bg-[#EFF4FF] border border-[#2D62FF]/30 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#2D62FF] rounded accent-[#2D62FF] shrink-0"
              />
              <span className="text-xs text-[#5A5F71] leading-relaxed">
                I hereby declare that all information submitted in this <strong>Personal Loan Application</strong> is true, correct, and verifiable. I authorize AkoFinanced It to process my credit profile and submit my documents to licensed lending partners in strict accordance with the Nigeria Data Protection Act (NDPA) and credit bureau guidelines.
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
                  <span>Submitting Personal Loan Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Personal Loan Application</span>
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
