import { BlogPosts } from "app/components/posts";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Blog",
	description: "Read my blog.",
};

export default function Page() {
	return (
		<section>
			<h1>My Blog</h1>
			<BlogPosts />
		</section>
	);
}
