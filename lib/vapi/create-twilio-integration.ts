import axios from "axios"

/**
 * Creates a Vapi Twilio integration and returns the webhook URL for user-managed Twilio numbers.
 * @param {string} vapiApiKey - Your Vapi API key
 * @param {string} [name] - Optional integration name
 * @returns {Promise<string>} - The incomingWebhookUrl to give to the user
 */
export async function createVapiTwilioIntegration(vapiApiKey: string, name = "UserProvidedTwilio") {
  const response = await axios.post(
    "https://api.vapi.ai/integration",
    {
      type: "twilio",
      name,
    },
    {
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  )
  return response.data.incomingWebhookUrl
}
