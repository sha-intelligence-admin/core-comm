import { getVapiClient } from './client';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { CreatePhoneNumberInput, UpdatePhoneNumberInput } from '@/lib/validations';

/**
 * Create a new phone number
 */
export async function createPhoneNumber(
  companyId: string,
  params: CreatePhoneNumberInput
) {
  const vapi = getVapiClient();
  const supabase = createServiceRoleClient();

  try {
    // Create phone number in Vapi
    const vapiPhone: any = await vapi.phoneNumbers.create({
      provider: params.provider === 'byo' ? 'byo-phone-number' : params.provider as any,
      ...(params.assistantId && { assistantId: params.assistantId }),
      ...(params.areaCode && { areaCode: params.areaCode }),
      ...(params.number && { number: params.number }),
      ...(params.fallbackNumber && { fallbackDestination: { number: params.fallbackNumber } }),
    } as any);

    // Store in database
    const { data, error } = await supabase
      .from('vapi_phone_numbers')
      .insert({
        company_id: companyId,
        vapi_phone_id: vapiPhone.id,
        phone_number: vapiPhone.number || vapiPhone.phoneNumber || '',
        assistant_id: params.assistantId || null,
        provider: params.provider,
        country_code: vapiPhone.countryCode || 'US',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      // Cleanup: Delete from Vapi if database insert fails
      try {
        await vapi.phoneNumbers.delete(vapiPhone.id);
      } catch (cleanupError) {
        console.error('Error cleaning up Vapi phone number:', cleanupError);
      }
      throw new Error('Failed to store phone number in database');
    }

    return { ...data, vapiPhone };
  } catch (error) {
    console.error('Error creating phone number:', error);
    throw error;
  }
}

/**
 * List all phone numbers for a company
 */
export async function listPhoneNumbers(companyId: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('vapi_phone_numbers')
    .select(`
      *,
      vapi_assistants (
        id,
        name,
        vapi_assistant_id
      )
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing phone numbers:', error);
    throw new Error('Failed to fetch phone numbers');
  }

  return data;
}

/**
 * Get a single phone number
 */
export async function getPhoneNumber(id: string, companyId: string) {
  const supabase = createServiceRoleClient();

  const { data, error } = await supabase
    .from('vapi_phone_numbers')
    .select(`
      *,
      vapi_assistants (
        id,
        name,
        vapi_assistant_id,
        description,
        system_prompt
      )
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (error || !data) {
    throw new Error('Phone number not found');
  }

  return data;
}

/**
 * Update a phone number
 */
export async function updatePhoneNumber(
  id: string,
  companyId: string,
  updates: UpdatePhoneNumberInput
) {
  const supabase = createServiceRoleClient();

  // Get current phone number data
  const { data: currentPhone, error: fetchError } = await supabase
    .from('vapi_phone_numbers')
    .select('vapi_phone_id, assistant_id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (fetchError || !currentPhone) {
    throw new Error('Phone number not found');
  }

  // Update in Vapi if assistant changed
  if (updates.assistantId !== undefined && updates.assistantId !== currentPhone.assistant_id) {
    const vapi = getVapiClient();

    try {
      // Get the assistant's vapi_assistant_id if provided
      let vapiAssistantId = null;
      if (updates.assistantId) {
        const { data: assistant } = await supabase
          .from('vapi_assistants')
          .select('vapi_assistant_id')
          .eq('id', updates.assistantId)
          .eq('company_id', companyId)
          .single();

        if (!assistant) {
          throw new Error('Assistant not found');
        }
        vapiAssistantId = assistant.vapi_assistant_id;
      }

      await vapi.phoneNumbers.update(currentPhone.vapi_phone_id, {
        assistantId: vapiAssistantId,
      });
    } catch (vapiError) {
      console.error('Error updating phone number in Vapi:', vapiError);
      throw new Error('Failed to update phone number configuration');
    }
  }

  // Update in database
  const { data, error } = await supabase
    .from('vapi_phone_numbers')
    .update({
      ...(updates.assistantId !== undefined && { assistant_id: updates.assistantId }),
      ...(updates.isActive !== undefined && { is_active: updates.isActive }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to update phone number');
  }

  return data;
}

/**
 * Delete a phone number
 */
export async function deletePhoneNumber(id: string, companyId: string) {
  const supabase = createServiceRoleClient();

  // Get phone number
  const { data: phone, error: fetchError } = await supabase
    .from('vapi_phone_numbers')
    .select('vapi_phone_id')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (fetchError || !phone) {
    throw new Error('Phone number not found');
  }

  // Delete from Vapi
  const vapi = getVapiClient();
  try {
    await vapi.phoneNumbers.delete(phone.vapi_phone_id);
  } catch (vapiError) {
    console.error('Error deleting phone number from Vapi:', vapiError);
    // Continue with database deletion even if Vapi deletion fails
  }

  // Delete from database (cascade will handle related records)
  const { error } = await supabase
    .from('vapi_phone_numbers')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId);

  if (error) {
    throw new Error('Failed to delete phone number from database');
  }
}

/**
 * Get call statistics for a phone number
 */
export async function getPhoneNumberStats(id: string, companyId: string) {
  const supabase = createServiceRoleClient();

  // Verify phone belongs to company
  const { data: phone, error: phoneError } = await supabase
    .from('vapi_phone_numbers')
    .select('phone_number')
    .eq('id', id)
    .eq('company_id', companyId)
    .single();

  if (phoneError || !phone) {
    throw new Error('Phone number not found');
  }

  // Get call statistics
  const { data: calls, error: statsError } = await supabase
    .from('calls')
    .select('id, duration, resolution_status, call_type, created_at')
    .eq('company_id', companyId)
    .or(`caller_number.eq.${phone.phone_number},recipient_number.eq.${phone.phone_number}`);

  if (statsError) {
    console.error('Error fetching phone number stats:', statsError);
    return {
      totalCalls: 0,
      totalDuration: 0,
      inboundCalls: 0,
      outboundCalls: 0,
      resolvedCalls: 0,
      pendingCalls: 0,
    };
  }

  const totalCalls = calls?.length || 0;
  const totalDuration = calls?.reduce((sum: number, call: any) => sum + (call.duration || 0), 0) || 0;
  const inboundCalls = calls?.filter((c: any) => c.call_type === 'inbound').length || 0;
  const outboundCalls = calls?.filter((c: any) => c.call_type === 'outbound').length || 0;
  const resolvedCalls = calls?.filter((c: any) => c.resolution_status === 'resolved').length || 0;
  const pendingCalls = calls?.filter((c: any) => c.resolution_status === 'pending').length || 0;

  return {
    totalCalls,
    totalDuration,
    inboundCalls,
    outboundCalls,
    resolvedCalls,
    pendingCalls,
  };
}
