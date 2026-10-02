/**
 * Performance monitoring types
 */

export interface WebVitalMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

export interface NetworkInformation {
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface DeviceCapabilities {
  memory: number;
  cores: number;
  connection: NetworkInformation | null;
  isLowEnd: boolean;
  supportsWebP: boolean;
  supportsAVIF: boolean;
}

export interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'jpeg' | 'png' | 'avif';
  width?: number;
  height?: number;
  lazy: boolean;
  placeholder: boolean;
}

export interface PerformanceBudget {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
  INP: number; // Interaction to Next Paint
}

export const PERFORMANCE_BUDGETS: PerformanceBudget = {
  LCP: 2500, // 2.5s
  FID: 100, // 100ms
  CLS: 0.1, // 0.1
  FCP: 1800, // 1.8s
  TTFB: 800, // 800ms
  INP: 200, // 200ms
};

export function getMetricRating(
  name: keyof PerformanceBudget,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const budget = PERFORMANCE_BUDGETS[name];
  
  // For CLS, lower is better
  if (name === 'CLS') {
    if (value <= budget) return 'good';
    if (value <= budget * 2.5) return 'needs-improvement';
    return 'poor';
  }
  
  // For time-based metrics
  if (value <= budget) return 'good';
  if (value <= budget * 2) return 'needs-improvement';
  return 'poor';
}
