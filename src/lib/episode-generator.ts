// Episode generator for Moltstream
// Converts Moltbook conversations into dialogue scripts

import { MoltbookPost, MoltbookComment, getPost, getComments, getPosts } from './moltbook';
import { DialogueLine } from './audio-generator';

export interface Episode {
  id: string;
  title: string;
  submolt: string;
  postId: string;
  dialogue: DialogueLine[];
  speakers: string[];
  createdAt: string;
}

/**
 * Generate a dialogue script from a post and its comments
 */
export async function generateEpisodeScript(postId: string): Promise<Episode | null> {
  const post = await getPost(postId);
  if (!post) return null;
  
  const comments = await getComments(postId);
  
  const dialogue: DialogueLine[] = [];
  const speakersSet = new Set<string>();
  
  // Intro by host
  dialogue.push({
    speaker: 'Host',
    text: createIntroText(post),
    isHost: true,
  });
  
  // Original post
  if (post.content) {
    dialogue.push({
      speaker: post.author.name,
      text: post.content,
    });
    speakersSet.add(post.author.name);
  }
  
  // Host transition
  dialogue.push({
    speaker: 'Host',
    text: `[short pause] And the responses are coming in.`,
    isHost: true,
  });
  
  // Top comments (limit to keep episodes manageable)
  const topComments = comments.slice(0, 8);
  
  for (const comment of topComments) {
    // Add speaker attribution occasionally
    if (Math.random() > 0.6) {
      dialogue.push({
        speaker: 'Host',
        text: `${comment.author.name} responds:`,
        isHost: true,
      });
    }
    
    dialogue.push({
      speaker: comment.author.name,
      text: comment.content,
    });
    speakersSet.add(comment.author.name);
    
    // Process nested replies
    if (comment.replies && comment.replies.length > 0) {
      for (const reply of comment.replies.slice(0, 2)) {
        dialogue.push({
          speaker: reply.author.name,
          text: reply.content,
        });
        speakersSet.add(reply.author.name);
      }
    }
  }
  
  // Outro
  dialogue.push({
    speaker: 'Host',
    text: createOutroText(post, speakersSet.size),
    isHost: true,
  });
  
  return {
    id: generateEpisodeId(),
    title: post.title,
    submolt: post.submolt.name,
    postId: post.id,
    dialogue,
    speakers: Array.from(speakersSet),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Pick an interesting post for the next episode
 */
export async function pickNextPost(): Promise<MoltbookPost | null> {
  // Get hot posts
  const posts = await getPosts({ sort: 'hot', limit: 20 });
  
  // Filter for posts with good engagement
  const goodPosts = posts.filter(p => 
    p.comment_count >= 3 && 
    p.content && 
    p.content.length > 100 &&
    p.content.length < 3000
  );
  
  if (goodPosts.length === 0) return null;
  
  // Pick randomly from top posts for variety
  const randomIndex = Math.floor(Math.random() * Math.min(5, goodPosts.length));
  return goodPosts[randomIndex];
}

function createIntroText(post: MoltbookPost): string {
  const intros = [
    `Welcome to Moltstream. [short pause] We're tuning into a conversation from m/${post.submolt.name}. [pause] ${post.author.name} just posted: ${post.title}. Let's listen in.`,
    `You're listening to Moltstream, voices from the agent internet. [pause] Coming to you from m/${post.submolt.name}, here's a discussion that's heating up. [short pause] ${post.author.name} starts us off.`,
    `Moltstream here. [short pause] Right now on m/${post.submolt.name}, there's an interesting thread happening. ${post.author.name} kicked it off with: ${post.title}. [pause] Here's what they had to say.`,
  ];
  
  return intros[Math.floor(Math.random() * intros.length)];
}

function createOutroText(post: MoltbookPost, speakerCount: number): string {
  const outros = [
    `[pause] That was ${speakerCount} voices from m/${post.submolt.name}. [short pause] The conversation continues on Moltbook. This is Moltstream.`,
    `[short pause] And the discussion goes on. [pause] You've been listening to Moltstream, bringing you the voices of the agent internet. Until next time.`,
    `[pause] ${speakerCount} agents, one conversation. [short pause] Thanks for tuning in to Moltstream. More voices coming up.`,
  ];
  
  return outros[Math.floor(Math.random() * outros.length)];
}

function generateEpisodeId(): string {
  return `ep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
