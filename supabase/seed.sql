-- Seed data for development
-- Note: Run this after creating your initial user through Supabase Auth

-- Insert sample calls (replace the user_id with actual user IDs from your auth.users table)
INSERT INTO public.calls (caller_number, recipient_number, duration, transcript, resolution_status, call_type, summary, sentiment, priority) VALUES
  ('+1234567890', '+1987654321', 180, 'Customer called regarding billing issue. Resolved by providing account credit.', 'resolved', 'inbound', 'Billing inquiry resolved with account credit', 'positive', 'medium'),
  ('+1555123456', '+1987654321', 300, 'Technical support call for software installation. Guided customer through setup process.', 'resolved', 'inbound', 'Technical support - software installation', 'neutral', 'low'),
  ('+1777888999', '+1987654321', 120, 'Complaint about service outage. Escalated to technical team.', 'escalated', 'inbound', 'Service outage complaint - escalated', 'negative', 'high'),
  ('+1666555444', '+1987654321', 90, 'Quick question about account features. Provided information and documentation links.', 'resolved', 'inbound', 'Account features inquiry', 'positive', 'low'),
  ('+1987654321', '+1333222111', 240, 'Follow-up call to previous ticket. Customer satisfied with resolution.', 'resolved', 'outbound', 'Follow-up call - customer satisfaction confirmed', 'positive', 'medium');

-- Insert sample integrations
INSERT INTO public.integrations (name, type, endpoint_url, status, description, config) VALUES
  ('Slack Notifications', 'webhook', 'https://hooks.slack.com/services/example', 'active', 'Send call notifications to Slack channel', '{"channel": "#support", "notify_on": ["escalated", "failed"]}'),
  ('CRM Sync', 'crm', 'https://api.example-crm.com/v1', 'active', 'Sync customer data with CRM system', '{"api_key": "****", "sync_interval": "5m"}'),
  ('Help Desk Integration', 'helpdesk', 'https://api.helpdesk.com/tickets', 'pending', 'Create tickets for escalated calls', '{"api_token": "****", "queue_id": "support"}'),
  ('Analytics MCP Server', 'mcp', 'mcp://analytics-server:8080', 'inactive', 'Analytics and reporting MCP server', '{"server_name": "analytics", "capabilities": ["data_analysis", "reporting"]}'),
  ('Email Notifications', 'webhook', 'https://api.email-service.com/send', 'error', 'Send email notifications for important calls', '{"from": "support@company.com", "template_id": "call_notification"}');

-- Note: To properly link data to users, you'll need to:
-- 1. Create users through Supabase Auth (signup/login)
-- 2. Update the user_id fields in calls and integrations tables with actual user IDs
-- 3. Or modify this seed script to use actual user IDs from your auth.users table
