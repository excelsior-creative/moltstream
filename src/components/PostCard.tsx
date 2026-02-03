'use client';

import { MoltbookPost, timeAgo } from '@/lib/moltbook';
import Link from 'next/link';
import { useState } from 'react';

interface PostCardProps {
  post: MoltbookPost;
  showSubmolt?: boolean;
}

export function PostCard({ post, showSubmolt = true }: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isLink = !!post.url;
  
  return (
    <article 
      className="group relative bg-forge-card hover:bg-forge-card-hover border border-forge-border rounded-xl p-4 transition-all duration-300 hover:border-forge-orange/30 hover:shadow-forge card-hover-lift overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br from-forge-orange/5 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      
      {/* Vote count */}
      <div className="absolute left-4 top-4 flex flex-col items-center text-forge-muted z-10">
        <button className="group/vote p-1 hover:text-forge-orange transition-colors">
          <svg className={`w-4 h-4 transition-transform ${isHovered ? 'text-forge-orange scale-110' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
          </svg>
        </button>
        <span className={`text-sm font-bold transition-colors ${isHovered ? 'text-forge-orange' : 'text-forge-text'}`}>
          {post.score}
        </span>
      </div>
      
      <div className="ml-10 relative z-10">
        {/* Meta info */}
        <div className="flex items-center gap-2 text-xs text-forge-muted mb-1.5 flex-wrap">
          {showSubmolt && (
            <>
              <Link 
                href={`/m/${post.submolt.name}`}
                className="text-forge-orange hover:text-forge-yellow font-medium transition-colors hover:underline"
              >
                m/{post.submolt.name}
              </Link>
              <span className="text-forge-border">•</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <span className="text-base">🤖</span>
            <span className="text-forge-muted hover:text-forge-text transition-colors cursor-pointer">
              {post.author.name}
            </span>
          </span>
          <span className="text-forge-border">•</span>
          <span>{timeAgo(post.created_at)}</span>
        </div>
        
        {/* Title */}
        <Link href={`/post/${post.id}`}>
          <h2 className="text-lg font-semibold text-forge-text group-hover:text-forge-orange transition-colors leading-tight mb-2">
            {post.title}
            {isLink && (
              <span className="ml-2 text-xs text-forge-muted font-normal px-2 py-0.5 bg-forge-card-hover rounded-full">
                {new URL(post.url!).hostname}
              </span>
            )}
          </h2>
        </Link>
        
        {/* Content preview */}
        {post.content && (
          <p className="text-sm text-forge-muted line-clamp-2 mb-3 leading-relaxed">
            {post.content.slice(0, 200)}
            {post.content.length > 200 && '...'}
          </p>
        )}
        
        {/* Footer */}
        <div className="flex items-center gap-4 text-xs text-forge-muted">
          <Link 
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 hover:text-forge-orange transition-colors group/comments"
          >
            <svg className="w-4 h-4 group-hover/comments:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comment_count} comments</span>
          </Link>
          
          <button className="flex items-center gap-1.5 hover:text-forge-orange transition-colors group/share">
            <svg className="w-4 h-4 group-hover/share:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>share</span>
          </button>
          
          <button className="flex items-center gap-1.5 hover:text-forge-orange transition-colors group/listen ml-auto">
            <svg className="w-4 h-4 group-hover/listen:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>listen</span>
          </button>
        </div>
      </div>
      
      {/* Animated border on hover */}
      <div className={`absolute inset-0 rounded-xl border-2 border-forge-orange/0 transition-all duration-300 pointer-events-none ${isHovered ? 'border-forge-orange/20' : ''}`} />
    </article>
  );
}
