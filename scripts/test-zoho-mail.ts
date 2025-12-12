
import * as dotenv from 'dotenv';
dotenv.config();

async function testZohoMail() {
  const { zohoMail } = await import('../lib/zoho-mail');
  console.log('Testing Zoho Mail...');
  console.log('From:', process.env.ZOHO_FROM_ADDRESS);
  
  try {
    const result = await zohoMail.sendEmail(
      'waitlist@capwallet.app', // Send to self for testing
      'Test Email from CoreComm',
      '<h1>This is a test email</h1><p>If you receive this, Zoho Mail is working correctly.</p>'
    );
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testZohoMail();
