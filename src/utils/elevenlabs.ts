// ElevenLabs Text-to-Speech integration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Popular voices with their ElevenLabs voice IDs
export const POPULAR_VOICES = {
  'Aria': '9BWtsMINqrJLrRacOk9x',
  'Roger': 'CwhRBWXzGAHq8TQ4Fs17',
  'Sarah': 'EXAVITQu4vr4xnSDxMaL',
  'Laura': 'FGY2WhTYpPnrIDTdsKH5',
  'Charlie': 'IKne3meq5aSn9XLyUdCD',
  'George': 'JBFqnCBsd6RMkjVDRZzb',
  'Callum': 'N2lVS1w4EtoT3dr4eOWO',
  'River': 'SAz9YHcvj6GT2YYXdXww',
  'Liam': 'TX3LPaxmHKxFdv7VOQHJ',
  'Charlotte': 'XB0fDUnXU5powFXDhCwa',
  'Alice': 'Xb7hH8MSUJpSbSDYk0k2',
  'Matilda': 'XrExE9yKIg1WjnnlVkGX',
  'Will': 'bIHbv24MWmeRgasZH58o',
  'Jessica': 'cgSgspJ2msm6clMCkdW9',
  'Eric': 'cjVigY5qzO86Huf0OWal',
  'Chris': 'iP95p4xoKVk53GoZ742B',
  'Brian': 'nPczCjzI2devNBz1zQrb',
  'Daniel': 'onwK4e9ZLuTAKqWW03F9',
  'Lily': 'pFZP5JQG7iQjIQuC4Bku',
  'Bill': 'pqHfZKP75CvOlQylNhV4'
} as const;

export type VoiceName = keyof typeof POPULAR_VOICES;

// Models available
export const MODELS = {
  'eleven_multilingual_v2': 'Eleven Multilingual v2',
  'eleven_turbo_v2_5': 'Eleven Turbo v2.5',
  'eleven_turbo_v2': 'Eleven Turbo v2',
  'eleven_multilingual_v1': 'Eleven Multilingual v1',
  'eleven_monolingual_v1': 'Eleven English v1'
} as const;

export type ModelId = keyof typeof MODELS;

interface TTSConfig {
  voiceId: string;
  modelId: ModelId;
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
}

class ElevenLabsTTS {
  private apiKey: string | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  
  constructor() {
    // Try to get API key from environment or prompt user
    this.initializeApiKey();
  }
  
  private async initializeApiKey() {
    // In production, this would come from Supabase secrets
    // For now, we'll use a placeholder that can be set by the user
    try {
      // This would be replaced with actual Supabase edge function call
      this.apiKey = process.env.ELEVENLABS_API_KEY || null;
    } catch (error) {
      console.warn('ElevenLabs API key not found');
    }
  }
  
  setApiKey(key: string) {
    this.apiKey = key;
  }
  
  async generateSpeech(
    text: string, 
    voiceId: string = POPULAR_VOICES.Sarah,
    config: Partial<TTSConfig> = {}
  ): Promise<void> {
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not set, falling back to browser TTS');
      return this.fallbackToWebSpeech(text);
    }
    
    const requestConfig: TTSConfig = {
      voiceId,
      modelId: 'eleven_turbo_v2_5',
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.0,
      useSpeakerBoost: true,
      ...config
    };
    
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${requestConfig.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id: requestConfig.modelId,
          voice_settings: {
            stability: requestConfig.stability,
            similarity_boost: requestConfig.similarityBoost,
            style: requestConfig.style,
            use_speaker_boost: requestConfig.useSpeakerBoost
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      await this.playAudio(audioUrl);
      
      // Clean up
      URL.revokeObjectURL(audioUrl);
      
    } catch (error) {
      console.warn('ElevenLabs TTS failed, falling back to browser TTS:', error);
      await this.fallbackToWebSpeech(text);
    }
  }
  
  private async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop any currently playing audio
      this.stopCurrentAudio();
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = 0.8;
      
      this.currentAudio.onended = () => {
        this.currentAudio = null;
        resolve();
      };
      
      this.currentAudio.onerror = (error) => {
        this.currentAudio = null;
        reject(error);
      };
      
      this.currentAudio.play().catch(reject);
    });
  }
  
  private async fallbackToWebSpeech(text: string): Promise<void> {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve(); // Don't fail, just continue
      
      speechSynthesis.speak(utterance);
    });
  }
  
  stopCurrentAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    
    // Also stop browser speech synthesis
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  }
  
  async getAvailableVoices(): Promise<Array<{id: string, name: string, category: string}>> {
    if (!this.apiKey) {
      return Object.entries(POPULAR_VOICES).map(([name, id]) => ({
        id,
        name,
        category: 'Popular'
      }));
    }
    
    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category || 'Custom'
      }));
      
    } catch (error) {
      console.warn('Failed to fetch voices from ElevenLabs:', error);
      return Object.entries(POPULAR_VOICES).map(([name, id]) => ({
        id,
        name,
        category: 'Popular'
      }));
    }
  }
}

// Export singleton instance
export const elevenlabsTTS = new ElevenLabsTTS();

// Convenience functions
export async function speakWithElevenLabs(
  text: string, 
  voiceName: VoiceName = 'Sarah',
  options: Partial<TTSConfig> = {}
): Promise<void> {
  const voiceId = POPULAR_VOICES[voiceName];
  await elevenlabsTTS.generateSpeech(text, voiceId, options);
}

export function stopElevenLabsSpeech(): void {
  elevenlabsTTS.stopCurrentAudio();
}

export function setElevenLabsApiKey(key: string): void {
  elevenlabsTTS.setApiKey(key);
}