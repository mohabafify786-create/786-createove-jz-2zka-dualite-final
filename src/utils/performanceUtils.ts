/**
 * Performance optimization utilities
 */

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback): number => {
        const start = Date.now();
        return setTimeout(() => {
          cb({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          } as IdleDeadline);
        }, 1);
      };

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number): void => clearTimeout(id);

/**
 * Schedule a task during idle periods
 */
export function scheduleIdleTask(callback: () => void, options?: IdleRequestOptions): number {
  return requestIdleCallback(callback, options);
}

/**
 * Chunk processing for large arrays
 */
export async function processInChunks<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  chunkSize: number = 10
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(processor));
    results.push(...chunkResults);

    // Yield to main thread
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Virtual scrolling helper
 */
export function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  overscan: number = 3
): { startIndex: number; endIndex: number } {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    startIndex + visibleCount + overscan * 2,
    Math.ceil(scrollTop / itemHeight) + visibleCount + overscan
  );

  return { startIndex, endIndex };
}

/**
 * Memory-efficient array chunking
 */
export function* chunkArray<T>(array: T[], size: number): Generator<T[]> {
  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}

/**
 * Check if device is low-end
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === 'undefined') return false;

  // Check for low memory
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory !== undefined && memory < 4) {
    return true;
  }

  // Check for slow connection
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') {
    return true;
  }

  // Check hardware concurrency
  const cores = navigator.hardwareConcurrency;
  if (cores !== undefined && cores < 4) {
    return true;
  }

  return false;
}

/**
 * Preload critical assets
 */
export function preloadAssets(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map((url) => {
      return new Promise<void>((resolve) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = url.endsWith('.css') ? 'style' : 'script';
        link.onload = () => resolve();
        link.onerror = () => resolve(); // Resolve anyway to not block
        document.head.appendChild(link);
      });
    })
  );
}

/**
 * Prefetch pages for faster navigation
 */
export function prefetchPage(url: string): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Measure performance
 */
export function measurePerformance(name: string): {
  end: () => number;
} {
  const start = performance.now();
  
  return {
    end: () => {
      const duration = performance.now() - start;
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      return duration;
    },
  };
}

/**
 * Check Web Vitals
 */
export function reportWebVitals(callback: (metric: { name: string; value: number }) => void): void {
  if (typeof window === 'undefined') return;

  // Report LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    callback({ name: 'LCP', value: lastEntry.startTime });
  }).observe({ type: 'largest-contentful-paint', buffered: true });

  // Report FID
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if ('processingStart' in entry) {
        callback({
          name: 'FID',
          value: (entry as PerformanceEventTiming).processingStart - entry.startTime,
        });
      }
    });
  }).observe({ type: 'first-input', buffered: true });

  // Report CLS
  let clsValue = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += (entry as LayoutShift).value;
        callback({ name: 'CLS', value: clsValue });
      }
    });
  }).observe({ type: 'layout-shift', buffered: true });
}

interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
