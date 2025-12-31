import { formatDate, getBlogPosts } from "app/blog/utils";
import Link from "next/link";

export function ListBlogPosts() {
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
					<Link
						key={post.slug}
						href={`/blog/${post.slug}`}
						className="block mb-4 md:mb-0 blog-list-item"
					>
						<div className="layout-row">
							<div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
								<p className="post-date w-[160px] text-xl tabular-nums">
									{formatDate(post.metadata.publishedAt, false)} :
								</p>
								<p className="post-title text-xl">{post.metadata.title}</p>
							</div>
						</div>
					</Link>
				))}
		</div>
	);
}
