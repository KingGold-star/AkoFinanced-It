import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

// Resilient background syncing helpers
export async function syncApplicationToSupabase(app: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('applications').upsert({
      id: app.id,
      reference_number: app.reference_number,
      applicant_type: app.applicant_type,
      applicant_info: app.applicant_info,
      requested_amount: app.requested_amount,
      status: app.status,
      user_id: app.user_id || null,
      assigned_staff_id: app.assigned_staff_id || null,
      assigned_staff_name: app.assigned_staff_name || null,
      assigned_lender_id: app.assigned_lender_id || null,
      assigned_lender_name: app.assigned_lender_name || null,
      lender_offer: app.lender_offer || null,
      internal_notes: app.internal_notes || [],
      created_at: app.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync] Application upsert notice:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Application exception:', err?.message || err);
  }
}

export async function syncUserToSupabase(user: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('users').upsert({
      id: user.id,
      email: user.email,
      password_hash: user.password_hash || null,
      full_name: user.full_name,
      phone: user.phone || null,
      role: user.role || 'CUSTOMER',
      preferred_contact_method: user.preferred_contact_method || null,
      address: user.address || null,
      dob: user.dob || null,
      city: user.city || null,
      state: user.state || null,
      created_at: user.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync] User upsert notice:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] User exception:', err?.message || err);
  }
}

export async function syncDocumentToSupabase(doc: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('documents').upsert({
      id: doc.id,
      application_id: doc.application_id,
      document_type: doc.document_type,
      name: doc.name,
      file_url: doc.file_url,
      file_size: doc.file_size || '0 KB',
      status: doc.status || 'PENDING',
      uploaded_by: doc.uploaded_by,
      notes: doc.notes || null,
      created_at: doc.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync] Document upsert notice:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Document exception:', err?.message || err);
  }
}

export async function syncTimelineToSupabase(timeline: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('application_timeline').upsert({
      id: timeline.id,
      application_id: timeline.application_id,
      status: timeline.status,
      title: timeline.title,
      description: timeline.description,
      actor_name: timeline.actor_name,
      timestamp: timeline.timestamp || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync] Timeline upsert notice:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Timeline exception:', err?.message || err);
  }
}

export async function syncMessageToSupabase(msg: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('messages').upsert({
      id: msg.id,
      application_id: msg.application_id,
      sender_id: msg.sender_id,
      sender_name: msg.sender_name,
      sender_role: msg.sender_role,
      text: msg.text,
      created_at: msg.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync] Message upsert notice:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Message exception:', err?.message || err);
  }
}

export async function syncFollowUpToSupabase(fu: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('follow_ups').upsert({
      id: fu.id,
      application_id: fu.application_id,
      application_ref: fu.application_ref,
      customer_name: fu.customer_name,
      customer_phone: fu.customer_phone || null,
      assigned_staff_id: fu.assigned_staff_id || null,
      assigned_staff_name: fu.assigned_staff_name || null,
      due_date: fu.due_date,
      type: fu.type,
      notes: fu.notes || null,
      outcome: fu.outcome || null,
      completed: !!fu.completed,
      created_at: fu.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync] FollowUp upsert notice:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] FollowUp exception:', err?.message || err);
  }
}

export async function syncLenderToSupabase(lender: any) {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.from('lenders').upsert({
      id: lender.id,
      name: lender.name,
      institution_type: lender.institution_type,
      customer_types: lender.customer_types,
      products: lender.products || [],
      min_amount: lender.min_amount || 0,
      max_amount: lender.max_amount || 0,
      min_income_or_revenue: lender.min_income_or_revenue || 0,
      eligibility_criteria: lender.eligibility_criteria || null,
      required_documents: lender.required_documents || [],
      geographic_coverage: lender.geographic_coverage || null,
      contact_email: lender.contact_email || null,
      contact_phone: lender.contact_phone || null,
      processing_days: lender.processing_days || null,
      internal_notes: lender.internal_notes || null,
      active: lender.active !== false,
      is_demo: lender.is_demo !== false,
      created_at: lender.created_at || new Date().toISOString(),
    });

    if (error) {
      console.warn('[Supabase Sync] Lender upsert notice:', error.message);
    }
  } catch (err: any) {
    console.warn('[Supabase Sync] Lender exception:', err?.message || err);
  }
}
