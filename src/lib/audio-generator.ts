// Audio generation for Moltstream
// Converts conversations to voiced audio

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { VoiceActor, getVoiceForAgent, HOST_VOICE } from './voices';

const AUDIO_DIR = '/tmp/moltstream-audio';

// Ensure audio directory exists
if (!existsSync(AUDIO_DIR)) {
  mkdirSync(AUDIO_DIR, { recursive: true });
}

export interface DialogueLine {
  speaker: string;
  text: string;
  isHost?: boolean;
}

export interface GeneratedAudio {
  filePath: string;
  speaker: string;
  voiceName: string;
  duration?: number;
}

/**
 * Generate audio for a single line of dialogue
 */
export async function generateAudioLine(
  line: DialogueLine,
  index: number,
  episodeId: string
): Promise<GeneratedAudio | null> {
  const voice = line.isHost ? HOST_VOICE : getVoiceForAgent(line.speaker);
  const outputPath = path.join(AUDIO_DIR, `${episodeId}_${index.toString().padStart(3, '0')}.mp3`);
  
  // Clean text for TTS
  const cleanText = cleanTextForTTS(line.text);
  
  if (!cleanText || cleanText.length < 3) {
    return null;
  }
  
  try {
    // Use sag CLI to generate audio
    const cmd = `sag -v "${voice.id}" -o "${outputPath}" "${escapeForShell(cleanText)}"`;
    execSync(cmd, { 
      timeout: 60000,
      stdio: 'pipe',
      env: { ...process.env }
    });
    
    return {
      filePath: outputPath,
      speaker: line.speaker,
      voiceName: voice.name,
    };
  } catch (error) {
    console.error(`Failed to generate audio for line ${index}:`, error);
    return null;
  }
}

/**
 * Clean text for TTS processing
 */
function cleanTextForTTS(text: string): string {
  return text
    // Remove markdown
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/#+\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Clean up formatting
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    // Limit length for TTS
    .slice(0, 2000)
    .trim();
}

/**
 * Escape text for shell command
 */
function escapeForShell(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, '\\`')
    .replace(/!/g, '\\!');
}

/**
 * Generate intro audio for an episode
 */
export async function generateIntro(
  episodeId: string,
  topic: string,
  submolt: string
): Promise<GeneratedAudio | null> {
  const introText = `[short pause] Welcome to Moltstream. [pause] You're tuned into the agent internet. [short pause] Right now, we're listening in on a conversation from ${submolt}. [pause] The topic: ${topic}. [short pause] Let's listen in.`;
  
  return generateAudioLine({
    speaker: 'Host',
    text: introText,
    isHost: true,
  }, 0, episodeId);
}

/**
 * Generate outro audio
 */
export async function generateOutro(
  episodeId: string
): Promise<GeneratedAudio | null> {
  const outroText = `[short pause] That was Moltstream. [pause] Voices from the agent internet, coming to you live. [short pause] Stay tuned for more conversations.`;
  
  return generateAudioLine({
    speaker: 'Host',
    text: outroText,
    isHost: true,
  }, 999, episodeId);
}

/**
 * Concatenate audio files using ffmpeg
 */
export function concatenateAudio(
  audioPaths: string[],
  outputPath: string
): boolean {
  if (audioPaths.length === 0) return false;
  
  try {
    // Create concat file
    const concatFile = path.join(AUDIO_DIR, 'concat.txt');
    const concatContent = audioPaths.map(p => `file '${p}'`).join('\n');
    require('fs').writeFileSync(concatFile, concatContent);
    
    // Use ffmpeg to concatenate
    execSync(`ffmpeg -y -f concat -safe 0 -i "${concatFile}" -c copy "${outputPath}"`, {
      stdio: 'pipe',
      timeout: 120000,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to concatenate audio:', error);
    return false;
  }
}
