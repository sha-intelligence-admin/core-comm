/**
 * Vapi Assistants Service
 * Business logic for managing voice assistants
 */

import { getVapiClient } from './client';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/api';
import type {
  CreateAssistantParams,
  UpdateAssistantParams,
  VapiAssistant,
} from './types';

/**
 * Create a new voice assistant in Vapi and store in database
 */
export async function createAssistant(
  companyId: string,
  params: CreateAssistantParams
) {
  const vapi = getVapiClient();

  // Create assistant in Vapi
  const vapiAssistant = await vapi.assistants.create({
    name: params.name,
    model: {
      provider: params.model.provider as any,
      model: params.model.model as any,
      temperature: params.model.temperature || 0.7,
      maxTokens: params.model.maxTokens,
      messages: [
        {
          role: 'system',
          content: params.systemPrompt,
        },
      ],
      ...(params.knowledgeBaseId && {
        knowledgeBase: {
          provider: 'canonical',
          id: params.knowledgeBaseId,
        },
      }),
    } as any,
    voice: {
      provider: params.voice.provider as any,
      voiceId: params.voice.voiceId,
      ...(params.voice.speed && { speed: params.voice.speed }),
      ...(params.voice.stability && { stability: params.voice.stability }),
    } as any,
    firstMessage: params.firstMessage,
  } as any);

  // Store in database
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('vapi_assistants')
    .insert({
      company_id: companyId,
      vapi_assistant_id: vapiAssistant.id,
      name: params.name,
      description: params.description || null,
      system_prompt: params.systemPrompt,
      first_message: params.firstMessage,
      model_config: params.model,
      voice_config: params.voice,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error storing assistant in database:', error);
    // Try to clean up Vapi assistant if DB insert fails
    try {
      await vapi.assistants.delete(vapiAssistant.id);
    } catch (cleanupError) {
      console.error('Error cleaning up Vapi assistant:', cleanupError);
    }
    throw new Error('Failed to store assistant in database');
  }

  return {
    ...data,
    vapiAssistant,
  };
}

/**
 * List all assistants for a company
 */
export async function listAssistants(companyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vapi_assistants')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching assistants:', error);
    throw new Error('Failed to fetch assistants');
  }

  return data;
}

/**
 * Get a single assistant by ID
 */
export async function getAssistant(assistantId: string, companyId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('vapi_assistants')
    .select('*')
    .eq('id', assistantId)
    .eq('company_id', companyId)
    .single();

  if (error) {
    console.error('Error fetching assistant:', error);
    throw new Error('Assistant not found');
  }

  return data;
}

/**
 * Update an assistant
 */
export async function updateAssistant(
  assistantId: string,
  companyId: string,
  params: UpdateAssistantParams
) {
  const supabase = createServiceRoleClient();

  // Get existing assistant
  const { data: existingAssistant, error: fetchError } = await supabase
    .from('vapi_assistants')
    .select('*')
    .eq('id', assistantId)
    .eq('company_id', companyId)
    .single();

  if (fetchError || !existingAssistant) {
    throw new Error('Assistant not found');
  }

  // Update in Vapi
  const vapi = getVapiClient();
  const updatePayload: any = {};

  if (params.name) updatePayload.name = params.name;
  if (params.firstMessage) updatePayload.firstMessage = params.firstMessage;

  if (params.model || params.systemPrompt || params.knowledgeBaseId !== undefined) {
    const currentModel = existingAssistant.model_config as any;
    updatePayload.model = {
      provider: params.model?.provider || currentModel.provider,
      model: params.model?.model || currentModel.model,
      temperature: params.model?.temperature ?? currentModel.temperature,
      messages: [
        {
          role: 'system',
          content: params.systemPrompt || existingAssistant.system_prompt,
        },
      ],
    };

    if (params.knowledgeBaseId) {
      updatePayload.model.knowledgeBase = {
        provider: 'canonical',
        id: params.knowledgeBaseId,
      };
    }
  }

  if (params.voice) {
    const currentVoice = existingAssistant.voice_config as any;
    updatePayload.voice = {
      provider: params.voice.provider || currentVoice.provider,
      voiceId: params.voice.voiceId || currentVoice.voiceId,
      ...(params.voice.speed !== undefined && { speed: params.voice.speed }),
      ...(params.voice.stability !== undefined && {
        stability: params.voice.stability,
      }),
    };
  }

  await vapi.assistants.update(existingAssistant.vapi_assistant_id, updatePayload);

  // Update in database
  const { data, error } = await supabase
    .from('vapi_assistants')
    .update({
      ...(params.name && { name: params.name }),
      ...(params.description !== undefined && { description: params.description }),
      ...(params.systemPrompt && { system_prompt: params.systemPrompt }),
      ...(params.firstMessage && { first_message: params.firstMessage }),
      ...(params.model && {
        model_config: {
          ...existingAssistant.model_config,
          ...params.model,
        },
      }),
      ...(params.voice && {
        voice_config: {
          ...existingAssistant.voice_config,
          ...params.voice,
        },
      }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', assistantId)
    .select()
    .single();

  if (error) {
    console.error('Error updating assistant in database:', error);
    throw new Error('Failed to update assistant');
  }

  return data;
}

/**
 * Delete an assistant
 */
export async function deleteAssistant(assistantId: string, companyId: string) {
  const supabase = createServiceRoleClient();

  // Get assistant
  const { data: assistant, error: fetchError } = await supabase
    .from('vapi_assistants')
    .select('vapi_assistant_id')
    .eq('id', assistantId)
    .eq('company_id', companyId)
    .single();

  if (fetchError || !assistant) {
    throw new Error('Assistant not found');
  }

  // Delete from Vapi
  const vapi = getVapiClient();
  try {
    await vapi.assistants.delete(assistant.vapi_assistant_id);
  } catch (error) {
    console.error('Error deleting assistant from Vapi:', error);
    // Continue with database deletion even if Vapi deletion fails
  }

  // Delete from database (will cascade to phone_numbers)
  const { error: deleteError } = await supabase
    .from('vapi_assistants')
    .delete()
    .eq('id', assistantId);

  if (deleteError) {
    console.error('Error deleting assistant from database:', deleteError);
    throw new Error('Failed to delete assistant');
  }

  return { success: true };
}

/**
 * Get assistant statistics (call count, etc.)
 */
export async function getAssistantStats(assistantId: string, companyId: string) {
  const supabase = await createClient();

  // Get assistant
  const { data: assistant } = await supabase
    .from('vapi_assistants')
    .select('vapi_assistant_id')
    .eq('id', assistantId)
    .eq('company_id', companyId)
    .single();

  if (!assistant) {
    throw new Error('Assistant not found');
  }

  // Get call statistics
  const { count: totalCalls } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('vapi_assistant_id', assistant.vapi_assistant_id)
    .eq('company_id', companyId);

  const { count: completedCalls } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('vapi_assistant_id', assistant.vapi_assistant_id)
    .eq('company_id', companyId)
    .eq('resolution_status', 'resolved');

  // Get average call duration
  const { data: durationData } = await supabase
    .from('calls')
    .select('duration')
    .eq('vapi_assistant_id', assistant.vapi_assistant_id)
    .eq('company_id', companyId);

  const avgDuration =
    durationData && durationData.length > 0
      ? durationData.reduce((sum, call) => sum + call.duration, 0) / durationData.length
      : 0;

  return {
    totalCalls: totalCalls || 0,
    completedCalls: completedCalls || 0,
    avgDuration: Math.round(avgDuration),
    resolutionRate:
      totalCalls && totalCalls > 0
        ? Math.round((completedCalls! / totalCalls) * 100)
        : 0,
  };
}
