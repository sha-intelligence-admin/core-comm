const twilio = require('twilio');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('SID:', accountSid ? 'Set' : 'Not Set');
console.log('Token:', authToken ? 'Set' : 'Not Set');

if (!accountSid || !authToken) {
  console.error('Missing Twilio credentials');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function testListNumbers() {
  try {
    console.log('Listing available numbers in US...');
    const numbers = await client.availablePhoneNumbers('US').local.list({
      smsEnabled: true,
      voiceEnabled: true,
      limit: 1,
    });
    
    if (numbers.length > 0) {
      console.log('Found number:', numbers[0].phoneNumber);
    } else {
      console.log('No numbers found.');
    }
  } catch (error) {
    console.error('Error listing numbers:', error);
    if (error.message) console.error('Error message:', error.message);
    if (error.code) console.error('Error code:', error.code);
    if (error.status) console.error('Error status:', error.status);
  }
}

testListNumbers();
