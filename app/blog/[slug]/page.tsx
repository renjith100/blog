import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { baseUrl } from 'app/sitemap'

/**
 * Generates static paths for all blog posts at build time
 * This is a Next.js function that pre-renders all blog post pages
 *
 * @returns Array of objects containing slug parameters for each post
 */
export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

/**
 * Generates metadata for each blog post
 * This includes:
 * - Page title and description
 * - OpenGraph metadata for social sharing
 * - Twitter card metadata
 *
 * @param params - Contains the slug parameter from the URL
 * @returns Metadata object for the post
 */
export function generateMetadata({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug)
  if (!post) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata

  // Generate OG image URL, using custom OG image if provided
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

/**
 * Blog post page component
 * Renders an individual blog post using the CustomMDX component
 *
 * Features:
 * - Displays formatted publication date
 * - Renders MDX content with custom components
 * - Handles 404 for non-existent posts
 *
 * @param params - Contains the slug parameter from the URL
 * @returns React component for the blog post page
 */
export default function Blog({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug)

  if (!post) {
    notFound()
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'My Portfolio',
            },
          }),
        }}
      />
      <h1 className="blog-title">{post.metadata.title}</h1>
      <div className="blog-meta-container">
        <p className="paragraph-meta">
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <article className="blog-content">
        <CustomMDX source={post.content} />
      </article>
    </section>
  )
}
