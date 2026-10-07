import 'dotenv/config';
import { db } from './db.js';
import { getSupabase } from './supabase.js';

export async function seedSupabaseDatabase() {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('[Supabase Seed] No Supabase client available');
    return;
  }

  console.log('[Supabase Seed] Starting cloud database synchronization...');

  // 1. Sync Users
  try {
    const userPayloads = db.users.map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      phone: u.phone || null,
      role: u.role,
      preferred_contact_method: u.preferred_contact_method || null,
      address: u.address || null,
      dob: u.dob || null,
      city: u.city || null,
      state: u.state || null,
      created_at: u.created_at || new Date().toISOString(),
    }));
    const { error: userErr } = await supabase.from('users').upsert(userPayloads);
    if (userErr) console.warn('[Supabase Seed] Users error:', userErr.message);
    else console.log(`[Supabase Seed] Synced ${userPayloads.length} users.`);
  } catch (e) {
    console.warn('[Supabase Seed] Users sync notice:', e);
  }

  // 2. Sync Lenders
  try {
    const lenderPayloads = db.lenders.map(l => ({
      id: l.id,
      name: l.name,
      institution_type: l.institution_type,
      customer_types: l.customer_types,
      products: l.products || [],
      min_amount: l.min_amount || 0,
      max_amount: l.max_amount || 0,
      min_income_or_revenue: l.min_income_or_revenue || 0,
      eligibility_criteria: l.eligibility_criteria || null,
      required_documents: l.required_documents || [],
      geographic_coverage: l.geographic_coverage || null,
      contact_email: l.contact_email || null,
      contact_phone: l.contact_phone || null,
      processing_days: l.processing_days || null,
      internal_notes: l.internal_notes || null,
      active: l.active !== false,
      is_demo: l.is_demo !== false,
      created_at: (l as any).created_at || new Date().toISOString(),
    }));
    const { error: lenderErr } = await supabase.from('lenders').upsert(lenderPayloads);
    if (lenderErr) console.warn('[Supabase Seed] Lenders error:', lenderErr.message);
    else console.log(`[Supabase Seed] Synced ${lenderPayloads.length} lenders.`);
  } catch (e) {
    console.warn('[Supabase Seed] Lenders sync notice:', e);
  }

  // 3. Sync Applications
  try {
    const appPayloads = db.applications.map(a => ({
      id: a.id,
      reference_number: a.reference_number,
      applicant_type: a.applicant_type,
      applicant_info: a.applicant_info || {},
      requested_amount: a.requested_amount || 0,
      status: a.status || 'UNDER_REVIEW',
      user_id: a.user_id || null,
      assigned_staff_id: a.assigned_staff_id || null,
      assigned_staff_name: a.assigned_staff_name || null,
      assigned_lender_id: a.assigned_lender_id || null,
      assigned_lender_name: a.assigned_lender_name || null,
      lender_offer: a.lender_offer || null,
      internal_notes: a.internal_notes || [],
      created_at: a.created_at || new Date().toISOString(),
      updated_at: a.updated_at || new Date().toISOString(),
    }));
    const { error: appErr } = await supabase.from('applications').upsert(appPayloads);
    if (appErr) console.warn('[Supabase Seed] Applications error:', appErr.message);
    else console.log(`[Supabase Seed] Synced ${appPayloads.length} applications.`);
  } catch (e) {
    console.warn('[Supabase Seed] Applications sync notice:', e);
  }

  // 4. Sync Documents
  try {
    const docPayloads = db.documents.map(d => ({
      id: d.id,
      application_id: d.application_id,
      document_type: d.document_type,
      name: d.name,
      file_url: d.file_url,
      file_size: d.file_size || '0 KB',
      status: d.status || 'PENDING',
      uploaded_by: d.uploaded_by,
      notes: d.notes || null,
      created_at: d.created_at || new Date().toISOString(),
    }));
    const { error: docErr } = await supabase.from('documents').upsert(docPayloads);
    if (docErr) console.warn('[Supabase Seed] Documents error:', docErr.message);
    else console.log(`[Supabase Seed] Synced ${docPayloads.length} documents.`);
  } catch (e) {
    console.warn('[Supabase Seed] Documents sync notice:', e);
  }

  // 5. Sync System Settings
  try {
    const { error: settingsErr } = await supabase.from('system_settings').upsert({
      id: 'global_settings',
      sla_assessment_hours: db.settings.sla_assessment_hours,
      sla_docs_hours: db.settings.sla_docs_hours,
      min_loan_amount: db.settings.min_loan_amount,
      max_loan_amount: db.settings.max_loan_amount,
      default_advisory_rate: db.settings.default_advisory_rate,
      email_notifications_enabled: db.settings.email_notifications_enabled,
      sms_notifications_enabled: db.settings.sms_notifications_enabled,
      require_2fa: db.settings.require_2fa,
      session_timeout_mins: db.settings.session_timeout_mins,
      auto_lender_match: db.settings.auto_lender_match,
      updated_at: new Date().toISOString(),
    });
    if (settingsErr) console.warn('[Supabase Seed] Settings error:', settingsErr.message);
    else console.log('[Supabase Seed] Synced system settings.');
  } catch (e) {
    console.warn('[Supabase Seed] Settings sync notice:', e);
  }

  console.log('[Supabase Seed] Supabase synchronization complete!');
}

// Auto-run if executed directly
if (process.argv[1]?.includes('seedSupabase')) {
  seedSupabaseDatabase().then(() => {
    console.log('Done');
    process.exit(0);
  });
}
