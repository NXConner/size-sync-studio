// Voice feedback system for measurements
export function getVoiceEnabled(): boolean {
  return localStorage.getItem('voice-enabled') !== 'false';
}

export function setVoiceEnabled(enabled: boolean): void {
  localStorage.setItem('voice-enabled', enabled.toString());
}

export async function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return speechSynthesis.getVoices();
}

export function getVoiceName(): string {
  return localStorage.getItem('voice-name') || '';
}

export function setVoiceName(name: string): void {
  localStorage.setItem('voice-name', name);
}

export function getVoiceRate(): number {
  return parseFloat(localStorage.getItem('voice-rate') || '1');
}

export function setVoiceRate(rate: number): void {
  localStorage.setItem('voice-rate', rate.toString());
}

export function getVoicePitch(): number {
  return parseFloat(localStorage.getItem('voice-pitch') || '1');
}

export function setVoicePitch(pitch: number): void {
  localStorage.setItem('voice-pitch', pitch.toString());
}

export function getVoiceVolume(): number {
  return parseFloat(localStorage.getItem('voice-volume') || '0.8');
}

export function setVoiceVolume(volume: number): void {
  localStorage.setItem('voice-volume', volume.toString());
}

export function getUseCustomVoiceLines(): boolean {
  return localStorage.getItem('use-custom-voice') === 'true';
}

export function setUseCustomVoiceLines(use: boolean): void {
  localStorage.setItem('use-custom-voice', use.toString());
}

export function getCustomVoiceLines(): string[] {
  const stored = localStorage.getItem('custom-voice-lines');
  return stored ? JSON.parse(stored) : [];
}

export function setCustomVoiceLines(lines: string[]): void {
  localStorage.setItem('custom-voice-lines', JSON.stringify(lines));
}

export function getAutoplayEnabled(): boolean {
  return localStorage.getItem('autoplay-enabled') !== 'false';
}

export function setAutoplayEnabled(enabled: boolean): void {
  localStorage.setItem('autoplay-enabled', enabled.toString());
}

export function getAutoplayIntervalMs(): number {
  return parseInt(localStorage.getItem('autoplay-interval') || '5000');
}

export function setAutoplayIntervalMs(ms: number): void {
  localStorage.setItem('autoplay-interval', ms.toString());
}

export function getSpeakOnCapture(): boolean {
  return localStorage.getItem('speak-on-capture') !== 'false';
}

export function setSpeakOnCapture(enabled: boolean): void {
  localStorage.setItem('speak-on-capture', enabled.toString());
}

export function getSpeakOnLock(): boolean {
  return localStorage.getItem('speak-on-lock') !== 'false';
}

export function setSpeakOnLock(enabled: boolean): void {
  localStorage.setItem('speak-on-lock', enabled.toString());
}

export function stopSpeaking(): void {
  speechSynthesis.cancel();
}

async function speak(text: string): Promise<void> {
  if (!getVoiceEnabled()) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = getVoiceRate();
  utterance.pitch = getVoicePitch();
  utterance.volume = getVoiceVolume();
  
  const voiceName = getVoiceName();
  if (voiceName) {
    const voice = speechSynthesis.getVoices().find(v => v.name === voiceName);
    if (voice) utterance.voice = voice;
  }
  
  speechSynthesis.speak(utterance);
}

export async function playHumDetect(): Promise<void> {
  await speak("Area detected");
}

export async function playCompliment(): Promise<void> {
  const compliments = ["Great measurement!", "Well done!", "Perfect positioning!"];
  const random = compliments[Math.floor(Math.random() * compliments.length)];
  await speak(random);
}

export async function playComplimentWithContext(context?: string | { length_in: number; length_cm: number; girth_in: number; girth_cm: number; confidence: number }): Promise<void> {
  if (typeof context === 'object' && context) {
    // Create a contextual message from measurement data
    const lengthText = context.length_in > 10 ? 
      `${context.length_cm.toFixed(1)} centimeters` : 
      `${context.length_in.toFixed(1)} inches`;
    
    const girthText = context.girth_in > 10 ? 
      `${context.girth_cm.toFixed(1)} centimeters` : 
      `${context.girth_in.toFixed(1)} inches`;
    
    const message = `Measurement complete. Length: ${lengthText}. Girth: ${girthText}. Confidence: ${Math.round(context.confidence * 100)} percent.`;
    await speak(message);
  } else {
    await speak(context || "Measurement complete");
  }
}

export async function playCustomLine(line: string): Promise<void> {
  await speak(line);
}