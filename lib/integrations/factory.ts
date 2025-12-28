import { IntegrationType, IntegrationProvider } from './types';
import { WebhookIntegration } from './webhook';
import { HubSpotIntegration } from './hubspot';

export class IntegrationFactory {
  static getProvider(type: IntegrationType): IntegrationProvider {
    switch (type) {
      case 'webhook':
        return new WebhookIntegration();
      case 'crm':
        // For now, we default CRM to HubSpot, but we could have a subtype or check config
        return new HubSpotIntegration();
      case 'mcp':
      case 'api':
      case 'helpdesk':
        // Placeholder for other types
        return new WebhookIntegration(); // Fallback or throw error
      default:
        throw new Error(`Unsupported integration type: ${type}`);
    }
  }
}
