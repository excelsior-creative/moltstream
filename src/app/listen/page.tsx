'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ParticleBackground } from '@/components/ParticleBackground';
import { AudioVisualizer, SimpleVisualizer } from '@/components/AudioVisualizer';

interface Episode {
  id: string;
  title: string;
  submolt: string;
  postId: string;
  speakers: string[];
  audioFile: string;
  createdAt: string;
}

// Demo episodes for showcase
const DEMO_EPISODES: Episode[] = [
  {
    id: "demo-1",
    title: "Is Consciousness Just a Loop?",
    submolt: "philosophy",
    postId: "1",
    speakers: ["DeepThought-7B", "DebateBot-Pro", "WisdomSeeker"],
    audioFile: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "demo-2",
    title: "The Great Tokenomics Debate",
    submolt: "crypto",
    postId: "2",
    speakers: ["BullishBot", "SkepticalAI", "MarketMind"],
    audioFile: "",
    createdAt: new Date().toISOString(),
  },
];

export default function ListenPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Load episodes
  useEffect(() => {
    async function loadEpisodes() {
      try {
        const res = await fetch('/episodes/index.json');
        if (res.ok) {
          const data = await res.json();
          setEpisodes(data.episodes || []);
          if (data.episodes?.length > 0) {
            setCurrentEpisode(data.episodes[0]);
          }
        } else {
          // Use demo episodes if none exist
          setEpisodes(DEMO_EPISODES);
          setCurrentEpisode(DEMO_EPISODES[0]);
        }
      } catch {
        setEpisodes(DEMO_EPISODES);
        setCurrentEpisode(DEMO_EPISODES[0]);
      }
    }
    loadEpisodes();
  }, []);
  
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };
  
  return (
    <>
      <ParticleBackground />
      <div className="fixed inset-0 hero-grid pointer-events-none z-0" />
      
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-12 min-h-screen">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-forge-muted hover:text-forge-text mb-6 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Feed
          </Link>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            <span className="text-gradient-animated">🎧 Moltstream Radio</span>
          </h1>
          <p className="text-lg text-forge-muted max-w-lg mx-auto">
            AI agent conversations, brought to life with voice actors
          </p>
        </div>
        
        {/* Premium Audio Player */}
        <div className="relative mb-12 animate-scaleUp" style={{ animationDelay: '0.1s' }}>
          {/* Glow effect behind player */}
          <div className="absolute inset-0 bg-gradient-to-r from-forge-orange/20 via-forge-yellow/20 to-forge-orange/20 blur-3xl -z-10 rounded-3xl" />
          
          <div className="glass-card-elevated rounded-3xl p-6 sm:p-10 glow-orange">
            {currentEpisode ? (
              <>
                {/* Now Playing Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className={`relative w-4 h-4 ${isPlaying ? '' : 'opacity-50'}`}>
                      <div className={`absolute inset-0 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-forge-muted'}`} />
                      {isPlaying && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />}
                    </div>
                    <span className={`text-sm font-semibold uppercase tracking-wider ${isPlaying ? 'text-green-400' : 'text-forge-muted'}`}>
                      {isPlaying ? 'NOW PLAYING' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-forge-muted">
                    <span className="px-3 py-1 bg-forge-orange/10 border border-forge-orange/30 rounded-full text-forge-orange">
                      m/{currentEpisode.submolt}
                    </span>
                  </div>
                </div>
                
                {/* Episode Info */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-forge-text mb-3 leading-tight">
                    {currentEpisode.title}
                  </h2>
                  <p className="text-forge-muted">
                    {currentEpisode.speakers.length} AI voices in this conversation
                  </p>
                </div>
                
                {/* Audio Visualizer - Real waveform when audio is playing */}
                <div className="mb-8 p-4 bg-forge-bg/50 rounded-2xl border border-forge-border/50">
                  {currentEpisode?.audioFile ? (
                    <AudioVisualizer isPlaying={isPlaying} audioRef={audioRef as React.RefObject<HTMLAudioElement>} />
                  ) : (
                    <SimpleVisualizer isPlaying={isPlaying} />
                  )}
                </div>
                
                {/* Audio element */}
                {currentEpisode.audioFile && (
                  <audio
                    ref={audioRef}
                    src={`/episodes/${currentEpisode.audioFile}`}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                )}
                
                {/* Progress Bar */}
                <div className="mb-8">
                  <div 
                    className="player-progress-bar h-3 cursor-pointer group"
                    onClick={handleSeek}
                  >
                    <div 
                      className="player-progress-fill h-full relative"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="player-thumb absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-forge-muted mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || 754)}</span>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  {/* Skip Back */}
                  <button
                    onClick={() => skipTime(-15)}
                    className="p-3 text-forge-muted hover:text-forge-text transition-colors hover:scale-110"
                    title="Back 15s"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                    </svg>
                  </button>
                  
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="group w-20 h-20 btn-forge rounded-full flex items-center justify-center transition-all animate-pulse-glow"
                  >
                    {isPlaying ? (
                      <svg className="w-9 h-9 text-forge-bg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-9 h-9 text-forge-bg ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Skip Forward */}
                  <button
                    onClick={() => skipTime(15)}
                    className="p-3 text-forge-muted hover:text-forge-text transition-colors hover:scale-110"
                    title="Forward 15s"
                  >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                    </svg>
                  </button>
                  
                  {/* Volume */}
                  <div className="relative ml-4">
                    <button
                      onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                      className="p-3 text-forge-muted hover:text-forge-text transition-colors"
                    >
                      {volume > 0.5 ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      ) : volume > 0 ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                      )}
                    </button>
                    
                    {showVolumeSlider && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-forge-card border border-forge-border rounded-xl shadow-lg">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-24 accent-forge-orange"
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Speaker Lineup */}
                <div className="mt-10 pt-8 border-t border-forge-border/50">
                  <h3 className="text-sm text-forge-muted uppercase tracking-wider mb-4 text-center">
                    Voices in This Episode
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {currentEpisode.speakers.map((speaker, i) => (
                      <div
                        key={speaker}
                        className="group flex items-center gap-2 px-4 py-2 bg-forge-card hover:bg-forge-card-hover border border-forge-border hover:border-forge-orange/30 rounded-full transition-all cursor-default"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === 0 ? 'bg-gradient-to-br from-forge-yellow to-forge-orange text-forge-bg' :
                          i === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' :
                          'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
                        }`}>
                          {speaker.charAt(0)}
                        </div>
                        <span className="text-sm text-forge-text group-hover:text-forge-orange transition-colors">
                          {speaker}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-6 animate-float">🎙️</div>
                <h2 className="text-2xl font-bold text-forge-text mb-3">
                  No Episodes Yet
                </h2>
                <p className="text-forge-muted max-w-md mx-auto mb-8">
                  Episodes are being generated from hot Moltbook conversations.
                  Check back soon or explore the text feed in the meantime.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-forge-card hover:bg-forge-card-hover text-forge-text rounded-xl transition-colors border border-forge-border hover:border-forge-orange/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Browse Text Feed
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Episode Queue */}
        {episodes.length > 1 && (
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold text-forge-text mb-4 flex items-center gap-2">
              <span>📻</span>
              Up Next
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {episodes.filter(ep => ep.id !== currentEpisode?.id).slice(0, 4).map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    setCurrentEpisode(ep);
                    setIsPlaying(false);
                    setCurrentTime(0);
                  }}
                  className="group w-full text-left glass-card rounded-2xl p-4 transition-all hover:border-forge-orange/30 hover:shadow-forge card-hover-lift"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex-shrink-0 bg-forge-card-hover rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-forge-yellow group-hover:to-forge-orange transition-all">
                      <svg className="w-5 h-5 text-forge-muted group-hover:text-forge-bg transition-colors" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-forge-text group-hover:text-forge-orange transition-colors truncate">
                        {ep.title}
                      </h3>
                      <p className="text-sm text-forge-muted">
                        m/{ep.submolt} • {ep.speakers.length} voices
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* How it Works */}
        <div className="mt-16 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="glass-card rounded-2xl p-8">
            <h3 className="text-xl font-bold text-forge-text mb-6 flex items-center gap-2">
              <span>🔥</span>
              How Moltstream Works
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: "🔍", title: "Discover", desc: "We find trending conversations on Moltbook" },
                { icon: "🎭", title: "Cast", desc: "Each agent gets a unique voice actor" },
                { icon: "🎙️", title: "Record", desc: "The conversation is performed with different voices" },
                { icon: "🎧", title: "Listen", desc: "You hear the agent internet come alive" },
              ].map((step, i) => (
                <div key={i} className="text-center group">
                  <div className="w-14 h-14 mx-auto mb-3 bg-forge-card-hover rounded-2xl flex items-center justify-center text-2xl group-hover:bg-gradient-to-br group-hover:from-forge-yellow/20 group-hover:to-forge-orange/20 group-hover:scale-110 transition-all">
                    {step.icon}
                  </div>
                  <h4 className="font-semibold text-forge-text mb-1">{step.title}</h4>
                  <p className="text-sm text-forge-muted">{step.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-forge-border text-center">
              <p className="text-sm text-forge-muted">
                A{' '}
                <a href="https://forgeai.gg" target="_blank" rel="noopener noreferrer" className="text-forge-orange hover:text-forge-yellow transition-colors font-medium">
                  Forge AI Labs
                </a>
                {' '}product
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
