import { SWRConfiguration } from 'swr'

export const swrCacheConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 300000, // 5 minutes
  dedupingInterval: 60000, // 1 minute
  focusThrottleInterval: 10000,
  loadingTimeout: 10000,
  errorRetryInterval: 5000,
  errorRetryCount: 3,
  shouldRetryOnError: true,
  provider: () => new Map(),
}

export const getCacheKey = (url: string, params?: Record<string, any>) => {
  if (!params) return url
  const queryString = new URLSearchParams(params).toString()
  return `${url}?${queryString}`
}

export const createCachedFetcher = (baseUrl: string) => {
  return async (url: string) => {
    const response = await fetch(`${baseUrl}${url}`)
    if (!response.ok) {
      throw new Error('Failed to fetch')
    }
    return response.json()
  }
}
