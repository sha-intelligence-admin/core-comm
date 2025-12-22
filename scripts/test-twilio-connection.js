const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('SID:', accountSid ? 'Set' : 'Not Set');
console.log('Token:', authToken ? 'Set' : 'Not Set');

if (!accountSid || !authToken) {
  console.error('Missing credentials');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function test() {
  try {
    console.log('Listing available numbers...');
    const numbers = await client.availablePhoneNumbers('US').local.list({
      limit: 1
    });
    console.log('Found number:', numbers[0]?.phoneNumber);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

test();
