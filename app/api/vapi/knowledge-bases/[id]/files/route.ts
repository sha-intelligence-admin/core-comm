import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import {
  uploadFile,
  listFiles,
  deleteFile,
} from '@/lib/vapi/knowledge-bases';
import {
  MAX_FILE_SIZE,
  RECOMMENDED_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  ALLOWED_FILE_EXTENSIONS,
} from '@/lib/validations';

/**
 * GET /api/vapi/knowledge-bases/[id]/files
 * List all files in a knowledge base
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get user's company_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403);
    }

    // List files
    const files = await listFiles(id, userProfile.company_id);

    return createSuccessResponse({ files });
  } catch (error) {
    console.error('Error in GET /api/vapi/knowledge-bases/[id]/files:', error);

    if (error instanceof Error && error.message === 'Knowledge base not found') {
      return createErrorResponse('Knowledge base not found', 404);
    }

    return createErrorResponse('Failed to fetch files', 500);
  }
}

/**
 * POST /api/vapi/knowledge-bases/[id]/files
 * Upload a file to a knowledge base
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get user's company_id and role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403);
    }

    // Check permissions
    let hasPermission = userProfile.role === 'admin' || userProfile.role === 'owner';

    if (!hasPermission) {
      // Fallback: Check organization_memberships
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('role')
        .eq('user_id', user.id)
        .eq('company_id', userProfile.company_id)
        .single();
      
      if (membership && (membership.role === 'owner' || membership.role === 'admin')) {
        hasPermission = true;
      }
    }

    // Only admins can upload files
    if (!hasPermission) {
      return createErrorResponse('Only admins can upload files', 403);
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return createErrorResponse('No file provided', 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return createErrorResponse(
        `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        400
      );
    }

    // Warn if file is larger than recommended
    let warning = null;
    if (file.size > RECOMMENDED_FILE_SIZE) {
      warning = `File size is ${(file.size / 1024).toFixed(2)}KB. Files larger than ${RECOMMENDED_FILE_SIZE / 1024}KB may take longer to process.`;
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension as any)) {
      return createErrorResponse(
        `File type not supported. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`,
        400
      );
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
      // Allow if extension is valid but MIME type check failed (some files may have incorrect MIME)
      console.warn(`File MIME type mismatch: ${file.type}, but extension ${fileExtension} is allowed`);
    }

    // Upload file
    const uploadedFile = await uploadFile(id, userProfile.company_id, file);

    return createSuccessResponse(
      { file: uploadedFile, warning },
      'File uploaded successfully'
    );
  } catch (error) {
    console.error('Error in POST /api/vapi/knowledge-bases/[id]/files:', error);

    if (error instanceof Error && error.message === 'Knowledge base not found') {
      return createErrorResponse('Knowledge base not found', 404);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to upload file', 500);
  }
}

/**
 * DELETE /api/vapi/knowledge-bases/[id]/files/[fileId]
 * Delete a file from a knowledge base
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return createErrorResponse('File ID is required', 400);
    }

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get user's company_id and role
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile?.company_id) {
      return createErrorResponse('User not associated with a company', 403);
    }

    // Check permissions
    let hasPermission = userProfile.role === 'admin' || userProfile.role === 'owner';

    if (!hasPermission) {
      // Fallback: Check organization_memberships
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('role')
        .eq('user_id', user.id)
        .eq('company_id', userProfile.company_id)
        .single();
      
      if (membership && (membership.role === 'owner' || membership.role === 'admin')) {
        hasPermission = true;
      }
    }

    // Only admins can delete files
    if (!hasPermission) {
      return createErrorResponse('Only admins can delete files', 403);
    }

    // Delete file
    await deleteFile(id, fileId, userProfile.company_id);

    return createSuccessResponse(null, 'File deleted successfully');
  } catch (error) {
    console.error('Error in DELETE /api/vapi/knowledge-bases/[id]/files:', error);

    if (error instanceof Error && error.message === 'Knowledge base not found') {
      return createErrorResponse('Knowledge base not found', 404);
    }

    if (error instanceof Error && error.message === 'File not found') {
      return createErrorResponse('File not found', 404);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to delete file', 500);
  }
}
