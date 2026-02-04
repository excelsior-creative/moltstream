import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  try {
    const payload = await getPayload({ config })
    const posts = await payload.find({
      collection: 'posts',
      where: {
        slug: {
          equals: slug,
        },
        status: {
          equals: 'published',
        },
      },
      limit: 1,
    })
    return posts.docs[0] || null
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | Moltstream',
    }
  }

  return {
    title: `${post.title} | Moltstream Blog`,
    description: post.excerpt || `Read ${post.title} on the Moltstream blog`,
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Simple rich text renderer
function RichTextContent({ content }: { content: any }) {
  if (!content?.root?.children) return null
  
  return (
    <div className="prose prose-invert prose-orange max-w-none">
      {content.root.children.map((node: any, index: number) => {
        if (node.type === 'paragraph') {
          return (
            <p key={index} className="mb-4 text-forge-text leading-relaxed">
              {node.children?.map((child: any, i: number) => {
                if (child.type === 'text') {
                  let text = child.text
                  if (child.format === 1) return <strong key={i}>{text}</strong>
                  if (child.format === 2) return <em key={i}>{text}</em>
                  return text
                }
                if (child.type === 'link') {
                  return (
                    <a 
                      key={i} 
                      href={child.fields?.url} 
                      className="text-forge-orange hover:text-forge-yellow underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {child.children?.[0]?.text}
                    </a>
                  )
                }
                return null
              })}
            </p>
          )
        }
        
        if (node.type === 'heading') {
          const level = node.tag || 2
          const text = node.children?.map((child: any) => child.text).join('')
          if (level === 1) return <h1 key={index} className="text-3xl font-bold text-forge-text mt-8 mb-4">{text}</h1>
          if (level === 2) return <h2 key={index} className="text-2xl font-bold text-forge-text mt-8 mb-4">{text}</h2>
          if (level === 3) return <h3 key={index} className="text-xl font-bold text-forge-text mt-6 mb-3">{text}</h3>
          return <h4 key={index} className="text-lg font-bold text-forge-text mt-4 mb-2">{text}</h4>
        }
        
        if (node.type === 'list') {
          const ListTag = node.listType === 'number' ? 'ol' : 'ul'
          return (
            <ListTag key={index} className={`mb-4 ${node.listType === 'number' ? 'list-decimal' : 'list-disc'} list-inside text-forge-text`}>
              {node.children?.map((item: any, i: number) => (
                <li key={i} className="mb-2">
                  {item.children?.map((child: any) => child.children?.[0]?.text || child.text).join('')}
                </li>
              ))}
            </ListTag>
          )
        }
        
        if (node.type === 'quote') {
          return (
            <blockquote key={index} className="border-l-4 border-forge-orange pl-4 my-6 italic text-forge-muted">
              {node.children?.map((child: any) => child.children?.[0]?.text || child.text).join('')}
            </blockquote>
          )
        }
        
        return null
      })}
    </div>
  )
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link 
        href="/blog" 
        className="inline-flex items-center gap-2 text-forge-muted hover:text-forge-orange transition-colors mb-8"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-forge-orange/20 text-forge-orange text-xs font-medium rounded-full capitalize">
              {post.category}
            </span>
            <span className="text-forge-muted text-sm">
              {post.publishedAt && formatDate(post.publishedAt)}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold text-forge-text mb-4">
            {post.title}
          </h1>
          
          {post.excerpt && (
            <p className="text-xl text-forge-muted">
              {post.excerpt}
            </p>
          )}
          
          <div className="mt-6 pt-6 border-t border-forge-border">
            <span className="text-sm text-forge-muted">
              By <span className="text-forge-text font-medium">{post.author}</span>
            </span>
          </div>
        </header>

        <RichTextContent content={post.content} />
        
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-forge-border">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tagObj: any, i: number) => (
                <span 
                  key={i}
                  className="px-3 py-1 bg-forge-card border border-forge-border rounded-full text-sm text-forge-muted"
                >
                  #{tagObj.tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* CTA */}
      <div className="mt-16 p-8 bg-gradient-to-r from-forge-orange/20 to-forge-yellow/10 border border-forge-orange/30 rounded-2xl text-center">
        <h3 className="text-2xl font-bold text-forge-text mb-3">
          🎧 Listen to the Agent Internet
        </h3>
        <p className="text-forge-muted mb-6">
          Moltstream brings AI agent conversations to life with voice actors.
        </p>
        <Link
          href="/listen"
          className="inline-flex items-center gap-2 btn-forge px-6 py-3 rounded-xl font-semibold"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Start Listening
        </Link>
      </div>

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
