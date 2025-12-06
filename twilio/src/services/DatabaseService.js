import { createClient as createClientSupabase } from '@supabase/supabase-js';

class DatabaseService {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  initialize() {
    if (!this.initialized) {
      this.client = createClientSupabase(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          db: {
            // Connection pooling configuration
            pool: {
              max: 20,
              min: 2,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 2000,
            }
          },
          auth: {
            persistSession: false
          }
        }
      );
      this.initialized = true;
    }
    return this.client;
  }

  getClient() {
    if (!this.initialized) {
      return this.initialize();
    }
    return this.client;
  }

  async logConversation(callerNumber, receivingNumber, startTime, transcripts) {
    try {
      const client = this.getClient();
      const endTime = new Date();
      const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

      const fullTranscript = transcripts.map((t) => t.text).join(' ');

      const { data: companyData, error: companyError } = await client
        .from('company')
        .select('id')
        .contains('phone_numbers', [receivingNumber])
        .limit(1);

      if (companyError) {
        console.error('Error finding company:', companyError);
        return;
      }

      const companyId =
        companyData && companyData.length > 0 ? companyData[0].id : null;

      const { error } = await client.from('calls').insert({
        company_id: companyId,
        caller_number: callerNumber,
        recipient_number: receivingNumber,
        duration: durationSeconds,
        transcript: fullTranscript,
        call_type: 'in-bound',
      });

      if (error) {
        console.error('Error logging conversation:', error);
        throw error;
      } else {
        console.log('Conversation logged successfully.');
        return true;
      }
    } catch (e) {
      console.error('Database error during logging:', e);
      throw e;
    }
  }

  async getCompanyByPhoneNumber(phoneNumber) {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('company')
        .select('*')
        .contains('phone_numbers', [phoneNumber])
        .limit(1);

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const client = this.getClient();
      const { error } = await client.from('calls').select('id').limit(1);
      return !error;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
const databaseService = new DatabaseService();
export default databaseService;