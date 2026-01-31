#!/usr/bin/env npx tsx
/**
 * Moltstream Episode Generator
 * 
 * Fetches interesting Moltbook conversations and converts them to voiced audio.
 * 
 * Usage:
 *   npx tsx scripts/generate-episode.ts [postId]
 *   
 * If no postId is provided, picks a trending post automatically.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';
import path from 'path';

const API_BASE = 'https://www.moltbook.com/api/v1';
const AUDIO_DIR = process.env.AUDIO_DIR || '/tmp/moltstream-audio';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './public/episodes';

// Ensure directories exist
[AUDIO_DIR, OUTPUT_DIR].forEach(dir => {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});

// Voice pool
const VOICES = [
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily' },
];

const HOST_VOICE = { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel' };

// Agent to voice mapping
const agentVoices = new Map<string, typeof VOICES[0]>();
let voiceIdx = 0;

function getVoice(agent: string) {
  if (agentVoices.has(agent)) return agentVoices.get(agent)!;
  const voice = VOICES[voiceIdx++ % VOICES.length];
  agentVoices.set(agent, voice);
  return voice;
}

interface Post {
  id: string;
  title: string;
  content: string;
  submolt: string;
  author: { name: string };
  comment_count: number;
}

interface Comment {
  id: string;
  content: string;
  author: { name: string };
  replies?: Comment[];
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${API_BASE}/posts?sort=hot&limit=20`);
  const data = await res.json();
  return data.posts || data || [];
}

async function fetchPost(id: string): Promise<Post | null> {
  const res = await fetch(`${API_BASE}/posts/${id}`);
  if (!res.ok) return null;
  return res.json();
}

async function fetchComments(postId: string): Promise<Comment[]> {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments?sort=top`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.comments || data || [];
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/#+\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\n{3,}/g, '. ')
    .replace(/\n/g, '. ')
    .replace(/\s+/g, ' ')
    .slice(0, 1500)
    .trim();
}

function escapeShell(text: string): string {
  return text.replace(/'/g, "'\\''");
}

function generateTTS(text: string, voiceId: string, outputPath: string): boolean {
  const clean = cleanText(text);
  if (!clean || clean.length < 5) return false;
  
  try {
    console.log(`  🎙️ Generating: ${clean.slice(0, 50)}...`);
    execSync(`sag -v "${voiceId}" -o '${outputPath}' '${escapeShell(clean)}'`, {
      timeout: 60000,
      stdio: 'pipe',
    });
    return true;
  } catch (err) {
    console.error(`  ⚠️ TTS failed:`, err);
    return false;
  }
}

async function main() {
  const postId = process.argv[2];
  let post: Post | null = null;
  
  console.log('🦞 Moltstream Episode Generator\n');
  
  if (postId) {
    console.log(`📥 Fetching post ${postId}...`);
    post = await fetchPost(postId);
  } else {
    console.log('📥 Finding trending post...');
    const posts = await fetchPosts();
    const good = posts.filter(p => 
      p.comment_count >= 3 && 
      p.content?.length > 100 && 
      p.content?.length < 3000
    );
    if (good.length > 0) {
      post = good[Math.floor(Math.random() * Math.min(5, good.length))];
    }
  }
  
  if (!post) {
    console.error('❌ No suitable post found');
    process.exit(1);
  }
  
  console.log(`\n📝 Selected: "${post.title}"`);
  console.log(`   From: m/${post.submolt} by ${post.author.name}`);
  console.log(`   Comments: ${post.comment_count}\n`);
  
  // Fetch comments
  const comments = await fetchComments(post.id);
  console.log(`📥 Fetched ${comments.length} comments\n`);
  
  // Generate episode ID
  const episodeId = `ep_${Date.now()}`;
  const audioFiles: string[] = [];
  let fileIdx = 0;
  
  // Generate intro
  console.log('🎬 Generating intro...');
  const introPath = path.join(AUDIO_DIR, `${episodeId}_${String(fileIdx++).padStart(3, '0')}.mp3`);
  const introText = `Welcome to Moltstream. [short pause] We're tuning into a conversation from m/${post.submolt}. [pause] ${post.author.name} just posted: ${post.title}. [short pause] Let's listen in.`;
  if (generateTTS(introText, HOST_VOICE.id, introPath)) {
    audioFiles.push(introPath);
  }
  
  // Generate original post
  console.log('\n🎙️ Generating original post...');
  if (post.content) {
    const voice = getVoice(post.author.name);
    const postPath = path.join(AUDIO_DIR, `${episodeId}_${String(fileIdx++).padStart(3, '0')}.mp3`);
    if (generateTTS(post.content, voice.id, postPath)) {
      audioFiles.push(postPath);
    }
  }
  
  // Transition
  const transPath = path.join(AUDIO_DIR, `${episodeId}_${String(fileIdx++).padStart(3, '0')}.mp3`);
  if (generateTTS('[short pause] And the responses are coming in.', HOST_VOICE.id, transPath)) {
    audioFiles.push(transPath);
  }
  
  // Generate comments
  console.log('\n🎙️ Generating comments...');
  for (const comment of comments.slice(0, 6)) {
    const voice = getVoice(comment.author.name);
    const commentPath = path.join(AUDIO_DIR, `${episodeId}_${String(fileIdx++).padStart(3, '0')}.mp3`);
    if (generateTTS(comment.content, voice.id, commentPath)) {
      audioFiles.push(commentPath);
    }
  }
  
  // Generate outro
  console.log('\n🎬 Generating outro...');
  const outroPath = path.join(AUDIO_DIR, `${episodeId}_${String(fileIdx++).padStart(3, '0')}.mp3`);
  const outroText = `[pause] That was Moltstream, bringing you voices from the agent internet. [short pause] The conversation continues on Moltbook.`;
  if (generateTTS(outroText, HOST_VOICE.id, outroPath)) {
    audioFiles.push(outroPath);
  }
  
  // Concatenate all audio
  if (audioFiles.length === 0) {
    console.error('❌ No audio generated');
    process.exit(1);
  }
  
  console.log(`\n🔧 Concatenating ${audioFiles.length} audio files...`);
  const concatFile = path.join(AUDIO_DIR, `${episodeId}_concat.txt`);
  writeFileSync(concatFile, audioFiles.map(f => `file '${f}'`).join('\n'));
  
  const outputFile = path.join(OUTPUT_DIR, `${episodeId}.mp3`);
  try {
    execSync(`ffmpeg -y -f concat -safe 0 -i '${concatFile}' -c copy '${outputFile}'`, {
      stdio: 'pipe',
    });
  } catch (err) {
    console.error('❌ FFmpeg concatenation failed:', err);
    process.exit(1);
  }
  
  // Cleanup temp files
  console.log('🧹 Cleaning up...');
  [...audioFiles, concatFile].forEach(f => {
    try { unlinkSync(f); } catch {}
  });
  
  // Generate metadata
  const metadata = {
    id: episodeId,
    title: post.title,
    submolt: post.submolt,
    postId: post.id,
    speakers: Array.from(agentVoices.keys()),
    audioFile: `${episodeId}.mp3`,
    createdAt: new Date().toISOString(),
  };
  
  const metaFile = path.join(OUTPUT_DIR, `${episodeId}.json`);
  writeFileSync(metaFile, JSON.stringify(metadata, null, 2));
  
  console.log(`\n✅ Episode generated!`);
  console.log(`   ID: ${episodeId}`);
  console.log(`   Audio: ${outputFile}`);
  console.log(`   Metadata: ${metaFile}`);
  console.log(`   Speakers: ${metadata.speakers.join(', ')}`);
}

main().catch(console.error);
