import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';

/**
 * GET /api/security/settings
 * Retrieves security settings for the user's organization.
 * 
 * @param request - NextRequest object
 * @returns JSON response with security settings
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403);
    }

    let { data: settings, error } = await supabase
      .from('security_settings')
      .select('*')
      .eq('company_id', userProfile.company_id)
      .single();

    if (error && error.code === 'PGRST116') {
      // No settings found, create default
      const { data: newSettings, error: createError } = await supabase
        .from('security_settings')
        .insert({ company_id: userProfile.company_id })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating default security settings:', createError);
        return createErrorResponse('Failed to initialize settings', 500);
      }
      settings = newSettings;
    } else if (error) {
      console.error('Error fetching security settings:', error);
      return createErrorResponse('Failed to fetch settings', 500);
    }

    return createSuccessResponse({ settings });
  } catch (error) {
    console.error('Internal error in GET /api/security/settings:', error);
    return createErrorResponse('Internal Server Error', 500);
  }
}

/**
 * PATCH /api/security/settings
 * Updates security settings for the user's organization.
 * Requires admin role.
 * 
 * @param request - NextRequest object containing settings updates
 * @returns JSON response with updated settings or error
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403);
    }

    if (userProfile.role !== 'admin') {
      return createErrorResponse('Only admins can update security settings', 403);
    }

    const body = await request.json();
    const { two_factor_enabled, allowed_auth_methods, ip_whitelist } = body;

    const updates: any = {};
    if (typeof two_factor_enabled !== 'undefined') updates.two_factor_enabled = two_factor_enabled;
    if (allowed_auth_methods) updates.allowed_auth_methods = allowed_auth_methods;
    if (ip_whitelist) updates.ip_whitelist = ip_whitelist;
    updates.updated_at = new Date().toISOString();

    const { data: settings, error } = await supabase
      .from('security_settings')
      .update(updates)
      .eq('company_id', userProfile.company_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating security settings:', error);
      return createErrorResponse('Failed to update settings', 500);
    }

    // Log this action
    await supabase.from('audit_logs').insert({
      company_id: userProfile.company_id,
      user_id: user.id,
      actor_name: user.email, // Ideally fetch name, but email is available on user object usually
      action: 'update_security_settings',
      resource: 'security_settings',
      details: updates,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return createSuccessResponse({ settings });
  } catch (error) {
    console.error('Internal error in PATCH /api/security/settings:', error);
    return createErrorResponse('Internal Server Error', 500);
  }
}
