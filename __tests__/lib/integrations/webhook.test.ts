import { WebhookIntegration } from '@/lib/integrations/webhook';

// Mock global fetch
global.fetch = jest.fn();

describe('WebhookIntegration', () => {
  let webhookIntegration: WebhookIntegration;

  beforeEach(() => {
    webhookIntegration = new WebhookIntegration();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('validateConfig', () => {
    it('should return true for valid URL', async () => {
      const config = { url: 'https://example.com/webhook', events: ['function-call'] };
      const result = await webhookIntegration.validateConfig(config);
      expect(result).toBe(true);
    });

    it('should return false for invalid URL', async () => {
      const config = { url: 'not-a-url', events: ['function-call'] };
      const result = await webhookIntegration.validateConfig(config);
      expect(result).toBe(false);
    });

    it('should return false for missing URL', async () => {
      const config = { events: ['function-call'] };
      const result = await webhookIntegration.validateConfig(config);
      expect(result).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should return true when fetch succeeds', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
      const config = { url: 'https://example.com/webhook' };
      const result = await webhookIntegration.testConnection(config);
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/webhook', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"event":"ping"'),
      }));
    });

    it('should return false when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const config = { url: 'https://example.com/webhook' };
      const result = await webhookIntegration.testConnection(config);
      expect(result).toBe(false);
    });
  });

  describe('executeAction', () => {
    it('should send function_call payload and return result', async () => {
      const mockResponse = { success: true, data: 'some data' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const config = { url: 'https://example.com/webhook', secret: 'my-secret' };
      const action = 'bookAppointment';
      const params = { date: '2025-01-01' };

      const result = await webhookIntegration.executeAction(config, action, params);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/webhook', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-Webhook-Secret': 'my-secret',
        }),
        body: expect.stringContaining('"type":"function_call"'),
      }));
    });

    it('should throw error on non-ok response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const config = { url: 'https://example.com/webhook' };
      await expect(webhookIntegration.executeAction(config, 'test', {})).rejects.toThrow('Webhook returned 500');
    });
  });
});
