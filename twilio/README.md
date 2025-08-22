.env example

PORT=3000
TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
AGENT_NUMBER=+0987654321
NGROK_AUTHTOKEN=your_ngrok_authtoken_here


How to Run:
    npm run dev

    you should see:
        server running on port PORT
        Phone number: TWILIO PHONE NUMBER
        speech recognition is enabled
        make sure to update your Twilio webhook URL

    ngrok http 3000

    you should see:
        Session Status                online                                                                                    Account                       email@gmail.com (Plan: Free)                                                        Version                       3.26.0                                                                                    Region                        Europe (eu)                                                                               Latency                       46ms                                                                                      Web Interface                 http://127.0.0.1:4040                                                                     Forwarding                    URL -> http://localhost:3000

    Copy the URL - this is your public webhook URL!

    set the URL to Webhook on twilio console.

    Call the twilio phone number.


How It Works: A Step-by-Step Guide
    The process for a single phone call is straightforward:

    A Call Comes In: When someone dials your number, Twilio receives the call and forwards it to your application.

    The Live Connection: Your app immediately tells Twilio to start a media stream. This is a special, real-time connection (a WebSocket) that continuously sends the caller's audio to your app.

    From Voice to Text: Your app takes the audio data from the stream and feeds it to Deepgram. Deepgram's powerful AI quickly transcribes the voice into text.

    Understanding the Request: The transcribed text is sent to the app's internal knowledge base, which uses a simple NLP model to figure out what the caller is asking about (e.g., "What is your business model?").

    The Smart Response: Based on the question, the app finds the best answer and generates a response.

    Speaking It Back: Your app sends the text response to Twilio, which uses its text-to-speech feature to "say" the answer back to the caller.

    Logging the Call: Once the call is finished, the entire conversation transcript and other details are saved to your Supabase database for future review.

    This entire process is expected to happens in just a few milliseconds, making for a smooth, natural conversation.

Project Structure
    index.js: The main entry point. It sets up the web server, connects to all the services (Twilio, Deepgram, Supabase), and gets the whole system running.

    routes/callRoutes.js: This file handles the specific API routes that Twilio calls, like when a new phone call starts or when a caller enters a number on their keypad.

    controllers/callController.js: This is where the "Twilio logic" lives. It creates the TwiML instructions that tell Twilio how to handle the call—like playing a greeting, starting the media stream, or redirecting to another number.

    websocket.js: This is the heart of the real-time system. It manages the WebSocket connection, sends audio to Deepgram for transcription, processes the responses, and logs the call data to Supabase.

    nlp/nlp-kb.js: This file contains your AI's brain. It's a simple knowledge base where you define pairs of questions and answers. You can easily add more to expand the assistant's abilities.