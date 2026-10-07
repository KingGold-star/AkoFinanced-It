import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  Building2,
  UserCheck,
  FolderOpen,
  Send,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FileText,
  MessageSquare,
  Sparkles,
  DollarSign,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CalendarClock,
  ChevronRight,
  Check,
  XCircle,
  FileCheck,
  Percent,
  Sliders,
  ExternalLink,
  Lock
} from 'lucide-react';
import {
  Application,
  ApplicationStatus,
  User as StaffUser,
  Lender,
  Document,
  DocumentRequirement,
  TimelineEvent,
  Message,
  InternalNote,
  LenderOffer
} from '../../types';
import { api } from '../../lib/api';

interface ApplicationWorkspaceModalProps {
  applicationId: string;
  onClose: () => void;
  onUpdated: () => void;
  staffMembers: StaffUser[];
  lenders: Lender[];
}

export const ApplicationWorkspaceModal: React.FC<ApplicationWorkspaceModalProps> = ({
  applicationId,
  onClose,
  onUpdated,
  staffMembers,
  lenders
}) => {
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'documents' | 'matching' | 'notes' | 'followups' | 'messages' | 'audit'
  >('overview');

  // Sub-states
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [selectedLender, setSelectedLender] = useState<string>('');
  const [stageNote, setStageNote] = useState<string>('');

  // Lender Matching states
  const [matchingResults, setMatchingResults] = useState<any[]>([]);
  const [matchingLoading, setMatchingLoading] = useState<boolean>(false);

  // Offer / Decision state
  const [offerApprovedAmount, setOfferApprovedAmount] = useState<string>('');
  const [offerRate, setOfferRate] = useState<string>('2.5');
  const [offerTenor, setOfferTenor] = useState<string>('12');
  const [offerMonthlyRepayment, setOfferMonthlyRepayment] = useState<string>('');
  const [offerAdvisoryFee, setOfferAdvisoryFee] = useState<string>('');
  const [offerDecisionNote, setOfferDecisionNote] = useState<string>('');
  const [offerDecisionStatus, setOfferDecisionStatus] = useState<'APPROVED' | 'DECLINED'>('APPROVED');
  const [savingOffer, setSavingOffer] = useState<boolean>(false);

  // Internal Notes state
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);

  // Follow-up state
  const [showNewFollowupForm, setShowNewFollowupForm] = useState<boolean>(false);
  const [fDueDate, setFDueDate] = useState<string>('');
  const [fType, setFType] = useState<string>('BORROWER_CALL');
  const [fNotes, setFNotes] = useState<string>('');
  const [savingFollowup, setSavingFollowup] = useState<boolean>(false);

  // Message Desk state
  const [chatText, setChatText] = useState<string>('');
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);

  // Document Rejection Modal state
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Format currency
  const formatNGN = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getApplicationById(applicationId);
      if (res && res.application) {
        setApp(res.application);
        setSelectedStatus(res.application.status);
        setSelectedStaff(res.application.assigned_staff_id || '');
        setSelectedLender(res.application.assigned_lender_id || '');

        if (res.application.lender_offer) {
          setOfferApprovedAmount(String(res.application.lender_offer.approved_amount || ''));
          setOfferRate(String(res.application.lender_offer.interest_rate_monthly || '2.5'));
          setOfferTenor(String(res.application.lender_offer.tenor_months || '12'));
          setOfferMonthlyRepayment(String(res.application.lender_offer.monthly_repayment || ''));
          setOfferAdvisoryFee(String(res.application.lender_offer.advisory_fee || ''));
          setOfferDecisionNote(res.application.lender_offer.decision_note || '');
        } else {
          setOfferApprovedAmount(String(res.application.requested_amount));
        }
      }
    } catch (err) {
      console.error('Failed to load application workspace data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [applicationId]);

  // Stage Advancement Handler
  const handleUpdateStatusAndAssignees = async (overrideStatus?: string) => {
    if (!app) return;
    try {
      setStatusUpdating(true);
      const newStatus = overrideStatus || selectedStatus;
      await api.updateApplicationStatus(app.id, {
        status: newStatus,
        assigned_staff_id: selectedStaff || undefined,
        assigned_lender_id: selectedLender || undefined,
        note: stageNote || undefined
      });
      setStageNote('');
      await loadData();
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update application');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Trigger automated matching engine
  const handleRunMatchingEngine = async () => {
    if (!app) return;
    try {
      setMatchingLoading(true);
      const res = await api.matchLenders(app.id);
      if (res && res.matches) {
        setMatchingResults(res.matches);
      }
    } catch (err: any) {
      console.error('Failed to run matching engine:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  // Save Internal Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !newNoteText.trim()) return;
    try {
      setSavingNote(true);
      await api.addApplicationNote(app.id, newNoteText.trim());
      setNewNoteText('');
      await loadData();
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  // Record Formal Lender Offer / Decision
  const handleSaveLenderOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;
    try {
      setSavingOffer(true);
      await api.recordLenderOffer(app.id, {
        approved_amount: Number(offerApprovedAmount),
        interest_rate_monthly: Number(offerRate),
        tenor_months: Number(offerTenor),
        monthly_repayment: offerMonthlyRepayment ? Number(offerMonthlyRepayment) : undefined,
        advisory_fee: offerAdvisoryFee ? Number(offerAdvisoryFee) : undefined,
        decision_note: offerDecisionNote,
        decision_status: offerDecisionStatus
      });
      await loadData();
      onUpdated();
      alert('Formal lender decision successfully recorded.');
    } catch (err: any) {
      alert(err.message || 'Failed to record lender decision');
    } finally {
      setSavingOffer(false);
    }
  };

  // Schedule Follow-up
  const handleCreateFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !fDueDate || !fNotes) return;
    try {
      setSavingFollowup(true);
      await api.createFollowUp(app.id, {
        due_date: fDueDate,
        type: fType,
        notes: fNotes
      });
      setShowNewFollowupForm(false);
      setFNotes('');
      setFDueDate('');
      await loadData();
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule follow-up');
    } finally {
      setSavingFollowup(false);
    }
  };

  // Verify or Reject Document
  const handleDocVerification = async (docId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    try {
      await api.updateDocumentStatus(docId, { status, notes });
      setRejectingDocId(null);
      setRejectionReason('');
      await loadData();
      onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update document status');
    }
  };

  // Send message to borrower
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app || !chatText.trim()) return;
    try {
      setSendingMsg(true);
      await api.sendMessage(app.id, chatText.trim());
      setChatText('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  // Quick message canned responses
  const applyCannedTemplate = (text: string) => {
    setChatText(text);
  };

  if (loading || !app) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-[12px] p-8 max-w-md w-full text-center shadow-xl border border-slate-200">
          <div className="w-9 h-9 border-2 border-[#2D62FF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#0B0B0F]">Opening Application Workspace...</p>
          <p className="text-xs text-[#8F95A5] mt-1">Retrieving underwriting dossier and financial trail.</p>
        </div>
      </div>
    );
  }

  // Workflow Stages in Order
  const workflowStages: { id: ApplicationStatus; label: string; step: number }[] = [
    { id: 'UNDER_REVIEW', label: 'Received', step: 1 },
    { id: 'INITIAL_ASSESSMENT', label: 'Assessment', step: 2 },
    { id: 'PROCESSING', label: 'Processing', step: 3 },
    { id: 'DOCUMENTS_REQUIRED', label: 'Docs Required', step: 4 },
    { id: 'LENDER_MATCHED', label: 'Lender Match', step: 5 },
    { id: 'SUBMITTED_TO_LENDER', label: 'Submitted', step: 6 },
    { id: 'LENDER_REVIEW', label: 'Lender Review', step: 7 },
    { id: 'APPROVED', label: 'Decision (Approved)', step: 8 }
  ];

  const currentStageIndex = workflowStages.findIndex((s) => s.id === app.status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[12px] shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* Workspace Top Header */}
        <div className="bg-white border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Left: Ref, Applicant & Status */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-base font-bold text-[#2D62FF]">
                  {app.reference_number}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                    app.applicant_type === 'BUSINESS'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-[#EFF4FF] text-[#2D62FF] border-blue-200'
                  }`}
                >
                  {app.applicant_type}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-[#5A5F71] border border-slate-200">
                  {app.status.replace(/_/g, ' ')}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0B0B0F] mt-1">
                {app.applicant_info.first_name} {app.applicant_info.last_name}
                {app.applicant_info.business_name ? ` • ${app.applicant_info.business_name}` : ''}
              </h2>
            </div>

            {/* Right: Quick Action Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Status Advance Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-[10px] border border-slate-200">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs font-semibold bg-white px-3 py-1.5 rounded-[8px] border border-slate-200 text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
                >
                  <option value="UNDER_REVIEW">1. Received / New</option>
                  <option value="INITIAL_ASSESSMENT">2. Under Assessment</option>
                  <option value="PROCESSING">3. Processing / Underwriting</option>
                  <option value="DOCUMENTS_REQUIRED">4. Documents Required</option>
                  <option value="LENDER_MATCHED">5. Lender Matched</option>
                  <option value="SUBMITTED_TO_LENDER">6. Submitted to Lender</option>
                  <option value="LENDER_REVIEW">7. Lender Review</option>
                  <option value="APPROVED">8. Loan Approved / Sanctioned</option>
                  <option value="DECLINED">9. Application Declined</option>
                </select>

                <button
                  onClick={() => handleUpdateStatusAndAssignees()}
                  disabled={statusUpdating || selectedStatus === app.status}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  {statusUpdating ? 'Saving...' : 'Set Stage'}
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Visual 8-Stage Workflow Bar */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 overflow-x-auto">
            <div className="flex items-center min-w-[700px] justify-between text-xs">
              {workflowStages.map((stg, idx) => {
                const isPassed = currentStageIndex > idx || app.status === 'APPROVED';
                const isCurrent = app.status === stg.id;
                const isDeclined = app.status === 'DECLINED';

                return (
                  <div
                    key={stg.id}
                    onClick={() => {
                      setSelectedStatus(stg.id);
                      handleUpdateStatusAndAssignees(stg.id);
                    }}
                    className={`flex items-center gap-1.5 cursor-pointer group px-2 py-1 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : isPassed
                        ? 'text-emerald-700 font-medium'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isPassed ? <Check className="w-3 h-3" /> : stg.step}
                    </div>
                    <span className="whitespace-nowrap">{stg.label}</span>
                    {idx < workflowStages.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Assign Bar (Staff & Lender) */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Assigned Staff Selector */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Assigned Staff:</span>
              </span>
              <select
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  setTimeout(() => handleUpdateStatusAndAssignees(), 50);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="">Unassigned</option>
                {staffMembers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Lender Selector */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Lender Partner:</span>
              </span>
              <select
                value={selectedLender}
                onChange={(e) => {
                  setSelectedLender(e.target.value);
                  setTimeout(() => handleUpdateStatusAndAssignees(), 50);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-600"
              >
                <option value="">None / Pending Match</option>
                {lenders.map((len) => (
                  <option key={len.id} value={len.id}>
                    {len.name.replace(' [DEMO]', '')} ({len.institution_type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Created: {new Date(app.created_at).toLocaleString('en-GB')}</span>
            <span>•</span>
            <span>Last Update: {new Date(app.updated_at).toLocaleTimeString('en-GB')}</span>
          </div>
        </div>

        {/* Workspace Tab Navigation */}
        <div className="border-b border-slate-200 bg-white px-5 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Financial & KYC Profile', icon: FileText },
            { id: 'documents', label: `Documents Vault (${app.documents?.length || 0})`, icon: FolderOpen },
            { id: 'matching', label: 'Lender Match & Decision', icon: Building2 },
            { id: 'notes', label: `Staff Notes (${app.internal_notes?.length || 0})`, icon: Lock },
            { id: 'followups', label: 'Follow-ups & Tasks', icon: CalendarClock },
            { id: 'messages', label: `Borrower Messages (${app.messages?.length || 0})`, icon: MessageSquare },
            { id: 'audit', label: 'Audit Trail', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Workspace Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4">
          {/* TAB 1: Financial & KYC Profile */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Top Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-[#8F95A5]">Requested Amount</span>
                  <p className="text-lg font-bold text-[#2D62FF] mt-1">{formatNGN(app.requested_amount)}</p>
                </div>
                <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-[#8F95A5]">
                    {app.applicant_type === 'BUSINESS' ? 'Monthly Revenue' : 'Monthly Net Income'}
                  </span>
                  <p className="text-lg font-bold text-[#0B0B0F] mt-1">
                    {formatNGN(app.applicant_info.monthly_income_or_revenue || 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-[#8F95A5]">Existing Debt Repayments</span>
                  <p className="text-lg font-bold text-[#0B0B0F] mt-1">
                    {formatNGN(app.applicant_info.existing_monthly_debt || 0)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-[12px] border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-semibold text-[#8F95A5]">Debt-to-Income / Ratio</span>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    {app.applicant_info.monthly_income_or_revenue
                      ? `${Math.round(
                          ((app.applicant_info.existing_monthly_debt || 0) /
                            app.applicant_info.monthly_income_or_revenue) *
                            100
                        )}%`
                      : '0%'}
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Applicant Contact & Identification */}
                <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-[#0B0B0F] pb-3 border-b border-slate-100 mb-3.5 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#2D62FF]" />
                    <span>Applicant Identity & Verification</span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-[#5A5F71]">Full Legal Name</span>
                      <span className="font-bold text-[#0B0B0F]">
                        {app.applicant_info.first_name} {app.applicant_info.last_name}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-[#5A5F71]">Email Address</span>
                      <span className="font-medium text-[#0B0B0F]">{app.applicant_info.email}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-[#5A5F71]">Phone Number</span>
                      <span className="font-medium text-[#0B0B0F]">{app.applicant_info.phone}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-[#5A5F71]">Residential / Operating State</span>
                      <span className="font-medium text-[#0B0B0F]">
                        {app.applicant_info.state_location || 'Nigeria'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#5A5F71]">Financing Purpose</span>
                      <span className="font-semibold text-[#2D62FF]">{app.purpose}</span>
                    </div>
                  </div>
                </div>

                {/* Business / Employment Underwriting Profile */}
                <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-[#0B0B0F] pb-3 border-b border-slate-100 mb-3.5 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#2D62FF]" />
                    <span>
                      {app.applicant_type === 'BUSINESS' ? 'Enterprise / Business Profile' : 'Employment & Income Profile'}
                    </span>
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    {app.applicant_type === 'BUSINESS' ? (
                      <>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Business Legal Name</span>
                          <span className="font-bold text-slate-900">{app.applicant_info.business_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">CAC / RC Registration No.</span>
                          <span className="font-mono font-bold text-slate-900">
                            {app.applicant_info.cac_number || (app.applicant_info as any).registration_number || 'RC-Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Years in Active Operation</span>
                          <span className="font-medium text-slate-800">
                            {app.applicant_info.business_period_years || app.applicant_info.years_operating || (app.applicant_info as any).years_in_business || 2} Years
                          </span>
                        </div>
                        {app.applicant_info.premises_status && (
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Premises Status</span>
                            <span className="font-medium text-slate-800">{app.applicant_info.premises_status}</span>
                          </div>
                        )}
                        {app.applicant_info.commercial_bank && (
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Commercial Bank</span>
                            <span className="font-bold text-slate-900">
                              {app.applicant_info.commercial_bank} ({app.applicant_info.account_number || 'NUBAN'})
                            </span>
                          </div>
                        )}
                        {app.applicant_info.guarantor_nin && (
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Guarantor's NIN</span>
                            <span className="font-mono font-bold text-slate-900">{app.applicant_info.guarantor_nin}</span>
                          </div>
                        )}
                        {app.applicant_info.next_of_kin_name && (
                          <div className="flex justify-between py-1.5 border-b border-slate-100">
                            <span className="text-slate-500">Next of Kin</span>
                            <span className="font-medium text-slate-800">
                              {app.applicant_info.next_of_kin_name} ({app.applicant_info.next_of_kin_phone || ''})
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Underwriting Assessment</span>
                          <span className="font-bold text-emerald-600">SME Limited Liability Dossier</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Employment Status</span>
                          <span className="font-bold text-slate-900">
                            {app.applicant_info.employment_status || 'Salaried Full-Time'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Employer / Organization</span>
                          <span className="font-medium text-slate-800">
                            {app.applicant_info.employer_name || 'Corporate Entity'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-100">
                          <span className="text-slate-500">Net Disposable Income</span>
                          <span className="font-bold text-slate-900">
                            {formatNGN(
                              (app.applicant_info.monthly_income_or_revenue || 0) -
                                (app.applicant_info.existing_monthly_debt || 0)
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5">
                          <span className="text-slate-500">Identity Document Tier</span>
                          <span className="font-semibold text-emerald-600">Tier 2 Validated</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Documents Vault */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#0B0B0F]">Dossier Financial Documents</h3>
                    <p className="text-[11px] text-[#8F95A5] mt-0.5">
                      Review, audit, verify or reject documents submitted for this application
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF4FF] text-[#2D62FF] border border-blue-200">
                    {app.documents?.length || 0} Files Attached
                  </span>
                </div>

                <div className="space-y-3">
                  {app.documents && app.documents.length > 0 ? (
                    app.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-4 rounded-[10px] border border-slate-200 bg-slate-50/70 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-[10px] bg-white border border-slate-200 flex items-center justify-center text-[#2D62FF] shrink-0 shadow-2xs">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-[#0B0B0F]">{doc.name}</p>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  doc.status === 'VERIFIED'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : doc.status === 'REJECTED'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {doc.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#8F95A5] mt-1">
                              Type: <span className="font-semibold text-[#5A5F71]">{doc.document_type}</span> • Size: {doc.size || '1.4 MB'} • Uploaded: {new Date(doc.uploaded_at).toLocaleDateString('en-GB')}
                            </p>
                            {doc.notes && (
                              <p className="text-[11px] text-rose-600 mt-1 italic font-medium">
                                Note: {doc.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          {doc.status !== 'VERIFIED' && (
                            <button
                              onClick={() => handleDocVerification(doc.id, 'VERIFIED')}
                              className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-[8px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          )}

                          {doc.status !== 'REJECTED' && (
                            <button
                              onClick={() => {
                                setRejectingDocId(doc.id);
                                setRejectionReason('');
                              }}
                              className="px-3.5 py-1.5 text-xs font-bold bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 rounded-[8px] transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}

                          <a
                            href={doc.file_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-[#8F95A5] hover:text-[#0B0B0F] hover:bg-white rounded-[8px] border border-transparent hover:border-slate-200 transition-colors"
                            title="Inspect File"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-[#8F95A5]">
                      <FolderOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-[#0B0B0F]">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Requirements Status */}
              {app.requirements && app.requirements.length > 0 && (
                <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-[#0B0B0F] pb-3 border-b border-slate-100 mb-3.5">
                    Required Checklist Status
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {app.requirements.map((req) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-[10px] border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-[#0B0B0F]">{req.title}</p>
                          <p className="text-[10px] text-[#8F95A5]">{req.description}</p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : req.status === 'SUBMITTED'
                              ? 'bg-[#EFF4FF] text-[#2D62FF] border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Lender Match & Formal Decision */}
          {activeTab === 'matching' && (
            <div className="space-y-4">
              {/* Automated Matching Engine */}
              <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#0B0B0F] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#2D62FF]" />
                      <span>AkoFinanced It Rule-Based Matching Engine</span>
                    </h3>
                    <p className="text-[11px] text-[#8F95A5] mt-0.5">
                      Evaluates requested volume ({formatNGN(app.requested_amount)}), applicant type ({app.applicant_type}), and financial eligibility
                    </p>
                  </div>
                  <button
                    onClick={handleRunMatchingEngine}
                    disabled={matchingLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#2D62FF] hover:bg-blue-700 disabled:opacity-50 rounded-[10px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{matchingLoading ? 'Analyzing Criteria...' : 'Run Match Engine'}</span>
                  </button>
                </div>

                {matchingResults.length > 0 ? (
                  <div className="space-y-3">
                    {matchingResults.map((match, idx) => (
                      <div
                        key={match.lender_id || idx}
                        className="p-4 rounded-[10px] border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0B0B0F]">{match.lender_name}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {match.score}% Match Score
                            </span>
                            <span className="text-[10px] text-[#8F95A5] font-semibold">{match.institution_type}</span>
                          </div>
                          <p className="text-[11px] text-[#8F95A5] mt-1">
                            {match.reasons?.join(' • ') || 'Fully satisfies criteria for tickets in this bracket.'}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedLender(match.lender_id);
                            setSelectedStatus('LENDER_MATCHED');
                            handleUpdateStatusAndAssignees('LENDER_MATCHED');
                          }}
                          className="px-3.5 py-1.5 text-xs font-bold bg-[#2D62FF] text-white hover:bg-blue-700 rounded-[8px] transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          Select & Match
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-[#8F95A5]">
                    Click "Run Match Engine" to compute algorithmic lender fit scores across registered credit institutions.
                  </div>
                )}
              </div>

              {/* Formal Lender Sanction & Offer Record */}
              <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-[#0B0B0F] pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Formal Sanction / Offer Decision Panel</span>
                </h3>

                <form onSubmit={handleSaveLenderOffer} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Sanctioned Loan Amount (NGN)
                      </label>
                      <input
                        type="number"
                        required
                        value={offerApprovedAmount}
                        onChange={(e) => setOfferApprovedAmount(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Monthly Interest Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={offerRate}
                        onChange={(e) => setOfferRate(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tenor / Duration (Months)
                      </label>
                      <input
                        type="number"
                        required
                        value={offerTenor}
                        onChange={(e) => setOfferTenor(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Estimated Monthly Repayment (NGN)
                      </label>
                      <input
                        type="number"
                        placeholder="Optional calculated repayment"
                        value={offerMonthlyRepayment}
                        onChange={(e) => setOfferMonthlyRepayment(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Advisory / Brokerage Fee (NGN)
                      </label>
                      <input
                        type="number"
                        placeholder="Optional fee"
                        value={offerAdvisoryFee}
                        onChange={(e) => setOfferAdvisoryFee(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Decision Outcome
                      </label>
                      <select
                        value={offerDecisionStatus}
                        onChange={(e) => setOfferDecisionStatus(e.target.value as any)}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                      >
                        <option value="APPROVED">APPROVE & SANCTION LOAN</option>
                        <option value="DECLINED">DECLINE APPLICATION</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Decision Rationale & Terms
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Specify sanction conditions, drawdown requirements, or reasons for decline..."
                      value={offerDecisionNote}
                      onChange={(e) => setOfferDecisionNote(e.target.value)}
                      className="w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={savingOffer}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      {savingOffer ? 'Recording Decision...' : 'Save & Enforce Decision'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: Internal Staff Notes */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#8F95A5]" />
                    <h3 className="text-xs font-bold text-[#0B0B0F]">Private Internal Staff Notes</h3>
                  </div>
                  <span className="text-[10px] text-[#8F95A5] uppercase font-bold tracking-wider">
                    Staff-Only • Confidential
                  </span>
                </div>

                {/* Add new note form */}
                <form onSubmit={handleAddNote} className="mb-4">
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      required
                      placeholder="Add an internal observation, verification memo, or credit assessment note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="flex-1 py-2 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-[10px] text-[#0B0B0F] placeholder-[#8F95A5] focus:outline-none focus:border-[#2D62FF] focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={savingNote || !newNoteText.trim()}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#2D62FF] hover:bg-blue-700 disabled:opacity-40 rounded-[10px] transition-colors cursor-pointer shrink-0 self-end shadow-xs"
                    >
                      {savingNote ? 'Saving...' : 'Add Note'}
                    </button>
                  </div>
                </form>

                {/* Notes Stream */}
                <div className="space-y-3">
                  {app.internal_notes && app.internal_notes.length > 0 ? (
                    app.internal_notes.map((nt) => (
                      <div
                        key={nt.id}
                        className="p-3.5 rounded-[10px] border border-slate-200 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between mb-1.5 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0B0B0F]">{nt.author_name}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#5A5F71] border border-slate-200">
                              {nt.author_role}
                            </span>
                          </div>
                          <span className="text-[#8F95A5]">
                            {new Date(nt.created_at).toLocaleString('en-GB')}
                          </span>
                        </div>
                        <p className="text-xs text-[#0B0B0F] whitespace-pre-wrap leading-relaxed">{nt.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-[#8F95A5]">
                      No internal notes recorded for this application yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Follow-ups & Tasks */}
          {activeTab === 'followups' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#0B0B0F]">Scheduled Follow-up Tasks</h3>
                    <p className="text-[11px] text-[#8F95A5] mt-0.5">Borrower outreach, lender check-ins, and requirement pings</p>
                  </div>
                  <button
                    onClick={() => setShowNewFollowupForm(!showNewFollowupForm)}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#2D62FF] hover:bg-blue-700 rounded-[10px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Schedule Follow-up</span>
                  </button>
                </div>

                {showNewFollowupForm && (
                  <form onSubmit={handleCreateFollowup} className="p-4 mb-4 rounded-[10px] bg-slate-50 border border-slate-200 space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#5A5F71] mb-1">Due Date</label>
                        <input
                          type="date"
                          required
                          value={fDueDate}
                          onChange={(e) => setFDueDate(e.target.value)}
                          className="w-full py-2 px-3 bg-white border border-slate-200 rounded-[8px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#5A5F71] mb-1">Task Type</label>
                        <select
                          value={fType}
                          onChange={(e) => setFType(e.target.value)}
                          className="w-full py-2 px-3 bg-white border border-slate-200 rounded-[8px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
                        >
                          <option value="BORROWER_CALL">Borrower Phone Call</option>
                          <option value="DOCUMENT_REQUEST">Document Clarification</option>
                          <option value="LENDER_CHECK">Partner Lender Follow-up</option>
                          <option value="SANCTION_DELIVERY">Sanction / Offer Briefing</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#5A5F71] mb-1">Action Description / Notes</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Call borrower regarding 6-month bank statement turnover discrepancy"
                        value={fNotes}
                        onChange={(e) => setFNotes(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-200 rounded-[8px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowNewFollowupForm(false)}
                        className="px-3.5 py-1.5 text-xs text-[#5A5F71] hover:bg-slate-200/60 rounded-[8px] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingFollowup}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-[#2D62FF] hover:bg-blue-700 rounded-[8px] shadow-xs cursor-pointer"
                      >
                        {savingFollowup ? 'Scheduling...' : 'Save Task'}
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5 text-xs">
                  {app.followups && app.followups.length > 0 ? (
                    app.followups.map((fol) => (
                      <div
                        key={fol.id}
                        className={`p-3.5 rounded-[10px] border flex items-center justify-between gap-3 ${
                          fol.completed ? 'bg-slate-50/60 border-slate-200 opacity-70' : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0B0B0F]">{fol.type.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-[#8F95A5]">Due: {fol.due_date}</span>
                            {fol.completed && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-[#5A5F71] mt-1">{fol.notes}</p>
                          {fol.outcome && (
                            <p className="text-[11px] text-emerald-700 mt-1 font-semibold">Outcome: {fol.outcome}</p>
                          )}
                        </div>

                        {!fol.completed && (
                          <button
                            onClick={async () => {
                              const outcome = prompt('Enter outcome of follow-up call:', 'Completed call with applicant.');
                              if (outcome !== null) {
                                await api.updateFollowUp(fol.id, { completed: true, outcome });
                                await loadData();
                                onUpdated();
                              }
                            }}
                            className="px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-[8px] border border-emerald-200 cursor-pointer shrink-0 transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-[#8F95A5]">
                      No follow-ups recorded for this application.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Borrower Communication Desk */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs flex flex-col h-[490px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#2D62FF]" />
                    <span className="text-xs font-bold text-[#0B0B0F]">
                      Direct Conversation with {app.applicant_info.first_name}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8F95A5]">{app.applicant_info.email}</span>
                </div>

                {/* Canned Quick Response Chips */}
                <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto text-[11px]">
                  <span className="text-[#8F95A5] font-semibold shrink-0">Quick Templates:</span>
                  <button
                    onClick={() => applyCannedTemplate('Hello, we are reviewing your application and need an updated 6-month stamped bank statement.')}
                    className="px-2.5 py-1 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-[#5A5F71] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Request Stamped Statement
                  </button>
                  <button
                    onClick={() => applyCannedTemplate('Great news! Your application has matched with a lender partner and has been submitted for formal underwriting.')}
                    className="px-2.5 py-1 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-[#5A5F71] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Lender Submission Notice
                  </button>
                  <button
                    onClick={() => applyCannedTemplate('Congratulations! Your financing offer has been sanctioned. Please check your portal to review terms.')}
                    className="px-2.5 py-1 rounded-[6px] bg-slate-100 hover:bg-slate-200 text-[#5A5F71] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Offer Sanction Notice
                  </button>
                </div>

                {/* Message stream */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3.5 bg-slate-50 rounded-[10px] mb-3.5 border border-slate-100">
                  {app.messages && app.messages.length > 0 ? (
                    app.messages.map((m) => {
                      const isStaff = m.sender_role !== 'CUSTOMER';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col max-w-[80%] ${isStaff ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                        >
                          <span className="text-[10px] text-[#8F95A5] mb-0.5">
                            {m.sender_name} ({m.sender_role}) • {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div
                            className={`p-3 rounded-[12px] text-xs leading-relaxed ${
                              isStaff
                                ? 'bg-[#2D62FF] text-white rounded-br-xs shadow-xs'
                                : 'bg-white text-[#0B0B0F] border border-slate-200 rounded-bl-xs shadow-xs'
                            }`}
                          >
                            {m.text}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-14 text-xs text-[#8F95A5]">
                      No messages exchanged yet. Send a greeting or notice to the applicant.
                    </div>
                  )}
                </div>

                {/* Chat input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message to borrower..."
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    className="flex-1 py-2 px-3.5 text-xs bg-white border border-slate-200 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
                  />
                  <button
                    type="submit"
                    disabled={sendingMsg || !chatText.trim()}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#2D62FF] hover:bg-blue-700 disabled:opacity-40 rounded-[10px] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 7: Audit Trail */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="bg-white rounded-[12px] border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-bold text-[#0B0B0F] pb-3 border-b border-slate-100 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Immutable Case Audit History</span>
                </h3>

                <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {app.timeline && app.timeline.length > 0 ? (
                    app.timeline.map((evt) => (
                      <div key={evt.id} className="relative pl-8 text-xs">
                        <div className="absolute left-2 top-1 w-3.5 h-3.5 rounded-full bg-[#2D62FF] border-2 border-white shadow-2xs" />
                        <div className="p-3.5 rounded-[10px] bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#0B0B0F]">{evt.title}</span>
                            <span className="text-[10px] text-[#8F95A5]">
                              {new Date(evt.timestamp).toLocaleString('en-GB')}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#5A5F71]">{evt.description}</p>
                          {evt.actor_name && (
                            <p className="text-[10px] text-[#8F95A5] mt-1">Actor: {evt.actor_name}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-[#8F95A5]">
                      No timeline events recorded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Rejection Modal */}
      {rejectingDocId && (
        <div className="fixed inset-0 z-60 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[12px] p-6 max-w-sm w-full shadow-2xl border border-rose-200">
            <h4 className="text-sm font-bold text-rose-900 mb-1.5">Reject Document</h4>
            <p className="text-xs text-slate-600 mb-3.5">
              Please specify the reason for rejection so the borrower can re-upload correctly:
            </p>
            <textarea
              rows={3}
              required
              placeholder="e.g. Statement is blurry or missing official bank stamp / header."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-[10px] text-[#0B0B0F] mb-4 focus:outline-none focus:border-rose-500 focus:bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingDocId(null)}
                className="px-3.5 py-2 text-xs text-[#5A5F71] hover:bg-slate-100 rounded-[8px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDocVerification(rejectingDocId, 'REJECTED', rejectionReason)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-[8px] shadow-xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
