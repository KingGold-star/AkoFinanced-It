import {
  User,
  Application,
  Document,
  DocumentRequirement,
  Message,
  FollowUp,
  Lender,
  ApplicationTimelineEvent,
  AuditLog,
  LenderMatchResult,
  InternalNote,
  SystemSettings
} from '../types/index.js';

class Database {
  public users: User[] = [];
  public applications: Application[] = [];
  public timelineEvents: ApplicationTimelineEvent[] = [];
  public documents: Document[] = [];
  public documentRequirements: DocumentRequirement[] = [];
  public messages: Message[] = [];
  public followUps: FollowUp[] = [];
  public lenders: Lender[] = [];
  public auditLogs: AuditLog[] = [];
  public settings: SystemSettings = {
    sla_assessment_hours: 24,
    sla_docs_hours: 12,
    min_loan_amount: 50000,
    max_loan_amount: 100000000,
    default_advisory_rate: 1.5,
    email_notifications_enabled: true,
    sms_notifications_enabled: true,
    require_2fa: true,
    session_timeout_mins: 60,
    auto_lender_match: true
  };

  constructor() {
    this.seed();
  }

  private seed() {
    // Sole Administrator User
    const soleAdmin: User = {
      id: 'usr-admin-akofinancedit',
      email: 'akofinancedit@gmail.com',
      full_name: 'AkoFinanced It Administrator',
      phone: '+2348012345678',
      role: 'SUPER_ADMIN',
      created_at: new Date('2026-01-01').toISOString()
    };

    this.users = [soleAdmin];

    // Institutional Credit Partners & Lenders
    this.lenders = [
      {
        id: 'len-access-1',
        name: 'Access Bank Plc — Commercial SME Banking',
        institution_type: 'Commercial Bank',
        customer_types: 'BOTH',
        products: ['Working Capital Facility', 'LPO & Contract Finance', 'Asset Procurement Loan'],
        min_amount: 500000,
        max_amount: 50000000,
        min_income_or_revenue: 350000,
        eligibility_criteria: '6-12 months bank statements, valid BVN/NIN, corporate CAC registration or confirmed tier-1 salary employment.',
        required_documents: ['12 Months Bank Statement', 'CAC Registration Certificate & Status Report', 'Government ID', 'Utility Bill', 'Tax Clearance'],
        geographic_coverage: 'Nationwide (Nigeria)',
        contact_email: 'sme-credit@accessbankplc.com',
        contact_phone: '+23412712000',
        processing_days: '48-72 Hours',
        internal_notes: 'Preferred partner for prime SME working capital and contract execution.',
        active: true
      },
      {
        id: 'len-stanbic-2',
        name: 'Stanbic IBTC Bank — Enterprise & Asset Credit',
        institution_type: 'Commercial Bank',
        customer_types: 'BOTH',
        products: ['Vehicle & Fleet Asset Finance', 'Equipment Leasing', 'Personal Term Loan'],
        min_amount: 1000000,
        max_amount: 100000000,
        min_income_or_revenue: 800000,
        eligibility_criteria: 'Proforma invoice from approved vendor, 20-30% equity contribution, clean CRCC credit bureau report.',
        required_documents: ['Proforma Invoice from Verified Vendor', '12 Months Bank Statements', 'CAC MEMART', 'Director KYC Documents'],
        geographic_coverage: 'Nationwide (Nigeria)',
        contact_email: 'assetfinance@stanbicibtc.com',
        contact_phone: '+23414222222',
        processing_days: '3-5 Business Days',
        internal_notes: 'Leading desk for vehicle and industrial machinery acquisitions.',
        active: true
      },
      {
        id: 'len-fcmb-3',
        name: 'FCMB FastTrack SME Facility',
        institution_type: 'Commercial Bank',
        customer_types: 'BUSINESS',
        products: ['Quick Working Capital', 'Invoice Discounting', 'Supply Chain Liquidity'],
        min_amount: 250000,
        max_amount: 25000000,
        min_income_or_revenue: 200000,
        eligibility_criteria: 'Active business operations for at least 12 months with consistent monthly banking turnover.',
        required_documents: ['6 Months Bank Statement', 'CAC Registration Documents', 'Valid Director ID Card'],
        geographic_coverage: 'Nationwide (Nigeria)',
        contact_email: 'smedesk@fcmb.com',
        contact_phone: '+23412798800',
        processing_days: '24-48 Hours',
        internal_notes: 'Fast automated underwriting for registered merchants and retail businesses.',
        active: true
      },
      {
        id: 'len-sterling-4',
        name: 'Sterling Bank — Renewable Energy & Healthcare Fund',
        institution_type: 'Commercial Bank',
        customer_types: 'BOTH',
        products: ['Solar & Inverter Commercial Loan', 'Healthcare Equipment Financing', 'Agro-Business Credit'],
        min_amount: 500000,
        max_amount: 40000000,
        min_income_or_revenue: 400000,
        eligibility_criteria: 'Clean credit history, energy audit/vendor invoice for solar projects, verified medical licenses for clinics.',
        required_documents: ['Solar / Equipment Vendor Quotation', '12 Months Bank Statements', 'Business Incorporation Records', 'Practicing License (Medical)'],
        geographic_coverage: 'Nationwide (Nigeria)',
        contact_email: 'renewables@sterling.ng',
        contact_phone: '+23414484481',
        processing_days: '3-5 Business Days',
        internal_notes: 'Competitive interest rates for clean energy transition and healthcare facilities.',
        active: true
      },
      {
        id: 'len-boi-5',
        name: 'Bank of Industry (BOI) — National Industrial Fund',
        institution_type: 'DFI / Government Fund',
        customer_types: 'BUSINESS',
        products: ['Manufacturing Expansion Credit', 'Agro-Processing Facility', 'Tech & Innovation Fund'],
        min_amount: 5000000,
        max_amount: 150000000,
        min_income_or_revenue: 2000000,
        eligibility_criteria: 'Indigenous Nigerian company in manufacturing, processing, or technology with viable business plan.',
        required_documents: ['Audited Financial Statements (3 Years)', 'Feasibility Study & Business Plan', 'CAC Records', 'Collateral Documentation'],
        geographic_coverage: 'Nationwide (Nigeria)',
        contact_email: 'creditdesk@boi.ng',
        contact_phone: '+23412715070',
        processing_days: '7-14 Business Days',
        internal_notes: 'Subsidized single-digit interest rates for qualifying value-added industrial enterprises.',
        active: true
      }
    ];

    this.applications = [];
    this.timelineEvents = [];
    this.documents = [];
    this.documentRequirements = [];
    this.messages = [];
    this.followUps = [];
    this.auditLogs = [];
  }

  // Matching Engine
  public matchLenders(app: Application): LenderMatchResult[] {
    const results: LenderMatchResult[] = [];
    const amount = app.requested_amount;
    const isBiz = app.applicant_type === 'BUSINESS';
    const monthlyIncomeOrRevenue = isBiz 
      ? (app.applicant_info.monthly_revenue || 0)
      : (app.applicant_info.monthly_income || 0);

    for (const lender of this.lenders) {
      if (!lender.active) continue;

      let score = 100;
      const reasons: string[] = [];
      const missingRequirements: string[] = [];

      // Customer type match
      if (lender.customer_types !== 'BOTH' && lender.customer_types !== app.applicant_type) {
        score -= 40;
        missingRequirements.push(`Lender specializes in ${lender.customer_types} financing.`);
      } else {
        reasons.push(`Target applicant type (${app.applicant_type}) matches lender mandate.`);
      }

      // Amount bounds
      if (amount < lender.min_amount) {
        score -= 30;
        missingRequirements.push(`Requested amount (N${amount.toLocaleString()}) is below lender minimum (N${lender.min_amount.toLocaleString()}).`);
      } else if (amount > lender.max_amount) {
        score -= 30;
        missingRequirements.push(`Requested amount exceeds lender maximum cap (N${lender.max_amount.toLocaleString()}).`);
      } else {
        reasons.push(`Requested amount N${amount.toLocaleString()} is within supported range (N${lender.min_amount.toLocaleString()} - N${lender.max_amount.toLocaleString()}).`);
      }

      // Income / Revenue check
      if (monthlyIncomeOrRevenue < lender.min_income_or_revenue) {
        score -= 25;
        missingRequirements.push(`Monthly turnover (N${monthlyIncomeOrRevenue.toLocaleString()}) is below recommended threshold (N${lender.min_income_or_revenue.toLocaleString()}).`);
      } else {
        reasons.push(`Monthly financial inflows satisfy lender preliminary criteria.`);
      }

      // Geographic check
      if (lender.geographic_coverage !== 'Nationwide (Nigeria)' && app.applicant_info.state_location) {
        if (!lender.geographic_coverage.toLowerCase().includes(app.applicant_info.state_location.toLowerCase())) {
          score -= 15;
          missingRequirements.push(`Geographic restriction: Lender covers ${lender.geographic_coverage}.`);
        } else {
          reasons.push(`Applicant location (${app.applicant_info.state_location}) is within lender coverage area.`);
        }
      }

      const finalScore = Math.max(10, Math.min(99, score)); // Max 99%, never 100% or "approved"

      results.push({
        lender,
        match_score: finalScore,
        reasons,
        missing_requirements: missingRequirements
      });
    }

    return results.sort((a, b) => b.match_score - a.match_score);
  }

  public generateReferenceNumber(): string {
    const random6 = Math.floor(100000 + Math.random() * 900000);
    return `AKO-${random6}`;
  }

  public logAudit(userId: string, userName: string, action: string, details: string) {
    this.auditLogs.unshift({
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: userId,
      user_name: userName,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }
}

export const db = new Database();
