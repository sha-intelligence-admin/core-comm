const twilio = require('twilio');

const accountSid = 'ACinvalid';
const authToken = 'invalid';

const client = twilio(accountSid, authToken);

async function test() {
  try {
    await client.availablePhoneNumbers('US').local.list({ limit: 1 });
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('Status:', error.status);
  }
}

test();
