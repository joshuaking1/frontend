let posthogSingleton: any | null = null

export const initPostHog = async () => {
  if (typeof window === 'undefined') return
  if (posthogSingleton) return
  const { default: posthog } = await import('posthog-js')
  posthogSingleton = posthog
  posthogSingleton.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    loaded: () => {
      if (process.env.NODE_ENV === 'development') console.log('PostHog loaded')
    }
  })
}

export const identifyUser = (userId: string, userProperties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthogSingleton) {
    posthogSingleton.identify(userId, userProperties)
  }
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthogSingleton) {
    posthogSingleton.capture(eventName, properties)
  }
}

export const trackPageView = (pageName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthogSingleton) {
    posthogSingleton.capture('$pageview', {
      page: pageName,
      ...properties
    })
  }
}

export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthogSingleton) {
    const anyPosthog = posthogSingleton as unknown as { setPersonProperties?: (props: Record<string, any>) => void, get_distinct_id: () => string }
    if (typeof anyPosthog.setPersonProperties === 'function') {
      anyPosthog.setPersonProperties(properties)
    } else {
      const currentId = anyPosthog.get_distinct_id()
      if (currentId) {
        posthogSingleton.identify(currentId, properties)
      }
    }
  }
}

export const resetUser = () => {
  if (typeof window !== 'undefined' && posthogSingleton) {
    posthogSingleton.reset()
  }
}
export { posthogSingleton as posthog }
