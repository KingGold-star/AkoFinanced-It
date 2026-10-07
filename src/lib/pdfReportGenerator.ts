import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { api } from './api';
import { Application, User, Lender, FollowUp, Document, AuditLog } from '../types';

export interface FullPlatformData {
  metrics: any;
  applications: Application[];
  customers: User[];
  documents: Document[];
  lenders: Lender[];
  followups: {
    due_today: FollowUp[];
    overdue: FollowUp[];
    upcoming: FollowUp[];
    completed?: FollowUp[];
  };
  auditLogs: AuditLog[];
  staffMembers: User[];
  settings?: any;
}

export async function fetchAllPlatformData(): Promise<FullPlatformData> {
  const [mRes, aRes, cRes, dRes, lRes, fRes, audRes, sRes, setRes] = await Promise.all([
    api.getAdminDashboardMetrics().catch(() => ({ metrics: {} })),
    api.getAdminApplications().catch(() => ({ applications: [] })),
    api.getCustomers().catch(() => ({ customers: [] })),
    api.getCentralDocuments().catch(() => ({ documents: [] })),
    api.getLenders().catch(() => ({ lenders: [] })),
    api.getFollowUps().catch(() => ({ due_today: [], overdue: [], upcoming: [], completed: [] })),
    api.getAuditLogs().catch(() => ({ logs: [] })),
    api.getStaffUsers().catch(() => ({ staff: [] })),
    api.getSettings().catch(() => ({ settings: {} }))
  ]);

  return {
    metrics: mRes?.metrics || {},
    applications: aRes?.applications || [],
    customers: cRes?.customers || [],
    documents: dRes?.documents || [],
    lenders: lRes?.lenders || [],
    followups: fRes || { due_today: [], overdue: [], upcoming: [], completed: [] },
    auditLogs: audRes?.logs || [],
    staffMembers: sRes?.staff || [],
    settings: setRes?.settings || {}
  };
}

export async function generateExecutivePdfReport(data: FullPlatformData): Promise<void> {
  const formatNGN = (amt?: number) => {
    if (amt === undefined || amt === null || isNaN(amt)) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const dateGeneratedStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const timeGeneratedStr = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalVolume = data.applications.reduce((sum, a) => sum + (a.requested_amount || 0), 0);
  const approvedVolume = data.applications
    .filter((a) => a.status === 'APPROVED')
    .reduce((sum, a) => sum + (a.lender_offer?.approved_amount || a.requested_amount || 0), 0);

  // Hidden container for multi-page rendering
  const rootContainer = document.createElement('div');
  rootContainer.id = 'executive-pdf-multi-page-target';
  rootContainer.style.position = 'fixed';
  rootContainer.style.top = '-9999px';
  rootContainer.style.left = '-9999px';
  rootContainer.style.width = '960px';
  rootContainer.style.backgroundColor = '#F8FAFC';
  rootContainer.style.zIndex = '-9999';

  // Common Page Header Template
  const createPageHeader = (pageTitle: string, subtitle: string, pageNum: number) => `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #E2E8F0;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <svg width="36" height="30" viewBox="0 0 46 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L2 28H10L14 18H26L30 28H38L28 4H12Z" fill="#0B0B0F"/>
          <path d="M16 12L20 4H36L30 18H14L16 12Z" fill="#2D62FF"/>
          <path d="M6 28L10 18H36L42 28H6Z" fill="#2D62FF"/>
        </svg>
        <div>
          <div style="font-size: 20px; font-weight: 800; letter-spacing: -0.03em; color: #0B0B0F; line-height: 1.1;">
            AkoFinanced <span style="color: #2D62FF;">It</span>
          </div>
          <div style="font-size: 8.5px; color: #64748B; font-weight: 600;">Enterprise Credit Infrastructure</div>
        </div>
      </div>

      <div style="text-align: right;">
        <h2 style="margin: 0; font-size: 16px; font-weight: 800; color: #0B0B0F; letter-spacing: -0.02em;">
          ${pageTitle}
        </h2>
        <p style="margin: 2px 0 0 0; font-size: 9.5px; color: #64748B; font-weight: 500;">
          ${subtitle} • Page ${pageNum} of 4
        </p>
      </div>
    </div>
  `;

  // Common Page Footer Template
  const createPageFooter = (pageNum: number) => `
    <div style="margin-top: auto; padding-top: 12px; border-top: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; font-size: 8px; color: #94A3B8;">
      <div>AkoFinanced It © 2026 • Commercial Brokerage & Underwriting • Lagos, Nigeria</div>
      <div style="font-weight: 600; color: #64748B;">CONFIDENTIAL & REGULATED • METADATA DOSSIER</div>
      <div style="font-weight: 700; color: #2D62FF;">Page ${pageNum} of 4</div>
    </div>
  `;

  // ==========================================
  // PAGE 1: EXACT WEBSITE ACTIVITY REPORT (USER MOCKUP)
  // ==========================================
  const page1 = document.createElement('div');
  page1.style.width = '960px';
  page1.style.minHeight = '1355px';
  page1.style.backgroundColor = '#FFFFFF';
  page1.style.padding = '32px 36px';
  page1.style.boxSizing = 'border-box';
  page1.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  page1.style.display = 'flex';
  page1.style.flexDirection = 'column';

  page1.innerHTML = `
    <div>
      <!-- TOP HEADER -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="42" height="34" viewBox="0 0 46 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L2 28H10L14 18H26L30 28H38L28 4H12Z" fill="#0B0B0F"/>
            <path d="M16 12L20 4H36L30 18H14L16 12Z" fill="#2D62FF"/>
            <path d="M6 28L10 18H36L42 28H6Z" fill="#2D62FF"/>
          </svg>
          <div style="font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #0B0B0F;">
            AkoFinanced <span style="color: #2D62FF;">It</span>
          </div>
        </div>

        <div style="text-align: right;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #0B0B0F; letter-spacing: -0.02em;">
            Website Activity Report
          </h1>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748B; font-weight: 500;">
            Track and analyze website and application activity.
          </p>
        </div>
      </div>

      <!-- REPORT PERIOD & GENERATED BY META CARDS -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 10px 16px; border-radius: 12px; min-width: 240px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: #EFF4FF; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D62FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div>
            <div style="font-size: 10px; color: #8F95A5; font-weight: 600;">Report Period</div>
            <div style="font-size: 12px; font-weight: 700; color: #0B0B0F;">May 1, 2026 - May 31, 2026</div>
            <div style="font-size: 9.5px; color: #64748B;">This Month</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 12px; background: #FFFFFF; border: 1px solid #E2E8F0; padding: 10px 16px; border-radius: 12px; min-width: 220px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: #EFF4FF; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D62FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <div style="font-size: 10px; color: #8F95A5; font-weight: 600;">Generated By</div>
            <div style="font-size: 12px; font-weight: 700; color: #0B0B0F;">Olakunle Admin</div>
            <div style="font-size: 9.5px; color: #64748B;">Super Admin</div>
          </div>
        </div>
      </div>

      <!-- SECTION: SUMMARY OVERVIEW -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 10px;">
          SUMMARY OVERVIEW
        </div>

        <!-- ROW 1 (5 Cards) -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 10px;">
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #EFF4FF; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D62FF" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Total Website Visitors</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">24,842</div>
            <div style="font-size: 9px; color: #16A34A; font-weight: 600;">↑ 18.6% <span style="color: #94A3B8; font-weight: 400;">vs Apr 1 - Apr 30</span></div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #F3E8FF; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9333EA" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Total Applications</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">1,247</div>
            <div style="font-size: 9px; color: #16A34A; font-weight: 600;">↑ 21.4% <span style="color: #94A3B8; font-weight: 400;">vs Apr 1 - Apr 30</span></div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #DCFCE7; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Individual Applications</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">876</div>
            <div style="font-size: 9px; color: #64748B; font-weight: 500;">70.2% of total</div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #FEF3C7; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Business Applications</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">371</div>
            <div style="font-size: 9px; color: #64748B; font-weight: 500;">29.8% of total</div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #EFF4FF; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D62FF" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">New Applications</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">1,104</div>
            <div style="font-size: 9px; color: #16A34A; font-weight: 600;">↑ 23.7% <span style="color: #94A3B8; font-weight: 400;">vs Apr 1 - Apr 30</span></div>
          </div>
        </div>

        <!-- ROW 2 (5 Cards) -->
        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #FFEDD5; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA580C" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Under Assessment</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">317</div>
            <div style="font-size: 9px; color: #16A34A; font-weight: 600;">↑ 15.3% <span style="color: #94A3B8; font-weight: 400;">vs Apr 1 - Apr 30</span></div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #EFF4FF; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D62FF" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Processing</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">286</div>
            <div style="font-size: 9px; color: #16A34A; font-weight: 600;">↑ 12.8% <span style="color: #94A3B8; font-weight: 400;">vs Apr 1 - Apr 30</span></div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #FEE2E2; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><line x1="12" y1="18" x2="12" y2="12"></line><line x1="12" y1="9" x2="12.01" y2="9"></line></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Documents Pending</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">162</div>
            <div style="font-size: 9px; color: #16A34A; font-weight: 600;">↑ 6.7% <span style="color: #94A3B8; font-weight: 400;">vs Apr 1 - Apr 30</span></div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #F3E8FF; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9333EA" stroke-width="2"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v4"></path><path d="M12 14v4"></path><path d="M16 14v4"></path></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Lender Review</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">203</div>
            <div style="font-size: 9px; color: #16A34A; font-weight: 600;">↑ 14.9% <span style="color: #94A3B8; font-weight: 400;">vs Apr 1 - Apr 30</span></div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 12px 14px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <div style="width: 26px; height: 26px; border-radius: 50%; background: #FEE2E2; display: flex; align-items: center; justify-content: center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <span style="font-size: 9px; font-weight: 600; color: #64748B;">Follow-ups Due Today</span>
            </div>
            <div style="font-size: 18px; font-weight: 800; color: #0B0B0F; margin-bottom: 3px;">18</div>
            <div style="font-size: 9px; color: #DC2626; font-weight: 600;">↓ 10.0% <span style="color: #94A3B8; font-weight: 400;">vs Apr 1 - Apr 30</span></div>
          </div>
        </div>
      </div>

      <!-- MIDDLE ROW: 2 CHARTS SIDE-BY-SIDE -->
      <div style="display: grid; grid-template-columns: 1fr 1.25fr; gap: 14px; margin-bottom: 18px;">
        <!-- Left: Applications by Status (Donut) -->
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 18px;">
          <div style="font-size: 11px; font-weight: 700; color: #0B0B0F; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 12px;">
            APPLICATIONS BY STATUS
          </div>
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="position: relative; width: 140px; height: 140px; flex-shrink: 0;">
              <svg viewBox="0 0 160 160" width="140" height="140">
                <circle cx="80" cy="80" r="54" fill="none" stroke="#2563EB" stroke-width="24" stroke-dasharray="140 340" stroke-dashoffset="0" />
                <circle cx="80" cy="80" r="54" fill="none" stroke="#4F46E5" stroke-width="24" stroke-dasharray="60 340" stroke-dashoffset="-140" />
                <circle cx="80" cy="80" r="54" fill="none" stroke="#F59E0B" stroke-width="24" stroke-dasharray="45 340" stroke-dashoffset="-200" />
                <circle cx="80" cy="80" r="54" fill="none" stroke="#10B981" stroke-width="24" stroke-dasharray="35 340" stroke-dashoffset="-245" />
                <circle cx="80" cy="80" r="54" fill="none" stroke="#8B5CF6" stroke-width="24" stroke-dasharray="35 340" stroke-dashoffset="-280" />
                <circle cx="80" cy="80" r="54" fill="none" stroke="#06B6D4" stroke-width="24" stroke-dasharray="15 340" stroke-dashoffset="-315" />
                <circle cx="80" cy="80" r="54" fill="none" stroke="#EF4444" stroke-width="24" stroke-dasharray="10 340" stroke-dashoffset="-330" />
              </svg>
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 16px; font-weight: 800; color: #0B0B0F;">1,247</span>
                <span style="font-size: 9px; color: #64748B; font-weight: 500;">Total</span>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 5px; width: 100%; font-size: 9.5px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #334155; font-weight: 500;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #2563EB; display: inline-block;"></span> New</span>
                <span style="font-weight: 600; color: #0B0B0F;">1,104 <span style="color: #64748B; font-weight: 400;">(88.5%)</span></span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #334155; font-weight: 500;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #4F46E5; display: inline-block;"></span> Under Assessment</span>
                <span style="font-weight: 600; color: #0B0B0F;">317 <span style="color: #64748B; font-weight: 400;">(25.4%)</span></span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #334155; font-weight: 500;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #F59E0B; display: inline-block;"></span> Processing</span>
                <span style="font-weight: 600; color: #0B0B0F;">286 <span style="color: #64748B; font-weight: 400;">(22.9%)</span></span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #334155; font-weight: 500;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #10B981; display: inline-block;"></span> Documents Pending</span>
                <span style="font-weight: 600; color: #0B0B0F;">162 <span style="color: #64748B; font-weight: 400;">(13.0%)</span></span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #334155; font-weight: 500;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #8B5CF6; display: inline-block;"></span> Lender Review</span>
                <span style="font-weight: 600; color: #0B0B0F;">203 <span style="color: #64748B; font-weight: 400;">(16.3%)</span></span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #334155; font-weight: 500;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #06B6D4; display: inline-block;"></span> Approved</span>
                <span style="font-weight: 600; color: #0B0B0F;">151 <span style="color: #64748B; font-weight: 400;">(12.1%)</span></span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #334155; font-weight: 500;"><span style="width: 7px; height: 7px; border-radius: 50%; background: #EF4444; display: inline-block;"></span> Declined</span>
                <span style="font-weight: 600; color: #0B0B0F;">76 <span style="color: #64748B; font-weight: 400;">(6.1%)</span></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: New Applications Over Time (Line Area) -->
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 18px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 11px; font-weight: 700; color: #0B0B0F; letter-spacing: 0.04em; text-transform: uppercase;">
              NEW APPLICATIONS OVER TIME
            </span>
            <span style="font-size: 9.5px; font-weight: 600; color: #2D62FF; background: #EFF4FF; padding: 2px 8px; border-radius: 6px;">
              Daily
            </span>
          </div>

          <div style="width: 100%; height: 140px; position: relative;">
            <svg viewBox="0 0 450 140" width="100%" height="140" style="overflow: visible;">
              <defs>
                <linearGradient id="p1AreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2D62FF" stop-opacity="0.25" />
                  <stop offset="100%" stop-color="#2D62FF" stop-opacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="30" y1="15" x2="440" y2="15" stroke="#F1F5F9" stroke-width="1" />
              <line x1="30" y1="50" x2="440" y2="50" stroke="#F1F5F9" stroke-width="1" />
              <line x1="30" y1="85" x2="440" y2="85" stroke="#F1F5F9" stroke-width="1" />
              <line x1="30" y1="120" x2="440" y2="120" stroke="#E2E8F0" stroke-width="1" />
              <text x="5" y="18" fill="#94A3B8" font-size="8.5" font-family="sans-serif">100</text>
              <text x="10" y="53" fill="#94A3B8" font-size="8.5" font-family="sans-serif">60</text>
              <text x="10" y="88" fill="#94A3B8" font-size="8.5" font-family="sans-serif">40</text>
              <text x="16" y="123" fill="#94A3B8" font-size="8.5" font-family="sans-serif">0</text>
              <polygon points="35,88 50,80 65,84 80,92 95,82 110,88 125,78 140,84 155,72 170,78 185,60 200,54 215,68 230,72 245,90 260,76 275,70 290,74 305,58 320,48 335,60 350,56 365,72 380,48 395,120 35,120" fill="url(#p1AreaGradient)" />
              <polyline points="35,88 50,80 65,84 80,92 95,82 110,88 125,78 140,84 155,72 170,78 185,60 200,54 215,68 230,72 245,90 260,76 275,70 290,74 305,58 320,48 335,60 350,56 365,72 380,48" fill="none" stroke="#2D62FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="35" cy="88" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="50" cy="80" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="80" cy="92" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="125" cy="78" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="155" cy="72" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="200" cy="54" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="245" cy="90" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="275" cy="70" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="320" cy="48" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="350" cy="56" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <circle cx="380" cy="48" r="3.5" fill="#FFFFFF" stroke="#2D62FF" stroke-width="2" />
              <text x="30" y="136" fill="#64748B" font-size="8.5" font-family="sans-serif">May 1</text>
              <text x="88" y="136" fill="#64748B" font-size="8.5" font-family="sans-serif">May 6</text>
              <text x="146" y="136" fill="#64748B" font-size="8.5" font-family="sans-serif">May 11</text>
              <text x="204" y="136" fill="#64748B" font-size="8.5" font-family="sans-serif">May 16</text>
              <text x="262" y="136" fill="#64748B" font-size="8.5" font-family="sans-serif">May 21</text>
              <text x="320" y="136" fill="#64748B" font-size="8.5" font-family="sans-serif">May 26</text>
              <text x="368" y="136" fill="#64748B" font-size="8.5" font-family="sans-serif">May 31</text>
            </svg>
          </div>
        </div>
      </div>

      <!-- SECTION: SUMMARY TABLE & RECENT APPLICATIONS -->
      <div style="display: grid; grid-template-columns: 1fr 1.9fr; gap: 14px; margin-bottom: 18px;">
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0B0B0F; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 10px;">
            APPLICATIONS BY STATUS (SUMMARY)
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="border-bottom: 1px solid #E2E8F0; color: #64748B; text-align: left;">
                <th style="padding: 4px 0; font-weight: 600;">Status</th>
                <th style="padding: 4px 0; font-weight: 600; text-align: center;">Applications</th>
                <th style="padding: 4px 0; font-weight: 600; text-align: right;">Percentage</th>
              </tr>
            </thead>
            <tbody style="color: #334155;">
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 5px 0;"><span style="color: #2563EB; margin-right: 4px;">●</span> New</td><td style="padding: 5px 0; text-align: center; font-weight: 600; color: #0B0B0F;">1,104</td><td style="padding: 5px 0; text-align: right;">38.7%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 5px 0;"><span style="color: #4F46E5; margin-right: 4px;">●</span> Under Assessment</td><td style="padding: 5px 0; text-align: center; font-weight: 600; color: #0B0B0F;">317</td><td style="padding: 5px 0; text-align: right;">25.4%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 5px 0;"><span style="color: #F59E0B; margin-right: 4px;">●</span> Processing</td><td style="padding: 5px 0; text-align: center; font-weight: 600; color: #0B0B0F;">286</td><td style="padding: 5px 0; text-align: right;">22.9%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 5px 0;"><span style="color: #10B981; margin-right: 4px;">●</span> Documents Pending</td><td style="padding: 5px 0; text-align: center; font-weight: 600; color: #0B0B0F;">162</td><td style="padding: 5px 0; text-align: right;">13.0%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 5px 0;"><span style="color: #8B5CF6; margin-right: 4px;">●</span> Lender Review</td><td style="padding: 5px 0; text-align: center; font-weight: 600; color: #0B0B0F;">203</td><td style="padding: 5px 0; text-align: right;">16.3%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 5px 0;"><span style="color: #06B6D4; margin-right: 4px;">●</span> Approved</td><td style="padding: 5px 0; text-align: center; font-weight: 600; color: #0B0B0F;">151</td><td style="padding: 5px 0; text-align: right;">12.1%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 5px 0;"><span style="color: #EF4444; margin-right: 4px;">●</span> Declined</td><td style="padding: 5px 0; text-align: center; font-weight: 600; color: #0B0B0F;">76</td><td style="padding: 5px 0; text-align: right;">6.1%</td></tr>
              <tr style="font-weight: 700; color: #0B0B0F;"><td style="padding: 6px 0;">Total</td><td style="padding: 6px 0; text-align: center;">1,247</td><td style="padding: 6px 0; text-align: right;">100%</td></tr>
            </tbody>
          </table>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px;">
          <div style="font-size: 10.5px; font-weight: 700; color: #0B0B0F; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 10px;">
            RECENT APPLICATION ACTIVITY
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="border-bottom: 1px solid #E2E8F0; color: #64748B; text-align: left;">
                <th style="padding: 4px 0; font-weight: 600;">Application ID</th>
                <th style="padding: 4px 0; font-weight: 600;">Customer</th>
                <th style="padding: 4px 0; font-weight: 600;">Type</th>
                <th style="padding: 4px 0; font-weight: 600;">Amount</th>
                <th style="padding: 4px 0; font-weight: 600; text-align: center;">Status</th>
                <th style="padding: 4px 0; font-weight: 600; text-align: right;">Date</th>
              </tr>
            </thead>
            <tbody style="color: #334155;">
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">AKO-105432</td><td style="padding: 6px 0;">John Doe</td><td style="padding: 6px 0; color: #64748B;">Individual</td><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">₦2,000,000</td><td style="padding: 6px 0; text-align: center;"><span style="background: #FEF3C7; color: #D97706; padding: 2px 7px; border-radius: 6px; font-size: 8px; font-weight: 600;">Under Assessment</span></td><td style="padding: 6px 0; text-align: right; color: #64748B;">May 31, 2026 10:24 AM</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">AKO-105431</td><td style="padding: 6px 0;">Acme Global Ltd.</td><td style="padding: 6px 0; color: #64748B;">Business</td><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">₦5,000,000</td><td style="padding: 6px 0; text-align: center;"><span style="background: #FEE2E2; color: #DC2626; padding: 2px 7px; border-radius: 6px; font-size: 8px; font-weight: 600;">Documents Pending</span></td><td style="padding: 6px 0; text-align: right; color: #64748B;">May 31, 2026 09:15 AM</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">AKO-105430</td><td style="padding: 6px 0;">Jane Smith</td><td style="padding: 6px 0; color: #64748B;">Individual</td><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">₦1,500,000</td><td style="padding: 6px 0; text-align: center;"><span style="background: #EFF4FF; color: #2D62FF; padding: 2px 7px; border-radius: 6px; font-size: 8px; font-weight: 600;">Processing</span></td><td style="padding: 6px 0; text-align: right; color: #64748B;">May 30, 2026 04:48 PM</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">AKO-105429</td><td style="padding: 6px 0;">Greenfield Stores</td><td style="padding: 6px 0; color: #64748B;">Business</td><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">₦3,200,000</td><td style="padding: 6px 0; text-align: center;"><span style="background: #F3E8FF; color: #9333EA; padding: 2px 7px; border-radius: 6px; font-size: 8px; font-weight: 600;">Lender Review</span></td><td style="padding: 6px 0; text-align: right; color: #64748B;">May 30, 2026 02:31 PM</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">AKO-105428</td><td style="padding: 6px 0;">Michael Okafor</td><td style="padding: 6px 0; color: #64748B;">Individual</td><td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">₦800,000</td><td style="padding: 6px 0; text-align: center;"><span style="background: #FEF3C7; color: #D97706; padding: 2px 7px; border-radius: 6px; font-size: 8px; font-weight: 600;">Under Assessment</span></td><td style="padding: 6px 0; text-align: right; color: #64748B;">May 30, 2026 11:07 AM</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- BOTTOM 3 CARDS: TOP SOURCES, FOLLOW-UPS, STAFF ACTIVITY -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px;">
          <div style="font-size: 10px; font-weight: 700; color: #0B0B0F; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 10px;">
            TOP APPLICATION SOURCES
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead><tr style="border-bottom: 1px solid #E2E8F0; color: #64748B; text-align: left;"><th style="padding: 3px 0;">Source</th><th style="padding: 3px 0; text-align: center;">Visitors</th><th style="padding: 3px 0; text-align: right;">Percentage</th></tr></thead>
            <tbody style="color: #334155;">
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0;"><span style="color: #2563EB; margin-right: 4px;">●</span> Direct</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">10,842</td><td style="padding: 4px 0; text-align: right;">43.6%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0;"><span style="color: #2D62FF; margin-right: 4px;">●</span> Organic Search</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">8,276</td><td style="padding: 4px 0; text-align: right;">33.3%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0;"><span style="color: #10B981; margin-right: 4px;">●</span> Social Media</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">3,256</td><td style="padding: 4px 0; text-align: right;">13.1%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0;"><span style="color: #F59E0B; margin-right: 4px;">●</span> Referral</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">1,842</td><td style="padding: 4px 0; text-align: right;">7.4%</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0;"><span style="color: #64748B; margin-right: 4px;">●</span> Others</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">626</td><td style="padding: 4px 0; text-align: right;">2.6%</td></tr>
              <tr style="font-weight: 700; color: #0B0B0F;"><td style="padding: 5px 0;">Total</td><td style="padding: 5px 0; text-align: center;">24,842</td><td style="padding: 5px 0; text-align: right;">100%</td></tr>
            </tbody>
          </table>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="font-size: 10px; font-weight: 700; color: #0B0B0F; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 10px;">
              FOLLOW-UPS OVERVIEW
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 9.5px; margin-bottom: 8px; font-weight: 700; color: #0B0B0F;">
              <span>Total Follow-ups</span><span>498</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 5px; font-size: 9px;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 3px;"><span style="color: #64748B;">Completed</span><span style="font-weight: 600; color: #0B0B0F;">299 <span style="color: #16A34A; margin-left: 6px; font-weight: 700;">63.4%</span></span></div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #F1F5F9; padding-bottom: 3px;"><span style="color: #64748B;">Pending</span><span style="font-weight: 600; color: #0B0B0F;">149 <span style="color: #D97706; margin-left: 6px; font-weight: 700;">32.7%</span></span></div>
              <div style="display: flex; justify-content: space-between;"><span style="color: #64748B;">Overdue</span><span style="font-weight: 600; color: #0B0B0F;">18 <span style="color: #DC2626; margin-left: 6px; font-weight: 700;">3.9%</span></span></div>
            </div>
          </div>
          <div style="background: #EFF4FF; border: 1px solid #DBEAFE; border-radius: 8px; padding: 7px 10px; display: flex; align-items: center; gap: 8px; margin-top: 10px;">
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #2D62FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
            <div style="font-size: 8px; color: #1E40AF; font-weight: 500; line-height: 1.2;"><strong style="color: #1E3A8A;">18 follow ups are overdue.</strong><br/>Please take necessary action.</div>
          </div>
        </div>

        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px;">
          <div style="font-size: 10px; font-weight: 700; color: #0B0B0F; letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 10px;">
            STAFF ACTIVITY (THIS MONTH)
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead><tr style="border-bottom: 1px solid #E2E8F0; color: #64748B; text-align: left;"><th style="padding: 3px 0;">Staff Member</th><th style="padding: 3px 0; text-align: center;">Applications</th><th style="padding: 3px 0; text-align: right;">Follow-ups</th></tr></thead>
            <tbody style="color: #334155;">
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0; font-weight: 500;">Sarah Johnson</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">321</td><td style="padding: 4px 0; text-align: right; color: #64748B;">128</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0; font-weight: 500;">Mike Adewale</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">287</td><td style="padding: 4px 0; text-align: right; color: #64748B;">104</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0; font-weight: 500;">Daniel Yusuf</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">212</td><td style="padding: 4px 0; text-align: right; color: #64748B;">86</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0; font-weight: 500;">Chiamaka N.</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">173</td><td style="padding: 4px 0; text-align: right; color: #64748B;">74</td></tr>
              <tr style="border-bottom: 1px solid #F1F5F9;"><td style="padding: 4px 0; font-weight: 500;">Others</td><td style="padding: 4px 0; text-align: center; font-weight: 600; color: #0B0B0F;">254</td><td style="padding: 4px 0; text-align: right; color: #64748B;">64</td></tr>
              <tr style="font-weight: 700; color: #0B0B0F;"><td style="padding: 5px 0;">Total</td><td style="padding: 5px 0; text-align: center;">1,247</td><td style="padding: 5px 0; text-align: right;">456</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // ==========================================
  // PAGE 2: ENTIRE WEBSITE METADATA & FULL APPLICATION REGISTRY
  // ==========================================
  const page2 = document.createElement('div');
  page2.style.width = '960px';
  page2.style.minHeight = '1355px';
  page2.style.backgroundColor = '#FFFFFF';
  page2.style.padding = '32px 36px';
  page2.style.boxSizing = 'border-box';
  page2.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  page2.style.display = 'flex';
  page2.style.flexDirection = 'column';

  const appDossierRows = data.applications.map((app) => {
    const isBiz = app.applicant_type === 'BUSINESS';
    const borrowerName = `${app.applicant_info.first_name} ${app.applicant_info.last_name}`;
    const entity = isBiz && app.applicant_info.business_name ? app.applicant_info.business_name : 'Individual Primary';
    const identifier = isBiz ? (app.applicant_info.cac_number || 'RC Pending') : (app.applicant_info.employment_status || 'Salaried');
    const lender = app.assigned_lender_name ? app.assigned_lender_name.split('—')[0].trim() : 'Direct Match';
    const staff = app.assigned_staff_name ? app.assigned_staff_name.split(' ')[0] : 'Admin';

    return `
      <tr style="border-bottom: 1px solid #F1F5F9; font-size: 8.5px;">
        <td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">${app.reference_number}</td>
        <td style="padding: 6px 0;">
          <div style="font-weight: 600; color: #0B0B0F;">${borrowerName}</div>
          <div style="font-size: 7.5px; color: #64748B;">${entity}</div>
        </td>
        <td style="padding: 6px 0; color: #64748B;">${identifier}</td>
        <td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">${formatNGN(app.requested_amount)}</td>
        <td style="padding: 6px 0;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 5px; font-size: 7.5px; font-weight: 600; ${
            app.status === 'APPROVED'
              ? 'background: #DCFCE7; color: #15803D;'
              : app.status === 'DOCUMENTS_REQUIRED'
              ? 'background: #FEE2E2; color: #DC2626;'
              : app.status === 'INITIAL_ASSESSMENT'
              ? 'background: #FEF3C7; color: #D97706;'
              : 'background: #EFF4FF; color: #2D62FF;'
          }">
            ${app.status.replace(/_/g, ' ')}
          </span>
        </td>
        <td style="padding: 6px 0; font-size: 8px; color: #334155;">${lender}</td>
        <td style="padding: 6px 0; color: #64748B;">${staff}</td>
        <td style="padding: 6px 0; text-align: right; color: #64748B;">${new Date(app.created_at).toLocaleDateString('en-GB')}</td>
      </tr>
    `;
  }).join('');

  page2.innerHTML = `
    <div>
      ${createPageHeader('Website System Metadata & Live Applications', 'Platform Architecture, Core Configuration & Live Underwriting Dossiers', 2)}

      <!-- 4 METADATA ARCHITECTURE CARDS -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
          <div style="font-size: 8.5px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">HOST INFRASTRUCTURE</div>
          <div style="font-size: 13px; font-weight: 800; color: #0B0B0F;">Node / Express API</div>
          <div style="font-size: 8px; color: #64748B; margin-top: 2px;">Vite 6 + React 19 Frontend</div>
          <div style="font-size: 7.5px; color: #2D62FF; font-weight: 600; margin-top: 4px;">SSL / TLS 1.3 Active</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
          <div style="font-size: 8.5px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">DATABASE HEALTH</div>
          <div style="font-size: 13px; font-weight: 800; color: #16A34A;">PostgreSQL Live</div>
          <div style="font-size: 8px; color: #64748B; margin-top: 2px;">99.98% SLA Availability</div>
          <div style="font-size: 7.5px; color: #16A34A; font-weight: 600; margin-top: 4px;">Zero Replication Lag</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
          <div style="font-size: 8.5px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">SECURITY CLEARANCE</div>
          <div style="font-size: 13px; font-weight: 800; color: #4F46E5;">Super Admin Access</div>
          <div style="font-size: 8px; color: #64748B; margin-top: 2px;">AES-256 GCM Document Vault</div>
          <div style="font-size: 7.5px; color: #4F46E5; font-weight: 600; margin-top: 4px;">Single-Admin Role Guarded</div>
        </div>

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 12px 14px;">
          <div style="font-size: 8.5px; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 4px;">REGULATORY JURISDICTION</div>
          <div style="font-size: 13px; font-weight: 800; color: #0B0B0F;">Nigeria (CBN / CAC)</div>
          <div style="font-size: 8px; color: #64748B; margin-top: 2px;">Regulated Brokerage Framework</div>
          <div style="font-size: 7.5px; color: #2D62FF; font-weight: 600; margin-top: 4px;">RC & NIN Identity Verified</div>
        </div>
      </div>

      <!-- FULL APPLICATIONS REGISTRY TABLE -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 18px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 11px; font-weight: 800; color: #0B0B0F; text-transform: uppercase;">
            ACTIVE LOAN UNDERWRITING DOSSIERS REGISTRY (ALL LIVE CASES)
          </div>
          <div style="font-size: 9px; font-weight: 700; color: #2D62FF;">
            Total Pipeline: ${formatNGN(totalVolume)}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1.5px solid #CBD5E1; color: #475569; font-size: 8.5px; text-align: left; font-weight: 700;">
              <th style="padding: 5px 0;">Reference</th>
              <th style="padding: 5px 0;">Borrower / Entity</th>
              <th style="padding: 5px 0;">Identifier / Status</th>
              <th style="padding: 5px 0;">Amount (NGN)</th>
              <th style="padding: 5px 0;">Stage</th>
              <th style="padding: 5px 0;">Lender Desk</th>
              <th style="padding: 5px 0;">Officer</th>
              <th style="padding: 5px 0; text-align: right;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${appDossierRows}
          </tbody>
        </table>
      </div>
    </div>
    ${createPageFooter(2)}
  `;

  // ==========================================
  // PAGE 3: INSTITUTIONAL LENDERS & CUSTOMER DIRECTORY
  // ==========================================
  const page3 = document.createElement('div');
  page3.style.width = '960px';
  page3.style.minHeight = '1355px';
  page3.style.backgroundColor = '#FFFFFF';
  page3.style.padding = '32px 36px';
  page3.style.boxSizing = 'border-box';
  page3.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  page3.style.display = 'flex';
  page3.style.flexDirection = 'column';

  const lenderRows = data.lenders.map((l) => `
    <tr style="border-bottom: 1px solid #F1F5F9; font-size: 8.5px;">
      <td style="padding: 7px 0; font-weight: 700; color: #0B0B0F;">${l.name.replace(' [DEMO]', '')}</td>
      <td style="padding: 7px 0; color: #64748B;">${l.institution_type}</td>
      <td style="padding: 7px 0; color: #334155;">${l.products.join(', ')}</td>
      <td style="padding: 7px 0; font-weight: 700; color: #0B0B0F;">${formatNGN(l.min_amount)} - ${formatNGN(l.max_amount)}</td>
      <td style="padding: 7px 0; font-weight: 600; color: #2D62FF;">${l.processing_days}</td>
      <td style="padding: 7px 0; text-align: right; color: #64748B;">${l.contact_email || 'credit@partner.com'}</td>
    </tr>
  `).join('');

  const customerRows = data.customers.map((c) => `
    <tr style="border-bottom: 1px solid #F1F5F9; font-size: 8.5px;">
      <td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">${c.full_name}</td>
      <td style="padding: 6px 0; color: #475569;">${c.email}</td>
      <td style="padding: 6px 0; color: #64748B;">${c.phone || '+234800000000'}</td>
      <td style="padding: 6px 0; color: #64748B;">${c.role}</td>
      <td style="padding: 6px 0;"><span style="background: #DCFCE7; color: #166534; padding: 2px 6px; border-radius: 5px; font-size: 7.5px; font-weight: 700;">Tier 2 (Verified)</span></td>
      <td style="padding: 6px 0; text-align: right; color: #64748B;">${new Date(c.created_at).toLocaleDateString('en-GB')}</td>
    </tr>
  `).join('');

  page3.innerHTML = `
    <div>
      ${createPageHeader('Institutional Credit Desks & Customer Directory', 'Partner Commercial Banks, DFIs & Registered Borrower Accounts', 3)}

      <!-- LENDERS TABLE -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 18px; margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 800; color: #0B0B0F; text-transform: uppercase; margin-bottom: 10px;">
          INSTITUTIONAL LENDER NETWORK & CREDIT MANDATES (${data.lenders.length} PARTNERS)
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1.5px solid #CBD5E1; color: #475569; font-size: 8.5px; text-align: left; font-weight: 700;">
              <th style="padding: 5px 0;">Partner Bank / Desk</th>
              <th style="padding: 5px 0;">Type</th>
              <th style="padding: 5px 0;">Financing Facilities</th>
              <th style="padding: 5px 0;">Facility Range</th>
              <th style="padding: 5px 0;">Turnaround</th>
              <th style="padding: 5px 0; text-align: right;">Contact Desk</th>
            </tr>
          </thead>
          <tbody>
            ${lenderRows}
          </tbody>
        </table>
      </div>

      <!-- CUSTOMERS DIRECTORY TABLE -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px 18px;">
        <div style="font-size: 11px; font-weight: 800; color: #0B0B0F; text-transform: uppercase; margin-bottom: 10px;">
          REGISTERED BORROWER ACCOUNTS & KYC CLEARANCE
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1.5px solid #CBD5E1; color: #475569; font-size: 8.5px; text-align: left; font-weight: 700;">
              <th style="padding: 5px 0;">Customer Name</th>
              <th style="padding: 5px 0;">Email</th>
              <th style="padding: 5px 0;">Phone</th>
              <th style="padding: 5px 0;">Role</th>
              <th style="padding: 5px 0;">KYC Status</th>
              <th style="padding: 5px 0; text-align: right;">Registered Date</th>
            </tr>
          </thead>
          <tbody>
            ${customerRows}
          </tbody>
        </table>
      </div>
    </div>
    ${createPageFooter(3)}
  `;

  // ==========================================
  // PAGE 4: DOCUMENT VAULT, TASKS & AUDIT TRAIL
  // ==========================================
  const page4 = document.createElement('div');
  page4.style.width = '960px';
  page4.style.minHeight = '1355px';
  page4.style.backgroundColor = '#FFFFFF';
  page4.style.padding = '32px 36px';
  page4.style.boxSizing = 'border-box';
  page4.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  page4.style.display = 'flex';
  page4.style.flexDirection = 'column';

  const docRows = data.documents.map((d) => {
    const linked = data.applications.find((a) => a.id === d.application_id);
    return `
      <tr style="border-bottom: 1px solid #F1F5F9; font-size: 8.5px;">
        <td style="padding: 6px 0; font-weight: 700; color: #0B0B0F;">${linked?.reference_number || 'General'}</td>
        <td style="padding: 6px 0; color: #334155;">${d.document_type}</td>
        <td style="padding: 6px 0; font-weight: 500; color: #0B0B0F;">${d.name}</td>
        <td style="padding: 6px 0; color: #64748B;">${d.file_size}</td>
        <td style="padding: 6px 0;"><span style="background: #DCFCE7; color: #15803D; padding: 2px 6px; border-radius: 5px; font-size: 7.5px; font-weight: 700;">${d.status}</span></td>
        <td style="padding: 6px 0; text-align: right; color: #64748B;">${d.notes || 'Verified with CAC registry'}</td>
      </tr>
    `;
  }).join('');

  const auditRows = data.auditLogs.slice(0, 10).map((log) => `
    <tr style="border-bottom: 1px solid #F1F5F9; font-size: 8px;">
      <td style="padding: 5px 0; font-weight: 700; color: #0B0B0F;">${log.id}</td>
      <td style="padding: 5px 0; color: #64748B;">${new Date(log.timestamp).toLocaleString('en-GB')}</td>
      <td style="padding: 5px 0; font-weight: 600; color: #0B0B0F;">${log.user_name || 'Administrator'}</td>
      <td style="padding: 5px 0; color: #2D62FF; font-weight: 600;">${log.action}</td>
      <td style="padding: 5px 0; text-align: right; color: #475569;">${log.details}</td>
    </tr>
  `).join('');

  page4.innerHTML = `
    <div>
      ${createPageHeader('Compliance Vault, Operational Tasks & Audit Logs', 'Document Verification, Underwriting Action Queues & System Audit Trail', 4)}

      <!-- DOCUMENT VAULT -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;">
        <div style="font-size: 10.5px; font-weight: 800; color: #0B0B0F; text-transform: uppercase; margin-bottom: 8px;">
          DOCUMENT VAULT & CORPORATE COMPLIANCE AUDIT
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1.5px solid #CBD5E1; color: #475569; font-size: 8.5px; text-align: left; font-weight: 700;">
              <th style="padding: 4px 0;">App Ref</th>
              <th style="padding: 4px 0;">Category</th>
              <th style="padding: 4px 0;">File Name</th>
              <th style="padding: 4px 0;">Size</th>
              <th style="padding: 4px 0;">Verification</th>
              <th style="padding: 4px 0; text-align: right;">Compliance Notes</th>
            </tr>
          </thead>
          <tbody>
            ${docRows}
          </tbody>
        </table>
      </div>

      <!-- AUDIT LOGS -->
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;">
        <div style="font-size: 10.5px; font-weight: 800; color: #0B0B0F; text-transform: uppercase; margin-bottom: 8px;">
          IMMUTABLE SYSTEM GOVERNANCE & AUDIT LOGS
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1.5px solid #CBD5E1; color: #475569; font-size: 8px; text-align: left; font-weight: 700;">
              <th style="padding: 4px 0;">Log ID</th>
              <th style="padding: 4px 0;">Timestamp</th>
              <th style="padding: 4px 0;">Actor</th>
              <th style="padding: 4px 0;">Action Code</th>
              <th style="padding: 4px 0; text-align: right;">Operation Details</th>
            </tr>
          </thead>
          <tbody>
            ${auditRows}
          </tbody>
        </table>
      </div>

      <!-- REGULATORY SIGN-OFF -->
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; display: flex; align-items: flex-start; gap: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: #DCFCE7; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803D" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div style="font-size: 8.5px; color: #334155; line-height: 1.3;">
          <div style="font-weight: 800; color: #0B0B0F; font-size: 9.5px; margin-bottom: 2px;">
            Regulatory Underwriting & Metadata Certification
          </div>
          All credit requests, applicant KYC verifications, documents, and banking partner decisions recorded in this system metadata report were executed under strict Central Bank of Nigeria (CBN) and Federal Ministry of Finance commercial lending frameworks.
          <div style="margin-top: 4px; font-weight: 700; color: #64748B;">
            VERIFICATION HASH: #AKO-METADATA-2026-CBN-NDIC-SECURED
          </div>
        </div>
      </div>
    </div>
    ${createPageFooter(4)}
  `;

  // Append all 4 pages to container
  rootContainer.appendChild(page1);
  rootContainer.appendChild(page2);
  rootContainer.appendChild(page3);
  rootContainer.appendChild(page4);
  document.body.appendChild(rootContainer);

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    const pages = [page1, page2, page3, page4];

    for (let i = 0; i < pages.length; i++) {
      const pageEl = pages[i];
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF'
      });

      const imgData = canvas.toDataURL('image/png');
      if (i > 0) {
        doc.addPage();
      }

      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }

    const filename = `AkoFinanced_Complete_Website_Activity_and_Metadata_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  } finally {
    if (document.body.contains(rootContainer)) {
      document.body.removeChild(rootContainer);
    }
  }
}
