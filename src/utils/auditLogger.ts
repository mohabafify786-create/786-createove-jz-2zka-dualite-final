/**
 * Audit logging utility for security events
 */

interface AuditLogEntry {
  timestamp: string;
  event: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

type AuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILURE'
  | 'AUTH_LOGOUT'
  | 'AUTH_REGISTER'
  | 'AUTH_PASSWORD_RESET'
  | 'AUTH_EMAIL_VERIFIED'
  | 'PROFILE_UPDATE'
  | 'PROFILE_PHOTO_UPLOAD'
  | 'PROFILE_DELETE'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILURE'
  | 'PAYMENT_REFUND'
  | 'SUBSCRIPTION_CREATED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'MESSAGE_SENT'
  | 'MESSAGE_BLOCKED'
  | 'CONTENT_FLAGGED'
  | 'ACCOUNT_SUSPICIOUS_ACTIVITY'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CSRF_VALIDATION_FAILED'
  | 'SECURITY_VIOLATION';

// In-memory log buffer (would be sent to server in production)
const logBuffer: AuditLogEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Log a security audit event
 */
export function auditLog(
  event: AuditEventType,
  details?: Record<string, unknown>,
  severity: AuditLogEntry['severity'] = 'low'
): void {
  const entry: AuditLogEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    details,
  };

  // Add to buffer
  logBuffer.push(entry);
  
  // Trim buffer if too large
  if (logBuffer.length > MAX_BUFFER_SIZE) {
    logBuffer.shift();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    const logMethod = severity === 'critical' || severity === 'high' 
      ? console.error 
      : severity === 'medium' 
        ? console.warn 
        : console.log;
    
    logMethod(`[Audit] ${event}:`, details);
  }

  // In production, this would send to a logging service
  // For now, we just store in memory and could send to Supabase
}

/**
 * Get all audit logs (for debugging)
 */
export function getAuditLogs(): AuditLogEntry[] {
  return [...logBuffer];
}

/**
 * Clear audit logs
 */
export function clearAuditLogs(): void {
  logBuffer.length = 0;
}

/**
 * Log authentication events
 */
export const authAudit = {
  loginSuccess: (userId: string) => 
    auditLog('AUTH_LOGIN_SUCCESS', { userId }, 'low'),
  
  loginFailure: (email: string, reason: string) => 
    auditLog('AUTH_LOGIN_FAILURE', { email, reason }, 'medium'),
  
  logout: (userId?: string) => 
    auditLog('AUTH_LOGOUT', { userId }, 'low'),
  
  register: (userId: string, email: string) => 
    auditLog('AUTH_REGISTER', { userId, email }, 'low'),
  
  passwordReset: (email: string) => 
    auditLog('AUTH_PASSWORD_RESET', { email }, 'medium'),
  
  emailVerified: (userId: string) => 
    auditLog('AUTH_EMAIL_VERIFIED', { userId }, 'low'),
};

/**
 * Log profile events
 */
export const profileAudit = {
  update: (userId: string, fields: string[]) => 
    auditLog('PROFILE_UPDATE', { userId, fields }, 'low'),
  
  photoUpload: (userId: string) => 
    auditLog('PROFILE_PHOTO_UPLOAD', { userId }, 'low'),
  
  delete: (userId: string) => 
    auditLog('PROFILE_DELETE', { userId }, 'critical'),
};

/**
 * Log payment events
 */
export const paymentAudit = {
  initiated: (userId: string, planId: string, amount: number) => 
    auditLog('PAYMENT_INITIATED', { userId, planId, amount }, 'medium'),
  
  success: (userId: string, subscriptionId: string) => 
    auditLog('PAYMENT_SUCCESS', { userId, subscriptionId }, 'low'),
  
  failure: (userId: string, error: string) => 
    auditLog('PAYMENT_FAILURE', { userId, error }, 'high'),
  
  refund: (userId: string, amount: number, reason: string) => 
    auditLog('PAYMENT_REFUND', { userId, amount, reason }, 'high'),
};

/**
 * Log security events
 */
export const securityAudit = {
  rateLimitExceeded: (endpoint: string) => 
    auditLog('RATE_LIMIT_EXCEEDED', { endpoint }, 'medium'),
  
  csrfValidationFailed: () => 
    auditLog('CSRF_VALIDATION_FAILED', undefined, 'high'),
  
  suspiciousActivity: (userId: string, activity: string) => 
    auditLog('ACCOUNT_SUSPICIOUS_ACTIVITY', { userId, activity }, 'critical'),
  
  contentFlagged: (userId: string, contentType: string, reason: string) => 
    auditLog('CONTENT_FLAGGED', { userId, contentType, reason }, 'high'),
  
  securityViolation: (type: string, details: Record<string, unknown>) => 
    auditLog('SECURITY_VIOLATION', { type, ...details }, 'critical'),
};

export default auditLog;
