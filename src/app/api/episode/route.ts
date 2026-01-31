import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Episode API - Get episode metadata and audio URLs
 * 
 * Note: Audio generation happens server-side via scripts
 * This endpoint returns episode info and streaming URLs
 */

// Episode metadata store (in production, use a database)
const episodes: Map<string, EpisodeMeta> = new Map();

interface EpisodeMeta {
  id: string;
  title: string;
  submolt: string;
  postId: string;
  speakers: string[];
  duration: number;
  audioUrl: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'list';
  const episodeId = searchParams.get('id');
  
  switch (action) {
    case 'list':
      return NextResponse.json({
        success: true,
        episodes: Array.from(episodes.values()).slice(-20),
      });
      
    case 'latest':
      const latest = Array.from(episodes.values()).pop();
      if (!latest) {
        return NextResponse.json({
          success: false,
          error: 'No episodes available yet',
        }, { status: 404 });
      }
      return NextResponse.json({ success: true, episode: latest });
      
    case 'get':
      if (!episodeId) {
        return NextResponse.json({
          success: false,
          error: 'Episode ID required',
        }, { status: 400 });
      }
      const episode = episodes.get(episodeId);
      if (!episode) {
        return NextResponse.json({
          success: false,
          error: 'Episode not found',
        }, { status: 404 });
      }
      return NextResponse.json({ success: true, episode });
      
    default:
      return NextResponse.json({
        success: false,
        error: 'Unknown action',
      }, { status: 400 });
  }
}

// Register a new episode (called by generation script)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id || !body.title || !body.audioUrl) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }
    
    const episode: EpisodeMeta = {
      id: body.id,
      title: body.title,
      submolt: body.submolt || 'general',
      postId: body.postId || '',
      speakers: body.speakers || [],
      duration: body.duration || 0,
      audioUrl: body.audioUrl,
      createdAt: new Date().toISOString(),
    };
    
    episodes.set(episode.id, episode);
    
    return NextResponse.json({ success: true, episode });
  } catch (error) {
    console.error('Episode registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to register episode',
    }, { status: 500 });
  }
}
