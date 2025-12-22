const twilio = require('twilio');

// Intentionally unset credentials to see the error message
const accountSid = undefined;
const authToken = undefined;

try {
    const client = twilio(accountSid, authToken);
    console.log('Client created');
} catch (error) {
    console.error('Error creating client:', error.message);
}
