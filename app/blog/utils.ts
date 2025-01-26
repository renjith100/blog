import fs from 'fs'
import path from 'path'

/**
 * Type definition for blog post metadata.
 * Extracted from the frontmatter of MDX files
 */
type Metadata = {
  title: string       // Post title
  publishedAt: string // Publication date
  summary: string     // Brief description
  image?: string      // Optional OG image URL
}

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
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes
    metadata[key.trim() as keyof Metadata] = value
  })

  return { metadata: metadata as Metadata, content }
}

/**
 * Retrieves all MDX files from a specified directory
 * 
 * @param dir - Directory path to search for MDX files
 * @returns Array of MDX filenames
 */
function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

/**
 * Reads and parses an MDX file
 * 
 * @param filePath - Path to the MDX file
 * @returns Object containing parsed metadata and content
 */
function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

/**
 * Processes all MDX files in a directory
 * Extracts metadata, content, and generates slugs
 * 
 * @param dir - Directory containing MDX files
 * @returns Array of processed blog posts with metadata, content, and slugs
 */
function getMDXData(dir) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

/**
 * Retrieves all blog posts from the posts directory
 * This is the main export used by other components to access blog posts
 * 
 * @returns Array of processed blog posts
 */
export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), 'app', 'blog', 'posts'))
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
 * formatDate("2025-01-25") => "January 25, 2025"
 * formatDate("2025-01-25", true) => "January 25, 2025 (2d ago)"
 */
export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`
  } else {
    formattedDate = 'Today'
  }

  let fullDate = targetDate.toLocaleString('en-us', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
