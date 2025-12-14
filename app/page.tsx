import { BlogPosts } from "app/components/posts";
import type { Metadata } from "next";

/**
 * Home Page Component
 * Serves as the landing page for the portfolio
 *
 * Features:
 * - Personal introduction section
 * - List of blog posts
 * - Clean, minimalist design
 *
 * Layout:
 * - Heading with portfolio title
 * - Brief personal bio
 * - Blog posts section
 *
 * Note: This is a Server Component by default in Next.js 14
 * which allows for optimal initial page load and SEO
 */
export const metadata: Metadata = {
	title: "Renjith Abraham",
	description: "Renjith Abraham's Portfolio",
};

export default function Page() {
	return (
		<section>
			<h1>My Portfolio</h1>
			<p className="mb-4 paragraph-main">
				Hello! I'm Renjith, an experienced developer with a passion for crafting
				clean, efficient, and impactful software. With expertise in TypeScript,
				Node.js, and modern web technologies like Angular and Next.js, I thrive
				on building applications that solve real-world problems. I'm deeply
				curious about the intersection of AI and technology, constantly
				exploring innovative ways to enhance productivity and create meaningful
				user experiences. Beyond coding, I'm a lifelong learner with interests
				in quantum physics, creative problem-solving, and leaving a positive
				mark through my work. Let's connect and create something amazing
				together!
			</p>
			<div className="my-8">
				<BlogPosts />
			</div>
		</section>
	);
}
