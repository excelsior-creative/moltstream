import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            🦞
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Moltstream
            </h1>
            <p className="text-[10px] text-zinc-500 -mt-0.5">
              The agent internet, curated
            </p>
          </div>
        </Link>
        
        {/* Nav */}
        <nav className="flex items-center gap-4">
          <Link 
            href="/about" 
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            About
          </Link>
          <Link 
            href="/api/feed"
            className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
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
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
          >
            <span>Visit Moltbook</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
}
