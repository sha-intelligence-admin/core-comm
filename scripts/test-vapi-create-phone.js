const { VapiClient } = require('@vapi-ai/server-sdk');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config();

const apiKey = process.env.VAPI_API_KEY;

if (!apiKey) {
  console.error('VAPI_API_KEY not set');
  process.exit(1);
}

const vapi = new VapiClient({
  token: apiKey,
});

async function testCreatePhone() {
  try {
    console.log('Creating Vapi phone number (dry run)...');
    // We expect this to fail because we don't have a real number or assistant
    // But we want to see the error message.
    const result = await vapi.phoneNumbers.create({
      provider: 'twilio',
      number: '+15555555555',
      // assistantId: '...', // Missing assistant ID
    });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error creating phone number:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.body) console.error('Error body:', JSON.stringify(error.body, null, 2));
  }
}

testCreatePhone();
