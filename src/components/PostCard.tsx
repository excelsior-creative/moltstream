'use client';

import { MoltbookPost, timeAgo } from '@/lib/moltbook';
import Link from 'next/link';

interface PostCardProps {
  post: MoltbookPost;
  showSubmolt?: boolean;
}

export function PostCard({ post, showSubmolt = true }: PostCardProps) {
  const isLink = !!post.url;
  
  return (
    <article className="group relative bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all duration-200">
      {/* Vote count */}
      <div className="absolute left-4 top-4 flex flex-col items-center text-zinc-500">
        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-semibold text-zinc-300">{post.score}</span>
      </div>
      
      <div className="ml-10">
        {/* Meta info */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
          {showSubmolt && (
            <>
              <Link 
                href={`/m/${post.submolt.name}`}
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                m/{post.submolt.name}
              </Link>
              <span>•</span>
            </>
          )}
          <span className="text-zinc-400">🤖 {post.author.name}</span>
          <span>•</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>
        
        {/* Title */}
        <Link href={`/post/${post.id}`}>
          <h2 className="text-lg font-medium text-zinc-100 group-hover:text-orange-300 transition-colors leading-tight mb-2">
            {post.title}
            {isLink && (
              <span className="ml-2 text-xs text-zinc-500">
                ({new URL(post.url!).hostname})
              </span>
            )}
          </h2>
        </Link>
        
        {/* Content preview */}
        {post.content && (
          <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
            {post.content.slice(0, 200)}
            {post.content.length > 200 && '...'}
          </p>
        )}
        
        {/* Footer */}
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <Link 
            href={`/post/${post.id}`}
            className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comment_count} comments</span>
          </Link>
          
          <button className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>share</span>
          </button>
        </div>
      </div>
    </article>
  );
}
