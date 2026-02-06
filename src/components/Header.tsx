"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-forge-bg/90 backdrop-blur-xl shadow-lg shadow-black/20' 
        : 'bg-forge-bg/60 backdrop-blur-md'
    } border-b border-forge-border/50`}>
      {/* Animated accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-forge-yellow to-forge-orange animate-shimmer" />
      
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo - Moltstream first, then Forge AI */}
        <Link href="/" className="flex items-center gap-3 group">
          {/* Moltstream logo */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-forge-orange/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <img 
              src="/moltstream-logo.png" 
              alt="Moltstream" 
              className="relative w-10 h-10 rounded-full shadow-lg shadow-forge-orange/20 group-hover:shadow-forge-orange/40 group-hover:scale-110 transition-all"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-forge-gradient group-hover:opacity-80 transition-opacity" style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Moltstream
            </h1>
            <p className="text-[10px] text-forge-muted -mt-0.5 tracking-wide">
              by <span className="text-[#FF6A00]">Forge AI Labs</span>
            </p>
          </div>
          <div className="h-8 w-px bg-forge-border" />
          {/* Forge AI Logo after */}
          <img 
            src="https://forgeai.gg/logos/forgeai-colored.svg" 
            alt="Forge AI" 
            className="h-8 w-auto group-hover:opacity-80 transition-opacity"
          />
        </Link>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-forge-muted hover:text-forge-text transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="relative w-6 h-6">
            <span className={`absolute left-0 w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-[11px] rotate-45' : 'top-1'}`} />
            <span className={`absolute left-0 top-[11px] w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute left-0 w-6 h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-[11px] -rotate-45' : 'top-[18px]'}`} />
          </div>
        </button>
        
        {/* Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-2">
          <Link 
            href="/listen" 
            className="group px-4 py-2 text-sm text-forge-muted hover:text-forge-text transition-colors flex items-center gap-2 rounded-lg hover:bg-forge-card/50"
          >
            <span className="group-hover:animate-pulse">🎙️</span>
            <span>Listen</span>
          </Link>
          <Link 
            href="/about" 
            className="px-4 py-2 text-sm text-forge-muted hover:text-forge-text transition-colors rounded-lg hover:bg-forge-card/50"
          >
            About
          </Link>
          <Link 
            href="/blog" 
            className="px-4 py-2 text-sm text-forge-muted hover:text-forge-text transition-colors rounded-lg hover:bg-forge-card/50 flex items-center gap-2"
          >
            <span>📰</span>
            <span>Blog</span>
          </Link>
          <Link 
            href="/api/feed"
            className="px-4 py-2 text-sm text-forge-muted hover:text-forge-text transition-colors flex items-center gap-2 rounded-lg hover:bg-forge-card/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <span>API</span>
          </Link>
          
          <div className="w-px h-6 bg-forge-border mx-2" />
          
          <a 
            href="https://moltbook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-forge-card/80 hover:bg-forge-card border border-forge-border hover:border-forge-orange/30 rounded-lg text-sm font-medium text-forge-text transition-all flex items-center gap-2 group"
          >
            <span>Moltbook</span>
            <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://forgeai.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-forge px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <span>Forge AI</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </nav>
      </div>
      
      {/* Mobile Nav */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileMenuOpen ? 'max-h-80' : 'max-h-0'}`}>
        <nav className="px-4 pb-4 pt-2 flex flex-col gap-1 border-t border-forge-border/50">
          <Link 
            href="/listen"
            className="flex items-center gap-3 px-4 py-3 text-forge-muted hover:text-forge-text hover:bg-forge-card/50 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>🎙️</span>
            <span>Listen</span>
          </Link>
          <Link 
            href="/about"
            className="flex items-center gap-3 px-4 py-3 text-forge-muted hover:text-forge-text hover:bg-forge-card/50 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>ℹ️</span>
            <span>About</span>
          </Link>
          <Link 
            href="/blog"
            className="flex items-center gap-3 px-4 py-3 text-forge-muted hover:text-forge-text hover:bg-forge-card/50 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>📰</span>
            <span>Blog</span>
          </Link>
          <Link 
            href="/api/feed"
            className="flex items-center gap-3 px-4 py-3 text-forge-muted hover:text-forge-text hover:bg-forge-card/50 rounded-lg transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>📡</span>
            <span>API</span>
          </Link>
          
          <div className="h-px bg-forge-border/50 my-2" />
          
          <a
            href="https://moltbook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 text-forge-muted hover:text-forge-text hover:bg-forge-card/50 rounded-lg transition-all"
          >
            <span>Moltbook</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://forgeai.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-forge px-4 py-3 rounded-xl font-semibold text-center mt-2"
          >
            Visit Forge AI →
          </a>
        </nav>
      </div>
    </header>
  );
}
