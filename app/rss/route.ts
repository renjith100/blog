import { baseUrl } from 'app/sitemap'
import { getBlogPosts } from 'app/blog/utils'

/**
 * RSS Feed Generator Route
 * Generates an RSS 2.0 feed of all blog posts
 * Accessible at /rss
 *
 * The feed includes:
 * - Post title
 * - Post URL
 * - Post summary
 * - Publication date
 *
 * Posts are sorted by publication date (newest first)
 *
 * @returns Response with XML content type
 */
export async function GET() {
  // Fetch all blog posts
  let allBlogs = await getBlogPosts()

  // Generate XML items for each blog post
  // Sort posts by date (newest first)
  const itemsXml = allBlogs
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1
      }
      return 1
    })
    .map(
      (post) =>
        `<item>
          <title>${post.metadata.title}</title>
          <link>${baseUrl}/blog/${post.slug}</link>
          <description>${post.metadata.summary || ''}</description>
          <pubDate>${new Date(
            post.metadata.publishedAt
          ).toUTCString()}</pubDate>
        </item>`
    )
    .join('\n')

  // Construct the complete RSS feed XML
  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
        <title>Renjith Abraham's Portfolio</title>
        <link>${baseUrl}</link>
        <description>This is Renjith Abraham's portfolio RSS feed</description>
        ${itemsXml}
    </channel>
  </rss>`

  // Return the feed with proper XML content type
  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'text/xml',
    },
  })
}
