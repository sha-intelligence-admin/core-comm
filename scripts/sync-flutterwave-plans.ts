
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file BEFORE importing other modules
config({ path: resolve(__dirname, '../.env') });

// Dynamic imports to ensure env vars are loaded first
const { PRICING_TIERS } = require('../app/constants/pricing');
const { createPlan } = require('../lib/flutterwave');

interface PricingTier {
  id: string;
  name: string;
  price: number | null;
  flutterwave_plan_id: number | null;
}

async function syncPlans() {
  console.log('Starting Flutterwave Plan Sync...');

  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    console.error('Error: FLUTTERWAVE_SECRET_KEY is not set in .env');
    process.exit(1);
  }

  const tiers = Object.values(PRICING_TIERS as Record<string, PricingTier>).filter((t): t is PricingTier => t.price !== null);

  for (const tier of tiers) {
    console.log(`Creating plan: ${tier.name} ($${tier.price}/month)...`);
    
    try {
      const payload = {
        name: tier.name,
        amount: tier.price,
        interval: 'monthly',
        currency: 'USD', // Assuming USD
        duration: 1 // This usually means it runs indefinitely until cancelled if not specified, but for 'monthly' interval it defines the frequency. 
        // Actually Flutterwave 'duration' is often used for how many times to charge. If omitted, it's infinite.
        // Let's check Flutterwave docs or just omit duration for infinite subscription.
      };

      // Flutterwave createPlan payload: { name, amount, interval, duration, currency }
      // interval: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
      
      const response = await createPlan({
        name: `CoreComm ${tier.name}`, // Prefixing to be clear
        amount: tier.price,
        interval: 'monthly',
        currency: 'USD'
      });

      if (response.status === 'success') {
        console.log(`✅ Successfully created plan: ${tier.name}`);
        console.log(`   Plan ID: ${response.data.id}`);
        console.log(`   Plan Token: ${response.data.plan_token}`);
      } else {
        console.error(`❌ Failed to create plan: ${tier.name}`, response);
      }

    } catch (error: any) {
      console.error(`❌ Error creating plan ${tier.name}:`, error.response?.data || error.message);
    }
  }

  console.log('Sync complete.');
}

syncPlans();
