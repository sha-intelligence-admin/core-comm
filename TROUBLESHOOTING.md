# Troubleshooting Guide

This guide addresses common issues developers may encounter when working with CoreComm.

## 1. Setup & Installation Issues

### `npm install` fails
- **Cause**: Node.js version mismatch or network issues.
- **Solution**:
  - Ensure you are using Node.js v18+. Run `node -v`.
  - Clear cache: `npm cache clean --force`.
  - Delete `node_modules` and `package-lock.json`, then retry.

### Database Connection Errors
- **Error**: `P0001: Can't connect to database` or similar Supabase errors.
- **Solution**:
  - Check `.env.local` for correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Ensure your IP is allowed in Supabase Project Settings > Network.
  - If using Docker locally, ensure the container is running.

## 2. Development Issues

### Hot Reload Not Working
- **Cause**: Windows file system limits or WSL issues.
- **Solution**:
  - Restart the dev server.
  - On Windows/WSL, ensure project is on the Linux filesystem, not `/mnt/c/`.

### TypeScript Errors
- **Error**: `Property 'x' does not exist on type 'y'`.
- **Solution**:
  - Run `npm run type-check` to see full error list.
  - Ensure you have generated Supabase types if schema changed:
    ```bash
    supabase gen types typescript --project-id "your-project-id" > lib/supabase/types.ts
    ```

## 3. Authentication Issues

### Login Loop / Session Not Persisting
- **Cause**: Cookie configuration or browser privacy settings.
- **Solution**:
  - Check `lib/supabase/client.ts` configuration.
  - Ensure `NEXT_PUBLIC_SUPABASE_URL` matches the project you are authenticating against.
  - Clear browser cookies and local storage.

### 2FA Issues
- **Error**: "Invalid code" when entering TOTP.
- **Solution**:
  - Ensure system time is synced.
  - Check if `auth.mfa_factors` table has entries for the user.

## 4. Vapi Integration Issues

### Webhook Verification Failed
- **Error**: 401 Unauthorized on `/api/webhooks/vapi`.
- **Solution**:
  - Verify `VAPI_WEBHOOK_SECRET` in `.env.local` matches the secret in Vapi Dashboard.
  - Ensure the webhook URL is publicly accessible (use ngrok for local dev).

### Call Not Logging
- **Cause**: Webhook not firing or database insert failing.
- **Solution**:
  - Check Vapi Dashboard > Logs for webhook delivery status.
  - Check Supabase `call_logs` table permissions (RLS).

## 5. Deployment Issues

### Build Fails on Vercel
- **Cause**: Type errors or missing env vars.
- **Solution**:
  - Run `npm run build` locally to reproduce.
  - Check Vercel Project Settings > Environment Variables.

### 500 Internal Server Error in Production
- **Solution**:
  - Check Vercel/Server logs.
  - Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in production environment.

## Debugging Tools

### Enable Debug Logging
Set `NEXT_PUBLIC_DEBUG=true` in `.env.local` to enable verbose logging in browser console (if implemented).

### Database Query Inspection
Use Supabase Dashboard > SQL Editor to run manual queries and inspect data state.

### Network Inspector
Use Chrome DevTools > Network tab to inspect API request/response payloads.
