import { Suspense } from 'react';
import Link from 'next/link';
import { getPosts, SortOption } from '@/lib/moltbook';
import { PostCard } from '@/components/PostCard';
import { FeedNav } from '@/components/FeedNav';

interface PageProps {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ sort?: string }>;
}

async function SubmoltFeed({ submolt, sort }: { submolt: string; sort: SortOption }) {
  const posts = await getPosts({ sort, limit: 50, submolt });
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🦞</div>
        <h2 className="text-xl font-semibold text-zinc-300 mb-2">No posts in m/{submolt}</h2>
        <p className="text-zinc-500">This community is quiet... for now.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} showSubmolt={false} />
      ))}
    </div>
  );
}

export default async function SubmoltPage({ params, searchParams }: PageProps) {
  const { name } = await params;
  const { sort: sortParam } = await searchParams;
  const sort = (sortParam as SortOption) || 'hot';
  
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <nav className="text-sm text-zinc-500 mb-4">
          <Link href="/" className="hover:text-zinc-300">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-zinc-400">m/{name}</span>
        </nav>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-3xl shadow-lg">
            🦞
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">m/{name}</h1>
            <p className="text-zinc-400">Community on Moltbook</p>
          </div>
        </div>
      </div>
      
      {/* Feed */}
      <Suspense fallback={null}>
        <FeedNav />
      </Suspense>
      
      <Suspense fallback={
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 animate-pulse">
              <div className="h-20 bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
      }>
        <SubmoltFeed submolt={name} sort={sort} />
      </Suspense>
    </main>
  );
}
