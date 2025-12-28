
import { config } from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const FLW_SECRET = process.env.FLUTTERWAVE_SECRET_KEY;
const FLW_BASE = 'https://api.flutterwave.com/v3';

if (!FLW_SECRET) {
  console.error('FLUTTERWAVE_SECRET_KEY is not set.');
  process.exit(1);
}

async function createPlan(payload: any) {
  try {
    const url = `${FLW_BASE}/payment-plans`;
    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${FLW_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    return resp.data;
  } catch (error: any) {
    console.error('Error creating plan:', error.response?.data || error.message);
    return null;
  }
}

async function main() {
  const newPlans = [
    {
      name: 'CoreComm Starter (New)',
      amount: 79,
      interval: 'monthly',
      currency: 'USD'
    },
    {
      name: 'CoreComm Professional (New)',
      amount: 299,
      interval: 'monthly',
      currency: 'USD'
    }
  ];

  console.log('Creating new pricing plans...');

  for (const plan of newPlans) {
    const result = await createPlan(plan);
    if (result && result.status === 'success') {
      console.log(`✅ Created ${plan.name}: ID = ${result.data.id}`);
    } else {
      console.log(`❌ Failed to create ${plan.name}`);
    }
  }
}

main();
