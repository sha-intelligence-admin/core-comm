# Security Policy

## Overview
CoreComm is designed with security as a top priority. This document outlines our security posture, policies, and reporting procedures.

## Security Architecture

### Authentication
- **Provider**: Supabase Auth (GoTrue).
- **Standards**: JWT (JSON Web Tokens) for session management.
- **MFA**: Time-based One-Time Password (TOTP) support.

### Authorization
- **Row Level Security (RLS)**: All database access is governed by RLS policies ensuring strict tenant isolation.
- **API Security**: Server-side validation of user roles and permissions.

### Data Protection
- **Encryption at Rest**: All data in Supabase is encrypted at rest.
- **Encryption in Transit**: TLS 1.2+ is enforced for all connections.
- **Secrets Management**: Environment variables are used for sensitive keys; never committed to code.

## Compliance

### GDPR
- Users can request data deletion (Right to be Forgotten).
- Data export functionality is available.

### Audit Logging
- Critical actions (login, billing changes, configuration updates) are logged to an immutable `audit_logs` table.

## Vulnerability Reporting

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue.
2. **Email**: security@corecomm.com (or equivalent contact).
3. Include details to reproduce the issue.

## Security Checklist for Developers

Before merging code, ensure:
- [ ] No secrets are hardcoded.
- [ ] RLS policies cover new tables.
- [ ] Input validation is implemented (Zod schemas).
- [ ] Dependencies are up to date (`npm audit`).

## References
- [deployment/SECURITY_AUDIT_REPORT.md](deployment/SECURITY_AUDIT_REPORT.md)
- [deployment/PRODUCTION_SECURITY_CHECKLIST.md](deployment/PRODUCTION_SECURITY_CHECKLIST.md)
