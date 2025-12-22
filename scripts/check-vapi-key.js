const vapiApiKey = process.env.VAPI_PRIVATE_API_KEY || process.env.VAPI_API_KEY;
console.log('Vapi Key:', vapiApiKey ? 'Set' : 'Not Set');
if (vapiApiKey) {
    console.log('Vapi Key Length:', vapiApiKey.length);
}
