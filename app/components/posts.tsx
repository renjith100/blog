import { formatDate, getBlogPosts } from "app/blog/utils";
import Link from "next/link";

export function BlogPosts() {
	const allBlogs = getBlogPosts();

	return (
		<div className="layout-container">
			{allBlogs
				.sort((a, b) => {
					if (
						new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
					) {
						return -1;
					}
					return 1;
				})
				.map((post) => (
					<Link key={post.slug} href={`/blog/${post.slug}`}>
						<div className="layout-row">
							<div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
								<p className="post-date w-[160px] paragraph-date text-xl tabular-nums text-neutral-600 dark:text-neutral-400">
									{formatDate(post.metadata.publishedAt, false)}
								</p>
								<p className="paragraph-preview text-xl text-neutral-800 dark:text-neutral-200">
									{post.metadata.title}
								</p>
							</div>
						</div>
					</Link>
				))}
		</div>
	);
}
