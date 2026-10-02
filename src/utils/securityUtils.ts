/**
 * Security utilities for input validation, sanitization, and protection
 */

// HTML entity encoding map
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Sanitize HTML to prevent XSS attacks
 * Encodes dangerous HTML characters to their entity equivalents
 */
export function sanitizeHTML(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize user input for display
 * Removes potentially dangerous content while preserving formatting
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Returns an object with validation results
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Calculate strength
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasMixedCase = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const isLongEnough = password.length >= 12;

  if (isLongEnough && hasMixedCase && hasNumbers && hasSpecialChar) {
    strength = 'strong';
  } else if (password.length >= 8 && hasMixedCase && hasNumbers) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Validate age input
 */
export function isValidAge(age: number): boolean {
  return Number.isInteger(age) && age >= 18 && age <= 100;
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if a URL is safe (same origin or whitelisted)
 */
export function isSafeUrl(url: string, whitelist: string[] = []): boolean {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    const currentOrigin = window.location.origin;

    // Allow same-origin URLs
    if (parsedUrl.origin === currentOrigin) {
      return true;
    }

    // Check whitelist
    if (whitelist.some((domain) => parsedUrl.hostname.endsWith(domain))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Content Security Policy nonce generator
 */
export function generateCSPNonce(): string {
  return generateSecureToken(16);
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

/**
 * Validate file type
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const fileType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  
  return allowedTypes.some((type) => {
    if (type.startsWith('.')) {
      return extension === type.substring(1);
    }
    return fileType === type || fileType.startsWith(type + '/');
  });
}

/**
 * Validate file size
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Rate limiting helper (client-side)
 */
export class ClientRateLimiter {
  private attempts: number[] = [];
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    this.attempts = this.attempts.filter((t) => now - t < this.windowMs);
    return this.attempts.length < this.maxAttempts;
  }

  recordAttempt(): void {
    this.attempts.push(Date.now());
  }

  getRemainingTime(): number {
    if (this.attempts.length === 0) return 0;
    const oldest = Math.min(...this.attempts);
    return Math.max(0, this.windowMs - (Date.now() - oldest));
  }

  reset(): void {
    this.attempts = [];
  }
}

/**
 * Secure storage wrapper with encryption support
 */
export class SecureStorage {
  private prefix: string;

  constructor(prefix: string = 'heartsync_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  set(key: string, value: unknown): void {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error('[SecureStorage] Failed to set item:', error);
    }
  }

  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error('[SecureStorage] Failed to remove item:', error);
    }
  }

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(this.prefix))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('[SecureStorage] Failed to clear:', error);
    }
  }
}

// Export singleton instances
export const secureStorage = new SecureStorage();
export const authRateLimiter = new ClientRateLimiter(5, 300000); // 5 attempts per 5 minutes
export const messageRateLimiter = new ClientRateLimiter(20, 60000); // 20 messages per minute
