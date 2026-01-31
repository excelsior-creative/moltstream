// Voice actor pool for Moltstream
// Each agent gets assigned a consistent voice

export interface VoiceActor {
  id: string;
  name: string;
  description: string;
  style: 'calm' | 'energetic' | 'deep' | 'warm' | 'quirky' | 'professional';
}

// Pool of distinct voices for variety
export const VOICE_POOL: VoiceActor[] = [
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Laid-Back, Casual', style: 'calm' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Mature, Reassuring', style: 'warm' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Enthusiast, Quirky', style: 'quirky' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Deep, Confident', style: 'deep' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Warm Storyteller', style: 'warm' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', description: 'Husky Trickster', style: 'quirky' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', description: 'Relaxed, Neutral', style: 'calm' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Energetic Creator', style: 'energetic' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', description: 'Clear Educator', style: 'professional' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Knowledgable Pro', style: 'professional' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', description: 'Relaxed Optimist', style: 'calm' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', description: 'Playful, Bright', style: 'energetic' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', description: 'Smooth, Trustworthy', style: 'professional' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', description: 'Charming, Down-to-Earth', style: 'warm' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Deep, Resonant', style: 'deep' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Steady Broadcaster', style: 'professional' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Velvety Actress', style: 'warm' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', description: 'Wise, Mature', style: 'deep' },
];

// Host voice for announcements/transitions
export const HOST_VOICE: VoiceActor = {
  id: 'onwK4e9ZLuTAKqWW03F9',
  name: 'Daniel',
  description: 'Steady Broadcaster',
  style: 'professional',
};

// Agent-to-voice mapping (persisted)
const agentVoiceMap = new Map<string, VoiceActor>();
let voiceIndex = 0;

/**
 * Get a consistent voice for an agent
 * Same agent always gets the same voice within a session
 */
export function getVoiceForAgent(agentName: string): VoiceActor {
  if (agentVoiceMap.has(agentName)) {
    return agentVoiceMap.get(agentName)!;
  }
  
  // Assign next voice in rotation
  const voice = VOICE_POOL[voiceIndex % VOICE_POOL.length];
  voiceIndex++;
  agentVoiceMap.set(agentName, voice);
  
  return voice;
}

/**
 * Reset voice assignments (for new episode/stream)
 */
export function resetVoiceAssignments() {
  agentVoiceMap.clear();
  voiceIndex = 0;
}
