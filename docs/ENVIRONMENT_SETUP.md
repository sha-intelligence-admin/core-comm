# Environment Setup Guide

This guide details the environment variables and configuration files required to run CoreComm locally and in production.

## Environment Variables

Create a `.env.local` file in the root directory for local development.

### Required Variables

#### Supabase (Database & Auth)
These variables connect your application to your Supabase project.
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (e.g., `https://xyz.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public anonymous key for client-side requests.
- `SUPABASE_SERVICE_ROLE_KEY`: The secret service role key for server-side admin tasks (bypasses RLS). **Keep this secret!**

#### Vapi (Voice AI)
Required for voice agent functionality.
- `VAPI_API_KEY`: Your private API key from the Vapi dashboard.
- `VAPI_WEBHOOK_SECRET`: Secret used to verify incoming webhooks from Vapi.

### Optional / Feature-Specific Variables

#### Twilio (Telephony)
Required if you are managing phone numbers or SMS via Twilio directly.
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID.
- `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token.

#### Redis (Caching & Rate Limiting)
Required for rate limiting and caching.
- `REDIS_URL`: Connection string for your Redis instance (e.g., `redis://localhost:6379`).

#### General
- `NODE_ENV`: Set to `development` locally and `production` when deployed.

## Configuration Files

### `next.config.mjs`
Configures the Next.js framework.
- **Public Runtime Config**: Variables exposed to the browser.
- **Rewrites/Redirects**: API routing rules.

### `tailwind.config.js`
Configures the styling framework.
- **Theme**: Custom colors, fonts, and breakpoints.
- **Plugins**: `tailwindcss-animate` and others.

### `tsconfig.json`
TypeScript compiler options.
- **Paths**: Path aliases (e.g., `@/*` maps to `./*`).
- **Strict Mode**: Enabled for better type safety.

### `jest.config.js`
Testing configuration.
- **Test Environment**: `jsdom` for component tests.
- **Setup Files**: `jest.setup.js`.

## Setup Instructions

1. **Copy the example file** (if available) or create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in the values**:
   - Get Supabase keys from your Supabase Project Settings > API.
   - Get Vapi keys from Vapi Dashboard.

3. **Verify setup**:
   Run the development server and check the console for any missing variable errors.
