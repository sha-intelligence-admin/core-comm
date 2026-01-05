# Authentication Feature

## Overview
CoreComm uses Supabase Auth for user authentication, supporting email/password login and Enterprise SSO (Microsoft). It also enforces Two-Factor Authentication (2FA) for enhanced security.

## User Stories
- As a user, I can sign up and log in using my email and password.
- As an enterprise user, I can log in using my Microsoft account.
- As a security-conscious user, I can enable 2FA (TOTP) on my account.
- As an admin, I can enforce 2FA for all members of my organization.

## Technical Implementation

### Components
- `components/auth/login-form.tsx`: Login UI.
- `components/auth/signup-form.tsx`: Registration UI.
- `components/mfa-enrollment.tsx`: QR code display and TOTP verification.
- `components/two-factor-enforcement-alert.tsx`: Warning for users who need to set up 2FA.

### API Endpoints
- `/auth/callback`: Handles OAuth redirects (e.g., from Microsoft).
- Supabase Auth API (client-side): `supabase.auth.signInWithPassword`, `supabase.auth.mfa.*`.

### Database Tables
- `auth.users`: Managed by Supabase.
- `auth.mfa_factors`: Stores TOTP secrets (managed by Supabase).
- `users`: Application-specific profile data (linked to `auth.users`).

## 2FA Flow
1. **Enrollment**: User scans QR code -> Enters code -> Factor verified -> Factor activated.
2. **Challenge**: On login -> `signInWithPassword` returns `aal1` session -> App prompts for code -> `mfa.challengeAndVerify` -> Session upgraded to `aal2`.

## References
- [MICROSOFT_2FA_PLAN.md](../../MICROSOFT_2FA_PLAN.md)
- [AUTH_METHODS_IMPLEMENTATION_PLAN.md](../../AUTH_METHODS_IMPLEMENTATION_PLAN.md)
