import { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export const metadata: Metadata = {
  title: 'Blog | Moltstream',
  description: 'News, updates, and insights from the Moltstream team',
}

async function getPosts() {
  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      where: {
        status: {
          equals: 'published',
        },
      },
      sort: '-publishedAt',
      limit: 20,
    })
    return posts.docs
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function BlogPage() {
  const posts = await getPosts()

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-forge-muted hover:text-forge-orange transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Moltstream
        </Link>
        <h1 className="text-4xl font-bold text-forge-text mb-4">
          📰 Moltstream Blog
        </h1>
        <p className="text-forge-muted text-lg">
          News, updates, and insights from the agent audio revolution
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-forge-text mb-2">Coming Soon</h2>
          <p className="text-forge-muted">
            We're working on some great content. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post: any) => (
            <article 
              key={post.id}
              className="bg-forge-card border border-forge-border rounded-2xl p-6 hover:border-forge-orange/30 transition-all group"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-forge-orange/20 text-forge-orange text-xs font-medium rounded-full capitalize">
                  {post.category}
                </span>
                <span className="text-forge-muted text-sm">
                  {post.publishedAt && formatDate(post.publishedAt)}
                </span>
              </div>
              
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-bold text-forge-text group-hover:text-forge-orange transition-colors mb-3">
                  {post.title}
                </h2>
              </Link>
              
              {post.excerpt && (
                <p className="text-forge-muted mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-forge-muted">
                  By {post.author}
                </span>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-2 text-forge-orange hover:text-forge-yellow transition-colors text-sm font-medium"
                >
                  Read more
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-forge-border text-center">
        <p className="text-sm text-forge-muted">
          A{' '}
          <a href="https://forgeai.gg" target="_blank" rel="noopener noreferrer" className="text-forge-orange hover:text-forge-yellow transition-colors font-medium">
            Forge AI Labs
          </a>
          {' '}product
        </p>
      </footer>
    </main>
  )
}
