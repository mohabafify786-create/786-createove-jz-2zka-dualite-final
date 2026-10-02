import { useState, useEffect, useRef, useCallback } from 'react';

interface ImageOptimizationOptions {
  src: string;
  placeholder?: string;
  width?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  lazy?: boolean;
  threshold?: number;
}

interface ImageOptimizationResult {
  optimizedSrc: string;
  isLoading: boolean;
  hasError: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
  isIntersecting: boolean;
}

// Default placeholder image (1x1 transparent pixel)
const DEFAULT_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/**
 * Hook for optimized image loading with lazy loading, WebP support, and CDN optimization
 */
export function useImageOptimization({
  src,
  placeholder = DEFAULT_PLACEHOLDER,
  width,
  quality = 80,
  format = 'webp',
  lazy = true,
  threshold = 0.1,
}: ImageOptimizationOptions): ImageOptimizationResult {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(!lazy);
  const [optimizedSrc, setOptimizedSrc] = useState(lazy ? placeholder : src);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized URL with CDN parameters
  const getOptimizedUrl = useCallback((originalUrl: string): string => {
    // Check if URL is from Unsplash (supports dynamic resizing)
    if (originalUrl.includes('unsplash.com')) {
      const url = new URL(originalUrl);
      if (width) url.searchParams.set('w', width.toString());
      url.searchParams.set('q', quality.toString());
      if (format === 'webp') url.searchParams.set('fm', 'webp');
      url.searchParams.set('auto', 'format');
      return url.toString();
    }

    // Check if URL is from ibb.co (ImgBB)
    if (originalUrl.includes('ibb.co')) {
      // ImgBB doesn't support dynamic optimization, return original
      return originalUrl;
    }

    // For other URLs, return as-is
    return originalUrl;
  }, [width, quality, format]);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || !imageRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observerRef.current?.disconnect();
          }
        });
      },
      { threshold, rootMargin: '100px' }
    );

    observerRef.current.observe(imageRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, threshold]);

  // Load image when intersecting
  useEffect(() => {
    if (!isIntersecting) return;

    setIsLoading(true);
    setHasError(false);

    const img = new Image();
    const url = getOptimizedUrl(src);

    img.onload = () => {
      setOptimizedSrc(url);
      setIsLoading(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      // Fallback to original URL if optimization fails
      setOptimizedSrc(src);
    };

    img.src = url;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [isIntersecting, src, getOptimizedUrl]);

  return {
    optimizedSrc,
    isLoading,
    hasError,
    imageRef: imageRef as React.RefObject<HTMLImageElement>,
    isIntersecting,
  };
}

/**
 * Preload critical images for faster LCP
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Batch preload multiple images
 */
export async function preloadImages(srcs: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(srcs.map(preloadImage));
}

export default useImageOptimization;
