import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { Role, ApplicationStatus, ApplicantType, User } from './src/types/index.js';
import { setupGeminiLiveWebSocket, generateAdvisorResponse, generateAdvisorSpeech, resetAiClient } from './src/server/geminiLive.js';
import {
  getSupabase,
  syncApplicationToSupabase,
  syncUserToSupabase,
  syncDocumentToSupabase,
  syncTimelineToSupabase,
  syncMessageToSupabase,
  syncFollowUpToSupabase,
  syncLenderToSupabase
} from './src/server/supabase.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Enable gzip/deflate response compression for high throughput and reduced load time
app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple Token Session Store in Memory
const sessions = new Map<string, { userId: string; role: Role; email: string; full_name: string }>();
const SESSION_SECRET = process.env.SESSION_SECRET || 'ako_financing_secret_session_key_2026';

function generateSessionToken(user: { id: string; role: Role; email: string; full_name: string }): string {
  const payload = {
    uid: user.id,
    role: user.role,
    email: user.email,
    name: user.full_name,
    iat: Date.now()
  };
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payloadStr).digest('base64url');
  const token = `ako_${payloadStr}.${hmac}`;

  sessions.set(token, {
    userId: user.id,
    role: user.role,
    email: user.email,
    full_name: user.full_name
  });

  return token;
}

function verifyAndGetSession(token: string): { userId: string; role: Role; email: string; full_name: string } | null {
  if (!token) return null;

  // 1. Direct in-memory hit
  if (sessions.has(token)) {
    return sessions.get(token)!;
  }

  // 2. Decode signed token ako_<payload>.<signature>
  if (token.startsWith('ako_')) {
    const parts = token.slice(4).split('.');
    if (parts.length === 2) {
      const [payloadStr, signature] = parts;
      try {
        const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payloadStr).digest('base64url');
        if (signature === expectedHmac) {
          const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
          const user = db.users.find(
            (u) => u.id === payload.uid || (payload.email && u.email.toLowerCase() === payload.email.toLowerCase())
          );
          if (user) {
            const restoredSession = {
              userId: user.id,
              role: user.role,
              email: user.email,
              full_name: user.full_name
            };
            sessions.set(token, restoredSession);
            return restoredSession;
          }
        }
      } catch (e) {
        // invalid signature or json
      }
    }
  }

  // 3. Fallback for demo users or legacy sessions
  const directUser = db.users.find(
    (u) => u.id === token || u.email.toLowerCase() === token.toLowerCase()
  );
  if (directUser) {
    const session = {
      userId: directUser.id,
      role: directUser.role,
      email: directUser.email,
      full_name: directUser.full_name
    };
    sessions.set(token, session);
    return session;
  }

  return null;
}

// Auth Helper Middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  let session: { userId: string; role: Role; email: string; full_name: string } | null = null;

  if (token && token !== 'undefined' && token !== 'null') {
    session = verifyAndGetSession(token);
  }

  // Resilient fallback for demo/development sessions: verify via email header
  if (!session) {
    const userEmailHeader = req.headers['x-user-email'] as string;
    if (userEmailHeader) {
      const u = db.users.find(usr => usr.email.toLowerCase() === userEmailHeader.toLowerCase());
      if (u) {
        session = {
          userId: u.id,
          role: u.role,
          email: u.email,
          full_name: u.full_name
        };
      }
    }
  }

  if (!session) {
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    return res.status(401).json({ error: 'Session expired or invalid token' });
  }

  (req as any).user = session;
  next();
}

// Role Enforcement Middleware
function requireRoles(allowedRoles: Role[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient privileges' });
    }
    next();
  };
}

// Helper password hash
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + 'ako_secret_salt_2026').digest('hex');
}

// ==================== AUTH API ROUTES ====================

// Register Account (Post-application or direct)
app.post('/api/auth/register', (req, res) => {
  const { email, password, full_name, phone, pending_reference_number, auth_provider, avatar_url } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please provide an email address.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (user) {
    // If user already exists, update name, phone, auth_provider, and avatar if provided
    if (full_name && full_name.trim()) user.full_name = full_name.trim();
    if (phone && phone.trim()) user.phone = phone.trim();
    if (auth_provider) (user as any).auth_provider = auth_provider;
    if (avatar_url) (user as any).avatar_url = avatar_url;
  } else {
    // Derive name if not explicitly provided
    let derivedName = (full_name && full_name.trim()) || '';
    if (!derivedName) {
      const handle = normalizedEmail.split('@')[0];
      derivedName = handle
        .replace(/[\._\+\-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim() || 'Verified User';
    }

    user = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: normalizedEmail,
      full_name: derivedName,
      phone: phone ? phone.trim() : '',
      role: 'CUSTOMER' as Role,
      auth_provider: auth_provider || 'email',
      avatar_url: avatar_url || undefined,
      created_at: new Date().toISOString()
    };
    db.users.push(user);
    syncUserToSupabase(user);
    db.logAudit(user.id, user.full_name, 'USER_REGISTER', `Customer account registered for ${user.email} via ${user.auth_provider || 'email'}.`);
  }

  // Auto-link all applications matching this email
  let linkedRef: string | null = null;
  db.applications.forEach((appRecord) => {
    if (
      appRecord.applicant_info?.email?.toLowerCase() === normalizedEmail &&
      (!appRecord.user_id || appRecord.user_id !== user!.id)
    ) {
      appRecord.user_id = user!.id;
      appRecord.updated_at = new Date().toISOString();
      if (!linkedRef) linkedRef = appRecord.reference_number;
      syncApplicationToSupabase(appRecord);
    }
  });

  // Auto-link specific pending application if reference provided
  if (pending_reference_number) {
    const appRecord = db.applications.find(
      (a) => a.reference_number.toUpperCase() === pending_reference_number.toUpperCase()
    );
    if (appRecord) {
      appRecord.user_id = user.id;
      appRecord.updated_at = new Date().toISOString();
      linkedRef = appRecord.reference_number;
      db.logAudit(user.id, user.full_name, 'APPLICATION_LINKED', `Linked application ${linkedRef} to user account.`);
      syncApplicationToSupabase(appRecord);
    }
  }

  const token = generateSessionToken(user);

  return res.json({
    user,
    token,
    linked_reference: linkedRef,
    message: linkedRef ? `Account ready and application ${linkedRef} linked successfully!` : 'Account ready and signed in successfully!'
  });
});

// Login (Supports personal emails, social accounts, existing accounts, and auto-links applications)
app.post('/api/auth/login', (req, res) => {
  const { email, password, full_name, phone, pending_reference_number, auth_provider, avatar_url } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json({ error: 'Please enter a valid personal or work email address.' });
  }

  // Sole Administrator Security Policy: akofinancedit@gmail.com with password Akowe_12345
  if (normalizedEmail === 'akofinancedit@gmail.com') {
    if (password !== 'Akowe_12345') {
      return res.status(401).json({ error: 'Invalid administrator credentials. Access denied.' });
    }
  }

  let user = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  // If this is the sole admin, ensure they exist with SUPER_ADMIN role
  if (normalizedEmail === 'akofinancedit@gmail.com') {
    if (!user) {
      user = {
        id: 'usr-admin-akofinancedit',
        email: 'akofinancedit@gmail.com',
        full_name: 'AkoFinanced It Administrator',
        phone: phone || '+2348012345678',
        role: 'SUPER_ADMIN' as Role,
        created_at: new Date().toISOString()
      };
      db.users.push(user);
    } else {
      user.role = 'SUPER_ADMIN' as Role;
    }
  } else if (user && user.role !== 'CUSTOMER') {
    // Demote any other unauthorized emails trying to hold staff/admin roles
    user.role = 'CUSTOMER' as Role;
  }

  // If user doesn't exist in memory DB, check for existing applications or auto-provision personal account
  if (!user) {
    // 1. Check if there are any existing loan applications with this email
    const matchingApp = db.applications.find(
      (a) => a.applicant_info?.email?.toLowerCase() === normalizedEmail
    );

    let derivedName = '';
    let derivedPhone = phone || '';

    if (matchingApp && matchingApp.applicant_info) {
      const info = matchingApp.applicant_info;
      derivedName = `${info.first_name || ''} ${info.last_name || ''}`.trim() || info.business_name || '';
      if (!derivedPhone && info.phone) derivedPhone = info.phone;
    }

    if (!derivedName) {
      if (full_name && full_name.trim()) {
        derivedName = full_name.trim();
      } else {
        const handle = normalizedEmail.split('@')[0];
        derivedName = handle
          .replace(/[\._\+\-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim() || 'Verified Customer';
      }
    }

    user = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: normalizedEmail,
      full_name: derivedName,
      phone: derivedPhone,
      role: 'CUSTOMER' as Role,
      auth_provider: auth_provider || 'email',
      avatar_url: avatar_url || undefined,
      created_at: new Date().toISOString()
    };

    db.users.push(user);
    syncUserToSupabase(user);
    db.logAudit(user.id, user.full_name, 'USER_AUTO_PROVISION', `Personal email account provisioned for ${user.email} via ${user.auth_provider || 'email'}.`);
  } else {
    if (auth_provider && !(user as any).auth_provider) {
      (user as any).auth_provider = auth_provider;
    }
    if (avatar_url && !(user as any).avatar_url) {
      (user as any).avatar_url = avatar_url;
    }
  }

  // Auto-link any applications matching this user's email
  let linkedRef: string | null = null;
  db.applications.forEach((appRecord) => {
    if (
      appRecord.applicant_info?.email?.toLowerCase() === normalizedEmail &&
      (!appRecord.user_id || appRecord.user_id !== user!.id)
    ) {
      appRecord.user_id = user!.id;
      appRecord.updated_at = new Date().toISOString();
      if (!linkedRef) linkedRef = appRecord.reference_number;
      syncApplicationToSupabase(appRecord);
    }
  });

  // Auto-link specific pending application if provided
  if (pending_reference_number) {
    const appRecord = db.applications.find(
      (a) => a.reference_number.toUpperCase() === pending_reference_number.toUpperCase()
    );
    if (appRecord) {
      appRecord.user_id = user.id;
      appRecord.updated_at = new Date().toISOString();
      linkedRef = appRecord.reference_number;
      db.logAudit(user.id, user.full_name, 'APPLICATION_LINKED', `Linked application ${linkedRef} to existing user.`);
      syncApplicationToSupabase(appRecord);
    }
  }

  const token = generateSessionToken(user);
  db.logAudit(user.id, user.full_name, 'USER_LOGIN', `User logged in with email ${user.email} (${user.role}).`);

  return res.json({
    user,
    token,
    linked_reference: linkedRef,
    message: 'Signed in successfully'
  });
});

// Current Auth User
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const sessionUser = (req as any).user;
  let user = db.users.find((u) => u.id === sessionUser.userId || u.email.toLowerCase() === sessionUser.email.toLowerCase());
  
  if (!user && sessionUser.email) {
    // Re-provision session user if missing after server reload
    user = {
      id: sessionUser.userId || `usr-${Date.now()}`,
      email: sessionUser.email.toLowerCase(),
      full_name: sessionUser.full_name || 'Verified Customer',
      phone: '',
      role: (sessionUser.role as Role) || 'CUSTOMER',
      created_at: new Date().toISOString()
    };
    db.users.push(user);
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.json({ user });
});

// Update Profile
app.patch('/api/auth/profile', authenticateToken, (req, res) => {
  const sessionUser = (req as any).user;
  const user = db.users.find((u) => u.id === sessionUser.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { full_name, phone, preferred_contact_method, address, dob, city, state } = req.body;
  if (full_name && full_name.trim()) {
    user.full_name = full_name.trim();
  }
  if (phone !== undefined) {
    user.phone = phone;
  }
  if (preferred_contact_method) {
    (user as any).preferred_contact_method = preferred_contact_method;
  }
  if (address !== undefined) {
    (user as any).address = address;
  }
  if (dob !== undefined) {
    (user as any).dob = dob;
  }
  if (city !== undefined) {
    (user as any).city = city;
  }
  if (state !== undefined) {
    (user as any).state = state;
  }

  db.logAudit(user.id, user.full_name, 'PROFILE_UPDATED', `User updated their account profile.`);

  return res.json({ user, message: 'Profile updated successfully' });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    sessions.delete(token);
  }
  return res.json({ message: 'Logged out successfully' });
});

// ==================== PUBLIC APPLICATION SUBMISSION ====================

// Guest Loan Application Submission (NO LOGIN REQUIRED)
app.post('/api/applications', (req, res) => {
  const { applicant_type, applicant_info, requested_amount } = req.body;

  // Server-side validation
  if (!applicant_type || !['INDIVIDUAL', 'BUSINESS'].includes(applicant_type)) {
    return res.status(400).json({ error: 'Applicant type must be INDIVIDUAL or BUSINESS' });
  }

  if (!requested_amount || isNaN(Number(requested_amount)) || Number(requested_amount) < 10000) {
    return res.status(400).json({ error: 'Please enter a valid requested financing amount (Minimum N10,000)' });
  }

  const contactName = (applicant_info?.contact_name || '').trim();
  const firstName = (applicant_info?.first_name || (contactName ? contactName.split(' ')[0] : '')).trim();
  const lastName = (applicant_info?.last_name || (contactName ? (contactName.split(' ').slice(1).join(' ') || firstName) : '')).trim();
  const loanPurpose = (applicant_info?.purpose_for_loan || applicant_info?.financing_purpose || '').trim();

  if (!applicant_info || (!firstName && !contactName) || !applicant_info.email || !applicant_info.phone) {
    return res.status(400).json({ error: 'Missing required contact information (Contact name, email, phone).' });
  }

  if (!loanPurpose || loanPurpose.length < 3) {
    return res.status(400).json({ error: 'Please state your purpose for loan in detail.' });
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let loggedInUserId: string | null = null;
  if (token) {
    const session = verifyAndGetSession(token);
    if (session) {
      loggedInUserId = session.userId;
    }
  }

  const existingUser = db.users.find((u) => u.email.toLowerCase() === applicant_info.email.toLowerCase().trim());
  const userIdToLink = loggedInUserId || (existingUser ? existingUser.id : null);

  const refNumber = db.generateReferenceNumber();
  const appId = `app-${Date.now()}`;

  // Assign staff automatically to first loan officer
  const defaultStaff = db.users.find((u) => u.role === 'LOAN_OFFICER') || db.users.find((u) => u.role === 'SUPER_ADMIN');

  const newApp = {
    id: appId,
    reference_number: refNumber,
    applicant_type: applicant_type as ApplicantType,
    applicant_info: {
      ...applicant_info,
      first_name: firstName || 'Applicant',
      last_name: lastName || 'Contact',
      contact_name: contactName || `${firstName} ${lastName}`.trim(),
      email: applicant_info.email.toLowerCase().trim(),
      phone: applicant_info.phone.trim(),
      state_location: applicant_info.state_location || 'Lagos State',
      employment_status: applicant_info.employment_status,
      employer_name: applicant_info.employer_name,
      monthly_income: applicant_info.monthly_income ? Number(applicant_info.monthly_income) : undefined,
      monthly_expenses: applicant_info.monthly_expenses ? Number(applicant_info.monthly_expenses) : undefined,
      existing_loans: applicant_info.existing_loans ? Number(applicant_info.existing_loans) : undefined,
      business_name: applicant_info.business_name,
      business_type: applicant_info.business_type || (applicant_type === 'BUSINESS' ? 'LTD' : undefined),
      years_operating: applicant_info.years_operating ? Number(applicant_info.years_operating) : (applicant_info.business_period_years ? Number(applicant_info.business_period_years) : undefined),
      monthly_revenue: applicant_info.monthly_revenue ? Number(applicant_info.monthly_revenue) : undefined,
      business_expenses: applicant_info.business_expenses ? Number(applicant_info.business_expenses) : undefined,
      cac_number: applicant_info.cac_number,
      financing_purpose: loanPurpose,
      additional_notes: applicant_info.additional_notes || '',
      // SME Loan (Limited Liability) Fields
      purpose_for_loan: loanPurpose,
      nature_of_business: applicant_info.nature_of_business,
      bvn: applicant_info.bvn,
      dob: applicant_info.dob,
      signature: applicant_info.signature,
      guarantor_nin: applicant_info.guarantor_nin,
      business_address: applicant_info.business_address,
      residential_address: applicant_info.residential_address,
      business_branches: applicant_info.business_branches !== undefined ? Number(applicant_info.business_branches) : undefined,
      number_of_employees: applicant_info.number_of_employees !== undefined ? Number(applicant_info.number_of_employees) : undefined,
      business_period_years: applicant_info.business_period_years !== undefined ? Number(applicant_info.business_period_years) : undefined,
      premises_status: applicant_info.premises_status,
      applicant_nin: applicant_info.applicant_nin,
      applicant_tin: applicant_info.applicant_tin,
      next_of_kin_name: applicant_info.next_of_kin_name,
      next_of_kin_relationship: applicant_info.next_of_kin_relationship,
      next_of_kin_phone: applicant_info.next_of_kin_phone,
      next_of_kin_address: applicant_info.next_of_kin_address,
      utility_bill: applicant_info.utility_bill,
      utility_bill_file_name: applicant_info.utility_bill_file_name,
      commercial_bank: applicant_info.commercial_bank,
      account_number: applicant_info.account_number,
      account_name: applicant_info.account_name,
      alert_phone_number: applicant_info.alert_phone_number,
      loan_category: applicant_info.loan_category || (applicant_type === 'BUSINESS' ? 'Requirement for SME Loan (Limited Liability)' : 'Individual Loan')
    },
    requested_amount: Number(requested_amount),
    status: 'UNDER_REVIEW' as ApplicationStatus,
    user_id: userIdToLink, // Nullable until account created, but now links if signed in or matches email
    assigned_staff_id: defaultStaff ? defaultStaff.id : null,
    assigned_staff_name: defaultStaff ? defaultStaff.full_name : 'Unassigned',
    assigned_lender_id: null,
    assigned_lender_name: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.applications.unshift(newApp);

  // Default Timeline Event
  const initialTimeline = {
    id: `tl-${Date.now()}`,
    application_id: appId,
    status: 'UNDER_REVIEW' as ApplicationStatus,
    title: 'Application Received',
    description: `Application ${refNumber} received via AkoFinanced It web portal.`,
    actor_name: 'System',
    timestamp: new Date().toISOString()
  };
  db.timelineEvents.push(initialTimeline);

  // Default Document Requirements
  if (applicant_type === 'INDIVIDUAL') {
    db.documentRequirements.push(
      {
        id: `req-${Date.now()}-1`,
        application_id: appId,
        title: '6 Months Official Bank Statement',
        description: 'PDF bank statement showing monthly salary credits or business inflows.',
        required: true,
        status: 'OUTSTANDING'
      },
      {
        id: `req-${Date.now()}-2`,
        application_id: appId,
        title: 'Valid Government Issued ID',
        description: 'NIN, International Passport, Voter Card, or Driver License.',
        required: true,
        status: 'OUTSTANDING'
      }
    );
  } else {
    db.documentRequirements.push(
      {
        id: `req-${Date.now()}-1`,
        application_id: appId,
        title: '12 Months Business Bank Statement',
        description: 'Official corporate account statement.',
        required: true,
        status: 'OUTSTANDING'
      },
      {
        id: `req-${Date.now()}-2`,
        application_id: appId,
        title: 'CAC Registration Documents',
        description: 'Certificate of Incorporation & CAC Status Report / MEMART.',
        required: true,
        status: 'OUTSTANDING'
      },
      {
        id: `req-${Date.now()}-3`,
        application_id: appId,
        title: 'Director Government ID',
        description: 'ID card of main company director or founder.',
        required: true,
        status: 'OUTSTANDING'
      }
    );
  }

  // Attach uploaded documents from application if present
  if (applicant_info.utility_bill || applicant_info.utility_bill_file_name) {
    db.documents.push({
      id: `doc-${Date.now()}-util`,
      application_id: appId,
      document_type: 'Utility Bill',
      name: applicant_info.utility_bill_file_name || 'Utility_Bill.pdf',
      file_url: applicant_info.utility_bill || '',
      file_size: 'Uploaded with Application',
      status: 'PENDING',
      uploaded_by: `${firstName} ${lastName}`.trim() || 'Applicant',
      notes: 'Submitted via Application Form',
      created_at: new Date().toISOString()
    });
  }

  if (applicant_info.gov_id_document || applicant_info.gov_id_file_name) {
    db.documents.push({
      id: `doc-${Date.now()}-govid`,
      application_id: appId,
      document_type: 'Government ID',
      name: applicant_info.gov_id_file_name || 'Government_ID.pdf',
      file_url: applicant_info.gov_id_document || '',
      file_size: 'Uploaded with Application',
      status: 'PENDING',
      uploaded_by: `${firstName} ${lastName}`.trim() || 'Applicant',
      notes: 'Government ID submitted with Personal Loan application',
      created_at: new Date().toISOString()
    });
  }

  if (applicant_info.work_id_document || applicant_info.work_id_file_name) {
    db.documents.push({
      id: `doc-${Date.now()}-workid`,
      application_id: appId,
      document_type: 'Work ID Card',
      name: applicant_info.work_id_file_name || 'Work_ID_Card.png',
      file_url: applicant_info.work_id_document || '',
      file_size: 'Uploaded with Application',
      status: 'PENDING',
      uploaded_by: `${firstName} ${lastName}`.trim() || 'Applicant',
      notes: 'Work ID Card submitted with Personal Loan application',
      created_at: new Date().toISOString()
    });
  }

  if (applicant_info.payslip_or_statement_document || applicant_info.payslip_or_statement_file_name) {
    db.documents.push({
      id: `doc-${Date.now()}-payslip`,
      application_id: appId,
      document_type: 'Bank Statement / Payslip',
      name: applicant_info.payslip_or_statement_file_name || 'Bank_Statement_or_Payslip.pdf',
      file_url: applicant_info.payslip_or_statement_document || '',
      file_size: 'Uploaded with Application',
      status: 'PENDING',
      uploaded_by: `${firstName} ${lastName}`.trim() || 'Applicant',
      notes: 'Bank Statement / Payslip submitted with Personal Loan application',
      created_at: new Date().toISOString()
    });
  }

  // Create initial staff follow-up task
  const newFollowUp = {
    id: `fol-${Date.now()}`,
    application_id: appId,
    application_ref: refNumber,
    customer_name: `${newApp.applicant_info.first_name} ${newApp.applicant_info.last_name}`,
    customer_phone: newApp.applicant_info.phone,
    assigned_staff_id: defaultStaff ? defaultStaff.id : 'usr-admin-1',
    assigned_staff_name: defaultStaff ? defaultStaff.full_name : 'Staff',
    due_date: new Date().toISOString().split('T')[0],
    type: 'CALL' as const,
    notes: `Initial qualification review for ${refNumber} (N${newApp.requested_amount.toLocaleString()}).`,
    completed: false,
    created_at: new Date().toISOString()
  };
  db.followUps.push(newFollowUp);

  // Sync to Supabase in background
  syncApplicationToSupabase(newApp);
  syncTimelineToSupabase(initialTimeline);
  syncFollowUpToSupabase(newFollowUp);

  db.logAudit('GUEST', 'Anonymous Applicant', 'APPLICATION_CREATED', `Created loan application ${refNumber} for N${newApp.requested_amount.toLocaleString()}.`);

  return res.status(201).json({
    success: true,
    reference_number: refNumber,
    application: newApp,
    message: 'We have received your application successfully!'
  });
});

// View basic status by reference number (Safe view, non-sensitive)
app.get('/api/applications/ref/:refNum', (req, res) => {
  const ref = req.params.refNum.toUpperCase();
  const appRecord = db.applications.find((a) => a.reference_number === ref);
  if (!appRecord) {
    return res.status(404).json({ error: 'Application reference not found.' });
  }

  // Return non-sensitive summary
  return res.json({
    reference_number: appRecord.reference_number,
    applicant_type: appRecord.applicant_type,
    requested_amount: appRecord.requested_amount,
    status: appRecord.status,
    created_at: appRecord.created_at,
    has_account: !!appRecord.user_id
  });
});

// ==================== CUSTOMER DASHBOARD APIS ====================

// Get Current Customer's Applications
app.get('/api/applications/my', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const userRecord = db.users.find((u) => u.id === user.userId);
  if (!userRecord) return res.status(404).json({ error: 'User not found' });

  // Match by user_id OR email
  const myApps = db.applications.filter(
    (a) => a.user_id === user.userId || a.applicant_info.email.toLowerCase() === user.email.toLowerCase()
  );

  return res.json({ applications: myApps });
});

// Get Application Detail (For owner customer or staff)
app.get('/api/applications/:id', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const appId = req.params.id;
  const appRecord = db.applications.find((a) => a.id === appId || a.reference_number.toUpperCase() === appId.toUpperCase());

  if (!appRecord) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'REVIEWER'].includes(user.role);
  const isOwner = appRecord.user_id === user.userId || appRecord.applicant_info.email.toLowerCase() === user.email.toLowerCase();

  if (!isStaff && !isOwner) {
    return res.status(403).json({ error: 'Access denied: You do not own this application.' });
  }

  const timeline = db.timelineEvents.filter((t) => t.application_id === appRecord.id);
  const docs = db.documents.filter((d) => d.application_id === appRecord.id);
  const requirements = db.documentRequirements.filter((r) => r.application_id === appRecord.id);
  const msgs = db.messages.filter((m) => m.application_id === appRecord.id);
  const followups = isStaff ? db.followUps.filter((f) => f.application_id === appRecord.id) : [];

  return res.json({
    application: appRecord,
    timeline,
    documents: docs,
    document_requirements: requirements,
    messages: msgs,
    followups
  });
});

// Upload Document
app.post('/api/applications/:id/documents', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const appId = req.params.id;
  const { document_type, name, file_data, file_size } = req.body;

  const appRecord = db.applications.find((a) => a.id === appId);
  if (!appRecord) return res.status(404).json({ error: 'Application not found' });

  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'REVIEWER'].includes(user.role);
  const isOwner = appRecord.user_id === user.userId || appRecord.applicant_info.email.toLowerCase() === user.email.toLowerCase();

  if (!isStaff && !isOwner) {
    return res.status(403).json({ error: 'Access denied' });
  }

  if (!name || !document_type) {
    return res.status(400).json({ error: 'Document name and type required' });
  }

  const newDoc = {
    id: `doc-${Date.now()}`,
    application_id: appRecord.id,
    document_type,
    name,
    file_url: file_data || '/samples/demo_document.pdf',
    file_size: file_size || '1.4 MB',
    status: 'PENDING' as const,
    uploaded_by: user.full_name,
    created_at: new Date().toISOString()
  };

  db.documents.push(newDoc);

  // Update requirement status if matched
  const reqMatch = db.documentRequirements.find(
    (r) => r.application_id === appRecord.id && r.title.toLowerCase().includes(document_type.toLowerCase())
  );
  if (reqMatch) {
    reqMatch.status = 'SUBMITTED';
  }

  // Update status to PROCESSING if under review
  if (appRecord.status === 'DOCUMENTS_REQUIRED') {
    appRecord.status = 'PROCESSING';
    appRecord.updated_at = new Date().toISOString();
  }

  db.timelineEvents.push({
    id: `tl-${Date.now()}`,
    application_id: appRecord.id,
    status: appRecord.status,
    title: 'Document Uploaded',
    description: `Document "${name}" (${document_type}) uploaded by ${user.full_name}.`,
    actor_name: user.full_name,
    timestamp: new Date().toISOString()
  });

  db.logAudit(user.userId, user.full_name, 'DOCUMENT_UPLOAD', `Uploaded ${name} for app ${appRecord.reference_number}`);

  return res.status(201).json({ document: newDoc, message: 'Document uploaded successfully!' });
});

// Post Customer/Staff Message
app.post('/api/applications/:id/messages', authenticateToken, (req, res) => {
  const user = (req as any).user;
  const appId = req.params.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text cannot be empty' });
  }

  const appRecord = db.applications.find((a) => a.id === appId);
  if (!appRecord) return res.status(404).json({ error: 'Application not found' });

  const isStaff = ['SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'REVIEWER'].includes(user.role);
  const isOwner = appRecord.user_id === user.userId || appRecord.applicant_info.email.toLowerCase() === user.email.toLowerCase();

  if (!isStaff && !isOwner) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    application_id: appRecord.id,
    sender_id: user.userId,
    sender_name: isStaff ? `${user.full_name} (AkoFinanced)` : user.full_name,
    sender_role: user.role,
    text: text.trim(),
    created_at: new Date().toISOString()
  };

  db.messages.push(newMsg);

  return res.status(201).json({ message: newMsg });
});

// ==================== ADMIN & STAFF CRM APIS ====================

const staffRoles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'LOAN_OFFICER', 'REVIEWER'];

// Staff Dashboard Metrics
app.get('/api/admin/dashboard', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const apps = db.applications;
  const followups = db.followUps;

  const todayStr = new Date().toISOString().split('T')[0];

  const metrics = {
    total: apps.length,
    new_applications: apps.filter((a) => a.status === 'UNDER_REVIEW').length,
    initial_review: apps.filter((a) => a.status === 'INITIAL_ASSESSMENT').length,
    documents_pending: apps.filter((a) => a.status === 'DOCUMENTS_REQUIRED').length,
    lender_matched: apps.filter((a) => a.status === 'LENDER_MATCHED').length,
    submitted_to_lenders: apps.filter((a) => a.status === 'SUBMITTED_TO_LENDER' || a.status === 'LENDER_REVIEW').length,
    approved: apps.filter((a) => a.status === 'APPROVED').length,
    declined: apps.filter((a) => a.status === 'DECLINED').length,
    followups_due_today: followups.filter((f) => !f.completed && f.due_date === todayStr).length,
    followups_overdue: followups.filter((f) => !f.completed && f.due_date < todayStr).length
  };

  return res.json({ metrics });
});

// List Applications Table with Filters
app.get('/api/admin/applications', authenticateToken, requireRoles(staffRoles), (req, res) => {
  let list = [...db.applications];
  const { type, status, staff_id, lender_id, search, min_amount, max_amount } = req.query;

  if (type) {
    list = list.filter((a) => a.applicant_type === type);
  }

  if (status) {
    list = list.filter((a) => a.status === status);
  }

  if (staff_id) {
    list = list.filter((a) => a.assigned_staff_id === staff_id);
  }

  if (lender_id) {
    list = list.filter((a) => a.assigned_lender_id === lender_id);
  }

  if (search) {
    const s = String(search).toLowerCase();
    list = list.filter(
      (a) =>
        a.reference_number.toLowerCase().includes(s) ||
        a.applicant_info.first_name.toLowerCase().includes(s) ||
        a.applicant_info.last_name.toLowerCase().includes(s) ||
        a.applicant_info.email.toLowerCase().includes(s) ||
        (a.applicant_info.business_name && a.applicant_info.business_name.toLowerCase().includes(s))
    );
  }

  if (min_amount) {
    list = list.filter((a) => a.requested_amount >= Number(min_amount));
  }

  if (max_amount) {
    list = list.filter((a) => a.requested_amount <= Number(max_amount));
  }

  return res.json({ applications: list });
});

// Update Application Status, Staff, or Lender
app.patch('/api/admin/applications/:id', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const user = (req as any).user;
  const appId = req.params.id;
  const { status, assigned_staff_id, assigned_lender_id, note } = req.body;

  const appRecord = db.applications.find((a) => a.id === appId);
  if (!appRecord) return res.status(404).json({ error: 'Application not found' });

  if (status && status !== appRecord.status) {
    const oldStatus = appRecord.status;
    appRecord.status = status as ApplicationStatus;

    db.timelineEvents.push({
      id: `tl-${Date.now()}`,
      application_id: appRecord.id,
      status: appRecord.status,
      title: `Status Changed to ${status.replace(/_/g, ' ')}`,
      description: note || `Status updated from ${oldStatus.replace(/_/g, ' ')} to ${status.replace(/_/g, ' ')} by ${user.full_name}.`,
      actor_name: user.full_name,
      timestamp: new Date().toISOString()
    });
  }

  if (assigned_staff_id) {
    const staffUser = db.users.find((u) => u.id === assigned_staff_id);
    if (staffUser) {
      appRecord.assigned_staff_id = staffUser.id;
      appRecord.assigned_staff_name = staffUser.full_name;
    }
  }

  if (assigned_lender_id) {
    const lender = db.lenders.find((l) => l.id === assigned_lender_id);
    if (lender) {
      appRecord.assigned_lender_id = lender.id;
      appRecord.assigned_lender_name = lender.name;
    }
  }

  appRecord.updated_at = new Date().toISOString();

  db.logAudit(user.userId, user.full_name, 'APPLICATION_UPDATE', `Updated application ${appRecord.reference_number}.`);

  return res.json({ application: appRecord, message: 'Application updated successfully' });
});

// Rule-Based Matching Engine Route
app.post('/api/admin/applications/:id/match-lenders', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const appId = req.params.id;
  const appRecord = db.applications.find((a) => a.id === appId);
  if (!appRecord) return res.status(404).json({ error: 'Application not found' });

  const matches = db.matchLenders(appRecord);

  return res.json({
    application_id: appRecord.id,
    reference_number: appRecord.reference_number,
    matches
  });
});

// Follow-ups APIs
app.get('/api/admin/followups', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const due_today = db.followUps.filter((f) => !f.completed && f.due_date === todayStr);
  const overdue = db.followUps.filter((f) => !f.completed && f.due_date < todayStr);
  const upcoming = db.followUps.filter((f) => !f.completed && f.due_date > todayStr);
  const completed = db.followUps.filter((f) => f.completed);

  return res.json({ due_today, overdue, upcoming, completed });
});

app.post('/api/admin/applications/:id/followups', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const user = (req as any).user;
  const appId = req.params.id;
  const { due_date, type, notes } = req.body;

  const appRecord = db.applications.find((a) => a.id === appId);
  if (!appRecord) return res.status(404).json({ error: 'Application not found' });

  if (!due_date || !type || !notes) {
    return res.status(400).json({ error: 'Due date, type and notes required' });
  }

  const newFollowup = {
    id: `fol-${Date.now()}`,
    application_id: appRecord.id,
    application_ref: appRecord.reference_number,
    customer_name: `${appRecord.applicant_info.first_name} ${appRecord.applicant_info.last_name}`,
    customer_phone: appRecord.applicant_info.phone,
    assigned_staff_id: user.userId,
    assigned_staff_name: user.full_name,
    due_date,
    type,
    notes,
    completed: false,
    created_at: new Date().toISOString()
  };

  db.followUps.unshift(newFollowup);

  return res.status(201).json({ followup: newFollowup });
});

app.patch('/api/admin/followups/:id', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const fId = req.params.id;
  const { completed, outcome } = req.body;

  const followup = db.followUps.find((f) => f.id === fId);
  if (!followup) return res.status(404).json({ error: 'Followup task not found' });

  if (completed !== undefined) followup.completed = Boolean(completed);
  if (outcome !== undefined) followup.outcome = outcome;

  return res.json({ followup });
});

// Lender Management APIs
app.get('/api/admin/lenders', authenticateToken, requireRoles(staffRoles), (req, res) => {
  return res.json({ lenders: db.lenders });
});

app.post('/api/admin/lenders', authenticateToken, requireRoles(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  const user = (req as any).user;
  const {
    name,
    institution_type,
    customer_types,
    products,
    min_amount,
    max_amount,
    min_income_or_revenue,
    eligibility_criteria,
    required_documents,
    geographic_coverage,
    contact_email,
    contact_phone,
    processing_days,
    internal_notes
  } = req.body;

  if (!name || !institution_type) {
    return res.status(400).json({ error: 'Lender name and institution type required' });
  }

  const newLender = {
    id: `len-${Date.now()}`,
    name: name.includes('[DEMO]') ? name : `${name} [DEMO]`,
    institution_type,
    customer_types: customer_types || 'BOTH',
    products: Array.isArray(products) ? products : [products || 'Standard Loan'],
    min_amount: Number(min_amount) || 100000,
    max_amount: Number(max_amount) || 10000000,
    min_income_or_revenue: Number(min_income_or_revenue) || 100000,
    eligibility_criteria: eligibility_criteria || 'Standard eligibility',
    required_documents: Array.isArray(required_documents) ? required_documents : ['Bank Statement', 'Government ID'],
    geographic_coverage: geographic_coverage || 'Nationwide (Nigeria)',
    contact_email: contact_email || 'demo@lender.test',
    contact_phone: contact_phone || '+234000000000',
    processing_days: processing_days || '3-5 Days',
    internal_notes: internal_notes || 'Added by admin',
    active: true,
    is_demo: true // Enforce DEMO badge
  };

  db.lenders.push(newLender);
  db.logAudit(user.userId, user.full_name, 'LENDER_CREATED', `Created new lender partner ${newLender.name}`);
  return res.status(201).json({ lender: newLender });
});

app.patch('/api/admin/lenders/:id', authenticateToken, requireRoles(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  const user = (req as any).user;
  const lenderId = req.params.id;
  const lender = db.lenders.find((l) => l.id === lenderId);
  if (!lender) return res.status(404).json({ error: 'Lender not found' });

  const {
    name,
    institution_type,
    customer_types,
    products,
    min_amount,
    max_amount,
    min_income_or_revenue,
    eligibility_criteria,
    required_documents,
    geographic_coverage,
    contact_email,
    contact_phone,
    processing_days,
    internal_notes,
    active
  } = req.body;

  if (name !== undefined) lender.name = name;
  if (institution_type !== undefined) lender.institution_type = institution_type;
  if (customer_types !== undefined) lender.customer_types = customer_types;
  if (products !== undefined) lender.products = Array.isArray(products) ? products : [products];
  if (min_amount !== undefined) lender.min_amount = Number(min_amount);
  if (max_amount !== undefined) lender.max_amount = Number(max_amount);
  if (min_income_or_revenue !== undefined) lender.min_income_or_revenue = Number(min_income_or_revenue);
  if (eligibility_criteria !== undefined) lender.eligibility_criteria = eligibility_criteria;
  if (required_documents !== undefined) lender.required_documents = Array.isArray(required_documents) ? required_documents : [required_documents];
  if (geographic_coverage !== undefined) lender.geographic_coverage = geographic_coverage;
  if (contact_email !== undefined) lender.contact_email = contact_email;
  if (contact_phone !== undefined) lender.contact_phone = contact_phone;
  if (processing_days !== undefined) lender.processing_days = processing_days;
  if (internal_notes !== undefined) lender.internal_notes = internal_notes;
  if (active !== undefined) lender.active = Boolean(active);

  db.logAudit(user.userId, user.full_name, 'LENDER_UPDATED', `Updated lender details for ${lender.name}`);
  return res.json({ lender, message: 'Lender updated successfully' });
});

app.delete('/api/admin/lenders/:id', authenticateToken, requireRoles(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  const user = (req as any).user;
  const lenderId = req.params.id;
  const idx = db.lenders.findIndex((l) => l.id === lenderId);
  if (idx === -1) return res.status(404).json({ error: 'Lender not found' });

  const deletedName = db.lenders[idx].name;
  db.lenders.splice(idx, 1);
  db.logAudit(user.userId, user.full_name, 'LENDER_DELETED', `Removed lender partner ${deletedName}`);
  return res.json({ message: 'Lender removed successfully' });
});

// Customers Management API
app.get('/api/admin/customers', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const { search } = req.query;
  const customerUsers = db.users.filter((u) => u.role === 'CUSTOMER');

  // Also collect applicants from unlinked applications
  const unlinkedEmails = new Set(customerUsers.map((c) => c.email.toLowerCase()));
  const unlinkedApplicants: any[] = [];

  for (const app of db.applications) {
    const email = app.applicant_info.email.toLowerCase();
    if (!unlinkedEmails.has(email)) {
      unlinkedEmails.add(email);
      unlinkedApplicants.push({
        id: `applicant-${app.id}`,
        email: app.applicant_info.email,
        full_name: `${app.applicant_info.first_name} ${app.applicant_info.last_name}`,
        phone: app.applicant_info.phone,
        role: 'CUSTOMER' as Role,
        created_at: app.created_at,
        state: app.applicant_info.state_location,
        is_guest: true
      });
    }
  }

  const allBorrowers = [...customerUsers, ...unlinkedApplicants];

  const summary = allBorrowers.map((borrower) => {
    const userApps = db.applications.filter(
      (a) =>
        (borrower.id && a.user_id === borrower.id) ||
        a.applicant_info.email.toLowerCase() === borrower.email.toLowerCase()
    );

    const totalAmount = userApps.reduce((acc, a) => acc + (a.requested_amount || 0), 0);
    const latestApp = userApps.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    const hasVerifiedDoc = db.documents.some(
      (d) => userApps.some((ua) => ua.id === d.application_id) && d.status === 'VERIFIED'
    );

    return {
      id: borrower.id,
      full_name: borrower.full_name,
      email: borrower.email,
      phone: borrower.phone,
      applicant_type: latestApp ? latestApp.applicant_type : 'INDIVIDUAL',
      total_applications: userApps.length,
      total_requested_amount: totalAmount,
      latest_status: latestApp ? latestApp.status : 'UNDER_REVIEW',
      kyc_status: hasVerifiedDoc ? 'VERIFIED' : 'TIER_1',
      created_at: borrower.created_at,
      state: borrower.state || (latestApp?.applicant_info?.state_location) || 'Nigeria'
    };
  });

  let result = summary;
  if (search) {
    const q = String(search).toLowerCase();
    result = summary.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    );
  }

  return res.json({ customers: result });
});

// Central Documents Repository API
app.get('/api/admin/documents', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const { status, search } = req.query;
  let docs = db.documents.map((doc) => {
    const app = db.applications.find((a) => a.id === doc.application_id);
    return {
      ...doc,
      reference_number: app ? app.reference_number : 'N/A',
      applicant_name: app ? `${app.applicant_info.first_name} ${app.applicant_info.last_name}` : 'Unknown',
      applicant_type: app ? app.applicant_type : 'INDIVIDUAL',
      requested_amount: app ? app.requested_amount : 0
    };
  });

  if (status) {
    docs = docs.filter((d) => d.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    docs = docs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.document_type.toLowerCase().includes(q) ||
        d.reference_number.toLowerCase().includes(q) ||
        d.applicant_name.toLowerCase().includes(q)
    );
  }

  return res.json({ documents: docs });
});

// Verify / Reject Document API
app.patch('/api/admin/documents/:id/status', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const user = (req as any).user;
  const docId = req.params.id;
  const { status, notes } = req.body;

  const doc = db.documents.find((d) => d.id === docId);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  if (status && ['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
    doc.status = status;
    if (notes) doc.notes = notes;

    const app = db.applications.find((a) => a.id === doc.application_id);
    const ref = app ? app.reference_number : 'App';

    db.logAudit(
      user.userId,
      user.full_name,
      status === 'VERIFIED' ? 'DOCUMENT_VERIFIED' : 'DOCUMENT_REJECTED',
      `${status === 'VERIFIED' ? 'Verified' : 'Rejected'} ${doc.name} for ${ref}. ${notes ? `Note: ${notes}` : ''}`
    );

    // If verified, also update any matching requirement
    if (status === 'VERIFIED') {
      const req = db.documentRequirements.find(
        (r) => r.application_id === doc.application_id && r.title.toLowerCase().includes(doc.document_type.toLowerCase())
      );
      if (req) req.status = 'APPROVED';
    }
  }

  return res.json({ document: doc, message: `Document marked as ${status}` });
});

// Add Internal Operational Note to Application
app.post('/api/admin/applications/:id/notes', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const user = (req as any).user;
  const appId = req.params.id;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Note text cannot be empty' });
  }

  const app = db.applications.find((a) => a.id === appId);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  if (!app.internal_notes) app.internal_notes = [];

  const newNote = {
    id: `nt-${Date.now()}`,
    application_id: app.id,
    author_id: user.userId,
    author_name: user.full_name,
    author_role: user.role,
    text: text.trim(),
    created_at: new Date().toISOString()
  };

  app.internal_notes.unshift(newNote);
  db.logAudit(user.userId, user.full_name, 'INTERNAL_NOTE_ADDED', `Added private staff note to ${app.reference_number}`);

  return res.status(201).json({ note: newNote, message: 'Internal note saved' });
});

// Record Lender Offer / Decision
app.post('/api/admin/applications/:id/lender-offer', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const user = (req as any).user;
  const appId = req.params.id;
  const {
    approved_amount,
    interest_rate_monthly,
    tenor_months,
    monthly_repayment,
    advisory_fee,
    decision_note,
    decision_status
  } = req.body;

  const app = db.applications.find((a) => a.id === appId);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  app.lender_offer = {
    approved_amount: approved_amount ? Number(approved_amount) : app.requested_amount,
    interest_rate_monthly: interest_rate_monthly ? Number(interest_rate_monthly) : 2.5,
    tenor_months: tenor_months ? Number(tenor_months) : 12,
    monthly_repayment: monthly_repayment ? Number(monthly_repayment) : undefined,
    advisory_fee: advisory_fee ? Number(advisory_fee) : undefined,
    decision_note: decision_note || '',
    recorded_at: new Date().toISOString()
  };

  if (decision_status && ['APPROVED', 'DECLINED'].includes(decision_status)) {
    const oldStatus = app.status;
    app.status = decision_status as ApplicationStatus;
    db.timelineEvents.push({
      id: `tl-${Date.now()}`,
      application_id: app.id,
      status: app.status,
      title: decision_status === 'APPROVED' ? 'Loan Sanctioned / Approved' : 'Application Declined',
      description: decision_note || `Formal decision recorded by ${user.full_name}.`,
      actor_name: user.full_name,
      timestamp: new Date().toISOString()
    });
  }

  app.updated_at = new Date().toISOString();
  db.logAudit(user.userId, user.full_name, 'LENDER_OFFER_RECORDED', `Recorded lender decision for ${app.reference_number}`);

  return res.json({ application: app, lender_offer: app.lender_offer, message: 'Lender decision recorded' });
});

// Unified Inbox / Messages API
app.get('/api/admin/messages', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const threads: any[] = [];
  const appIds = Array.from(new Set(db.messages.map((m) => m.application_id)));

  for (const appId of appIds) {
    const app = db.applications.find((a) => a.id === appId);
    const msgs = db.messages
      .filter((m) => m.application_id === appId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const lastMsg = msgs[msgs.length - 1];

    if (app && lastMsg) {
      threads.push({
        application_id: app.id,
        reference_number: app.reference_number,
        customer_name: `${app.applicant_info.first_name} ${app.applicant_info.last_name}`,
        customer_email: app.applicant_info.email,
        customer_phone: app.applicant_info.phone,
        status: app.status,
        requested_amount: app.requested_amount,
        last_message: lastMsg.text,
        last_message_sender: lastMsg.sender_name,
        last_message_time: lastMsg.created_at,
        total_messages: msgs.length,
        messages: msgs
      });
    }
  }

  threads.sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());
  return res.json({ threads });
});

// Operational & Executive Reports API
app.get('/api/admin/reports', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const apps = db.applications;
  const lenders = db.lenders;

  const totalVolumeRequested = apps.reduce((acc, a) => acc + (a.requested_amount || 0), 0);
  const approvedApps = apps.filter((a) => a.status === 'APPROVED');
  const totalVolumeApproved = approvedApps.reduce((acc, a) => {
    return acc + (a.lender_offer?.approved_amount || a.requested_amount || 0);
  }, 0);

  const approvalRate = apps.length > 0 ? Math.round((approvedApps.length / apps.length) * 100) : 0;

  // Dynamically group real applications by Month Year
  const monthMap = new Map<string, { month: string; volume_requested: number; volume_approved: number; applications: number }>();

  if (apps.length > 0) {
    for (const app of apps) {
      const d = new Date(app.created_at || Date.now());
      const monthKey = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { month: monthKey, volume_requested: 0, volume_approved: 0, applications: 0 });
      }
      const entry = monthMap.get(monthKey)!;
      entry.applications += 1;
      entry.volume_requested += (app.requested_amount || 0);
      if (app.status === 'APPROVED') {
        entry.volume_approved += (app.lender_offer?.approved_amount || app.requested_amount || 0);
      }
    }
  }

  const currentMonthKey = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const monthlyTrends = monthMap.size > 0 
    ? Array.from(monthMap.values())
    : [{ month: currentMonthKey, volume_requested: 0, volume_approved: 0, applications: 0 }];

  // Status breakdown
  const statusCounts = [
    { name: 'Under Review', count: apps.filter((a) => a.status === 'UNDER_REVIEW').length, color: '#5A5F71' },
    { name: 'Assessment', count: apps.filter((a) => a.status === 'INITIAL_ASSESSMENT').length, color: '#3B82F6' },
    { name: 'Processing', count: apps.filter((a) => a.status === 'PROCESSING').length, color: '#8B5CF6' },
    { name: 'Docs Required', count: apps.filter((a) => a.status === 'DOCUMENTS_REQUIRED').length, color: '#F59E0B' },
    { name: 'Lender Matched', count: apps.filter((a) => a.status === 'LENDER_MATCHED').length, color: '#06B6D4' },
    { name: 'Submitted / Review', count: apps.filter((a) => a.status === 'SUBMITTED_TO_LENDER' || a.status === 'LENDER_REVIEW').length, color: '#2D62FF' },
    { name: 'Approved', count: apps.filter((a) => a.status === 'APPROVED').length, color: '#10B981' },
    { name: 'Declined', count: apps.filter((a) => a.status === 'DECLINED').length, color: '#EF4444' }
  ];

  // Category Distribution (Individual vs Business)
  const indApps = apps.filter((a) => a.applicant_type === 'INDIVIDUAL');
  const bizApps = apps.filter((a) => a.applicant_type === 'BUSINESS');
  const categoryBreakdown = [
    { name: 'Individual Loans', count: indApps.length, volume: indApps.reduce((acc, a) => acc + a.requested_amount, 0) },
    { name: 'Business Loans', count: bizApps.length, volume: bizApps.reduce((acc, a) => acc + a.requested_amount, 0) }
  ];

  // Lender Distribution
  const lenderDistribution = lenders.map((len) => {
    const lenApps = apps.filter((a) => a.assigned_lender_id === len.id);
    return {
      name: len.name.replace(' [DEMO]', ''),
      type: len.institution_type,
      assigned_count: lenApps.length,
      volume: lenApps.reduce((acc, a) => acc + a.requested_amount, 0)
    };
  });

  // Staff Performance
  const staffUsers = db.users.filter((u) => u.role !== 'CUSTOMER');
  const staffPerformance = staffUsers.map((st) => {
    const assignedApps = apps.filter((a) => a.assigned_staff_id === st.id);
    const completedFollowups = db.followUps.filter((f) => f.assigned_staff_id === st.id && f.completed);
    return {
      id: st.id,
      name: st.full_name,
      role: st.role,
      assigned_cases: assignedApps.length,
      completed_tasks: completedFollowups.length
    };
  });

  // Real turnaround calculation
  let avgTurnaround = 0;
  const processedApps = apps.filter(a => ['APPROVED', 'DECLINED'].includes(a.status) && a.created_at && a.updated_at);
  if (processedApps.length > 0) {
    const totalDays = processedApps.reduce((acc, a) => {
      const diff = Math.max(0, new Date(a.updated_at).getTime() - new Date(a.created_at).getTime());
      return acc + (diff / (1000 * 60 * 60 * 24));
    }, 0);
    avgTurnaround = Number((totalDays / processedApps.length).toFixed(1));
  }

  return res.json({
    metrics: {
      total_volume_requested: totalVolumeRequested,
      total_volume_approved: totalVolumeApproved,
      total_applications: apps.length,
      approval_rate_percent: approvalRate,
      avg_turnaround_days: avgTurnaround
    },
    monthly_trends: monthlyTrends,
    status_breakdown: statusCounts,
    category_breakdown: categoryBreakdown,
    lender_distribution: lenderDistribution,
    staff_performance: staffPerformance
  });
});

// Staff Management APIs
app.post('/api/admin/staff', authenticateToken, requireRoles(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  const admin = (req as any).user;
  const { email, full_name, phone, role } = req.body;

  if (!email || !full_name || !role) {
    return res.status(400).json({ error: 'Email, full name and role are required' });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newStaff: User = {
    id: `usr-staff-${Date.now()}`,
    email: email.toLowerCase().trim(),
    full_name: full_name.trim(),
    phone: phone || '',
    role: role as Role,
    created_at: new Date().toISOString()
  };

  db.users.push(newStaff);
  db.logAudit(admin.userId, admin.full_name, 'STAFF_INVITED', `Added new staff member ${newStaff.full_name} (${newStaff.role})`);

  return res.status(201).json({ staff: newStaff, message: 'Staff member added successfully' });
});

app.patch('/api/admin/staff/:id', authenticateToken, requireRoles(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  const admin = (req as any).user;
  const staffId = req.params.id;
  const { role, phone, full_name } = req.body;

  const staffUser = db.users.find((u) => u.id === staffId);
  if (!staffUser) return res.status(404).json({ error: 'Staff member not found' });

  if (role) staffUser.role = role;
  if (phone !== undefined) staffUser.phone = phone;
  if (full_name) staffUser.full_name = full_name;

  db.logAudit(admin.userId, admin.full_name, 'STAFF_UPDATED', `Updated staff details for ${staffUser.full_name}`);
  return res.json({ staff: staffUser, message: 'Staff updated successfully' });
});

// System Settings APIs
app.get('/api/admin/settings', authenticateToken, requireRoles(staffRoles), (req, res) => {
  return res.json({ settings: db.settings });
});

app.patch('/api/admin/settings', authenticateToken, requireRoles(['SUPER_ADMIN', 'ADMIN']), (req, res) => {
  const user = (req as any).user;
  const updates = req.body;

  db.settings = { ...db.settings, ...updates };
  db.logAudit(user.userId, user.full_name, 'SETTINGS_UPDATED', `Updated system operational & security settings.`);

  return res.json({ settings: db.settings, message: 'System settings saved successfully' });
});

// Audit Logs API
app.get('/api/admin/audit-logs', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const { search } = req.query;
  let logs = [...db.auditLogs];

  if (search) {
    const q = String(search).toLowerCase();
    logs = logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.user_name.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
    );
  }

  return res.json({ logs: logs.slice(0, 100) });
});

// Staff Users List API
app.get('/api/admin/staff', authenticateToken, requireRoles(staffRoles), (req, res) => {
  const staff = db.users.filter((u) => u.role !== 'CUSTOMER').map((s) => {
    const activeCases = db.applications.filter((a) => a.assigned_staff_id === s.id && !['APPROVED', 'DECLINED'].includes(a.status)).length;
    return {
      ...s,
      active_cases_count: activeCases
    };
  });
  return res.json({ staff });
});

// ==================== AI ADVISOR APIS (REST FALLBACK & TTS) ====================

app.post('/api/ai/advisor-chat', async (req, res) => {
  try {
    const { prompt, history, voiceName } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const text = await generateAdvisorResponse(prompt, history || []);
    let audio: string | null = null;
    try {
      audio = await generateAdvisorSpeech(text, voiceName || 'Kore');
    } catch (ttsErr) {
      console.warn('[Gemini TTS] Fallback TTS generation skipped:', ttsErr);
    }

    return res.json({ text, audio });
  } catch (err: any) {
    console.error('[AI Advisor] Chat error:', err);
    return res.status(500).json({ error: err?.message || 'Failed to generate advisor response' });
  }
});

app.get('/api/config/gemini-key', (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const hasKey = !!key && key.trim() !== '' && key !== 'MY_GEMINI_API_KEY';
  return res.json({ hasKey });
});

app.post('/api/config/gemini-key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return res.status(400).json({ error: 'API key is required' });
  }

  const cleanKey = apiKey.trim();
  process.env.GEMINI_API_KEY = cleanKey;
  resetAiClient();

  // Persist to .env file
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }
    if (envContent.includes('GEMINI_API_KEY=')) {
      envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY="${cleanKey}"`);
    } else {
      envContent += `\nGEMINI_API_KEY="${cleanKey}"\n`;
    }
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
  } catch (e) {
    console.warn('[Server] Notice saving .env:', e);
  }

  return res.json({ success: true, message: 'Gemini API key configured and activated successfully!' });
});

// ==================== VITE DEVELOPMENT & PRODUCTION SERVING ====================

async function startServer() {
  const server = http.createServer(app);

  // Handle client error socket events to prevent unhandled node socket errors
  server.on('clientError', (err: any, socket: any) => {
    const msg = err?.message || (typeof err === 'string' ? err : 'Client connection notice');
    console.warn('[HTTP Server] Client socket notice handled:', msg);
    if (socket && socket.writable) {
      try {
        socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
      } catch {}
    }
    if (socket && typeof socket.destroy === 'function') {
      try {
        socket.destroy();
      } catch {}
    }
  });

  server.on('error', (err: any) => {
    console.error('[HTTP Server] Server error:', err?.message || err);
  });

  // Mount Gemini Live WebSocket handler
  setupGeminiLiveWebSocket(server);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.includes(path.sep + 'assets' + path.sep)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[AkoFinanced It] Server listening with Gemini Live on http://0.0.0.0:${PORT}`);
  });
}

startServer();
