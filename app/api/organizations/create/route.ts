import { NextRequest, NextResponse } from "next/server"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"
import {
  configureForwardingNumber,
  normalizePhoneNumber,
  purchaseTwilioPhoneNumber,
  releaseTwilioPhoneNumber,
  type TwilioProvisioningResult,
} from "@/lib/twilio/client"
import { createAssistant } from "@/lib/vapi/assistants"
import { createPhoneNumber as createVapiPhoneNumber } from "@/lib/vapi/phone-numbers"
import { createKnowledgeBase } from "@/lib/vapi/knowledge-bases"
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

// Ensure we don't use localhost for Twilio webhooks as it will fail validation
const FINAL_WEBHOOK_BASE_URL = (PUBLIC_WEBHOOK_BASE_URL?.includes('localhost') || PUBLIC_WEBHOOK_BASE_URL?.includes('127.0.0.1'))
  ? FALLBACK_WEBHOOK_BASE_URL
  : PUBLIC_WEBHOOK_BASE_URL

const normalizeVoiceProvider = (value?: string | null): VoiceProvider => {
  if (!value) return "11labs"
  const normalized = value.toLowerCase()
  const mapping: Record<string, VoiceProvider> = {
    "11labs": "11labs",
    elevenlabs: "11labs",
    openai: "openai",
    // Add other mappings as needed
  }
  return mapping[normalized] ?? "11labs"
}

const DEFAULT_MODEL_PROVIDER = (process.env.VAPI_DEFAULT_MODEL_PROVIDER as ModelProvider) ?? "openai"
const DEFAULT_MODEL_NAME = VAPI_DEFAULTS.model

function buildAssistantSystemPrompt(context: any) {
  const lines = [
    `You are the AI voice assistant for ${context.companyName}${context.industry ? ` in the ${context.industry} industry` : ""}.`,
    context.description && `Company overview: ${context.description}`,
    context.primaryGoals?.length ? `Primary goals: ${context.primaryGoals.join(", ")}.` : null,
    context.knowledgeBase && `Knowledge Base: ${context.knowledgeBase}`,
    context.integrationName && `Integration: ${context.integrationName} (${context.integrationEndpoint || 'No endpoint provided'})`,
    `Collect caller details, solve their request when possible, and escalate urgent or complex issues to a human teammate.`,
    `Maintain a friendly, confident tone and keep answers concise while confirming next steps before ending the call.`,
  ].filter(Boolean)
  return lines.join("\n")
}

function buildAssistantFirstMessage(companyName: string) {
  return `Hi, thanks for calling ${companyName}! I'm the AI assistant. How can I help you today?`
}

/**
 * POST /api/organizations/create
 * Creates a new organization with initial setup (assistant, phone number, etc.).
 * 
 * @param request - NextRequest object containing organization details
 * @returns JSON response with the created organization or error
 */
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

    // Validate required fields
    if (!companyName || !companySize || !industry) {
      return NextResponse.json(
        { error: "Missing required fields: companyName, companySize, and industry are required" },
        { status: 400 }
      )
    }

    // Check how many organizations user already owns
    const { data: existingMemberships } = await serviceSupabase
      .from("organization_memberships")
      .select("id")
      .eq("user_id", user.id)
      .eq("role", "owner")

    const isFirstOrganization = !existingMemberships || existingMemberships.length === 0

    // Generate member key
    const memberKey = nanoid(16)

    // Track which steps are completed
    const setupStepsCompleted: Record<string, boolean> = {
      basics: true,
      phone: !!phoneNumberSource,
      integration: true, // Optional step, always marked as complete
      assistant: !!assistantName,
      goals: !!primaryGoals && primaryGoals.length > 0,
    }

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
    let userManagedNumber: string | null = null

    // Handle phone number provisioning if requested
    if (phoneNumberSource === "twilio-new" || phoneNumberSource === "forward-existing") {
      try {
        if (phoneNumberSource === "twilio-new" && regionPreference) {
          twilioProvisioning = await purchaseTwilioPhoneNumber({
            companyName,
            regionPreference,
          })
          purchasedNumberSidToRelease = twilioProvisioning.sid
          phoneNumbers.push(twilioProvisioning.phoneNumber)
        } else if (phoneNumberSource === "forward-existing" && normalizedIncomingNumber) {
          twilioProvisioning = await configureForwardingNumber({
            phoneNumber: normalizedIncomingNumber,
            companyName,
          })
        }
      } catch (twilioError) {
        const message = twilioError instanceof Error ? twilioError.message : "Unknown Twilio error"
        return NextResponse.json({ error: `Twilio provisioning failed: ${message}` }, { status: 502 })
      }
    } else if (phoneNumberSource === "twilio-user-managed" && normalizedIncomingNumber) {
      // User is managing their own Twilio number - store it after organization is created
      userManagedNumber = normalizedIncomingNumber
      console.log('📞 User-managed phone number:', userManagedNumber)
    }

    const uniquePhoneNumbers = Array.from(new Set(phoneNumbers))

    // Create company
    const { data: company, error: companyError } = await serviceSupabase
      .from("company")
      .insert({
        name: companyName,
        company_size: companySize,
        industry: industry,
        member_key: memberKey,
        timezone: timezone || "UTC",
        created_by: user.id,
        onboarding_completed: Object.values(setupStepsCompleted).every(Boolean),
        setup_steps_completed: setupStepsCompleted,
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
      return NextResponse.json({ error: "Failed to create organization: " + companyError.message }, { status: 500 })
    }

    // Create organization membership
    const { error: membershipError } = await serviceSupabase
      .from("organization_memberships")
      .insert({
        user_id: user.id,
        company_id: company.id,
        role: "owner",
        status: "active",
        is_default: isFirstOrganization, // Set as default if it's user's first org
        joined_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      })

    if (membershipError) {
      // Rollback company creation
      await serviceSupabase.from("company").delete().eq("id", company.id)
      if (purchasedNumberSidToRelease) {
        await releaseTwilioPhoneNumber(purchasedNumberSidToRelease)
      }
      return NextResponse.json({ error: "Failed to create membership: " + membershipError.message }, { status: 500 })
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
        current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days trial
      })
    }

    // Update user's company_id for backward compatibility
    await serviceSupabase
      .from("users")
      .upsert(
        {
          id: user.id,
          email: user.email!,
          company_id: company.id,
          full_name: user.user_metadata?.full_name || null,
          phone: user.user_metadata?.phone || null,
          role: 'admin',
          is_active: true,
        },
        { onConflict: "id" }
      )

    // Add user to team_members table
    await serviceSupabase
      .from("team_members")
      .insert({
        company_id: company.id,
        user_id: user.id,
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

    // Store phone number if provisioned
    if (twilioProvisioning) {
      console.log('💾 Saving phone number to database:', twilioProvisioning.phoneNumber)
      const { data: phoneData, error: phoneError } = await serviceSupabase
        .from("phone_numbers")
        .insert({
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
        .select()
      
      if (phoneError) {
        console.error('❌ Failed to save phone number:', phoneError)
      } else {
        console.log('✅ Phone number saved:', phoneData)
      }
    } else if (userManagedNumber) {
      console.log('💾 Saving user-managed phone number to database:', userManagedNumber)
      const { data: phoneData, error: phoneError } = await serviceSupabase
        .from("phone_numbers")
        .insert({
          phone_number: userManagedNumber,
          provider: "twilio",
          status: "active",
          friendly_name: `${companyName} Main Line`,
          capabilities: {
            voice: true,
            sms: true,
            mms: false,
          },
          config: {
            action: "user-managed",
            source: phoneNumberSource ?? null,
            region_preference: regionPreference ?? null,
            twilio_sid: null,
          },
          company_id: company.id,
          created_by: user.id,
        })
        .select()

      if (phoneError) {
        console.error('❌ Failed to save user-managed phone number:', phoneError)
      } else {
        console.log('✅ User-managed phone number saved:', phoneData)
      }
    } else {
      console.log('⚠️ No twilioProvisioning - phoneNumberSource:', phoneNumberSource, 'phoneNumber:', phoneNumber)
    }

    // Create Knowledge Base if content provided
    let knowledgeBaseId: string | undefined;
    if (knowledgeBase && knowledgeBase.trim().length > 0) {
      console.log('📚 Creating default Knowledge Base...');
      try {
        const kbFile = new File([knowledgeBase], "onboarding-info.txt", { type: "text/plain" });
        const kb = await createKnowledgeBase(company.id, {
          name: `${companyName} Knowledge Base`,
          description: "Created during onboarding",
          provider: "trieve",
          files: [kbFile]
        });
        knowledgeBaseId = kb.vapi_kb_id;
        console.log('✅ Created default Knowledge Base:', knowledgeBaseId);
      } catch (error) {
        console.error('❌ Failed to create default Knowledge Base:', error);
      }
    }

    // Create Integration if endpoint provided
    if (mcpEndpoint && mcpEndpoint.trim().length > 0) {
      console.log('🔌 Creating default Integration...');
      try {
        const { error: integrationError } = await serviceSupabase
          .from('integrations')
          .insert({
            company_id: company.id,
            type: 'webhook',
            name: integrationName || 'Default Webhook',
            description: 'Created during onboarding',
            config: {
              url: mcpEndpoint,
              events: ['function-call'],
            },
            status: 'active',
            is_active: true,
          });
        
        if (integrationError) {
          console.error('❌ Failed to create default Integration:', integrationError);
        } else {
          console.log('✅ Created default Integration');
        }
      } catch (error) {
        console.error('❌ Failed to create default Integration:', error);
      }
    }

    // Create AI assistant if configured
    if (assistantName) {
      console.log('🤖 Creating assistant:', assistantName)
      try {
        const assistantSystemPrompt = assistantPersonality?.trim() || buildAssistantSystemPrompt({
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

        const assistantFirstMessage = assistantGreeting?.trim() || buildAssistantFirstMessage(companyName)

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
        const voiceId = assistantVoiceId || VAPI_DEFAULTS.voiceId

        // Create assistant in VAPI and save to vapi_assistants table
        const assistantRecord = await createAssistant(company.id, {
          name: assistantName,
          description: assistantDescription || `${companyName} AI assistant`,
          systemPrompt: assistantSystemPrompt,
          firstMessage: assistantFirstMessage,
          language: assistantLanguage,
          model: {
            provider: modelProvider,
            model: modelName,
            temperature: 0.6,
          },
          voice: {
            provider: voiceProvider,
            voiceId: voiceId,
          },
          knowledgeBaseId: knowledgeBaseId,
        })

        console.log('✅ Assistant created in VAPI with ID:', assistantRecord?.vapi_assistant_id)

        // Link Twilio number to Vapi assistant if provisioned
        if ((twilioProvisioning || userManagedNumber) && assistantRecord?.vapi_assistant_id) {
          console.log('🔗 Linking phone number to Vapi assistant...')
          try {
            if (twilioProvisioning) {
              await createVapiPhoneNumber(company.id, {
                provider: "twilio",
                number: twilioProvisioning.phoneNumber,
                assistantId: assistantRecord.vapi_assistant_id,
                twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
                twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
              })
              console.log('✅ Phone number linked to Vapi assistant')
            } else if (userManagedNumber) {
              // For user-managed numbers without credentials, we cannot create a Vapi Phone Number object
              // The user must forward calls to the Assistant SIP URI manually
              console.log('ℹ️ User-managed number: Skipping Vapi Phone Number creation (no credentials).')
              console.log(`ℹ️ User should forward calls to SIP URI: sip:${assistantRecord.vapi_assistant_id}@sip.vapi.ai`)
            }
          } catch (linkError) {
            console.error('❌ Failed to link phone number to Vapi assistant:', linkError)
          }
        }

        // Update user-managed phone number with assigned assistant
        if (userManagedNumber && assistantRecord?.id) {
          const { error: updateError } = await serviceSupabase
            .from("phone_numbers")
            .update({ assigned_to: assistantRecord.id })
            .eq("phone_number", userManagedNumber)
            .eq("company_id", company.id)

          if (updateError) {
            console.error('❌ Failed to assign assistant to user-managed phone number:', updateError)
          } else {
            console.log('✅ Assigned assistant to user-managed phone number')
          }
        }

        // Also store assistant in voice_agents table for backward compatibility
        if (assistantRecord?.vapi_assistant_id) {
          const { data: agentData, error: agentError } = await serviceSupabase
            .from("voice_agents")
            .insert({
              company_id: company.id,
              created_by: user.id,
              name: assistantName,
              description: assistantDescription,
              voice_model: voiceId,
              language: assistantLanguage || 'en-US',
              status: 'active',
              is_active: true,
              config: {
                vapi_assistant_id: assistantRecord.vapi_assistant_id,
                model_provider: modelProvider,
                model_name: modelName,
                voice_provider: voiceProvider,
                voice_id: voiceId,
              },
            })
            .select()
          
          if (agentError) {
            console.error('❌ Failed to save voice agent:', agentError)
          } else {
            console.log('✅ Voice agent saved to database:', agentData?.[0]?.id)
          }
        }
      } catch (assistantError) {
        console.error('❌ Failed to create assistant:', assistantError)
        const errorMsg = assistantError instanceof Error ? assistantError.message : 'Unknown error'
        console.error('   Error details:', errorMsg)
        // Don't fail organization creation if assistant fails - skip and continue
      }
    } else {
      console.log('⚠️ No assistantName provided, skipping assistant creation')
    }

    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        onboarding_completed: company.onboarding_completed,
        setup_steps_completed: company.setup_steps_completed,
      },
      membership: {
        role: "owner",
        is_default: isFirstOrganization,
      },
      is_first_organization: isFirstOrganization,
    })
  } catch (error) {
    console.error("Organization creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
