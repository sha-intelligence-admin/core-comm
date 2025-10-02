// app/api/voice/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to handle potential module issues
let elevenLabsClient: any = null;

async function getElevenLabsClient() {
  if (!elevenLabsClient) {
    try {
      const ElevenLabsService = await import('../../../twilio/src/services/ElevenLabsService.js');
      elevenLabsClient = new ElevenLabsService.default();
    } catch (error) {
      console.error('Error importing ElevenLabsService:', error);
      throw new Error('Failed to initialize ElevenLabs service');
    }
  }
  return elevenLabsClient;
}

export async function POST(request: NextRequest) {
  try {
    // Get the service instance
    const elevenLabsService = await getElevenLabsClient();
    
    // Parse the request body
    const body = await request.json();
    const { 
      text, 
      voiceId, 
      streaming = false,
      priority = 'normal',
      options = {} 
    } = body;

    console.log('API Request received:', { text, voiceId, streaming, priority });

    // Validate required fields
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // Optimize text for TTS
    const optimizedText = elevenLabsService.optimizeTextForTTS(text);
    console.log('Optimized text:', optimizedText);
    
    if (!optimizedText) {
      return NextResponse.json(
        { error: 'Text is empty after optimization' },
        { status: 400 }
      );
    }

    // Handle streaming vs non-streaming requests
    if (streaming) {
      // For streaming, we'll collect chunks and return the complete audio
      const chunks = [];
      const result = await elevenLabsService.generateStreamingSpeech(
        optimizedText,
        voiceId,
        (chunk: any) => chunks.push(chunk), // onChunk callback
        { priority, ...options }
      );

      console.log('Streaming result:', { 
        success: result.success, 
        audioBufferLength: result.audioBuffer?.length,
        error: result.error 
      });

      if (!result.success || !result.audioBuffer) {
        return NextResponse.json(
          { 
            error: 'Failed to generate streaming speech',
            details: result.error || 'No audio buffer returned'
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        audioBase64: elevenLabsService.audioBufferToBase64(result.audioBuffer),
        voiceId: result.voiceId,
        chunks: result.chunks,
        streaming: true
      });

    } else {
      // Regular (non-streaming) speech generation
      console.log('Starting regular speech generation...');
      const result = await elevenLabsService.generateSpeech(
        optimizedText,
        voiceId,
        { priority, ...options }
      );

      console.log('Generation result:', { 
        success: result.success, 
        audioBufferLength: result.audioBuffer?.length,
        voiceId: result.voiceId,
        voiceName: result.voiceName,
        generationTime: result.generationTime,
        error: result.error 
      });

      if (!result.success || !result.audioBuffer) {
        return NextResponse.json(
          { 
            error: 'Failed to generate speech',
            details: result.error || 'No audio buffer returned',
            debug: {
              success: result.success,
              hasAudioBuffer: !!result.audioBuffer,
              audioBufferLength: result.audioBuffer?.length
            }
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        audioBase64: elevenLabsService.audioBufferToBase64(result.audioBuffer),
        voiceId: result.voiceId,
        voiceName: result.voiceName,
        generationTime: result.generationTime,
        streaming: false
      });
    }

  } catch (error) {
    console.error('Error in voice API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET method to retrieve available voices
export async function GET() {
  try {
    // Get the service instance
    const elevenLabsService = await getElevenLabsClient();
    
    const voices = await elevenLabsService.getAvailableVoices();
    
    return NextResponse.json({
      success: true,
      voices,
      voicePools: {
        primary: elevenLabsService.voicePools.primary,
        secondary: elevenLabsService.voicePools.secondary,
        fallback: elevenLabsService.voicePools.fallback
      }
    });

  } catch (error) {
    console.error('Error retrieving voices:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve voices',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT method to update voice settings
export async function PUT(request: NextRequest) {
  try {
    // Get the service instance
    const elevenLabsService = await getElevenLabsClient();
    
    const body = await request.json();
    const { defaultVoiceId, voiceSettings } = body;

    if (defaultVoiceId) {
      elevenLabsService.setDefaultVoice(defaultVoiceId);
    }

    if (voiceSettings) {
      elevenLabsService.updateVoiceSettings(voiceSettings);
    }

    return NextResponse.json({
      success: true,
      message: 'Voice settings updated successfully',
      defaultVoiceId: elevenLabsService.defaultVoiceId,
      voiceSettings: elevenLabsService.voiceSettings
    });

  } catch (error) {
    console.error('Error updating voice settings:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update voice settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
};