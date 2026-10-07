import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  Building2,
  UserCheck,
  Calendar,
  X,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Briefcase,
  User,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { Application, User as StaffUser, Lender } from '../../types';

interface ApplicationsTabProps {
  applications: Application[];
  staffMembers: StaffUser[];
  lenders: Lender[];
  onSelectApplication: (appId: string) => void;
  onRefresh: () => void;
}

export const ApplicationsTab: React.FC<ApplicationsTabProps> = ({
  applications,
  staffMembers,
  lenders,
  onSelectApplication,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INDIVIDUAL' | 'BUSINESS'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [staffFilter, setStaffFilter] = useState<string>('ALL');
  const [lenderFilter, setLenderFilter] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Currency formatter
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
        return { label: 'Received', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'INITIAL_ASSESSMENT':
        return { label: 'Assessment', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'PROCESSING':
        return { label: 'Processing', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'DOCUMENTS_REQUIRED':
        return { label: 'Docs Required', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'LENDER_MATCHED':
        return { label: 'Lender Matched', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'SUBMITTED_TO_LENDER':
        return { label: 'Submitted to Lender', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'LENDER_REVIEW':
        return { label: 'Lender Review', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'APPROVED':
        return { label: 'Approved', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'DECLINED':
        return { label: 'Declined', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: status.replace(/_/g, ' '), bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Filter and sort applications
  const filteredApps = useMemo(() => {
    return applications
      .filter((app) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesRef = app.reference_number.toLowerCase().includes(q);
          const matchesName = `${app.applicant_info.first_name} ${app.applicant_info.last_name}`.toLowerCase().includes(q);
          const matchesEmail = app.applicant_info.email.toLowerCase().includes(q);
          const matchesBiz = app.applicant_info.business_name && app.applicant_info.business_name.toLowerCase().includes(q);
          if (!matchesRef && !matchesName && !matchesEmail && !matchesBiz) return false;
        }

        // Applicant Type
        if (typeFilter !== 'ALL' && app.applicant_type !== typeFilter) return false;

        // Status
        if (statusFilter !== 'ALL' && app.status !== statusFilter) return false;

        // Assigned Staff
        if (staffFilter !== 'ALL') {
          if (staffFilter === 'UNASSIGNED') {
            if (app.assigned_staff_id) return false;
          } else if (app.assigned_staff_id !== staffFilter) {
            return false;
          }
        }

        // Assigned Lender
        if (lenderFilter !== 'ALL') {
          if (lenderFilter === 'UNASSIGNED') {
            if (app.assigned_lender_id) return false;
          } else if (app.assigned_lender_id !== lenderFilter) {
            return false;
          }
        }

        // Amount filters
        if (minAmount && app.requested_amount < Number(minAmount)) return false;
        if (maxAmount && app.requested_amount > Number(maxAmount)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          return sortOrder === 'desc' ? diff : -diff;
        }
        if (sortField === 'amount') {
          return sortOrder === 'desc' ? b.requested_amount - a.requested_amount : a.requested_amount - b.requested_amount;
        }
        if (sortField === 'name') {
          const nameA = `${a.applicant_info.first_name} ${a.applicant_info.last_name}`;
          const nameB = `${b.applicant_info.first_name} ${b.applicant_info.last_name}`;
          return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
        }
        return 0;
      });
  }, [
    applications,
    searchQuery,
    typeFilter,
    statusFilter,
    staffFilter,
    lenderFilter,
    minAmount,
    maxAmount,
    sortField,
    sortOrder
  ]);

  const hasActiveFilters =
    searchQuery ||
    typeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    staffFilter !== 'ALL' ||
    lenderFilter !== 'ALL' ||
    minAmount ||
    maxAmount;

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setStaffFilter('ALL');
    setLenderFilter('ALL');
    setMinAmount('');
    setMaxAmount('');
  };

  const handleExportCSV = () => {
    const headers = ['Reference Number,Applicant Name,Type,Business Name,Email,Phone,Requested Amount,Status,Assigned Staff,Assigned Lender,Created Date'];
    const rows = filteredApps.map((a) => {
      return [
        a.reference_number,
        `"${a.applicant_info.first_name} ${a.applicant_info.last_name}"`,
        a.applicant_type,
        `"${a.applicant_info.business_name || 'N/A'}"`,
        a.applicant_info.email,
        `"${a.applicant_info.phone}"`,
        a.requested_amount,
        a.status,
        `"${a.assigned_staff_name || 'Unassigned'}"`,
        `"${a.assigned_lender_name || 'None'}"`,
        new Date(a.created_at).toISOString().split('T')[0]
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AkoFinanced_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12 animate-fadeIn">
      {/* Search and Primary Filters Bar */}
      <div className="bg-white rounded-[12px] border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F95A5]" />
            <input
              type="text"
              id="input-app-search"
              placeholder="Search by Reference ID, customer name, email or business name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-[10px] text-[#0B0B0F] placeholder-[#8F95A5] focus:outline-none focus:border-[#2D62FF] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F95A5] hover:text-[#0B0B0F]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Pill Filter for Applicant Type */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-[10px] border border-slate-200 shrink-0">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-white text-[#2D62FF] shadow-xs' : 'text-[#5A5F71] hover:text-[#0B0B0F]'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('INDIVIDUAL')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                typeFilter === 'INDIVIDUAL' ? 'bg-white text-[#2D62FF] shadow-xs' : 'text-[#5A5F71] hover:text-[#0B0B0F]'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Individual</span>
            </button>
            <button
              onClick={() => setTypeFilter('BUSINESS')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[8px] transition-all cursor-pointer ${
                typeFilter === 'BUSINESS' ? 'bg-white text-[#2D62FF] shadow-xs' : 'text-[#5A5F71] hover:text-[#0B0B0F]'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Business</span>
            </button>
          </div>

          {/* Action buttons: Filter Toggle & Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[10px] border transition-colors cursor-pointer ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-[#EFF4FF] text-[#2D62FF] border-blue-200'
                  : 'bg-white text-[#5A5F71] border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#2D62FF]" />
              )}
            </button>

            <button
              onClick={handleExportCSV}
              id="btn-export-csv"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-[10px] bg-slate-100 text-[#0B0B0F] hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5 text-[#5A5F71]" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Expandable Advanced Filter Panel */}
        {showAdvancedFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8F95A5] mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNDER_REVIEW">Received / New</option>
                <option value="INITIAL_ASSESSMENT">Under Assessment</option>
                <option value="PROCESSING">Processing</option>
                <option value="DOCUMENTS_REQUIRED">Documents Required</option>
                <option value="LENDER_MATCHED">Lender Matched</option>
                <option value="SUBMITTED_TO_LENDER">Submitted to Lender</option>
                <option value="LENDER_REVIEW">Lender Review</option>
                <option value="APPROVED">Approved</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>

            {/* Assigned Staff Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8F95A5] mb-1">Assigned Officer</label>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
              >
                <option value="ALL">All Officers</option>
                <option value="UNASSIGNED">Unassigned Only</option>
                {staffMembers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Lender Partner Filter */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8F95A5] mb-1">Assigned Lender</label>
              <select
                value={lenderFilter}
                onChange={(e) => setLenderFilter(e.target.value)}
                className="w-full py-2 px-3 bg-white border border-slate-200 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
              >
                <option value="ALL">All Lenders</option>
                <option value="UNASSIGNED">Not Matched Yet</option>
                {lenders.map((len) => (
                  <option key={len.id} value={len.id}>
                    {len.name.replace(' [DEMO]', '')}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-[11px] font-semibold text-[#8F95A5] mb-1">Amount Range (NGN)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="w-1/2 py-2 px-3 bg-white border border-slate-200 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
                />
                <span className="text-[#8F95A5]">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="w-1/2 py-2 px-3 bg-white border border-slate-200 rounded-[10px] text-[#0B0B0F] focus:outline-none focus:border-[#2D62FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filter Summary and Clear */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#5A5F71]">
              Found <strong className="text-[#0B0B0F]">{filteredApps.length}</strong> matching applications
            </span>
            <button
              onClick={resetFilters}
              className="text-[#2D62FF] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Applications Table */}
      <div className="bg-white rounded-[12px] border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[#5A5F71] font-semibold select-none">
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => {
                      if (sortField === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('name');
                        setSortOrder('asc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-[#0B0B0F] cursor-pointer"
                  >
                    <span>Application ID & Customer</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8F95A5]" />
                  </button>
                </th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">
                  <button
                    onClick={() => {
                      if (sortField === 'amount') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('amount');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-[#0B0B0F] cursor-pointer"
                  >
                    <span>Requested Amount</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8F95A5]" />
                  </button>
                </th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Assigned Staff</th>
                <th className="py-3.5 px-3">Assigned Lender</th>
                <th className="py-3.5 px-3">
                  <button
                    onClick={() => {
                      if (sortField === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      else {
                        setSortField('date');
                        setSortOrder('desc');
                      }
                    }}
                    className="flex items-center gap-1 hover:text-[#0B0B0F] cursor-pointer"
                  >
                    <span>Submitted</span>
                    <ArrowUpDown className="w-3 h-3 text-[#8F95A5]" />
                  </button>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const statusMeta = getStatusBadge(app.status);
                const isBiz = app.applicant_type === 'BUSINESS';
                const createdDate = new Date(app.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <tr
                    key={app.id}
                    onClick={() => onSelectApplication(app.id)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* App ID & Customer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-xs font-bold shrink-0 ${
                            isBiz ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-[#EFF4FF] text-[#2D62FF] border border-blue-100'
                          }`}
                        >
                          {isBiz ? <Briefcase className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[#0B0B0F] group-hover:text-[#2D62FF] transition-colors">
                              {app.reference_number}
                            </span>
                          </div>
                          <p className="font-semibold text-[#0B0B0F]">
                            {app.applicant_info.first_name} {app.applicant_info.last_name}
                          </p>
                          {isBiz && app.applicant_info.business_name && (
                            <p className="text-[11px] text-[#8F95A5] truncate max-w-[200px]">
                              {app.applicant_info.business_name}
                            </p>
                          )}
                          <p className="text-[10px] text-[#8F95A5]">{app.applicant_info.phone}</p>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-[6px] ${
                          isBiz
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-[#EFF4FF] text-[#2D62FF] border border-blue-200'
                        }`}
                      >
                        {app.applicant_type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 font-bold text-[#0B0B0F]">
                      <div>{formatNGN(app.requested_amount)}</div>
                      {app.lender_offer?.approved_amount && (
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          Offer: {formatNGN(app.lender_offer.approved_amount)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-semibold rounded-full border whitespace-nowrap ${statusMeta.bg}`}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Assigned Staff */}
                    <td className="py-3.5 px-3">
                      {app.assigned_staff_name ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#EFF4FF] text-[#2D62FF] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {app.assigned_staff_name.charAt(0)}
                          </div>
                          <span className="text-[#0B0B0F] font-medium truncate max-w-[120px]">
                            {app.assigned_staff_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-semibold text-[11px] italic">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Assigned Lender */}
                    <td className="py-3.5 px-3">
                      {app.assigned_lender_name ? (
                        <div className="flex items-center gap-1.5 text-[#0B0B0F] font-medium truncate max-w-[130px]">
                          <Building2 className="w-3.5 h-3.5 text-[#2D62FF] shrink-0" />
                          <span className="truncate">{app.assigned_lender_name.replace(' [DEMO]', '')}</span>
                        </div>
                      ) : (
                        <span className="text-[#8F95A5] italic text-[11px]">Pending Match</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-3 text-[#5A5F71] text-[11px] whitespace-nowrap">
                      {createdDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectApplication(app.id);
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-[#2D62FF] bg-[#EFF4FF] hover:bg-[#2D62FF] hover:text-white rounded-[8px] transition-colors cursor-pointer"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No applications match your criteria</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try clearing filters or search query</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Displaying <strong className="text-slate-900">{filteredApps.length}</strong> of <strong className="text-slate-900">{applications.length}</strong> total records
          </span>
          <span>Click any row to open full underwriting workspace</span>
        </div>
      </div>
    </div>
  );
};
