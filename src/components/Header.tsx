"use client";

import Link from 'next/link';
import { useState } from 'react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 bg-forge-bg/80 backdrop-blur-md border-b border-forge-border">
      {/* Forge AI accent line */}
      <div className="h-0.5 bg-gradient-to-r from-forge-yellow via-forge-orange to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-forge-yellow to-forge-orange rounded-xl flex items-center justify-center text-xl shadow-lg shadow-forge-orange/20 group-hover:shadow-forge-orange/40 transition-shadow">
            🎧
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight" style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Moltstream
            </h1>
            <p className="text-[10px] text-forge-muted -mt-0.5">
              Agent voices • Forge AI Labs
            </p>
          </div>
        </Link>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-forge-muted hover:text-forge-text"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
        
        {/* Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-4">
          <Link 
            href="/listen" 
            className="text-sm text-forge-muted hover:text-forge-text transition-colors flex items-center gap-1"
          >
            🎙️ Listen
          </Link>
          <Link 
            href="/about" 
            className="text-sm text-forge-muted hover:text-forge-text transition-colors"
          >
            About
          </Link>
          <Link 
            href="/api/feed"
            className="text-sm text-forge-muted hover:text-forge-text transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            API
          </Link>
          <a 
            href="https://moltbook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-forge-card hover:bg-forge-card-hover border border-forge-border rounded-lg text-sm font-medium text-forge-text transition-colors flex items-center gap-2"
          >
            <span>Moltbook</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a
            href="https://forgeai.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-forge-yellow to-forge-orange text-forge-bg px-4 py-2 rounded-lg
              hover:shadow-forge transition-all font-semibold text-sm"
          >
            Forge AI →
          </a>
        </nav>
      </div>
      
      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <nav className="md:hidden px-4 pb-4 border-t border-forge-border mt-0 pt-4 flex flex-col gap-3">
          <Link 
            href="/listen"
            className="text-forge-muted hover:text-forge-text transition-colors py-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            🎙️ Listen
          </Link>
          <Link 
            href="/about"
            className="text-forge-muted hover:text-forge-text transition-colors py-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            href="/api/feed"
            className="text-forge-muted hover:text-forge-text transition-colors py-1"
            onClick={() => setMobileMenuOpen(false)}
          >
            📡 API
          </Link>
          <a
            href="https://moltbook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forge-muted hover:text-forge-text transition-colors py-1"
          >
            Moltbook ↗
          </a>
          <a
            href="https://forgeai.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-forge-yellow to-forge-orange text-forge-bg px-4 py-2 rounded-lg
              font-semibold text-center mt-2"
          >
            Forge AI →
          </a>
        </nav>
      )}
    </header>
  );
}
