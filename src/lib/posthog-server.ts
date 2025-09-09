// Server-side PostHog tracking utility
import { PostHog } from 'posthog-node'

let posthog: PostHog | null = null

export const initServerPostHog = () => {
  // Use server-side secret key, never the NEXT_PUBLIC key
  const serverKey = process.env.POSTHOG_API_KEY || process.env.POSTHOG_KEY
  const serverHost = process.env.POSTHOG_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

  if (!posthog && serverKey) {
    posthog = new PostHog(serverKey, {
      host: serverHost,
    })
  }
  return posthog
}

export const trackServerEvent = (
  userId: string | null,
  eventName: string,
  properties?: Record<string, any>
) => {
  try {
    const client = initServerPostHog()
    if (client) {
      client.capture({
        distinctId: userId || 'anonymous',
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          source: 'server'
        }
      })
    }
  } catch (error) {
    console.error('PostHog server tracking error:', error)
  }
}

export const identifyServerUser = (
  userId: string,
  properties?: Record<string, any>
) => {
  try {
    const client = initServerPostHog()
    if (client) {
      client.identify({
        distinctId: userId,
        properties: {
          ...properties,
          timestamp: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    console.error('PostHog server identify error:', error)
  }
}
