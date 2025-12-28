
import { getTwilioClient, resolveWebhookConfig, WebhookConfig, TwilioProvisioningResult } from "./client"

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
