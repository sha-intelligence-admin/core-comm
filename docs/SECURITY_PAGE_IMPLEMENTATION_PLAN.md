# Security Page Implementation Plan

## 1. Database Schema Updates

We need to create new tables in Supabase to store security configurations and audit logs.

### `security_settings` Table
Stores security configuration for each company.

```sql
create table security_settings (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references organizations(id) not null unique,
  two_factor_enabled boolean default false,
  allowed_auth_methods text[] default array['email', 'google', 'github'], -- e.g. ['email', 'sso']
  session_timeout_minutes integer default 1440, -- 24 hours
  ip_whitelist text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### `audit_logs` Table
Tracks important user actions for security auditing.

```sql
create table audit_logs (
  id uuid default gen_random_uuid() primary key,
  company_id uuid references organizations(id) not null,
  user_id uuid references auth.users(id),
  actor_name text, -- Snapshot of user name at time of action
  action text not null, -- e.g., "login", "update_settings", "export_data"
  resource text, -- e.g., "billing", "team_members"
  details jsonb, -- Extra metadata
  ip_address text,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster querying of logs by company
create index idx_audit_logs_company on audit_logs(company_id);
create index idx_audit_logs_created_at on audit_logs(created_at desc);
```

## 2. API Routes Implementation

We need to create Next.js API routes to handle data fetching and updates.

### Security Settings API
*   **File**: `app/api/security/settings/route.ts`
*   **GET**: Fetch security settings for the current user's company.
*   **PATCH**: Update specific settings (e.g., toggle 2FA).

### Audit Logs API
*   **File**: `app/api/security/audit-logs/route.ts`
*   **GET**: Fetch paginated audit logs. Supports filtering by user or action.

## 3. Frontend Integration

### Custom Hooks
Create hooks to manage state and data fetching.

*   **`hooks/use-security-settings.tsx`**:
    *   Uses `useSWR` to fetch from `/api/security/settings`.
    *   Provides `updateSettings` function to call PATCH endpoint.
*   **`hooks/use-audit-logs.tsx`**:
    *   Uses `useSWR` to fetch from `/api/security/audit-logs`.
    *   Handles pagination.

### Component Updates
Update `app/(dashboard)/security/page.tsx` to replace static data.

1.  **Connect 2FA Toggle**:
    *   Bind the `Switch` component to `settings.two_factor_enabled`.
    *   On change, call `updateSettings({ two_factor_enabled: newValue })`.
2.  **Connect Audit Logs Table**:
    *   Map over the data returned from `useAuditLogs`.
    *   Display real timestamps and user names.
3.  **Real Compliance Status**:
    *   (Optional) If compliance depends on specific settings (e.g., "Data Encryption" is always on), keep it static or link it to the `security_settings` state.

## 4. Middleware & Auth Integration (Advanced)

*   **Enforce 2FA**: Update `middleware.ts` or login flow to check `security_settings.two_factor_enabled` and require a second factor if true.
*   **Log Actions**: Create a utility function `logAuditAction(action, details)` that can be called from other API routes (e.g., when a user invites a team member or changes billing) to populate the `audit_logs` table.

## 5. Execution Steps

1.  Run SQL migration to create tables.
2.  Create API routes.
3.  Create frontend hooks.
4.  Wire up the UI components.
5.  Test 2FA toggle and Audit Log display.
