import fs from "node:fs";
import path from "node:path";

/**
 * Type definition for blog post metadata.
 * Extracted from the frontmatter of MDX files
 */
type Metadata = {
	title: string; // Post title
	publishedAt: string; // Publication date
	summary: string; // Brief description
	image?: string; // Optional OG image URL
};

/**
 * Parses the frontmatter section of an MDX file
 * Extracts metadata and content from the MDX document
 *
 * @param fileContent - Raw content of the MDX file
 * @returns Object containing parsed metadata and content
 *
 * Example frontmatter:
 * ---
 * title: My Post
 * publishedAt: 2025-01-25
 * summary: A great post
 * ---
 */
function parseFrontmatter(fileContent: string) {
	const frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
	const match = frontmatterRegex.exec(fileContent);

	if (!match) {
		return {
			metadata: {
				title: "FontMatter Error",
				publishedAt: new Date().toISOString(),
				summary: "FontMatter Error",
			},
			content: fileContent,
		};
	}

	const frontMatterBlock = match[1];
	const content = fileContent.replace(frontmatterRegex, "").trim();
	const frontMatterLines = frontMatterBlock.trim().split("\n");
	const metadata: Partial<Metadata> = {};

	frontMatterLines.forEach((line) => {
		const [key, ...valueArr] = line.split(": ");
		let value = valueArr.join(": ").trim();
		value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
		metadata[key.trim() as keyof Metadata] = value;
	});

	return {
		metadata: {
			title: metadata.title || "Untitled",
			publishedAt: metadata.publishedAt || new Date().toISOString(),
			summary: metadata.summary || "",
			image: metadata.image,
		},
		content,
	};
}

/**
 * Retrieves all MDX files from a specified directory
 *
 * @param dir - Directory path to search for MDX files
 * @returns Array of MDX filenames
 */
function getMDXFiles(dir) {
	return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
}

/**
 * Reads and parses an MDX file
 *
 * @param filePath - Path to the MDX file
 * @returns Object containing parsed metadata and content
 */
function readMDXFile(filePath) {
	const rawContent = fs.readFileSync(filePath, "utf-8");
	return parseFrontmatter(rawContent);
}

/**
 * Processes all MDX files in a directory
 * Extracts metadata, content, and generates slugs
 *
 * @param dir - Directory containing MDX files
 * @returns Array of processed blog posts with metadata, content, and slugs
 */
function getMDXData(dir) {
	const mdxFiles = getMDXFiles(dir);
	return mdxFiles.map((file) => {
		const { metadata, content } = readMDXFile(path.join(dir, file));
		const slug = path.basename(file, path.extname(file));

		return {
			metadata,
			slug,
			content,
		};
	});
}

/**
 * Retrieves all blog posts from the posts directory
 * This is the main export used by other components to access blog posts
 *
 * @returns Array of processed blog posts
 */
export function getBlogPosts() {
	return getMDXData(path.join(process.cwd(), "app", "blog", "posts"));
}

/**
 * Formats a date string into a human-readable format
 * Optionally includes relative time (e.g., "2 days ago")
 *
 * @param date - Date string (YYYY-MM-DD or ISO format)
 * @param includeRelative - Whether to include relative time
 * @returns Formatted date string
 *
 * Examples:
 * formatDate("2025-01-25") => "Jan 25, 2025"
 * formatDate("2025-01-25", true) => "Jan 25, 2025 (2d ago)"
 */
export function formatDate(date: string, includeRelative = false) {
	const currentDate = new Date();
	if (!date.includes("T")) {
		date = `${date}T00:00:00`;
	}
	const targetDate = new Date(date);

	const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
	const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
	const daysAgo = currentDate.getDate() - targetDate.getDate();

	let formattedDate = "";

	if (yearsAgo > 0) {
		formattedDate = `${yearsAgo}y ago`;
	} else if (monthsAgo > 0) {
		formattedDate = `${monthsAgo}mo ago`;
	} else if (daysAgo > 0) {
		formattedDate = `${daysAgo}d ago`;
	} else {
		formattedDate = "Today";
	}

	const fullDate = targetDate.toLocaleString("en-us", {
		month: "short",
		day: "2-digit",
		year: "numeric",
	});

	if (!includeRelative) {
		return fullDate;
	}

	return `${fullDate} (${formattedDate})`;
}
