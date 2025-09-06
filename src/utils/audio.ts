const VOICE_ENABLED_KEY = "size-seeker-voice-enabled";
const CUSTOM_VOICE_USE_KEY = "size-seeker-voice-custom-use";
const CUSTOM_VOICE_LINES_KEY = "size-seeker-voice-custom-lines"; // JSON string[]

export function getVoiceEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(VOICE_ENABLED_KEY);
  return raw == null ? true : raw === "true";
}

export function setVoiceEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VOICE_ENABLED_KEY, String(enabled));
}

export function getUseCustomVoiceLines(): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(CUSTOM_VOICE_USE_KEY);
  return raw === "true";
}

export function setUseCustomVoiceLines(useCustom: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOM_VOICE_USE_KEY, String(useCustom));
}

export function getCustomVoiceLines(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_VOICE_LINES_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((s) => String(s)).filter((s) => s.trim().length > 0);
  } catch {
    return [];
  }
}

export function setCustomVoiceLines(lines: string[]): void {
  if (typeof window === "undefined") return;
  const cleaned = (Array.isArray(lines) ? lines : [])
    .map((s) => String(s))
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0)
    .slice(0, 200);
  window.localStorage.setItem(CUSTOM_VOICE_LINES_KEY, JSON.stringify(cleaned));
}

async function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  if (voices && voices.length > 0) return voices;
  await new Promise<void>((resolve) => {
    const handler = () => {
      synth.removeEventListener("voiceschanged", handler);
      resolve();
    };
    synth.addEventListener("voiceschanged", handler);
    // Fallback timeout in case event doesn't fire
    setTimeout(() => {
      synth.removeEventListener("voiceschanged", handler);
      resolve();
    }, 500);
  });
  return synth.getVoices();
}

function pickFemaleEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter((v) => /en/i.test(v.lang));
  const preferredNames = [
    "Samantha",
    "Victoria",
    "Google UK English Female",
    "Microsoft Zira",
    "Google US English",
  ];
  for (const name of preferredNames) {
    const found = english.find((v) => v.name.includes(name));
    if (found) return found;
  }
  return english[0] || null;
}

export async function speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  // Stop any current utterance to avoid overlap
  try {
    synth.cancel();
  } catch {}
  const voices = await getVoicesAsync();
  const voice = pickFemaleEnglishVoice(voices);
  const utter = new SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.rate = opts?.rate ?? 0.95;
  utter.pitch = opts?.pitch ?? 1.0;
  utter.volume = opts?.volume ?? 1.0;
  synth.speak(utter);
}

// Soft hum-like cue using TTS. Using a long "ummmm" approximates a hum.
export async function playHumDetect(): Promise<void> {
  await speak("ummmm", { rate: 0.8, pitch: 1.1, volume: 0.9 });
}

export async function playCompliment(): Promise<void> {
  const useCustom = getUseCustomVoiceLines();
  const custom = getCustomVoiceLines();
  let text: string | null = null;
  if (useCustom && custom.length > 0) {
    text = custom[Math.floor(Math.random() * custom.length)];
  } else {
    const choices = [
      "You're doing great",
      "Nice focus and consistency",
      "Solid progress—keep it up",
      "Strong form and steady hands",
      "Proud of your dedication",
    ];
    text = choices[Math.floor(Math.random() * choices.length)];
  }
  await speak(text, { rate: 1.0, pitch: 1.05, volume: 1.0 });
}

export async function playCustomLine(text: string): Promise<void> {
  if (!text || !text.trim()) return;
  await speak(text.trim(), { rate: 1.0, pitch: 1.05, volume: 1.0 });
}

