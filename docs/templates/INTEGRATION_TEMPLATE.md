# [Service Name] Integration

## Purpose
Why do we integrate with this service? What capabilities does it add?

## Setup Guide

### Prerequisites
- Account requirements
- API keys needed

### Environment Variables
```bash
SERVICE_API_KEY=...
SERVICE_WEBHOOK_SECRET=...
```

### Configuration
Steps to configure the external service (e.g., setting webhook URLs in their dashboard).

## Implementation Details

### Code Locations
- **Client**: `lib/integrations/service-client.ts`
- **Webhooks**: `app/api/webhooks/service/route.ts`

### Key Features
- Feature 1
- Feature 2

## Data Syncing
How is data kept in sync between CoreComm and the service?
- **Direction**: One-way / Two-way
- **Frequency**: Real-time (webhook) / Scheduled (cron)

## Troubleshooting

### Common Errors
- Error message -> Solution

### Debugging
- How to inspect requests/responses.
