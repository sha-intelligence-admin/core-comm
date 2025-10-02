import React, { useState, useRef, useCallback } from 'react';
import { ChevronDown, Play, Square, Download, Volume2, Loader2 } from 'lucide-react';

interface TTSApiResponse {
  success: boolean;
  audioBase64?: string; // Changed from 'audio' to match API response
  voiceId?: string;
  voiceName?: string;
  generationTime?: number;
  streaming?: boolean;
  error?: string;
  details?: string;
}

type VoiceName = 'Emma' | 'Liam' | 'Olivia' | 'Noah' | 'Ava' | 'Elijah';

const ElevenLabsTTSForm: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Emma');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice mapping for ElevenLabs
  const voiceMapping: Record<VoiceName, string> = {
    'Emma': '21m00Tcm4TlvDq8ikWAM', // Rachel
    'Liam': 'pNInz6obpgDQGcFmaJgB', // Adam
    'Olivia': 'EXAVITQu4vr4xnSDxMaL', // Bella
    'Noah': 'VR6AewLTigWG4xSOukaG', // Arnold
    'Ava': 'MF3mGyEYCl7XYWbV9V6O', // Elli
    'Elijah': '29vD33N1CtxCmqQRPOHJ' // Drew
  };

  const voiceOptions: VoiceName[] = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Elijah'];

  const handleGenerate = useCallback(async (): Promise<void> => {
    if (!text.trim()) {
      setError('Please enter some text to generate speech');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const startTime = Date.now();
      
      console.log('Sending request to /api/voice with:', {
        text: text.trim(),
        voiceId: voiceMapping[selectedVoice],
        voice: selectedVoice
      });
      
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: voiceMapping[selectedVoice],
          priority: 'normal',
          options: {
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.75,
              style: 0.5,
              use_speaker_boost: true,
            }
          }
        }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: TTSApiResponse = await response.json();
      console.log('API Response:', {
        success: result.success,
        hasAudio: !!result.audioBase64,
        voiceId: result.voiceId,
        voiceName: result.voiceName,
        error: result.error
      });

      if (!result.success || !result.audioBase64) {
        throw new Error(result.error || result.details || 'Failed to generate speech');
      }

      // Convert base64 to audio blob
      try {
        const audioBytes = Uint8Array.from(atob(result.audioBase64), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
        const audioURL = URL.createObjectURL(audioBlob);
        
        // Clean up previous audio URL
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        setAudioUrl(audioURL);
        
        const generationTime = Date.now() - startTime;
        const displayTime = result.generationTime || generationTime;
        setSuccess(`Speech generated successfully using ${selectedVoice} voice (${result.voiceName}) in ${Math.round(displayTime/1000)}s`);
        if(audioURL && audioRef.current) {
          handlePlayPause();
        }
      } catch (audioError) {
        console.error('Error processing audio:', audioError);
        throw new Error('Failed to process generated audio');
      }

    } catch (err) {
      console.error('TTS Generation Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate speech. Please try again.';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [text, selectedVoice, audioUrl]);

  const handlePlayPause = useCallback((): void => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error('Error playing audio:', err);
          setError('Failed to play audio');
        });
        setIsPlaying(true);
      }
    }
  }, [audioUrl, isPlaying]);

  const handleAudioEnd = useCallback((): void => {
    setIsPlaying(false);
  }, []);

  const handleDownload = useCallback((): void => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `speech-${selectedVoice}-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioUrl, selectedVoice]);

  const clearMessages = useCallback((): void => {
    setError(null);
    setSuccess(null);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Status Messages */}
      {/* {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearMessages} className="text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl flex justify-between items-center">
          <span>{success}</span>
          <button onClick={clearMessages} className="text-green-400 hover:text-green-300">×</button>
        </div>
      )} */}

      {/* Main Form */}
      <div className='my-4 p-2 justify-center items-center w-full flex flex-col space-y-4 backdrop-blur-3xl bg-gradient-to-tl from-purple-500/10 via-blue-500/10 to-cyan-400/10 rounded-3xl'>
        
        <textarea 
          className="w-full bg-transparent text-white placeholder-gray-400 p-6 rounded-3xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300 min-h-[120px] resize-none"
          placeholder='Type your text here to convert to speech...'
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2500}
          disabled={isGenerating}
        />

        <div className="w-full text-right text-gray-400 text-sm pr-2">
          {text.length}/2500 characters
        </div>
        
        <div className='w-full flex flex-col space-y-4 bg-slate-900 rounded-3xl p-2'>
          <div className='w-full flex gap-2 overflow-x-auto p-2'>
            {voiceOptions.map((voice) => (
              <button
                key={voice}
                onClick={() => setSelectedVoice(voice)}
                disabled={isGenerating}
                className={`flex-shrink-0 px-8 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                  selectedVoice === voice 
                    ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-900 shadow-lg'
                    : 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 text-white hover:from-cyan-400/20 hover:to-blue-500/20'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {voice}
              </button>
            ))}
          </div>
          
          <div className='px-2 w-full flex justify-between items-center'>
            <button className='flex bg-black p-1 rounded-full text-white items-center gap-2 text-sm hover:bg-gray-800 transition-colors'>
              <img src="en.jpeg" alt="en" className='w-5 h-5 rounded-full' />
              <ChevronDown className='w-4 h-4' />
            </button>
            
            <div className="flex items-center gap-2">
              {/* {audioUrl && (
                <>
                  <button
                    onClick={handlePlayPause}
                    className="group bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-full font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    disabled={isGenerating}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-4 h-4 fill-white" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        Play
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="group bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
                    title="Download Audio"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )} */}
              
              <button 
                onClick={() => { handleGenerate();}}
                disabled={isGenerating || !text.trim()}
                className="group bg-blue-500 hover:bg-cyan-400 hover:text-slate-900 text-white px-1 pl-4 py-1 rounded-full font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
                <div className="flex items-center justify-center rounded-full bg-slate-900 p-2 transition-colors duration-200 group-hover:bg-slate-800">
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnd}
          className="hidden"
        />
      )}
    </div>
  );
};

export default ElevenLabsTTSForm;