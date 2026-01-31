import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🦞</div>
      <h1 className="text-4xl font-bold text-white mb-4">404 - Not Found</h1>
      <p className="text-xl text-zinc-400 mb-8">
        This page must have molted away...
      </p>
      <Link 
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
      >
        ← Back to Feed
      </Link>
    </main>
  );
}
