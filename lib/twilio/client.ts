import twilio, { Twilio } from "twilio"
import type { IncomingPhoneNumberInstance } from "twilio/lib/rest/api/v2010/account/incomingPhoneNumber"

let cachedClient: Twilio | null = null

function getTwilioClient(): Twilio {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN

  if (!accountSid || !authToken) {
    throw new Error("Missing Twilio credentials. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.")
  }

  if (cachedClient) {
    return cachedClient
  }

  cachedClient = twilio(accountSid, authToken)
  return cachedClient
}

const REGION_TO_COUNTRY_MAP: Record<string, string> = {
  us: "US",
  canada: "CA",
  uk: "GB",
  eu: "DE",
  apac: "AU",
  latam: "BR",
}

const DEFAULT_TWILIO_COUNTRY = "US"

function enforceHttps(url?: string | null) {
  if (!url) return undefined
  return url.startsWith("http://") ? url.replace("http://", "https://") : url
}

const DEFAULT_BASE_WEBHOOK_URL = (() => {
  const url = enforceHttps(process.env.TWILIO_WEBHOOK_BASE_URL) ||
    enforceHttps(process.env.APP_BASE_URL) ||
    enforceHttps(process.env.NEXT_PUBLIC_APP_URL) ||
    "https://corecomm.vercel.app"
  
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    return "https://corecomm.vercel.app"
  }
  return url
})()

const defaultVoiceWebhook = buildWebhookUrl(process.env.TWILIO_VOICE_WEBHOOK_URL, "/api/webhooks/twilio/voice")
const defaultSmsWebhook = buildWebhookUrl(process.env.TWILIO_SMS_WEBHOOK_URL, "/api/webhooks/twilio/sms")

function buildWebhookUrl(explicitUrl: string | undefined, fallbackPath: string) {
  const sanitizedExplicit = enforceHttps(explicitUrl)
  if (sanitizedExplicit) {
    return sanitizedExplicit
  }
  if (!DEFAULT_BASE_WEBHOOK_URL) {
    return undefined
  }
  return `${DEFAULT_BASE_WEBHOOK_URL.replace(/\/$/, "")}${fallbackPath}`
}

export type TwilioProvisioningResult = {
  sid: string
  phoneNumber: string
  friendlyName?: string | null
  capabilities?: IncomingPhoneNumberInstance["capabilities"]
  action: "purchased" | "forward-configured"
}

export function normalizePhoneNumber(value?: string | null): string | null {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith("+")) {
    return `+${trimmed.replace(/[^\d]/g, "")}`
  }

  const digitsOnly = trimmed.replace(/\D/g, "")
  if (!digitsOnly) {
    return null
  }

  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
    return `+${digitsOnly}`
  }

  return `+${digitsOnly}`
}

interface WebhookConfig {
  voiceWebhookUrl?: string
  smsWebhookUrl?: string
}

function resolveWebhookConfig(config?: WebhookConfig) {
  return {
    voiceWebhookUrl: config?.voiceWebhookUrl ?? defaultVoiceWebhook,
    smsWebhookUrl: config?.smsWebhookUrl ?? defaultSmsWebhook,
  }
}

export async function purchaseTwilioPhoneNumber(options: {
  companyName: string
  regionPreference?: string
  webhookConfig?: WebhookConfig
}): Promise<TwilioProvisioningResult> {
  const client = getTwilioClient()
  const countryCode = REGION_TO_COUNTRY_MAP[options.regionPreference ?? ""] ?? DEFAULT_TWILIO_COUNTRY
  const webhookConfig = resolveWebhookConfig(options.webhookConfig)

  const [candidate] = await client.availablePhoneNumbers(countryCode).local.list({
    smsEnabled: true,
    voiceEnabled: true,
    limit: 1,
  })

  if (!candidate) {
    throw new Error(`No Twilio numbers available in region: ${countryCode}`)
  }

  const friendlyName = `${options.companyName} Main Line`.substring(0, 64)

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: candidate.phoneNumber,
    friendlyName,
    voiceUrl: webhookConfig.voiceWebhookUrl,
    smsUrl: webhookConfig.smsWebhookUrl,
  })

  return {
    sid: purchased.sid,
    phoneNumber: purchased.phoneNumber,
    friendlyName: purchased.friendlyName,
    capabilities: purchased.capabilities,
    action: "purchased",
  }
}

export async function purchaseTwilioPhoneNumberByAreaCode(options: {
  areaCode: string
  companyName?: string
  webhookConfig?: WebhookConfig
}): Promise<TwilioProvisioningResult> {
  const client = getTwilioClient()
  const webhookConfig = resolveWebhookConfig(options.webhookConfig)

  // Search for available numbers with the specific area code
  const [candidate] = await client.availablePhoneNumbers('US').local.list({
    areaCode: parseInt(options.areaCode),
    smsEnabled: true,
    voiceEnabled: true,
    limit: 1,
  })

  if (!candidate) {
    throw new Error(`No Twilio numbers available with area code: ${options.areaCode}`)
  }

  const friendlyName = options.companyName 
    ? `${options.companyName} Line`.substring(0, 64)
    : `CoreComm Line ${options.areaCode}`

  const purchased = await client.incomingPhoneNumbers.create({
    phoneNumber: candidate.phoneNumber,
    friendlyName,
    voiceUrl: webhookConfig.voiceWebhookUrl,
    smsUrl: webhookConfig.smsWebhookUrl,
  })

  return {
    sid: purchased.sid,
    phoneNumber: purchased.phoneNumber,
    friendlyName: purchased.friendlyName,
    capabilities: purchased.capabilities,
    action: "purchased",
  }
}

export async function configureForwardingNumber(options: {
  phoneNumber: string
  companyName: string
  webhookConfig?: WebhookConfig
}): Promise<TwilioProvisioningResult> {
  const client = getTwilioClient()
  const normalized = normalizePhoneNumber(options.phoneNumber)
  if (!normalized) {
    throw new Error("Invalid phone number provided for forwarding")
  }
  const webhookConfig = resolveWebhookConfig(options.webhookConfig)

  const [existing] = await client.incomingPhoneNumbers.list({ phoneNumber: normalized, limit: 1 })

  if (!existing) {
    throw new Error(`Twilio account does not own ${normalized}`)
  }

  const updated = await client
    .incomingPhoneNumbers(existing.sid)
    .update({
      friendlyName: existing.friendlyName ?? `${options.companyName} Forward`,
      voiceUrl: webhookConfig.voiceWebhookUrl,
      smsUrl: webhookConfig.smsWebhookUrl,
    })

  return {
    sid: updated.sid,
    phoneNumber: updated.phoneNumber,
    friendlyName: updated.friendlyName,
    capabilities: updated.capabilities,
    action: "forward-configured",
  }
}

export async function releaseTwilioPhoneNumber(sid?: string) {
  if (!sid) {
    return
  }

  const client = getTwilioClient()
  await client.incomingPhoneNumbers(sid).remove()
}
