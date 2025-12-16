import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import {
  configureForwardingNumber,
  normalizePhoneNumber,
  purchaseTwilioPhoneNumber,
  releaseTwilioPhoneNumber,
  type TwilioProvisioningResult,
} from "@/lib/twilio/client"
import { createAssistant, deleteAssistant } from "@/lib/vapi/assistants"
import { createPhoneNumber as createVapiPhoneNumber } from "@/lib/vapi/phone-numbers"
import { createVapiTwilioIntegration } from "@/lib/vapi/create-twilio-integration"
import { VAPI_DEFAULTS } from "@/lib/vapi/client"
import type { ModelProvider, VoiceProvider } from "@/lib/vapi/types"
import { nanoid } from "nanoid"

const FALLBACK_WEBHOOK_BASE_URL = "https://corecomm.vercel.app"

const enforceHttpsUrl = (url?: string | null) => {
  if (!url) return undefined
  return url.startsWith("http://") ? url.replace("http://", "https://") : url
}

const PUBLIC_WEBHOOK_BASE_URL =
  enforceHttpsUrl(process.env.TWILIO_WEBHOOK_BASE_URL) ||
  enforceHttpsUrl(process.env.APP_BASE_URL) ||
  enforceHttpsUrl(process.env.NEXT_PUBLIC_APP_URL) ||
  FALLBACK_WEBHOOK_BASE_URL

const manualVoiceWebhookUrl = `${PUBLIC_WEBHOOK_BASE_URL.replace(/\/$/, "")}/api/webhooks/twilio/voice`
const manualSmsWebhookUrl = `${PUBLIC_WEBHOOK_BASE_URL.replace(/\/$/, "")}/api/webhooks/twilio/sms`

const DEFAULT_MODEL_PROVIDER = (process.env.VAPI_DEFAULT_MODEL_PROVIDER as ModelProvider) ?? "openai"
const DEFAULT_MODEL_NAME = VAPI_DEFAULTS.model
const DEFAULT_MODEL_TEMPERATURE = 0.6
const normalizeVoiceProvider = (value?: string | null): VoiceProvider => {
  if (!value) return "11labs"
  const normalized = value.toLowerCase()
  const mapping: Record<string, VoiceProvider> = {
    "11labs": "11labs",
    "11-labs": "11labs",
    elevenlabs: "11labs",
    vapi: "vapi",
    azure: "azure",
    cartesia: "cartesia",
    "custom-voice": "custom-voice",
    customvoice: "custom-voice",
    deepgram: "deepgram",
    hume: "hume",
    lmnt: "lmnt",
    neuphonic: "neuphonic",
    openai: "openai",
    playht: "playht",
    "rime-ai": "rime-ai",
    rimeai: "rime-ai",
    "smallest-ai": "smallest-ai",
    smallestai: "smallest-ai",
    tavus: "tavus",
    sesame: "sesame",
    inworld: "inworld",
    minimax: "minimax",
    wellsaid: "wellsaid",
    orpheus: "orpheus",
  }
  return mapping[normalized] ?? "11labs"
}

const DEFAULT_VOICE_PROVIDER = normalizeVoiceProvider(
  process.env.VAPI_DEFAULT_VOICE_PROVIDER || VAPI_DEFAULTS.voiceProvider
)
const DEFAULT_VOICE_ID = VAPI_DEFAULTS.voiceId

type AssistantPromptContext = {
  companyName: string
  industry?: string
  description?: string
  businessHours?: string
  timezone?: string
  knowledgeBase?: string
  primaryGoals?: string[]
  supportVolume?: string
  successMetrics?: string
  integrationName?: string
  integrationEndpoint?: string
}

function buildAssistantSystemPrompt(context: AssistantPromptContext) {
  const lines = [
    `You are the AI voice assistant for ${context.companyName}${context.industry ? ` in the ${context.industry} industry` : ""}.`,
    context.description && `Company overview: ${context.description}`,
    context.primaryGoals?.length ? `Primary goals: ${context.primaryGoals.join(", ")}.` : null,
    context.supportVolume && `Current support volume: ${context.supportVolume}.`,
    context.successMetrics && `Success metrics: ${context.successMetrics}.`,
    context.businessHours && `Business hours preference: ${context.businessHours}.`,
    context.timezone && `Operate primarily in the ${context.timezone} timezone.`,
    context.knowledgeBase && `Knowledge base summary: ${context.knowledgeBase}. Reference it when answering questions.`,
    context.integrationName && context.integrationEndpoint
      ? `Primary integration: ${context.integrationName} reachable at ${context.integrationEndpoint}.`
      : null,
    `Collect caller details, solve their request when possible, and escalate urgent or complex issues to a human teammate.`,
    `Maintain a friendly, confident tone and keep answers concise while confirming next steps before ending the call.`,
  ].filter(Boolean)

  return lines.join("\n")
}

function buildAssistantFirstMessage(companyName: string) {
  return `Hi, thanks for calling ${companyName}! I'm the AI assistant. How can I help you today?`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const serviceSupabase = createServiceRoleClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const {
      companyName,
      description,
      companySize,
      industry,
      supportVolume,
      currentSolution,
      phoneNumber,
      businessHours,
      customHours,
      timezone,
      primaryGoals,
      expectedVolume,
      successMetrics,
      phoneNumberSource,
      regionPreference,
      integrationName,
      mcpEndpoint,
      knowledgeBase,
      assistantName,
      assistantDescription,
      assistantModel,
      assistantVoiceProvider,
      assistantVoiceId,
      assistantGreeting,
      assistantLanguage,
      assistantPersonality,
    } = body

    const userManagedTwilio = phoneNumberSource === "twilio-user-managed"

    // Validate required fields
    if (!companyName || !companySize || !industry) {
      return NextResponse.json(
        { error: "Missing required fields: companyName, companySize, and industry are required" },
        { status: 400 }
      )
    }

    // Check if user already has a company
    // Use service role client to bypass RLS and avoid circular reference
    const { data: existingUser, error: userCheckError } = await serviceSupabase
      .from("users")
      .select("company_id")
      .eq("id", user.id)
      .maybeSingle()

    // If user doesn't exist in users table, we'll create their profile in the next step
    // Only return error if it's not a "not found" error
    if (userCheckError && userCheckError.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to verify user status: " + userCheckError.message }, { status: 500 })
    }

    if (existingUser?.company_id) {
      return NextResponse.json({ error: "User already has a company" }, { status: 400 })
    }

    // Generate a unique member key for the company
    const memberKey = nanoid(16)

    // Prepare business hours
    let businessHoursJson: Record<string, unknown> | null = null
    if (businessHours === "custom" && customHours) {
      try {
        businessHoursJson = typeof customHours === "string" ? JSON.parse(customHours) : customHours
      } catch (e) {
        businessHoursJson = { type: "custom", hours: customHours }
      }
    } else if (businessHours) {
      businessHoursJson = { type: businessHours }
    }

    const normalizedIncomingNumber = normalizePhoneNumber(phoneNumber)
    const phoneNumbers: string[] = normalizedIncomingNumber ? [normalizedIncomingNumber] : []
    let twilioProvisioning: TwilioProvisioningResult | null = null
    let purchasedNumberSidToRelease: string | null = null
    const insertedPhoneNumbers: string[] = []

    if (phoneNumberSource === "forward-existing" && !normalizedIncomingNumber) {
      return NextResponse.json(
        { error: "A valid phone number is required when forwarding an existing line." },
        { status: 400 }
      )
    }

    if (phoneNumberSource === "twilio-new" && !regionPreference) {
      return NextResponse.json(
        { error: "Please select a region when purchasing a new Twilio number." },
        { status: 400 }
      )
    }

    if (userManagedTwilio && !normalizedIncomingNumber) {
      return NextResponse.json(
        { error: "Please provide the Twilio number you'll configure manually." },
        { status: 400 }
      )
    }

    if (phoneNumberSource === "twilio-new" || phoneNumberSource === "forward-existing") {
      try {
        if (phoneNumberSource === "twilio-new") {
          twilioProvisioning = await purchaseTwilioPhoneNumber({
            companyName,
            regionPreference,
          })
          purchasedNumberSidToRelease = twilioProvisioning.sid
          phoneNumbers.push(twilioProvisioning.phoneNumber)
        } else if (normalizedIncomingNumber) {
          twilioProvisioning = await configureForwardingNumber({
            phoneNumber: normalizedIncomingNumber,
            companyName,
          })
        }
      } catch (twilioError) {
        const message = twilioError instanceof Error ? twilioError.message : "Unknown Twilio error"
        return NextResponse.json({ error: `Twilio provisioning failed: ${message}` }, { status: 502 })
      }
    }

    const uniquePhoneNumbers = Array.from(new Set(phoneNumbers))

    // Create company with only guaranteed columns
    // Note: Some columns like current_solution and current_volume may not exist
    // depending on which migration was run
    const { data: company, error: companyError } = await serviceSupabase
      .from("company")
      .insert({
        name: companyName,
        company_size: companySize,
        industry: industry,
        member_key: memberKey,
        timezone: timezone || "UTC",
        ...(description && { description }),
        ...(uniquePhoneNumbers.length > 0 && { phone_numbers: uniquePhoneNumbers }),
        ...(businessHoursJson && { business_hours: businessHoursJson }),
        ...(primaryGoals && primaryGoals.length > 0 && { primary_goals: primaryGoals }),
        ...(expectedVolume && { expected_volume: parseInt(expectedVolume, 10) }),
        ...(successMetrics && { success_metrics: successMetrics }),
        ...(supportVolume && { current_volume: supportVolume }),
        ...(currentSolution && { current_solution: currentSolution }),
      })
      .select()
      .single()

    if (companyError) {
      if (purchasedNumberSidToRelease) {
        await releaseTwilioPhoneNumber(purchasedNumberSidToRelease)
      }
      return NextResponse.json({ error: "Failed to create company: " + companyError.message }, { status: 500 })
    }

    // Update or create user with company_id
    // Use upsert to handle cases where user profile doesn't exist yet
    const { error: updateError } = await serviceSupabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          company_id: company.id,
          full_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
          role: "admin", // First user in company is admin
          is_active: true,
        },
        {
          onConflict: "id",
        }
      )
      .eq("id", user.id)

    if (updateError) {
      // Try to rollback company creation
      await serviceSupabase.from("company").delete().eq("id", company.id)
      if (purchasedNumberSidToRelease) {
        await releaseTwilioPhoneNumber(purchasedNumberSidToRelease)
      }
      return NextResponse.json({ error: "Failed to link user to company: " + updateError.message }, { status: 500 })
    }

    // Initialize Billing (Wallet & Subscription)
    const { error: billingError } = await serviceSupabase.from("wallets").insert({
      company_id: company.id,
      balance: 0,
      currency: 'usd'
    })

    if (billingError) {
      console.error("Failed to initialize wallet:", billingError)
    } else {
      // Create default trial subscription
      await serviceSupabase.from("billing_subscriptions").insert({
        company_id: company.id,
        plan_id: 'starter',
        status: 'trialing',
        current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Add user to team_members table
    const { error: teamMemberError } = await serviceSupabase
      .from("team_members")
      .insert({
        company_id: company.id,
        user_id: user.id,
        created_by: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
        email: user.email!,
        role: "admin",
        status: "active",
        can_access_analytics: true,
        can_manage_integrations: true,
        can_manage_team: true,
        can_manage_agents: true,
        can_view_calls: true,
        can_view_messages: true,
        can_view_emails: true,
      })

    if (teamMemberError) {
      console.error('Failed to add user to team_members:', teamMemberError)
      // Don't fail onboarding if team member creation fails, just log it
    }

    const phoneNumberRows: Array<Record<string, any>> = []

    if (twilioProvisioning) {
      phoneNumberRows.push({
        phone_number: twilioProvisioning.phoneNumber,
        provider: "twilio",
        status: "active",
        friendly_name: twilioProvisioning.friendlyName ?? `${companyName} Main Line`,
        capabilities: {
          voice: twilioProvisioning.capabilities?.voice ?? true,
          sms: twilioProvisioning.capabilities?.sms ?? true,
          mms: twilioProvisioning.capabilities?.mms ?? false,
        },
        config: {
          action: twilioProvisioning.action,
          source: phoneNumberSource ?? null,
          region_preference: regionPreference ?? null,
          twilio_sid: twilioProvisioning.sid,
        },
        company_id: company.id,
        created_by: user.id,
      })
    }

    if (userManagedTwilio && normalizedIncomingNumber) {
      // Create a Vapi Twilio integration and get the webhook URL
      let vapiWebhookUrl: string | null = null
      let vapiError: string | null = null
      try {
        const vapiApiKey = process.env.VAPI_API_KEY
        if (!vapiApiKey) throw new Error("VAPI_API_KEY is not configured.")
        vapiWebhookUrl = await createVapiTwilioIntegration(vapiApiKey, `${companyName} User Managed Twilio`)
      } catch (err) {
        vapiError = err instanceof Error ? err.message : String(err)
      }
      const instructions = vapiWebhookUrl
        ? `Log into your Twilio project and set Voice URL to ${vapiWebhookUrl} (POST). This will connect your number to CoreComm via Vapi.`
        : `Log into your Twilio project and set Voice URL to [Vapi Webhook URL] (POST). (Failed to auto-generate: ${vapiError ?? 'unknown error'})`;
      phoneNumberRows.push({
        phone_number: normalizedIncomingNumber,
        provider: "twilio",
        status: "pending",
        friendly_name: `${companyName} User Managed Line`,
        capabilities: { voice: true, sms: true, mms: false },
        config: {
          action: "user-managed",
          source: phoneNumberSource ?? null,
          manual_setup_required: true,
          vapi_webhook_url: vapiWebhookUrl,
          instructions,
        },
        company_id: company.id,
        created_by: user.id,
      })
    }

    if (phoneNumberRows.length > 0) {
      const { error: phoneNumberError } = await serviceSupabase
        .from("phone_numbers")
        .insert(phoneNumberRows)

      if (phoneNumberError) {
        await serviceSupabase.from("users").update({ company_id: null }).eq("id", user.id)
        await serviceSupabase.from("company").delete().eq("id", company.id)
        if (purchasedNumberSidToRelease) {
          await releaseTwilioPhoneNumber(purchasedNumberSidToRelease)
        }
        return NextResponse.json({ error: "Failed to store phone number metadata: " + phoneNumberError.message }, { status: 500 })
      }

      insertedPhoneNumbers.push(...phoneNumberRows.map((row) => row.phone_number as string))
    }

    const assistantSystemPrompt = buildAssistantSystemPrompt({
      companyName,
      industry,
      description,
      businessHours,
      timezone,
      knowledgeBase,
      primaryGoals,
      supportVolume,
      successMetrics,
      integrationName,
      integrationEndpoint: mcpEndpoint,
    })
    
    // Use custom personality if provided, otherwise use generated prompt
    const finalSystemPrompt = assistantPersonality?.trim() 
      ? assistantPersonality 
      : assistantSystemPrompt
    
    const assistantFirstMessage = assistantGreeting?.trim() 
      ? assistantGreeting 
      : buildAssistantFirstMessage(companyName)
    
    const finalAssistantName = assistantName?.trim() 
      ? assistantName 
      : `${companyName} Voice Concierge`.slice(0, 100)
    
    const finalAssistantDescription = assistantDescription?.trim() 
      ? assistantDescription 
      : (successMetrics || description || `${companyName} default assistant`)

    // Parse model configuration
    let modelProvider: ModelProvider = DEFAULT_MODEL_PROVIDER
    let modelName = DEFAULT_MODEL_NAME
    
    if (assistantModel) {
      if (assistantModel.startsWith('gpt-')) {
        modelProvider = 'openai'
        modelName = assistantModel
      } else if (assistantModel.startsWith('claude-')) {
        modelProvider = 'anthropic'
        modelName = assistantModel
      }
    }

    const voiceProvider = normalizeVoiceProvider(assistantVoiceProvider)
    const voiceId = assistantVoiceId || DEFAULT_VOICE_ID

    let assistantRecord: Awaited<ReturnType<typeof createAssistant>> | null = null
    let vapiPhoneRecord: Awaited<ReturnType<typeof createVapiPhoneNumber>> | null = null

    try {
      assistantRecord = await createAssistant(company.id, {
        name: finalAssistantName,
        description: finalAssistantDescription,
        systemPrompt: finalSystemPrompt,
        firstMessage: assistantFirstMessage,
        model: {
          provider: modelProvider,
          model: modelName,
          temperature: DEFAULT_MODEL_TEMPERATURE,
        },
        voice: {
          provider: voiceProvider,
          voiceId: voiceId,
        },
      })

      if (twilioProvisioning && assistantRecord?.id) {
        vapiPhoneRecord = await createVapiPhoneNumber(company.id, {
          provider: "twilio",
          number: twilioProvisioning.phoneNumber,
          assistantId: assistantRecord.id,
        })
      }

      // Save the assistant as a voice agent in the database
      if (assistantRecord) {
        const { error: voiceAgentError } = await serviceSupabase
          .from("voice_agents")
          .insert({
            company_id: company.id,
            created_by: user.id,
            name: assistantRecord.name,
            description: assistantRecord.description || finalAssistantDescription,
            voice_model: `${voiceProvider}-${voiceId}`,
            personality: finalSystemPrompt,
            language: assistantLanguage || 'en-US',
            status: 'active',
            greeting_message: assistantFirstMessage,
            config: {
              vapi_assistant_id: assistantRecord.vapi_assistant_id,
              model_provider: modelProvider,
              model_name: modelName,
              temperature: DEFAULT_MODEL_TEMPERATURE,
              voice_provider: voiceProvider,
              voice_id: voiceId,
            },
          })

        if (voiceAgentError) {
          console.error('Failed to create voice agent record:', voiceAgentError)
          // Don't fail onboarding if voice agent creation fails, just log it
        }
      }
    } catch (assistantError) {
      await serviceSupabase.from("users").update({ company_id: null }).eq("id", user.id)
      if (assistantRecord?.id) {
        try {
          await deleteAssistant(assistantRecord.id, company.id)
        } catch (cleanupAssistantError) {
          console.error("Failed to clean up assistant after onboarding error", cleanupAssistantError)
        }
      }
      if (insertedPhoneNumbers.length > 0) {
        await serviceSupabase.from("phone_numbers").delete().in("phone_number", insertedPhoneNumbers)
      }
      await serviceSupabase.from("company").delete().eq("id", company.id)
      if (purchasedNumberSidToRelease) {
        await releaseTwilioPhoneNumber(purchasedNumberSidToRelease)
      }
      const assistantMessage = assistantError instanceof Error ? assistantError.message : "Unknown error"
      return NextResponse.json({ error: "Failed to create default voice assistant: " + assistantMessage }, { status: 500 })
    }

    purchasedNumberSidToRelease = null

    return NextResponse.json(
      {
        success: true,
        company: {
          id: company.id,
          name: company.name,
          memberKey: company.member_key,
        },
        assistant:
          assistantRecord && {
            id: assistantRecord.id,
            name: assistantRecord.name,
            vapiAssistantId: assistantRecord.vapi_assistant_id,
          },
      },
      { status: 201 }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Internal server error: " + errorMessage }, { status: 500 })
  }
}
