export const monitorPerformance = (name: string, callback: () => void | Promise<void>) => {
  if (typeof window === 'undefined') {
    return callback()
  }
  
  return async () => {
    const startTime = performance.now()
    const startMemory = performance.memory?.usedJSHeapSize
    
    try {
      await callback()
      
      const endTime = performance.now()
      const endMemory = performance.memory?.usedJSHeapSize
      
      const duration = endTime - startTime
      const memoryUsed = endMemory && startMemory ? endMemory - startMemory : 0
      
      console.log(`[PERF] ${name}: ${duration.toFixed(2)}ms`, memoryUsed ? `(${formatMemory(memoryUsed)})` : '')
      
      // Report to analytics if available
      if (typeof window.analytics !== 'undefined') {
        window.analytics.track('Performance', {
          name,
          duration,
          memoryUsed
        })
      }
    } catch (error) {
      console.error(`[PERF ERROR] ${name}:`, error)
      throw error
    }
  }
}

const formatMemory = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export const measureFCP = () => {
  return new Promise<number>((resolve) => {
    if ('performance' in window && 'getEntriesByName' in performance) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntriesByName('first-contentful-paint')
        if (entries.length > 0) {
          resolve(entries[0].startTime)
          observer.disconnect()
        }
      })
      
      observer.observe({ type: 'paint', buffered: true })
      
      // Fallback timeout
      setTimeout(() => resolve(performance.now()), 10000)
    } else {
      resolve(performance.now())
    }
  })
}

export const measureTTI = () => {
  return new Promise<number>((resolve) => {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntriesByType('longtask')
        if (entries.length > 0) {
          // Simple TTI estimation
          const tti = performance.now()
          resolve(tti)
          observer.disconnect()
        }
      })
      
      observer.observe({ type: 'longtask', buffered: true })
      
      // Fallback timeout
      setTimeout(() => resolve(performance.now()), 15000)
    } else {
      resolve(performance.now())
    }
  })
}
