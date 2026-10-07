import { Application, User, Lender, FollowUp, AuditLog } from '../types';

const TOKEN_KEY = 'akofinanced_auth_token';
const LEGACY_TOKEN_KEY = 'akofinanced_token';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem('akofinanced_user') : null;
  let userEmail = '';
  if (savedUserStr) {
    try {
      const parsed = JSON.parse(savedUserStr);
      if (parsed?.email) userEmail = parsed.email;
    } catch {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userEmail) {
    headers['x-user-email'] = userEmail;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('akofinanced:auth-expired', {
            detail: { error: data.error || 'Session expired or invalid token' }
          })
        );
      }
    }
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(data: { email: string; password?: string; full_name: string; phone?: string; pending_reference_number?: string; auth_provider?: 'google' | 'github' | 'facebook' | 'email'; avatar_url?: string }) {
    const res = await request<{ user: User; token: string; linked_reference?: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async login(data: { email: string; password?: string; full_name?: string; phone?: string; pending_reference_number?: string; auth_provider?: 'google' | 'github' | 'facebook' | 'email'; avatar_url?: string }) {
    const res = await request<{ user: User; token: string; linked_reference?: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.token) setStoredToken(res.token);
    return res;
  },

  async getMe() {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(data: { 
    full_name?: string; 
    phone?: string; 
    preferred_contact_method?: string; 
    address?: string;
    dob?: string;
    city?: string;
    state?: string;
  }) {
    return request<{ user: User; message: string }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  logout() {
    setStoredToken(null);
  },

  // Applications
  async submitApplication(data: { applicant_type: 'INDIVIDUAL' | 'BUSINESS'; applicant_info: any; requested_amount: number }) {
    return request<{ success: boolean; reference_number: string; application: Application; message: string }>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getApplicationByRef(refNum: string) {
    return request<{ reference_number: string; applicant_type: string; requested_amount: number; status: string; created_at: string; has_account: boolean }>(`/api/applications/ref/${refNum}`);
  },

  async getMyApplications() {
    return request<{ applications: Application[] }>('/api/applications/my');
  },

  async getApplicationDetail(id: string) {
    return request<{
      application: Application;
      timeline: any[];
      documents: any[];
      document_requirements: any[];
      messages: any[];
      followups: any[];
    }>(`/api/applications/${id}`);
  },

  async uploadDocument(appId: string, docData: { document_type: string; name: string; file_data?: string; file_size?: string }) {
    return request<{ document: any; message: string }>(`/api/applications/${appId}/documents`, {
      method: 'POST',
      body: JSON.stringify(docData)
    });
  },

  async sendMessage(appId: string, text: string) {
    return request<{ message: any }>(`/api/applications/${appId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  // Admin / Staff CRM
  async getAdminDashboardMetrics() {
    return request<{ metrics: any }>('/api/admin/dashboard');
  },

  async getAdminApplications(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return request<{ applications: Application[] }>(`/api/admin/applications${query ? `?${query}` : ''}`);
  },

  async updateApplicationStatus(appId: string, data: { status?: string; assigned_staff_id?: string; assigned_lender_id?: string; note?: string }) {
    return request<{ application: Application; message: string }>(`/api/admin/applications/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async matchLenders(appId: string) {
    return request<{ application_id: string; reference_number: string; matches: any[] }>(`/api/admin/applications/${appId}/match-lenders`, {
      method: 'POST'
    });
  },

  async getFollowUps() {
    return request<{ due_today: FollowUp[]; overdue: FollowUp[]; upcoming: FollowUp[]; completed: FollowUp[] }>('/api/admin/followups');
  },

  async createFollowUp(appId: string, data: { due_date: string; type: string; notes: string }) {
    return request<{ followup: FollowUp }>(`/api/admin/applications/${appId}/followups`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateFollowUp(fId: string, data: { completed?: boolean; outcome?: string }) {
    return request<{ followup: FollowUp }>(`/api/admin/followups/${fId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async getLenders() {
    return request<{ lenders: Lender[] }>('/api/admin/lenders');
  },

  async createLender(data: Partial<Lender>) {
    return request<{ lender: Lender }>('/api/admin/lenders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateLender(lenderId: string, data: Partial<Lender>) {
    return request<{ lender: Lender; message: string }>(`/api/admin/lenders/${lenderId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async deleteLender(lenderId: string) {
    return request<{ message: string }>(`/api/admin/lenders/${lenderId}`, {
      method: 'DELETE'
    });
  },

  async getCustomers(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return request<{ customers: any[] }>(`/api/admin/customers${query ? `?${query}` : ''}`);
  },

  async getCentralDocuments(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return request<{ documents: any[] }>(`/api/admin/documents${query ? `?${query}` : ''}`);
  },

  async updateDocumentStatus(docId: string, data: { status: 'VERIFIED' | 'REJECTED' | 'PENDING'; notes?: string }) {
    return request<{ document: any; message: string }>(`/api/admin/documents/${docId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async addApplicationNote(appId: string, text: string) {
    return request<{ note: any; message: string }>(`/api/admin/applications/${appId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  async recordLenderOffer(appId: string, data: {
    approved_amount?: number;
    interest_rate_monthly?: number;
    tenor_months?: number;
    monthly_repayment?: number;
    advisory_fee?: number;
    decision_note?: string;
    decision_status?: 'APPROVED' | 'DECLINED';
  }) {
    return request<{ application: Application; lender_offer: any; message: string }>(`/api/admin/applications/${appId}/lender-offer`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getAdminMessageThreads() {
    return request<{ threads: any[] }>('/api/admin/messages');
  },

  async getAdminReports() {
    return request<{
      metrics: any;
      monthly_trends: any[];
      status_breakdown: any[];
      category_breakdown: any[];
      lender_distribution: any[];
      staff_performance: any[];
    }>('/api/admin/reports');
  },

  async createStaff(data: { email: string; full_name: string; phone?: string; role: string }) {
    return request<{ staff: User; message: string }>('/api/admin/staff', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateStaff(staffId: string, data: { role?: string; phone?: string; full_name?: string }) {
    return request<{ staff: User; message: string }>(`/api/admin/staff/${staffId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async getSettings() {
    return request<{ settings: any }>('/api/admin/settings');
  },

  async getAdminSettings() {
    return this.getSettings();
  },

  async updateSettings(data: any) {
    return request<{ settings: any; message: string }>('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  async updateAdminSettings(data: any) {
    return this.updateSettings(data);
  },

  async getAuditLogs(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return request<{ logs: AuditLog[] }>(`/api/admin/audit-logs${query ? `?${query}` : ''}`);
  },

  async getAdminAuditLogs(params: Record<string, string> = {}) {
    return this.getAuditLogs(params);
  },

  async getApplicationById(id: string) {
    return this.getApplicationDetail(id);
  },

  async getStaffUsers() {
    return request<{ staff: any[] }>('/api/admin/staff');
  }
};
