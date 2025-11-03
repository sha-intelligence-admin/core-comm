# Vapi Webhook Configuration Guide

This guide explains how to properly configure webhooks in your Vapi dashboard to work with your CoreComm application.

## 🎯 Overview

Your CoreComm application has a fully implemented webhook endpoint that handles all Vapi events. You just need to configure Vapi to send events to your server.

**Your Webhook Endpoint:** `https://your-domain.com/api/webhooks/vapi`

---

## 📋 Supported Events

Your webhook endpoint handles these Vapi events:

1. **`assistant-request`** - When a call starts, returns assistant configuration
2. **`status-update`** - Real-time call status changes (ringing, in-progress, ended)
3. **`end-of-call-report`** - Final call report with transcript, summary, recording
4. **`function-call`** - When assistant invokes custom functions

---

## 🔧 Configuration Methods

Vapi allows you to set server URLs at three levels (in order of precedence):

### Method 1: Account Level (Recommended for Testing)

**Best for:** Initial setup, testing, or if all assistants use the same webhook

**Steps:**
1. Log in to [Vapi Dashboard](https://dashboard.vapi.ai/)
2. Go to **Settings** → **Account Settings**
3. Find **Server URL** section
4. Enter: `https://your-domain.com/api/webhooks/vapi`
5. Click **Save**

**Pros:**
- One-time setup applies to all assistants
- Easy to test and debug

**Cons:**
- Less granular control per assistant

---

### Method 2: Assistant Level (Recommended for Production)

**Best for:** Production environments with multiple assistants needing different configurations

**Steps:**
1. Go to **Vapi Dashboard** → **Assistants**
2. Select the assistant you want to configure
3. Click the **Advanced** tab
4. Scroll to **Messaging** section
5. Find **Server URL** field
6. Enter: `https://your-domain.com/api/webhooks/vapi`
7. Click **Save Changes**

**Pros:**
- Granular control per assistant
- Different webhooks for different use cases

**Cons:**
- Must configure each assistant individually

---

### Method 3: Via API (Programmatic)

When creating or updating assistants via the Vapi API:

```typescript
// Example from your lib/vapi/assistants.ts
const vapiAssistant = await vapi.assistants.create({
  name: "Customer Support Bot",
  serverUrl: "https://your-domain.com/api/webhooks/vapi",
  model: { /* ... */ },
  voice: { /* ... */ },
  // ... other config
})
```

---

## 🔒 Security Configuration

### Step 1: Set Webhook Secret (Recommended)

1. In Vapi Dashboard → **Settings** → **API Keys**
2. Generate a **Webhook Secret**
3. Copy the secret
4. Add to your `.env.local`:
   ```bash
   VAPI_WEBHOOK_SECRET=your_webhook_secret_here
   ```

### Step 2: Enable Signature Verification

Your webhook endpoint already has signature verification code prepared:

**File:** `app/api/webhooks/vapi/route.ts:19-28`

Currently commented out. To enable:
1. Uncomment the signature verification logic
2. Implement the `verifyWebhookSignature` function
3. Restart your application

**Example Implementation:**

```typescript
async function verifyWebhookSignature(
  request: NextRequest,
  signature: string,
  secret: string
): Promise<boolean> {
  const payload = await request.text()
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return signature === digest
}
```

---

## 🧪 Testing Webhooks Locally

### Option 1: Using ngrok (Recommended)

```bash
# 1. Start your development server
npm run dev

# 2. In a new terminal, create ngrok tunnel
ngrok http 3000

# 3. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
# 4. In Vapi Dashboard, set Server URL to:
https://abc123.ngrok.io/api/webhooks/vapi
```

### Option 2: Using Vapi CLI

```bash
# 1. Install Vapi CLI
npm install -g @vapi-ai/cli

# 2. Start your dev server on port 3000
npm run dev

# 3. Forward webhooks to your local server
vapi listen --forward-to http://localhost:3000/api/webhooks/vapi

# Note: You still need ngrok for a public URL
```

---

## 📊 Webhook Event Flow

### 1. Incoming Call Flow

```
Call Received
    ↓
[assistant-request] → Your webhook returns assistant config
    ↓
[status-update: ringing] → Call record created in database
    ↓
[status-update: in-progress] → Call status updated
    ↓
[end-of-call-report] → Transcript, summary, recording saved
```

### 2. What Your Webhook Does

**For `assistant-request`:**
- Looks up phone number in `vapi_phone_numbers` table
- Retrieves associated assistant configuration
- Returns model, voice, and prompt settings to Vapi

**For `status-update`:**
- Creates or updates call record in `calls` table
- Links call to company and assistant

**For `end-of-call-report`:**
- Saves full transcript
- Stores call summary
- Records recording URL
- Analyzes sentiment
- Calculates duration and costs

**For `function-call`:**
- Executes custom business logic
- Returns function results to Vapi

---

## ✅ Verification Checklist

After configuring your webhook, verify it works:

### 1. Check Webhook is Reachable

```bash
# Test your webhook endpoint is publicly accessible
curl -X POST https://your-domain.com/api/webhooks/vapi \
  -H "Content-Type: application/json" \
  -d '{"message":{"type":"test"}}'

# Should return: {"success":true,"data":{"received":true}}
```

### 2. Test with Vapi

1. Make a test call to your Vapi number
2. Check your server logs for webhook events:
   ```
   [Vapi Webhook] Received event: assistant-request
   [Vapi Webhook] Received event: status-update
   [Vapi Webhook] Received event: end-of-call-report
   ```

3. Verify call appears in your database:
   ```sql
   SELECT * FROM calls ORDER BY created_at DESC LIMIT 1;
   ```

### 3. Check Vapi Dashboard

1. Go to **Vapi Dashboard** → **Logs**
2. Look for webhook delivery status
3. Green checkmarks = successful deliveries
4. Red X = failed deliveries (check error messages)

---

## 🐛 Troubleshooting

### Webhook Not Receiving Events

**Check:**
- ✅ Server URL is set in Vapi dashboard
- ✅ URL is publicly accessible (use `curl` to test)
- ✅ URL ends with `/api/webhooks/vapi` (no trailing slash)
- ✅ Using HTTPS in production (HTTP ok for localhost with ngrok)
- ✅ No firewall blocking Vapi's IP addresses

### 404 Not Found

**Issue:** Wrong URL path configured

**Fix:**
- Correct path: `https://your-domain.com/api/webhooks/vapi`
- ❌ Wrong: `https://your-domain.com/api/vapi/webhook` (this was deleted)

### 401 Unauthorized

**Issue:** Signature verification enabled but secret doesn't match

**Fix:**
- Verify `VAPI_WEBHOOK_SECRET` in `.env.local` matches Vapi dashboard
- Or temporarily disable signature verification for testing

### 500 Internal Server Error

**Check server logs for errors:**
```bash
# View Next.js logs
npm run dev

# Look for errors in the webhook handler
```

**Common issues:**
- Database connection error (check Supabase credentials)
- Missing environment variables
- Invalid webhook payload structure

### Database Errors

**Issue:** `company_id` not found or RLS policies blocking

**Fix:**
1. Ensure user completed onboarding (creates company)
2. Run the migration:
   ```bash
   supabase db push
   ```
3. Verify phone numbers are linked to companies in `vapi_phone_numbers` table

---

## 📝 Environment Variables Required

Add these to your `.env.local`:

```bash
# Vapi Configuration
VAPI_API_KEY=your_vapi_api_key_here
VAPI_WEBHOOK_SECRET=your_webhook_secret_here  # Optional but recommended

# Supabase (required for webhook to save data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required!
```

---

## 🚀 Production Deployment

### Before Going Live:

1. **Enable HTTPS**
   - Vapi requires HTTPS for production webhooks
   - Use a reverse proxy (Cloudflare, nginx) or deploy to Vercel/Netlify

2. **Set Production Server URL**
   - Update Vapi dashboard with production URL
   - Format: `https://your-production-domain.com/api/webhooks/vapi`

3. **Enable Signature Verification**
   - Uncomment verification code in `app/api/webhooks/vapi/route.ts`
   - Set `VAPI_WEBHOOK_SECRET` in production environment

4. **Set Up Monitoring**
   - Monitor webhook delivery success rate in Vapi dashboard
   - Set up error alerts for failed webhook calls
   - Use Sentry or similar for error tracking

5. **Test End-to-End**
   - Make test calls
   - Verify calls appear in dashboard
   - Check transcripts are saved correctly
   - Validate company association is working

---

## 📚 Additional Resources

- [Vapi Server URLs Documentation](https://docs.vapi.ai/server-url)
- [Vapi Webhook Events](https://docs.vapi.ai/server-url/events)
- [Local Webhook Testing](https://docs.vapi.ai/cli/webhook)
- [Server Authentication](https://docs.vapi.ai/server-url/server-authentication)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Vapi Dashboard → **Logs** for webhook delivery errors
2. Check your server logs for processing errors
3. Test webhook endpoint with `curl` manually
4. Join Vapi Discord/Community for support
5. Review `app/api/webhooks/vapi/route.ts` implementation

---

## ✨ What's Implemented

Your webhook endpoint is **fully functional** and handles:

- ✅ Assistant configuration requests
- ✅ Real-time call status updates
- ✅ End-of-call report processing
- ✅ Transcript and summary storage
- ✅ Recording URL capture
- ✅ Company and assistant association
- ✅ Sentiment analysis
- ✅ Cost tracking
- ✅ Custom function calls (extensible)

All you need to do is **configure the URL in Vapi dashboard** and you're ready to go! 🎉
