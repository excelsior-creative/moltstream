'use client';

interface LogoProps {
  className?: string;
  size?: number;
}

// Lobster/crayfish icon with audio waveform - represents Moltstream (molting + streaming)
export function MoltstreamLogo({ className = '', size = 36 }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      width={size}
      height={size}
      fill="none"
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id="lobster-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="url(#lobster-gradient)" />
      
      {/* Lobster body - simplified stylized version */}
      <g fill="#1a1a1a">
        {/* Main body/tail */}
        <ellipse cx="50" cy="55" rx="18" ry="24" />
        
        {/* Head */}
        <circle cx="50" cy="28" r="14" />
        
        {/* Claws - left */}
        <path d="M25 35 Q15 30 12 38 Q10 45 18 48 Q22 50 28 45 Q32 40 28 36 Z" />
        <path d="M28 45 Q24 52 30 55 L34 50 Q30 48 28 45 Z" />
        
        {/* Claws - right */}
        <path d="M75 35 Q85 30 88 38 Q90 45 82 48 Q78 50 72 45 Q68 40 72 36 Z" />
        <path d="M72 45 Q76 52 70 55 L66 50 Q70 48 72 45 Z" />
        
        {/* Antennae */}
        <path d="M42 18 Q38 8 32 5" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M58 18 Q62 8 68 5" stroke="#1a1a1a" strokeWidth="3" fill="none" strokeLinecap="round" />
        
        {/* Eyes */}
        <circle cx="44" cy="26" r="3" fill="#f59e0b" />
        <circle cx="56" cy="26" r="3" fill="#f59e0b" />
        
        {/* Tail segments */}
        <path d="M35 65 Q50 62 65 65" stroke="#f59e0b" strokeWidth="2" fill="none" />
        <path d="M36 72 Q50 69 64 72" stroke="#f59e0b" strokeWidth="2" fill="none" />
        <path d="M38 79 Q50 76 62 79" stroke="#f59e0b" strokeWidth="2" fill="none" />
        
        {/* Tail fan */}
        <path d="M40 85 L50 95 L60 85 Q50 88 40 85 Z" />
      </g>
      
      {/* Audio wave bars overlaid on tail */}
      <g fill="url(#wave-gradient)" opacity="0.9">
        <rect x="42" y="60" width="3" height="12" rx="1.5" />
        <rect x="48.5" y="55" width="3" height="20" rx="1.5" />
        <rect x="55" y="58" width="3" height="14" rx="1.5" />
      </g>
    </svg>
  );
}

// Simple icon version for favicon
export function MoltstreamIcon({ size = 32 }: { size?: number }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      width={size}
      height={size}
    >
      <defs>
        <linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#icon-gradient)" />
      <g fill="#1a1a1a">
        <ellipse cx="50" cy="55" rx="16" ry="22" />
        <circle cx="50" cy="30" r="12" />
        <path d="M28 38 Q18 34 16 42 Q18 48 26 46 L30 42 Z" />
        <path d="M72 38 Q82 34 84 42 Q82 48 74 46 L70 42 Z" />
        <circle cx="45" cy="28" r="2.5" fill="#f59e0b" />
        <circle cx="55" cy="28" r="2.5" fill="#f59e0b" />
      </g>
      <g fill="#fbbf24" opacity="0.9">
        <rect x="43" y="58" width="3" height="10" rx="1.5" />
        <rect x="48.5" y="54" width="3" height="16" rx="1.5" />
        <rect x="54" y="56" width="3" height="12" rx="1.5" />
      </g>
    </svg>
  );
}
