# Documentation Audit Report

## Overview
This report summarizes the state of documentation after the initial overhaul (Phases 1-3).

## New Core Documentation (Keep & Maintain)
- `README.md`: Main entry point.
- `GETTING_STARTED.md`: Setup guide.
- `ENVIRONMENT_SETUP.md`: Env vars.
- `ARCHITECTURE.md`: System design.
- `API_REFERENCE.md`: API endpoints.
- `COMPONENT_GUIDE.md`: UI components.
- `DATABASE_SCHEMA.md`: DB structure.
- `CONTRIBUTING.md`: Dev workflow.
- `TROUBLESHOOTING.md`: Common issues.
- `TESTING_GUIDE.md`: Testing strategy.
- `SECURITY.md`: Security policy.
- `GLOSSARY.md`: Terms.
- `docs/features/*.md`: Feature specifics.
- `deployment/CHECKLISTS.md`: Consolidated checklists.
- `deployment/README.md`: Deployment hub.

## Legacy Documentation (Review for Deletion/Archival)

The following files contain valuable information but may now be redundant or need merging into the new structure.

### Root Directory
- `API_REFERENCE.md`: **KEEP** (Updated).
- `AUTH_METHODS_IMPLEMENTATION_PLAN.md`: **ARCHIVE** (Content moved to `docs/features/authentication.md`).
- `DATABASE_MIGRATION_GUIDE.md`: **KEEP** (Referenced by `DATABASE_SCHEMA.md`).
- `DEPLOYMENT_CHECKLIST.md`: **ARCHIVED** (Moved to `deployment/CHECKLISTS.md`).
- `MANUAL_TEST_PLAN.md`: **KEEP** (Referenced by `TESTING_GUIDE.md`).
- `MICROSOFT_2FA_PLAN.md`: **ARCHIVE** (Content moved to `docs/features/authentication.md`).
- `MIGRATION_TO_HYBRID_PRICING.md`: **ARCHIVE** (Content moved to `docs/features/billing.md`).
- `PLAN_KB_INTEGRATIONS.md`: **ARCHIVE** (Content moved to `docs/features/integrations.md`).
- `PRICING_IMPLEMENTATION_PLAN.md`: **ARCHIVE** (Content moved to `docs/features/billing.md`).
- `REALTIME_TRANSCRIPT_PLAN.md`: **ARCHIVE** (Content moved to `docs/features/call-logs.md`).
- `SECURITY_PAGE_IMPLEMENTATION_PLAN.md`: **ARCHIVE** (Content moved to `docs/features/security.md`).
- `VAPI_WEBHOOK_SETUP.md`: **KEEP** (Detailed setup guide, referenced by `docs/features/integrations.md`).

### Deployment Directory
- `deployment/API_README.md`: **REVIEW** (Check if redundant with root `API_REFERENCE.md`).
- `deployment/corecomm_dev_manual.md`: **REVIEW** (Likely redundant with `GETTING_STARTED.md`).
- `deployment/SIGNUP_PROFILE_INTEGRATION.md`: **REVIEW** (Likely redundant with `docs/features/authentication.md`).
- `deployment/*_OLD.md`: **DELETE** (After verifying `CHECKLISTS.md`).

## Recommendations
1. **Archive Plans**: Move all `*_PLAN.md` files to a `docs/archive/` folder to declutter the root.
2. **Delete Redundant Files**: After confirming content is preserved, delete the `_OLD` files.
3. **Consolidate Deployment**: Merge `deployment/API_README.md` into the main API docs if needed.
