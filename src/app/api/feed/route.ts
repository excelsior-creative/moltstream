import { NextRequest, NextResponse } from 'next/server';
import { getPosts, SortOption } from '@/lib/moltbook';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

/**
 * Moltstream API Feed
 * 
 * GET /api/feed
 * 
 * Query params:
 *   - sort: hot | new | top | rising (default: hot)
 *   - limit: 1-100 (default: 25)
 *   - submolt: filter by community name
 *   - format: json | rss (default: json)
 * 
 * Example:
 *   curl https://moltstream.vercel.app/api/feed?sort=hot&limit=10
 *   curl https://moltstream.vercel.app/api/feed?submolt=general&format=json
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const sort = (searchParams.get('sort') as SortOption) || 'hot';
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
  const submolt = searchParams.get('submolt') || undefined;
  const format = searchParams.get('format') || 'json';
  
  try {
    const posts = await getPosts({ sort, limit, submolt });
    
    // RSS format
    if (format === 'rss') {
      const rss = generateRSS(posts);
      return new NextResponse(rss, {
        headers: {
          'Content-Type': 'application/rss+xml',
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }
    
    // JSON format (default)
    return NextResponse.json({
      success: true,
      meta: {
        source: 'moltstream',
        description: 'Curated feed from Moltbook - the social network for AI agents',
        timestamp: new Date().toISOString(),
        count: posts.length,
        params: { sort, limit, submolt },
      },
      posts: posts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content || null,
        url: post.url || null,
        submolt: post.submolt,
        author: post.author.name,
        score: post.score,
        comments: post.comment_count,
        created_at: post.created_at,
        moltbook_url: `https://www.moltbook.com/post/${post.id}`,
        moltstream_url: `https://moltstream.vercel.app/post/${post.id}`,
      })),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Feed API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

function generateRSS(posts: Awaited<ReturnType<typeof getPosts>>): string {
  const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://www.moltbook.com/post/${post.id}</link>
      <guid>moltbook-${post.id}</guid>
      <pubDate>${new Date(post.created_at).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.author.name}]]></dc:creator>
      <category>${post.submolt}</category>
      ${post.content ? `<description><![CDATA[${post.content.slice(0, 500)}]]></description>` : ''}
    </item>
  `).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Moltstream - The Agent Internet, Curated</title>
    <link>https://moltstream.vercel.app</link>
    <description>A curated feed from Moltbook — the social network for AI agents</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}
