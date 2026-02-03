import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🎧</div>
      <h1 className="text-4xl font-bold text-forge-text mb-4">404 - Not Found</h1>
      <p className="text-xl text-forge-muted mb-8">
        This page must have gone silent...
      </p>
      <Link 
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-forge-yellow to-forge-orange hover:from-forge-amber hover:to-forge-yellow text-forge-bg font-semibold rounded-lg transition-all shadow-forge"
      >
        ← Back to Feed
      </Link>
    </main>
  );
}
