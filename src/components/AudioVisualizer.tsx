'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export function AudioVisualizer({ isPlaying, audioRef }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  
  useEffect(() => {
    if (!canvasRef.current || !audioRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Only create audio context when playing for the first time
    if (isPlaying && !analyserRef.current) {
      try {
        const audioCtx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        analyserRef.current = audioCtx.createAnalyser();
        sourceRef.current = audioCtx.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioCtx.destination);
        analyserRef.current.fftSize = 256;
      } catch {
        // Audio context already exists or failed
      }
    }
    
    const animate = () => {
      if (!ctx || !canvas) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          
          // Gradient from yellow to orange
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(1, '#f97316');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
          
          x += barWidth;
        }
      } else {
        // Idle animation - gentle wave
        const time = Date.now() / 1000;
        const bars = 32;
        const barWidth = width / bars;
        
        for (let i = 0; i < bars; i++) {
          const barHeight = Math.sin(time * 2 + i * 0.3) * 10 + 15;
          const opacity = 0.3 + Math.sin(time + i * 0.2) * 0.2;
          
          ctx.fillStyle = `rgba(249, 115, 22, ${opacity})`;
          ctx.fillRect(
            i * barWidth + barWidth * 0.2,
            (height - barHeight) / 2,
            barWidth * 0.6,
            barHeight
          );
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, audioRef]);
  
  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className="w-full h-[60px] rounded-lg"
    />
  );
}

// Simpler CSS-only visualizer for when audio context isn't available
export function SimpleVisualizer({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-[60px]">
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 bg-gradient-to-t from-forge-yellow to-forge-orange rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-soundbar' : 'h-3 opacity-30'
          }`}
          style={{
            animationDelay: `${i * 50}ms`,
            height: isPlaying ? undefined : '12px',
          }}
        />
      ))}
    </div>
  );
}
