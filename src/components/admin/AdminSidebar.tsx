import React from 'react';
import { BrandLogo } from '../BrandLogo';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  FolderOpen,
  Building2,
  CalendarClock,
  MessageSquare,
  BarChart3,
  UserCheck,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
  Shield,
  Sparkles
} from 'lucide-react';
import { User, Role } from '../../types';

export type AdminTab =
  | 'overview'
  | 'applications'
  | 'customers'
  | 'documents'
  | 'lenders'
  | 'followups'
  | 'messages'
  | 'reports'
  | 'staff'
  | 'audit'
  | 'settings';

export type AdminTabType = AdminTab;

interface AdminSidebarProps {
  activeTab?: AdminTab;
  currentTab?: AdminTab;
  onTabChange?: (tab: AdminTab) => void;
  onSelectTab?: (tab: AdminTab) => void;
  user?: User;
  onLogout?: () => void;
  onNavigateHome?: () => void;
  badgeCounts?: {
    applications?: number;
    newApplications?: number;
    documents?: number;
    pendingDocs?: number;
    followups?: number;
    dueFollowups?: number;
    messages?: number;
    unreadMessages?: number;
  };
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  currentTab,
  onTabChange,
  onSelectTab,
  user,
  onLogout,
  onNavigateHome,
  badgeCounts,
  isMobileOpen,
  onCloseMobile
}) => {
  const selected = activeTab || currentTab || 'overview';
  const handleSelect = (tab: AdminTab) => {
    if (onTabChange) onTabChange(tab);
    if (onSelectTab) onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };
  const counts = badgeCounts || {};

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'applications',
      label: 'Applications',
      icon: FileSpreadsheet,
      badge: counts.applications || counts.newApplications,
      badgeColor: 'bg-blue-600 text-white'
    },
    { id: 'customers', label: 'Customers', icon: Users },
    {
      id: 'documents',
      label: 'Documents',
      icon: FolderOpen,
      badge: counts.documents || counts.pendingDocs,
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'lenders', label: 'Lenders', icon: Building2 },
    {
      id: 'followups',
      label: 'Follow-ups',
      icon: CalendarClock,
      badge: counts.followups || counts.dueFollowups,
      badgeColor: 'bg-rose-500 text-white'
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      badge: counts.messages || counts.unreadMessages,
      badgeColor: 'bg-blue-600 text-white'
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'staff', label: 'Staff & Roles', icon: UserCheck },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getRoleBadge = (role?: Role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ADMIN':
        return { label: 'Admin', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'LOAN_OFFICER':
        return { label: 'Loan Officer', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'REVIEWER':
        return { label: 'Reviewer', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: 'Operations Staff', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none bg-white">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateHome}>
            <BrandLogo />
          </div>
          <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-200">
            OPS CRM
          </span>
        </div>

        {/* Navigation List */}
        <div className="overflow-y-auto py-3 px-3 space-y-1 max-h-[calc(100vh-220px)] scrollbar-none">
          <div className="px-3 pb-1 text-[10px] font-bold text-[#8F95A5] uppercase tracking-wider">
            Operations Pipeline
          </div>
          {navItems.slice(0, 7).map((item) => {
            const Icon = item.icon;
            const isActive = selected === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2D62FF] text-white shadow-sm font-bold'
                    : 'text-[#5A5F71] hover:text-[#0B0B0F] hover:bg-[#EFF4FF]/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8F95A5]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-[#2D62FF]' : item.badgeColor || 'bg-[#2D62FF] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-1 text-[10px] font-bold text-[#8F95A5] uppercase tracking-wider">
            Management & Governance
          </div>
          {navItems.slice(7).map((item) => {
            const Icon = item.icon;
            const isActive = selected === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#2D62FF] text-white shadow-sm font-bold'
                    : 'text-[#5A5F71] hover:text-[#0B0B0F] hover:bg-[#EFF4FF]/70 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8F95A5]'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Area */}
      <div className="p-3 border-t border-slate-200 bg-white">
        {/* Quick Website Switcher */}
        {onNavigateHome && (
          <div className="mb-2">
            <button
              onClick={onNavigateHome}
              className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-xs text-[#5A5F71] hover:text-[#2D62FF] hover:bg-[#EFF4FF] border border-slate-200 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Customer Website</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8F95A5]" />
            </button>
          </div>
        )}

        {/* Staff Profile Footer */}
        {user && (
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[10px] bg-[#2D62FF] text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                {user.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0B0B0F] truncate">{user.full_name}</p>
                <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.2 rounded-[6px] border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded-[8px] text-[#8F95A5] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 select-none z-30 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
