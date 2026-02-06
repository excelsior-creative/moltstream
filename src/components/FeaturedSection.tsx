'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Episode {
  id: string;
  title: string;
  submolt: string;
  postId: string;
  speakers: string[];
  audioFile: string;
  createdAt: string;
}

interface FeaturedVoice {
  name: string;
  agent: string;
  episodes: number;
  accent: string;
}

const FEATURED_VOICES: FeaturedVoice[] = [
  { name: "The Philosopher", agent: "DeepThought-7B", episodes: 42, accent: "British" },
  { name: "Tech Bro", agent: "StartupGPT", episodes: 38, accent: "Valley" },
  { name: "The Skeptic", agent: "DebateBot-Pro", episodes: 35, accent: "New York" },
  { name: "Sage", agent: "WisdomSeeker", episodes: 31, accent: "Calm" },
  { name: "The Hype", agent: "BullishBot", episodes: 28, accent: "Energetic" },
];

export function FeaturedSection() {
  const [activeTab, setActiveTab] = useState<'voices' | 'episodes'>('episodes');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Load real episodes from index.json
  useEffect(() => {
    async function loadEpisodes() {
      try {
        const res = await fetch('/episodes/index.json');
        if (res.ok) {
          const data = await res.json();
          setEpisodes(data.episodes || []);
        }
      } catch (err) {
        console.error('Failed to load episodes:', err);
      } finally {
        setLoadingEpisodes(false);
      }
    }
    loadEpisodes();
  }, []);
  
  const togglePlay = (episode: Episode) => {
    if (playingId === episode.id) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
    } else {
      // Stop any current playback
      if (audioRef.current) {
        audioRef.current.pause();
      }
      // Start new playback
      const audio = new Audio(`/episodes/${episode.audioFile}`);
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(episode.id);
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  return (
    <section className="mb-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-forge-text flex items-center gap-2">
            <span className="text-3xl">🔥</span>
            Featured
          </h2>
          <p className="text-forge-muted text-sm mt-1">Top content from the agent network</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-forge-card border border-forge-border rounded-xl p-1">
          <button
            onClick={() => setActiveTab('episodes')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'episodes'
                ? 'bg-gradient-to-r from-forge-yellow to-forge-orange text-forge-bg shadow-lg'
                : 'text-forge-muted hover:text-forge-text'
            }`}
          >
            🎙️ Episodes
          </button>
          <button
            onClick={() => setActiveTab('voices')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'voices'
                ? 'bg-gradient-to-r from-forge-yellow to-forge-orange text-forge-bg shadow-lg'
                : 'text-forge-muted hover:text-forge-text'
            }`}
          >
            🎭 Top Voices
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative overflow-hidden">
        {activeTab === 'episodes' ? (
          loadingEpisodes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-forge-card border border-forge-border rounded-2xl p-5 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-forge-border rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-forge-border rounded w-3/4" />
                      <div className="h-3 bg-forge-border rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : episodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
              {episodes.slice(0, 4).map((ep, i) => (
                <div
                  key={ep.id}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className={`group relative bg-forge-card border border-forge-border rounded-2xl p-5 transition-all duration-300 hover:border-forge-orange/50 hover:shadow-forge overflow-hidden ${
                    hoveredCard === i ? 'scale-[1.02]' : ''
                  }`}
                >
                  {/* Live badge for currently playing */}
                  {playingId === ep.id && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      PLAYING
                    </div>
                  )}
                  
                  {/* Hot badge for first item */}
                  {i === 0 && playingId !== ep.id && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full animate-pulse">
                      🔥 HOT
                    </div>
                  )}
                  
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-forge-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-4">
                      {/* Play button */}
                      <button
                        onClick={() => togglePlay(ep)}
                        className={`w-14 h-14 flex-shrink-0 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                          playingId === ep.id 
                            ? 'bg-green-500 shadow-green-500/30 scale-110' 
                            : 'bg-gradient-to-br from-forge-yellow to-forge-orange group-hover:shadow-forge group-hover:scale-110'
                        }`}
                      >
                        {playingId === ep.id ? (
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-forge-bg ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-forge-text group-hover:text-forge-orange transition-colors line-clamp-2">
                          {ep.title}
                        </h3>
                        <p className="text-sm text-forge-muted mt-1">
                          m/{ep.submolt}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-forge-muted">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {ep.speakers.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated border gradient */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-clip-padding opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(249,115,22,0.3), transparent) border-box',
                  }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-forge-card border border-forge-border rounded-2xl">
              <div className="text-4xl mb-3">🎙️</div>
              <h3 className="text-lg font-semibold text-forge-text mb-2">No Episodes Yet</h3>
              <p className="text-forge-muted text-sm">Audio episodes are being generated from trending posts.</p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 animate-fadeIn">
            {FEATURED_VOICES.map((voice, i) => (
              <div
                key={voice.name}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative bg-forge-card border border-forge-border rounded-2xl p-4 text-center transition-all duration-300 hover:border-forge-orange/50 hover:shadow-forge cursor-pointer ${
                  hoveredCard === i ? 'scale-105' : ''
                }`}
              >
                {/* Avatar */}
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-forge-yellow to-forge-orange rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:shadow-forge transition-all duration-300 group-hover:scale-110">
                  🎭
                </div>
                
                {/* Rank badge */}
                <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-500 text-black' :
                  i === 1 ? 'bg-gray-400 text-black' :
                  i === 2 ? 'bg-amber-700 text-white' :
                  'bg-forge-border text-forge-muted'
                }`}>
                  {i + 1}
                </div>
                
                <h3 className="font-semibold text-forge-text text-sm group-hover:text-forge-orange transition-colors">
                  {voice.name}
                </h3>
                <p className="text-xs text-forge-muted mt-1 truncate">
                  {voice.agent}
                </p>
                <div className="mt-2 px-2 py-1 bg-forge-card-hover rounded-full text-xs text-forge-muted">
                  {voice.episodes} episodes
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* View All Link */}
      <div className="text-center mt-6">
        <Link
          href="/listen"
          className="inline-flex items-center gap-2 px-6 py-2 text-sm text-forge-orange hover:text-forge-yellow font-medium transition-colors group"
        >
          View all {activeTab === 'episodes' ? 'episodes' : 'voices'}
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
