# Authentication Methods Implementation Plan

## Overview
This document outlines the plan to enable and enforce the authentication methods selected in the Security Settings page. The goal is to ensure that the `allowed_auth_methods` setting dictates which login options are available to users of a specific company.

## Current State
- **Database**: `allowed_auth_methods` column exists in `security_settings` table.
- **UI**: Security page allows selecting:
    - `all`: All Methods (OTP + App + SSO)
    - `otp-app`: Email OTP + Authenticator App
    - `sso-only`: SSO Only
    - `otp-only`: Email OTP Only
- **Login Page**: Currently supports Email/Password and Google OAuth.
- **Missing**:
    - "Email OTP" (Magic Link / One-Time Code) login implementation.
    - Enforcement logic to restrict methods based on company settings.
    - Clear mapping between UI options and technical implementation.

## Definitions & Mapping

We need to align the UI options with technical providers:

| UI Option | Description | `allowed_auth_methods` DB Value | Technical Implementation |
|-----------|-------------|---------------------------------|--------------------------|
| `all` | All Methods | `['email', 'otp', 'sso']` | Password, Email OTP, Google/SSO |
| `otp-app` | Email OTP + Auth App | `['email_otp', 'totp']` | Primary: Email OTP, Secondary: TOTP (if enabled) |
| `sso-only` | SSO Only | `['sso']` | Google / SAML only |
| `otp-only` | Email OTP Only | `['email_otp']` | Primary: Email OTP (No Password) |

*Note: The current code maps `otp-only` to `['email']`. We should update this to be more specific if we want to distinguish between Password and Email OTP, or treat `email` as the category for both.*

## Implementation Steps

### Phase 1: Implement Email OTP Login
1.  **Update Login Page**: Add a "Sign in with Email Code" or "Send Magic Link" option to `app/auth/login/page.tsx`.
2.  **Backend Logic**: Use `supabase.auth.signInWithOtp({ email })`.
3.  **Verify Page**: Ensure `app/auth/verify/page.tsx` (or similar) handles the OTP verification.

### Phase 2: Enforce Authentication Policy
Since we don't know the user's company *before* they log in, we must enforce the policy *during* or *immediately after* the login process.

1.  **Middleware / Post-Login Check**:
    - Create a utility function `validateAuthMethod(user, method)`.
    - Fetch the user's company security settings.
    - Check if the used method (e.g., `google`, `password`, `email_otp`) is in `allowed_auth_methods`.
    - If not allowed:
        - Sign the user out.
        - Redirect to login with an error message: "This authentication method is not allowed for your organization."

2.  **Pre-Login Optimization (Optional)**:
    - Implement a "Enter Email First" step.
    - Lookup the company settings based on the email (requires an edge function or API that doesn't expose sensitive info).
    - Dynamically show/hide Password vs SSO vs OTP options.

### Phase 3: Update Security Settings Logic
1.  **Refine Mapping**: Update `handleAuthMethodChange` in `app/(dashboard)/security/page.tsx` to save the correct array values (e.g., distinguish `password` vs `email_otp` if needed, or just use `email` for both but enforce via policy).
2.  **UI Feedback**: Show which methods are currently active.

### Phase 4: SSO Expansion (Future)
- Currently "SSO" implies Google.
- Ensure `sso` in `allowed_auth_methods` covers Google, GitHub, and future SAML providers.

## Action Items
1.  [ ] Modify `app/auth/login/page.tsx` to include Email OTP tab/button.
2.  [ ] Create `validate-auth-policy.ts` utility to check user's method against company settings.
3.  [ ] Integrate validation into the auth callback or dashboard layout (to catch unauthorized sessions).
4.  [ ] Update `handleAuthMethodChange` to use precise values (`password`, `email_otp`, `sso`).
