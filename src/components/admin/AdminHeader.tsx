import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  Plus,
  Clock,
  Shield,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  CalendarClock,
  Menu
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';
import { User } from '../../types';

interface AdminHeaderProps {
  currentTab: AdminTab;
  user: User;
  onRefresh: () => void;
  loading: boolean;
  onOpenNewFollowup: () => void;
  onOpenNewLender: () => void;
  onOpenNewApplication?: () => void;
  onSearchGlobal?: (query: string) => void;
  onToggleMobileNav?: () => void;
  urgentCounts: {
    unassigned?: number;
    overdueFollowups?: number;
    pendingDocs?: number;
  };
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  currentTab,
  user,
  onRefresh,
  loading,
  onOpenNewFollowup,
  onOpenNewLender,
  onOpenNewApplication,
  onSearchGlobal,
  onToggleMobileNav,
  urgentCounts
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [globalQuery, setGlobalQuery] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTabTitle = (tab: AdminTab) => {
    switch (tab) {
      case 'overview':
        return { title: 'Operations Overview', desc: 'Real-time pipeline metrics, workflow bottlenecks, and attention queue.' };
      case 'applications':
        return { title: 'Loan Applications', desc: 'Search, filter, and manage applicant underwriting dossiers.' };
      case 'customers':
        return { title: 'Customer & Borrower Directory', desc: 'Track borrower profiles, KYC verification tiers, and history.' };
      case 'documents':
        return { title: 'Secure Document Vault', desc: 'Centralized review, verification, and audit of financial paperwork.' };
      case 'lenders':
        return { title: 'Lender Network Partners', desc: 'Manage partner banks, digital credit providers, and match mandates.' };
      case 'followups':
        return { title: 'Operational Follow-ups & Tasks', desc: 'Assigned outreach, borrower check-ins, and lender follow-ups.' };
      case 'messages':
        return { title: 'Borrower Communication Desk', desc: 'Direct two-way customer messaging and notice dispatches.' };
      case 'reports':
        return { title: 'Operations & Business Analytics', desc: 'Executive loan volumes, approval trends, and staff performance.' };
      case 'staff':
        return { title: 'Staff Directory & Roles', desc: 'Access permissions, case workloads, and loan officer allocations.' };
      case 'audit':
        return { title: 'System Security & Audit Logs', desc: 'Immutable operational activity trail and compliance logging.' };
      case 'settings':
        return { title: 'Platform & Operations Settings', desc: 'SLAs, advisory commission rates, and notification parameters.' };
    }
  };

  const currentTabMeta = getTabTitle(currentTab);
  const totalUrgent = (urgentCounts.unassigned || 0) + (urgentCounts.overdueFollowups || 0) + (urgentCounts.pendingDocs || 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchGlobal && globalQuery.trim()) {
      onSearchGlobal(globalQuery.trim());
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3.5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Tab Title & Context */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            {onToggleMobileNav && (
              <button
                onClick={onToggleMobileNav}
                className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Open Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{currentTabMeta.title}</h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{currentTabMeta.desc}</p>
            </div>
          </div>
        </div>

        {/* Right: Actions, Global Search, Time & Notifications */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between sm:justify-end">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-initial w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, customer..."
              value={globalQuery}
              onChange={(e) => {
                setGlobalQuery(e.target.value);
                if (onSearchGlobal) onSearchGlobal(e.target.value);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </form>

          {/* Live System Time */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-600">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentTime || '00:00:00'} WAT</span>
          </div>

          {/* Quick Action: New Followup */}
          <button
            onClick={onOpenNewFollowup}
            id="btn-header-new-followup"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Schedule Follow-up Task"
          >
            <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Follow-up</span>
          </button>

          {/* Quick Action: New Lender Partner */}
          <button
            onClick={onOpenNewLender}
            id="btn-header-new-lender"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
            title="Add Partner Lender"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Lender</span>
          </button>

          {/* Live Refresh Button */}
          <button
            onClick={onRefresh}
            id="btn-header-refresh"
            disabled={loading}
            title="Sync Data"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50 border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Urgent Attention Alert Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              id="btn-header-notifications"
              className="p-2 relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
            >
              <Bell className="w-3.5 h-3.5" />
              {totalUrgent > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-[12px] shadow-xl border border-slate-200 p-3.5 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900">Ops Attention Required</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {totalUrgent} items
                  </span>
                </div>

                <div className="py-2.5 space-y-2 text-xs">
                  {urgentCounts.overdueFollowups ? (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{urgentCounts.overdueFollowups} overdue follow-up calls need immediate review</span>
                    </div>
                  ) : null}

                  {urgentCounts.pendingDocs ? (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-800">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{urgentCounts.pendingDocs} documents awaiting specialist verification</span>
                    </div>
                  ) : null}

                  {urgentCounts.unassigned ? (
                    <div className="flex items-start gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">
                      <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{urgentCounts.unassigned} unassigned applications awaiting loan officer review</span>
                    </div>
                  ) : null}

                  {totalUrgent === 0 && (
                    <div className="text-center py-5 text-xs text-slate-400">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                      All operational queues are clear!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
