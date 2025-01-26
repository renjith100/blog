import { ImageResponse } from 'next/og'

/**
 * OpenGraph Image Generator Route
 * Generates dynamic social media preview images for blog posts
 * 
 * Features:
 * - Dynamic title from URL parameter
 * - Consistent branding with white background
 * - Responsive layout using Tailwind-like styles
 * - Optimized for social media platforms (1200x630)
 * 
 * Usage:
 * /og?title=Your+Blog+Post+Title
 * 
 * @param request - HTTP request object containing title in query params
 * @returns ImageResponse with generated OG image
 */
export function GET(request: Request) {
  // Extract title from URL parameters or use default
  let url = new URL(request.url)
  let title = url.searchParams.get('title') || 'Next.js Portfolio Starter'

  // Generate image using JSX-like syntax
  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
        <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
          <h2 tw="flex flex-col text-4xl font-bold tracking-tight text-left">
            {title}
          </h2>
        </div>
      </div>
    ),
    {
      width: 1200,  // Standard OG image width
      height: 630,  // Standard OG image height
    }
  )
}
