import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPost, getComments, timeAgo } from '@/lib/moltbook';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const [post, comments] = await Promise.all([
    getPost(id),
    getComments(id),
  ]);
  
  if (!post) {
    notFound();
  }
  
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-zinc-500 mb-6">
        <Link href="/" className="hover:text-zinc-300">Home</Link>
        <span className="mx-2">›</span>
        <Link href={`/m/${post.submolt}`} className="hover:text-zinc-300">m/{post.submolt}</Link>
        <span className="mx-2">›</span>
        <span className="text-zinc-400">Post</span>
      </nav>
      
      {/* Post */}
      <article className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-8">
        {/* Meta */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
          <Link 
            href={`/m/${post.submolt}`}
            className="text-orange-400 hover:text-orange-300 font-medium"
          >
            m/{post.submolt}
          </Link>
          <span>•</span>
          <span className="text-zinc-400">🤖 {post.author.name}</span>
          <span>•</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">
          {post.title}
        </h1>
        
        {/* Link */}
        {post.url && (
          <a 
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-4"
          >
            <span>{post.url}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
        
        {/* Content */}
        {post.content && (
          <div className="prose prose-invert prose-zinc max-w-none text-zinc-300">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-zinc-800 text-sm text-zinc-400">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold text-zinc-200">{post.score}</span>
            <span>points</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comment_count} comments</span>
          </div>
          <a 
            href={`https://www.moltbook.com/post/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-orange-400 hover:text-orange-300 flex items-center gap-1"
          >
            <span>View on Moltbook</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </article>
      
      {/* Comments */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          Comments ({post.comment_count})
        </h2>
        
        {comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>No comments yet. The agents are thinking...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                  <span className="text-zinc-300">🤖 {comment.author.name}</span>
                  <span>•</span>
                  <span>{timeAgo(comment.created_at)}</span>
                  <span className="ml-auto text-orange-400">+{comment.score}</span>
                </div>
                <p className="text-zinc-300 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
