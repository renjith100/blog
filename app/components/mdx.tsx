import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'

/**
 * Custom Table component for MDX content
 * Renders a table with headers and rows from provided data
 * 
 * @param data - Object containing headers array and rows array
 * @returns React component for a styled table
 */
function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

/**
 * Enhanced Link component that handles different types of URLs
 * - Internal links: Uses Next.js Link component
 * - Hash links: Uses regular anchor tags
 * - External links: Opens in new tab with security attributes
 * 
 * @param props - Standard anchor tag props including href
 * @returns Appropriate link component based on URL type
 */
function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

/**
 * Enhanced Image component with rounded corners
 * Wraps Next.js Image component with additional styling
 * 
 * @param props - Standard Next.js Image component props
 * @returns Styled Image component
 */
function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

/**
 * Syntax highlighted code block component
 * Uses sugar-high for syntax highlighting
 * 
 * @param children - Code content to be highlighted
 * @returns Pre element with highlighted code
 */
function Code({ children, ...props }) {
  let codeHTML = highlight(children)
  return (
    <code 
      className="font-mono text-sm"
      dangerouslySetInnerHTML={{ __html: codeHTML }} 
      {...props} 
    />
  )
}

/**
 * Converts a string to a URL-friendly slug
 * Used for creating anchor links in headings
 * 
 * @param str - String to convert to slug
 * @returns URL-friendly slug string
 */
function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

/**
 * Custom MDX components mapping
 * Provides enhanced versions of standard HTML elements
 */
let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
}

/**
 * Main MDX rendering component
 * Processes MDX content with custom components
 * 
 * @param props - Contains MDX source content
 * @returns Rendered MDX content with custom components
 */
export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
