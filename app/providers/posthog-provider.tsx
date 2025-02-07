'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!posthogKey || !posthogHost) {
    console.warn('PostHog environment variables are not set')
  } else {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
    })
  }
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    posthog.capture('$pageview', {
      $pathname: pathname,
      $search: searchParams,
      $current_url: window.location.href,
      $referrer: document.referrer,
      $title: document.title,
    });
    
  }, [pathname, searchParams])
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}