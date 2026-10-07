import React from 'react';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FolderOpen,
  Send,
  Building2,
  CalendarClock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Zap,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Inbox,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { Application, FollowUp, Document } from '../../types';
import { AdminTab } from './AdminSidebar';

interface OverviewTabProps {
  metrics: {
    total?: number;
    new_applications?: number;
    initial_review?: number;
    documents_pending?: number;
    lender_matched?: number;
    submitted_to_lenders?: number;
    approved?: number;
    declined?: number;
    followups_due_today?: number;
    followups_overdue?: number;
    processing?: number;
  };
  applications: Application[];
  followups: {
    due_today: FollowUp[];
    overdue: FollowUp[];
    upcoming: FollowUp[];
  };
  pendingDocuments?: Document[];
  onSelectApplication: (appId: string) => void;
  onNavigateTab: (tab: AdminTab) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  metrics,
  applications,
  followups,
  pendingDocuments = [],
  onSelectApplication,
  onNavigateTab
}) => {
  // Format currency
  const formatNGN = (amt: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return { label: 'Intake / New', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'INITIAL_ASSESSMENT':
        return { label: 'Assessment', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'PROCESSING':
        return { label: 'Underwriting', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'DOCUMENTS_REQUIRED':
        return { label: 'Docs Required', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'LENDER_MATCHED':
        return { label: 'Lender Matched', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'SUBMITTED_TO_LENDER':
      case 'LENDER_REVIEW':
        return { label: 'Lender Review', bg: 'bg-blue-50 text-[#2D62FF] border-blue-200' };
      case 'APPROVED':
        return { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'DECLINED':
        return { label: 'Declined', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: status.replace(/_/g, ' '), bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const recentApps = [...applications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  // Compute calculated values
  const totalAppsCount = metrics.total || applications.length;
  const newAppsCount = metrics.new_applications || applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const assessmentCount = metrics.initial_review || applications.filter((a) => a.status === 'INITIAL_ASSESSMENT').length;
  const processingCount = applications.filter((a) => a.status === 'PROCESSING').length;
  const docsPendingCount = metrics.documents_pending || applications.filter((a) => a.status === 'DOCUMENTS_REQUIRED').length;
  const lenderReviewCount = metrics.submitted_to_lenders || applications.filter((a) => a.status === 'SUBMITTED_TO_LENDER' || a.status === 'LENDER_REVIEW' || a.status === 'LENDER_MATCHED').length;
  const approvedCount = metrics.approved || applications.filter((a) => a.status === 'APPROVED').length;
  const declinedCount = metrics.declined || applications.filter((a) => a.status === 'DECLINED').length;
  const followupsTodayCount = metrics.followups_due_today || followups.due_today?.length || 0;
  const followupsOverdueCount = metrics.followups_overdue || followups.overdue?.length || 0;

  // Pipeline Naira volumes
  const totalVolume = applications.reduce((sum, app) => sum + (app.requested_amount || 0), 0);
  const approvedVolume = applications
    .filter((a) => a.status === 'APPROVED')
    .reduce((sum, a) => sum + (a.lender_offer?.approved_amount || a.requested_amount || 0), 0);

  // Pipeline stages configuration
  const pipelineStages = [
    { label: 'Intake', count: newAppsCount, color: 'bg-slate-500' },
    { label: 'Assessment', count: assessmentCount, color: 'bg-blue-500' },
    { label: 'Underwriting', count: processingCount, color: 'bg-indigo-500' },
    { label: 'Docs Required', count: docsPendingCount, color: 'bg-amber-500' },
    { label: 'Lender Review', count: lenderReviewCount, color: 'bg-cyan-500' },
    { label: 'Sanctioned', count: approvedCount, color: 'bg-emerald-500' },
    { label: 'Declined', count: declinedCount, color: 'bg-rose-400' }
  ];

  const [exportingPdf, setExportingPdf] = React.useState(false);

  const handleExportExecutiveReport = async () => {
    try {
      setExportingPdf(true);
      const { fetchAllPlatformData, generateExecutivePdfReport } = await import('../../lib/pdfReportGenerator');
      const fullData = await fetchAllPlatformData();
      generateExecutivePdfReport(fullData);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn font-sans">
      {/* Executive Quick Bar */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#0B0B0F]">Executive Operations & Loan Volume Dashboard</h2>
          <p className="text-xs text-[#8F95A5] mt-0.5">Real-time underwriting throughput, institutional metrics, and pipeline status</p>
        </div>

        <button
          onClick={handleExportExecutiveReport}
          disabled={exportingPdf}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EFF4FF] hover:bg-[#2D62FF] hover:text-white text-[#2D62FF] text-xs font-bold rounded-[10px] transition-all cursor-pointer border border-blue-200/80 shadow-xs active:scale-[0.99] disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{exportingPdf ? 'Compiling PDF Dossier...' : 'Export Executive Report'}</span>
        </button>
      </div>

      {/* 4 Core Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Pipeline */}
        <div
          onClick={() => onNavigateTab('applications')}
          className="bg-white p-5 rounded-[12px] border border-slate-200/90 hover:border-[#2D62FF] transition-all cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8F95A5] uppercase tracking-wider">Active Pipeline</span>
            <div className="w-8 h-8 rounded-[10px] bg-slate-100 flex items-center justify-center text-[#5A5F71] group-hover:bg-[#EFF4FF] group-hover:text-[#2D62FF] transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#0B0B0F] tracking-tight">{formatNGN(totalVolume)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#5A5F71] font-medium">{totalAppsCount} loan dossiers</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Live</span>
            </div>
          </div>
        </div>

        {/* Approved Volume */}
        <div
          onClick={() => onNavigateTab('applications')}
          className="bg-white p-5 rounded-[12px] border border-slate-200/90 hover:border-emerald-500 transition-all cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8F95A5] uppercase tracking-wider">Sanctioned Facilities</span>
            <div className="w-8 h-8 rounded-[10px] bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-emerald-700 tracking-tight">{formatNGN(approvedVolume)}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#5A5F71] font-medium">{approvedCount} approved</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {totalAppsCount > 0 ? Math.round((approvedCount / totalAppsCount) * 100) : 0}% Approval
              </span>
            </div>
          </div>
        </div>

        {/* Intake & Assessment */}
        <div
          onClick={() => onNavigateTab('applications')}
          className="bg-white p-5 rounded-[12px] border border-slate-200/90 hover:border-[#2D62FF] transition-all cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8F95A5] uppercase tracking-wider">Intake & Assessment</span>
            <div className="w-8 h-8 rounded-[10px] bg-blue-50 flex items-center justify-center text-[#2D62FF] group-hover:bg-[#2D62FF] group-hover:text-white transition-colors">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-[#2D62FF] tracking-tight">{newAppsCount + assessmentCount}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#5A5F71] font-medium">{newAppsCount} new intake · {assessmentCount} under assessment</span>
            </div>
          </div>
        </div>

        {/* Action Items & Follow-ups */}
        <div
          onClick={() => onNavigateTab('followups')}
          className="bg-white p-5 rounded-[12px] border border-slate-200/90 hover:border-amber-400 transition-all cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8F95A5] uppercase tracking-wider">Pending Action Items</span>
            <div className="w-8 h-8 rounded-[10px] bg-amber-50 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-amber-700 tracking-tight">
              {followupsTodayCount + followupsOverdueCount + docsPendingCount}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#5A5F71] font-medium">
                {docsPendingCount} docs · {followupsTodayCount + followupsOverdueCount} follow-ups
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Stage Pipeline Flow */}
      <div className="bg-white rounded-[12px] border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2D62FF]" />
            <h2 className="text-sm font-bold text-[#0B0B0F]">Underwriting Pipeline Stage Distribution</h2>
          </div>
          <span className="text-xs font-medium text-[#8F95A5]">{totalAppsCount} Total Active Applications</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {pipelineStages.map((stage, idx) => (
            <div
              key={idx}
              onClick={() => onNavigateTab('applications')}
              className="p-3 rounded-[10px] bg-slate-50 hover:bg-slate-100 border border-slate-200/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[#5A5F71] group-hover:text-[#0B0B0F]">
                  {stage.label}
                </span>
                <span className="text-xs font-bold text-[#0B0B0F]">{stage.count}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color} rounded-full transition-all`}
                  style={{
                    width: `${totalAppsCount > 0 ? Math.max((stage.count / totalAppsCount) * 100, stage.count > 0 ? 12 : 0) : 0}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Recent Applications & Operational Attention Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Applications (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[12px] border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0B0B0F]">Active Underwriting Dossiers</h3>
                <p className="text-xs text-[#8F95A5]">Recent credit submissions undergoing institutional review</p>
              </div>
              <button
                onClick={() => onNavigateTab('applications')}
                className="text-xs font-bold text-[#2D62FF] hover:text-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Full Table ({applications.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[#8F95A5] font-semibold">
                    <th className="pb-3 font-semibold">Reference</th>
                    <th className="pb-3 font-semibold">Borrower / Entity</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Stage</th>
                    <th className="pb-3 font-semibold">Lender / Desk</th>
                    <th className="pb-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApps.map((app) => {
                    const statusMeta = getStatusBadge(app.status);
                    const isBiz = app.applicant_type === 'BUSINESS';
                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        onClick={() => onSelectApplication(app.id)}
                      >
                        <td className="py-3.5 font-mono font-bold text-[#0B0B0F]">
                          {app.reference_number}
                        </td>
                        <td className="py-3.5">
                          <p className="font-semibold text-[#0B0B0F]">
                            {app.applicant_info.first_name} {app.applicant_info.last_name}
                          </p>
                          {isBiz && app.applicant_info.business_name && (
                            <p className="text-[11px] text-[#5A5F71] font-medium truncate max-w-[200px]">
                              {app.applicant_info.business_name}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 font-bold text-[#0B0B0F]">
                          {formatNGN(app.requested_amount)}
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${statusMeta.bg}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3.5 text-[#5A5F71] text-[11px] truncate max-w-[180px]">
                          {app.assigned_lender_name ? (
                            <span>{app.assigned_lender_name.split('—')[0].trim()}</span>
                          ) : (
                            <span className="text-[#8F95A5] italic">Direct Portfolio</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectApplication(app.id);
                            }}
                            className="px-3 py-1.5 text-[11px] font-bold text-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF] hover:text-white rounded-[8px] transition-colors cursor-pointer"
                          >
                            Dossier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-[#8F95A5]">
            <span>Showing top {recentApps.length} active dossiers</span>
            <button
              onClick={() => onNavigateTab('applications')}
              className="text-[#2D62FF] font-semibold hover:underline cursor-pointer"
            >
              Open Application Registry →
            </button>
          </div>
        </div>

        {/* Right Column: Operational Attention Desk (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Action Tasks Desk */}
          <div className="bg-white rounded-[12px] border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-[#0B0B0F]">Priority Action Tasks</h3>
              <button
                onClick={() => onNavigateTab('followups')}
                className="text-xs font-bold text-[#2D62FF] hover:text-blue-700 cursor-pointer transition-colors"
              >
                Board →
              </button>
            </div>

            <div className="space-y-2.5">
              {[...(followups.due_today || []), ...(followups.overdue || [])].slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onSelectApplication(task.application_id)}
                  className="p-3 rounded-[10px] bg-slate-50 hover:bg-blue-50/50 border border-slate-200/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-bold text-[#2D62FF]">
                      {task.application_ref}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                      Due Today
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#0B0B0F] line-clamp-1">{task.customer_name}</p>
                  <p className="text-[11px] text-[#5A5F71] line-clamp-2 mt-0.5">{task.notes}</p>
                </div>
              ))}

              {!(followups.due_today?.length || followups.overdue?.length) && (
                <div className="text-center py-6 text-xs text-[#8F95A5]">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                  <span>All officer follow-up actions completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Institutional Partner Desks */}
          <div className="bg-white rounded-[12px] border border-slate-200/90 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h3 className="text-sm font-bold text-[#0B0B0F]">Credit Partners</h3>
              <button
                onClick={() => onNavigateTab('lenders')}
                className="text-xs font-bold text-[#2D62FF] hover:text-blue-700 cursor-pointer transition-colors"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-[8px] bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-[#0B0B0F]">Access Bank Commercial SME</span>
                </div>
                <span className="text-[10px] text-[#5A5F71] font-medium">48h SLA</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[8px] bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-[#0B0B0F]">Stanbic IBTC Asset Finance</span>
                </div>
                <span className="text-[10px] text-[#5A5F71] font-medium">3-5 Days</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-[8px] bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-[#0B0B0F]">Sterling Renewable Fund</span>
                </div>
                <span className="text-[10px] text-[#5A5F71] font-medium">3-5 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
