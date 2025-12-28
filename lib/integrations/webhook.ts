import { IntegrationProvider, WebhookConfig } from './types';

export class WebhookIntegration implements IntegrationProvider {
  async validateConfig(config: any): Promise<boolean> {
    const webhookConfig = config as WebhookConfig;
    if (!webhookConfig.url) return false;
    try {
      new URL(webhookConfig.url);
      return true;
    } catch {
      return false;
    }
  }

  async testConnection(config: any): Promise<boolean> {
    const webhookConfig = config as WebhookConfig;
    try {
      // Send a ping event
      const response = await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookConfig.headers || {}),
        },
        body: JSON.stringify({
          event: 'ping',
          timestamp: new Date().toISOString(),
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Webhook test connection failed:', error);
      return false;
    }
  }

  async handleEvent(config: any, event: string, payload: any): Promise<void> {
    const webhookConfig = config as WebhookConfig;
    
    if (webhookConfig.events && !webhookConfig.events.includes(event)) {
      return;
    }

    try {
      await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookConfig.headers || {}),
          ...(webhookConfig.secret ? { 'X-Webhook-Secret': webhookConfig.secret } : {}),
        },
        body: JSON.stringify({
          event,
          payload,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error(`Failed to send webhook event ${event}:`, error);
      throw error;
    }
  }

  async executeAction(config: any, action: string, params: any): Promise<any> {
    const webhookConfig = config as WebhookConfig;
    try {
      const response = await fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(webhookConfig.headers || {}),
          ...(webhookConfig.secret ? { 'X-Webhook-Secret': webhookConfig.secret } : {}),
        },
        body: JSON.stringify({
          type: 'function_call',
          function: action,
          parameters: params,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}`);
      }

      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return { result: text };
      }
    } catch (error) {
      console.error('Webhook execution failed:', error);
      throw error;
    }
  }
}
