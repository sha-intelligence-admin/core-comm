import axios from 'axios';

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accountId: string;
  fromAddress: string;
}

class ZohoMailService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  private getConfig(): ZohoConfig {
    return {
      clientId: process.env.ZOHO_CLIENT_ID || '',
      clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
      refreshToken: process.env.ZOHO_REFRESH_TOKEN || '',
      accountId: process.env.ZOHO_ACCOUNT_ID || '',
      fromAddress: process.env.ZOHO_FROM_ADDRESS || '',
    };
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const config = this.getConfig();

    try {
      const params = new URLSearchParams({
        refresh_token: config.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
      });

      const response = await axios.post(
        'https://accounts.zoho.com/oauth/v2/token',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.error) {
        throw new Error(`Zoho Auth Error: ${response.data.error}`);
      }

      this.accessToken = response.data.access_token;
      // Token is usually valid for 1 hour, set expiry to 55 mins to be safe
      this.tokenExpiry = Date.now() + (response.data.expires_in || 3600) * 1000 - 300000;

      return this.accessToken!;
    } catch (error) {
      console.error('Failed to refresh Zoho access token:', error);
      throw new Error('Failed to authenticate with Zoho Mail');
    }
  }

  async sendEmail(to: string, subject: string, htmlBody: string) {
    const config = this.getConfig();
    
    if (!config.clientId || !config.refreshToken) {
      console.warn('Zoho Mail credentials not configured');
      return false;
    }

    try {
      const token = await this.getAccessToken();
      
      const response = await axios.post(
        `https://mail.zoho.com/api/accounts/${config.accountId}/messages`,
        {
          fromAddress: config.fromAddress,
          toAddress: to,
          subject: subject,
          content: htmlBody,
        },
        {
          headers: {
            Authorization: `Zoho-oauthtoken ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status?.code !== 200 && response.data.data?.status !== 'success') {
         throw new Error(JSON.stringify(response.data));
      }

      return true;
    } catch (error) {
      console.error('Error sending email via Zoho:', error);
      throw error;
    }
  }

  async sendInvitationEmail(to: string, inviteLink: string, inviterName: string) {
    const subject = `You've been invited to join CoreComm`;
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to CoreComm</h2>
        <p>Hello,</p>
        <p>${inviterName} has invited you to join their team on CoreComm.</p>
        <p>Click the button below to accept the invitation and set up your account:</p>
        <div style="margin: 24px 0;">
          <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Accept Invitation</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${inviteLink}">${inviteLink}</a></p>
        <p>If you didn't expect this invitation, you can ignore this email.</p>
      </div>
    `;

    return this.sendEmail(to, subject, htmlBody);
  }
}

export const zohoMail = new ZohoMailService();
