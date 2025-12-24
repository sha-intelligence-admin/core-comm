import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/supabase/api';
import { CreatePhoneNumberSchema } from '@/lib/validations';
import {
  createPhoneNumber,
  listPhoneNumbers,
} from '@/lib/vapi/phone-numbers';
import { purchaseTwilioPhoneNumberByAreaCode } from '@/lib/twilio/client';

/**
 * GET /api/vapi/phone-numbers
 * List all phone numbers for the user's company
 */
export async function GET(request: NextRequest) {
  try {
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

    // List phone numbers
    const phoneNumbers = await listPhoneNumbers(userProfile.company_id);

    return createSuccessResponse({ phoneNumbers });
  } catch (error) {
    console.error('Error in GET /api/vapi/phone-numbers:', error);
    return createErrorResponse('Failed to fetch phone numbers', 500);
  }
}

/**
 * POST /api/vapi/phone-numbers
 * Create or provision a new phone number
 */
export async function POST(request: NextRequest) {
  try {
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

    // Only admins can create phone numbers
    if (!hasPermission) {
      return createErrorResponse('Only admins can provision phone numbers', 403);
    }

    // Validate request body
    const body = await request.json();
    const validatedData = CreatePhoneNumberSchema.parse(body);

    // Inject Twilio credentials if provider is twilio and they are missing
    if (validatedData.provider === 'twilio') {
      if (!validatedData.twilioAccountSid && process.env.TWILIO_ACCOUNT_SID) {
        validatedData.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
      }
      if (!validatedData.twilioAuthToken && process.env.TWILIO_AUTH_TOKEN) {
        validatedData.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
      }

      // Handle purchasing a new number if areaCode is provided but number is missing
      if (validatedData.areaCode && !validatedData.number) {
        try {
          const purchased = await purchaseTwilioPhoneNumberByAreaCode({
            areaCode: validatedData.areaCode,
            companyName: 'CoreComm User', // We could fetch company name if needed
          });
          
          // Use the purchased number for Vapi import
          validatedData.number = purchased.phoneNumber;
          
          // Remove areaCode as it's not needed for import and causes Vapi error
          delete validatedData.areaCode;
        } catch (purchaseError) {
          console.error('Failed to purchase Twilio number:', purchaseError);
          return createErrorResponse(
            `Failed to purchase phone number: ${purchaseError instanceof Error ? purchaseError.message : 'Unknown error'}`, 
            502
          );
        }
      }
    }

    // Verify assistant exists if provided
    if (validatedData.assistantId) {
      const { data: assistant, error: assistantError } = await supabase
        .from('vapi_assistants')
        .select('id')
        .eq('id', validatedData.assistantId)
        .eq('company_id', userProfile.company_id)
        .single();

      if (assistantError || !assistant) {
        return createErrorResponse('Assistant not found', 404);
      }
    }

    // Create phone number
    const phoneNumber = await createPhoneNumber(
      userProfile.company_id,
      validatedData
    );

    return createSuccessResponse(
      { phoneNumber },
      'Phone number provisioned successfully'
    );
  } catch (error) {
    console.error('Error in POST /api/vapi/phone-numbers:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return createErrorResponse('Invalid request data', 400);
    }

    if (error instanceof Error) {
      return createErrorResponse(error.message, 500);
    }

    return createErrorResponse('Failed to provision phone number', 500);
  }
}
