export type IntegrationType = 'mcp' | 'webhook' | 'api' | 'crm' | 'helpdesk';

export interface IntegrationConfig {
  [key: string]: any;
}

export interface WebhookConfig extends IntegrationConfig {
  url: string;
  secret?: string;
  headers?: Record<string, string>;
  events: string[];
}

export interface HubSpotConfig extends IntegrationConfig {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface SalesforceConfig extends IntegrationConfig {
  instanceUrl: string;
  accessToken: string;
  refreshToken?: string;
}

export interface IntegrationProvider {
  validateConfig(config: IntegrationConfig): Promise<boolean>;
  testConnection(config: IntegrationConfig): Promise<boolean>;
  sync?(config: IntegrationConfig, lastSync?: Date): Promise<void>;
  handleEvent?(config: IntegrationConfig, event: string, payload: any): Promise<void>;
  executeAction?(config: IntegrationConfig, action: string, params: any): Promise<any>;
}
