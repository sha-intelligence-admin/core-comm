import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';

export const dynamic = 'force-dynamic';

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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const { data: logs, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('company_id', userProfile.company_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return createErrorResponse('Failed to fetch audit logs', 500);
    }

    return createSuccessResponse({ 
      logs,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (error) {
    console.error('Internal error in GET /api/security/audit-logs:', error);
    return createErrorResponse('Internal Server Error', 500);
  }
}
