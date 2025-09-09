import posthog from 'posthog-js'

export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // We'll handle this manually
      capture_pageleave: true,
      loaded: () => {
        if (process.env.NODE_ENV === 'development') console.log('PostHog loaded')
      }
    })
  }
}

export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, userProperties)
  }
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties)
  }
}

export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview', {
      page: pageName,
      ...properties
    })
  }
}

export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    // Prefer the modern PostHog API; fall back to identify with current distinct id
    const anyPosthog = posthog as unknown as { setPersonProperties?: (props: Record<string, any>) => void }
    if (typeof anyPosthog.setPersonProperties === 'function') {
      anyPosthog.setPersonProperties(properties)
    } else {
      const currentId = posthog.get_distinct_id()
      if (currentId) {
        posthog.identify(currentId, properties)
      }
    }
  }
}

export const resetUser = () => {
  if (typeof window !== 'undefined') {
    posthog.reset()
  }
}

export { posthog }
