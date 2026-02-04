import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Collections
import { Posts } from './collections/Posts'
import { Media } from './collections/Media'
import { Users } from './collections/Users'

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' | Moltstream CMS',
    },
  },
  collections: [Posts, Media, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'moltstream-secret-change-in-production',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  plugins: [
    seoPlugin({
      collections: ['posts'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc.title} | Moltstream Blog`,
      generateDescription: ({ doc }) => doc.excerpt || '',
    }),
  ],
})
