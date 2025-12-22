const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' }); // Try .env.local first
dotenv.config(); // Then .env

console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? `Set (Length: ${process.env.TWILIO_ACCOUNT_SID.length})` : 'Not Set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? `Set (Length: ${process.env.TWILIO_AUTH_TOKEN.length})` : 'Not Set');
console.log('VAPI_API_KEY:', process.env.VAPI_API_KEY ? `Set (Length: ${process.env.VAPI_API_KEY.length})` : 'Not Set');
console.log('ZOHO_CLIENT_ID:', process.env.ZOHO_CLIENT_ID ? `Set (Length: ${process.env.ZOHO_CLIENT_ID.length})` : 'Not Set');
