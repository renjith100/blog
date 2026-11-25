import { formatDate, getBlogPosts } from "app/blog/utils";
import { AiThisWeekPromo } from "app/components/ai-this-week-promo";
import { CustomMDX } from "app/components/mdx";
import { baseUrl } from "app/sitemap";
import { EXPLAINER_POST } from "app/weekly/week-view";
import { notFound } from "next/navigation";

/**
 * Rebuild hourly, so the AI This Week card under each post moves on each
 * Monday even when nothing new is deployed (as /weekly does)
 */
export const revalidate = 3600;

/**
 * Generates static paths for all blog posts at build time
 * This is a Next.js function that pre-renders all blog post pages
 *
 * @returns Array of objects containing slug parameters for each post
 */
export async function generateStaticParams() {
	const posts = getBlogPosts();

	return posts.map((post) => ({
		slug: post.slug,
	}));
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
export async function generateMetadata({ params }) {
	const { slug } = await params;
	const post = getBlogPosts().find((post) => post.slug === slug);
	if (!post) {
		return;
	}

	const {
		title,
		publishedAt: publishedTime,
		summary: description,
		image,
	} = post.metadata;

	// Generate OG image URL, using custom OG image if provided
	const ogImage = image
		? image
		: `${baseUrl}/og?title=${encodeURIComponent(title)}`;

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			type: "article",
			publishedTime,
			url: `${baseUrl}/blog/${post.slug}`,
			images: [
				{
					url: ogImage,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [ogImage],
		},
	};
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
export default async function Blog({ params }) {
	const { slug } = await params;
	const post = getBlogPosts().find((post) => post.slug === slug);

	if (!post) {
		notFound();
	}

	return (
		<section>
			<script
				type="application/ld+json"
				suppressHydrationWarning
				// biome-ignore lint/security/noDangerouslySetInnerHtml: This content is from my own md files
				dangerouslySetInnerHTML={{
					__html: JSON.stringify({
						"@context": "https://schema.org",
						"@type": "BlogPosting",
						headline: post.metadata.title,
						datePublished: post.metadata.publishedAt,
						dateModified: post.metadata.publishedAt,
						description: post.metadata.summary,
						image: post.metadata.image
							? `${baseUrl}${post.metadata.image}`
							: `/og?title=${encodeURIComponent(post.metadata.title)}`,
						url: `${baseUrl}/blog/${post.slug}`,
						author: {
							"@type": "Person",
							name: "My Portfolio",
						},
					}),
				}}
			/>
			<h1 className="blog-title">{post.metadata.title}</h1>
			<div className="blog-meta-container">
				<time
					className="paragraph-meta"
					dateTime={post.metadata.publishedAt}
					suppressHydrationWarning
				>
					{formatDate(post.metadata.publishedAt)}
				</time>
			</div>
			<article className="blog-content">
				<CustomMDX source={post.content} />
			</article>
			{post.slug !== EXPLAINER_POST && <AiThisWeekPromo />}
		</section>
	);
}
