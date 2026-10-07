export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'LOAN_OFFICER' | 'REVIEWER' | 'CUSTOMER';

export type ApplicantType = 'INDIVIDUAL' | 'BUSINESS';

export type ApplicationStatus =
  | 'UNDER_REVIEW'
  | 'INITIAL_ASSESSMENT'
  | 'PROCESSING'
  | 'DOCUMENTS_REQUIRED'
  | 'LENDER_MATCHED'
  | 'SUBMITTED_TO_LENDER'
  | 'LENDER_REVIEW'
  | 'APPROVED'
  | 'DECLINED';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  created_at: string;
  preferred_contact_method?: string;
  address?: string;
  dob?: string;
  city?: string;
  state?: string;
  auth_provider?: 'google' | 'github' | 'facebook' | 'email';
  avatar_url?: string;
}

export interface ApplicantInfo {
  // Common
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  state_location: string;
  
  // Individual specific
  employment_status?: string; // 'Salaried' | 'Self-Employed' | 'Business Owner' | 'Contractor'
  employer_name?: string;
  monthly_income?: number; // NGN
  monthly_expenses?: number; // NGN
  existing_loans?: number; // Monthly repayment NGN
  
  // Business specific
  business_name?: string;
  business_type?: string; // 'Sole Proprietorship' | 'LTD' | 'Partnership' | 'Cooperative'
  years_operating?: number;
  monthly_revenue?: number; // NGN
  business_expenses?: number; // NGN
  cac_number?: string;
  
  // Purpose & Details
  financing_purpose: string;
  additional_notes?: string;

  // SME Loan (Limited Liability) Requirements
  contact_name?: string;
  purpose_for_loan?: string;
  nature_of_business?: string;
  bvn?: string;
  dob?: string;
  signature?: string;
  guarantor_nin?: string;
  business_address?: string;
  residential_address?: string;
  business_branches?: number;
  number_of_employees?: number;
  business_period_years?: number;
  premises_status?: 'Rented' | 'Owned' | 'Leased' | string;
  applicant_nin?: string;
  applicant_tin?: string;
  next_of_kin_name?: string;
  next_of_kin_relationship?: string;
  next_of_kin_phone?: string;
  next_of_kin_address?: string;
  utility_bill?: string;
  utility_bill_file_name?: string;
  commercial_bank?: string;
  account_number?: string;
  account_name?: string;
  alert_phone_number?: string;
  loan_category?: string;

  // Personal Loan Requirements
  gender?: string;
  nearest_landmark?: string;
  marital_status?: string;
  lga?: string;
  state?: string;
  residential_status?: 'Owned' | 'Rented' | string;
  residence_move_date?: string;
  office_address?: string;
  employment_start_date?: string;
  monthly_net_salary?: number;
  work_email?: string;
  staff_id_or_job_role?: string;
  work_phone?: string;
  salary_bank_name?: string;
  salary_account_number?: string;
  loan_tenor?: string;
  next_of_kin_email?: string;
  gov_id_document?: string;
  gov_id_file_name?: string;
  work_id_document?: string;
  work_id_file_name?: string;
  payslip_or_statement_document?: string;
  payslip_or_statement_file_name?: string;
}

export interface InternalNote {
  id: string;
  application_id: string;
  author_id: string;
  author_name: string;
  author_role: Role;
  text: string;
  created_at: string;
}

export interface LenderOffer {
  approved_amount?: number;
  interest_rate_monthly?: number; // e.g. 2.5%
  tenor_months?: number;
  monthly_repayment?: number;
  advisory_fee?: number;
  decision_note?: string;
  recorded_at?: string;
}

export interface CustomerSummary {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  applicant_type: ApplicantType;
  total_applications: number;
  total_requested_amount: number;
  latest_status: ApplicationStatus;
  kyc_status: 'VERIFIED' | 'PENDING' | 'TIER_1' | 'TIER_2';
  created_at: string;
  state?: string;
}

export interface SystemSettings {
  sla_assessment_hours: number;
  sla_docs_hours: number;
  min_loan_amount: number;
  max_loan_amount: number;
  default_advisory_rate: number;
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  require_2fa: boolean;
  session_timeout_mins: number;
  auto_lender_match: boolean;
}

export interface Application {
  id: string;
  reference_number: string; // e.g. AKO-104582
  applicant_type: ApplicantType;
  applicant_info: ApplicantInfo;
  requested_amount: number; // NGN
  status: ApplicationStatus;
  user_id: string | null; // Nullable until account created/linked
  assigned_staff_id?: string | null;
  assigned_staff_name?: string | null;
  assigned_lender_id?: string | null;
  assigned_lender_name?: string | null;
  lender_offer?: LenderOffer | null;
  internal_notes?: InternalNote[];
  created_at: string;
  updated_at: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  application_id: string;
  status: ApplicationStatus;
  title: string;
  description: string;
  actor_name: string;
  timestamp: string;
}

export interface Document {
  id: string;
  application_id: string;
  document_type: string; // e.g. 'Bank Statement', 'CAC Certificate', 'Government ID', 'Utility Bill'
  name: string;
  file_url: string;
  file_size: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploaded_by: string;
  notes?: string;
  created_at: string;
}

export interface DocumentRequirement {
  id: string;
  application_id: string;
  title: string;
  description: string;
  required: boolean;
  status: 'OUTSTANDING' | 'SUBMITTED' | 'APPROVED';
}

export interface Message {
  id: string;
  application_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: Role;
  text: string;
  created_at: string;
}

export type FollowUpType = 'CALL' | 'EMAIL' | 'LENDER_CHECK' | 'DOCUMENT_REQUEST' | 'DECISION_VERIFICATION';

export interface FollowUp {
  id: string;
  application_id: string;
  application_ref: string;
  customer_name: string;
  customer_phone: string;
  assigned_staff_id: string;
  assigned_staff_name: string;
  due_date: string; // YYYY-MM-DD or ISO
  type: FollowUpType;
  notes: string;
  outcome?: string;
  completed: boolean;
  created_at: string;
}

export interface Lender {
  id: string;
  name: string;
  institution_type: 'Commercial Bank' | 'Microfinance Bank' | 'Fintech / Digital Lender' | 'DFI / Government Fund' | 'Private Credit';
  customer_types: 'INDIVIDUAL' | 'BUSINESS' | 'BOTH';
  products: string[];
  min_amount: number;
  max_amount: number;
  min_income_or_revenue: number; // NGN per month
  eligibility_criteria: string;
  required_documents: string[];
  geographic_coverage: string;
  contact_email: string;
  contact_phone: string;
  processing_days: string;
  internal_notes: string;
  active: boolean;
  is_demo?: boolean;
}

export interface LenderMatchResult {
  lender: Lender;
  match_score: number; // 0-100%
  reasons: string[];
  missing_requirements: string[];
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}
