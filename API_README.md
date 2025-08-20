# CoreComm Backend API
Backend API for the CoreComm platform with Supabase integration.

## Setup Instructions

### Prerequisites

- Node.js (LTS version)
- pnpm (preferred) or npm
- Supabase project

### 1. Environment Setup

1. Copy the environment example file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   DATABASE_URL=your_supabase_database_url
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   API_BASE_URL=http://localhost:3000/api
   ```

### 2. Database Setup

1. Run the schema setup in your Supabase project:
   ```sql
   -- Copy and execute the contents of supabase/schema.sql in your Supabase SQL editor
   ```

2. (Optional) Add seed data:
   ```sql
   -- Copy and execute the contents of supabase/seed.sql in your Supabase SQL editor
   ```

### 3. Start the Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3000/api`

## API Endpoints

### Health Check
- `GET /api/health` - Health check endpoint

### Calls API
- `GET /api/calls` - Get paginated list of calls with filtering
- `POST /api/calls` - Create a new call
- `GET /api/calls/[id]` - Get a specific call
- `PUT /api/calls/[id]` - Update a specific call
- `DELETE /api/calls/[id]` - Delete a specific call

#### Query Parameters for GET /api/calls:
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `resolution_status` (enum: pending|resolved|escalated|failed) - Filter by resolution status
- `call_type` (enum: inbound|outbound) - Filter by call type
- `priority` (enum: low|medium|high|urgent) - Filter by priority
- `search` (string) - Search in caller_number, transcript, or summary

#### Example Call Object:
```json
{
  "id": "uuid",
  "caller_number": "+1234567890",
  "recipient_number": "+1987654321",
  "duration": 180,
  "transcript": "Customer called regarding billing issue...",
  "resolution_status": "resolved",
  "call_type": "inbound",
  "summary": "Billing inquiry resolved",
  "sentiment": "positive",
  "priority": "medium",
  "user_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Integrations API
- `GET /api/integrations` - Get paginated list of integrations with filtering
- `POST /api/integrations` - Create a new integration
- `GET /api/integrations/[id]` - Get a specific integration
- `PUT /api/integrations/[id]` - Update a specific integration
- `DELETE /api/integrations/[id]` - Delete a specific integration

#### Query Parameters for GET /api/integrations:
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `type` (enum: mcp|webhook|api|crm|helpdesk) - Filter by integration type
- `status` (enum: active|inactive|error|pending) - Filter by status
- `search` (string) - Search in name, description, or endpoint_url

#### Example Integration Object:
```json
{
  "id": "uuid",
  "name": "Slack Notifications",
  "type": "webhook",
  "endpoint_url": "https://hooks.slack.com/services/example",
  "status": "active",
  "config": {
    "channel": "#support",
    "notify_on": ["escalated", "failed"]
  },
  "description": "Send call notifications to Slack channel",
  "user_id": "uuid",
  "last_sync": "2024-01-01T00:00:00Z",
  "error_message": null,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Authentication

All API endpoints (except `/api/health`) require authentication via Supabase Auth. The frontend should include the authentication token in requests.

## Database Schema

### Tables

1. **users** - Extends Supabase auth.users with additional profile information
2. **calls** - Call records with transcripts, resolution status, and metadata
3. **integrations** - MCP endpoints and other third-party integrations

### Key Features

- Row Level Security (RLS) enabled
- Automatic timestamp management
- UUID primary keys
- Proper indexing for performance
- Type-safe database operations

## Development

### Adding New Endpoints

1. Create route files in `app/api/[endpoint]/route.ts`
2. Add validation schemas in `lib/validations.ts`
3. Update TypeScript types in `lib/supabase/types.ts`
4. Test endpoints using the frontend or API client

### Database Migrations

When making schema changes:

1. Update `supabase/schema.sql`
2. Update TypeScript types in `lib/supabase/types.ts`
3. Update validation schemas if needed
4. Run migrations in Supabase dashboard

## Testing

Test the API endpoints using your preferred HTTP client (curl, Postman, etc.):

```bash
# Health check
curl http://localhost:3000/api/health

# Get calls (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/calls

# Create a call (requires authentication)
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"caller_number": "+1234567890", "duration": 120}' \
  http://localhost:3000/api/calls
```

## Next Steps

1. **Configure Supabase:**
   - Create a new Supabase project
   - Update `.env.local` with your actual Supabase credentials
   
2. **Setup Database:**
   - Run the SQL in `supabase/schema.sql` in your Supabase SQL editor
   - Optionally run `supabase/seed.sql` for sample data

3. **Test Authentication:**
   - Implement user registration/login in your frontend
   - Test API endpoints with authenticated requests

4. **Frontend Integration:**
   - Connect your existing frontend components to the API
   - Update components to use real data from the API

5. **Production Setup:**
   - Add real-time subscriptions for live updates
   - Implement webhook endpoints for external integrations
   - Add analytics and monitoring
   - Deploy to your preferred hosting platform
