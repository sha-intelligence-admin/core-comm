# Security Features

## Overview
Security is paramount for CoreComm. This document outlines the security features implemented to protect user data and ensure compliance.

## Key Features

### 1. Role-Based Access Control (RBAC)
- **Roles**: Admin, Member.
- **Enforcement**: RLS policies in database + Middleware checks in Next.js.

### 2. Two-Factor Authentication (2FA)
- **Type**: TOTP (Time-based One-Time Password).
- **Enforcement**: Admins can require 2FA for all organization members.

### 3. Audit Logging
- **Purpose**: Track sensitive actions (login, settings change, data export).
- **Storage**: `audit_logs` table (immutable).

### 4. Data Encryption
- **At Rest**: Supabase manages disk encryption.
- **In Transit**: All API traffic via HTTPS/TLS 1.2+.

## Technical Implementation

### Middleware (`middleware.ts`)
- Intercepts every request.
- Verifies Supabase session.
- Checks for 2FA requirement (redirects to enrollment if needed).

### RLS Policies
- Strict policies ensure cross-tenant data isolation (Company A cannot see Company B's data).

## References
- [SECURITY_PAGE_IMPLEMENTATION_PLAN.md](../../SECURITY_PAGE_IMPLEMENTATION_PLAN.md)
- [DEPLOYMENT/SECURITY_AUDIT_REPORT.md](../../deployment/SECURITY_AUDIT_REPORT.md)
