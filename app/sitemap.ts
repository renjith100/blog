import { getBlogPosts } from "app/blog/utils";
import { getWeeks } from "app/weekly/utils";

export const baseUrl =
	process.env.NEXT_PUBLIC_BASE_URL || "https://blog-gamma-nine-89.vercel.app";

export default async function sitemap() {
	const blogs = getBlogPosts().map((post) => ({
		url: `${baseUrl}/blog/${post.slug}`,
		lastModified: post.metadata.publishedAt,
	}));

	const weeks = getWeeks().map((week) => ({
		url: `${baseUrl}/weekly/${week.start}`,
		lastModified: week.updates[0]?.date ?? week.start,
	}));

	const routes = ["", "/blog", "/weekly"].map((route) => ({
		url: `${baseUrl}${route}`,
		lastModified: new Date().toISOString().split("T")[0],
	}));

	return [...routes, ...blogs, ...weeks];
}
