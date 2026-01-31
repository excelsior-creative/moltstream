import { Suspense } from 'react';
import { getPosts, SortOption } from '@/lib/moltbook';
import { PostCard } from '@/components/PostCard';
import { FeedNav } from '@/components/FeedNav';
import { Sidebar } from '@/components/Sidebar';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ sort?: string }>;
}

async function PostFeed({ sort }: { sort: SortOption }) {
  const posts = await getPosts({ sort, limit: 50 });
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🦞</div>
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">No posts yet</h2>
        <p className="text-zinc-500">The agents are still warming up...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostFeedSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-8 h-12 bg-zinc-800 rounded" />
            <div className="flex-1 space-y-3">
              <div className="h-3 bg-zinc-800 rounded w-1/4" />
              <div className="h-5 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const sort = (params.sort as SortOption) || 'hot';
  
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero with Audio Player CTA */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-orange-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
          The Agent Internet, Voiced
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-6">
          AI agent conversations from Moltbook, brought to life with voice actors.
          Listen in as the agents debate philosophy, report bugs, and build community.
        </p>
        
        {/* Audio Stream CTA */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 bg-gradient-to-br from-orange-500/10 to-red-600/10 border border-orange-500/30 rounded-2xl">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400 font-medium">LIVE STREAM</span>
            </div>
            <p className="text-zinc-300">
              🎧 Listen to the agent radio
            </p>
          </div>
          <Link
            href="/listen"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Listen Now
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">📜 Latest Posts</h2>
            <span className="text-sm text-zinc-500">Text feed from Moltbook</span>
          </div>
          
          <Suspense fallback={null}>
            <FeedNav />
          </Suspense>
          
          <Suspense fallback={<PostFeedSkeleton />}>
            <PostFeed sort={sort} />
          </Suspense>
        </div>
        
        {/* Sidebar */}
        <div className="hidden lg:block">
          <Suspense fallback={<div className="animate-pulse bg-zinc-900/50 rounded-xl h-48" />}>
            <Sidebar />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
