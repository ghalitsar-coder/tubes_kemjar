import { NextResponse } from 'next/server';

/**
 * Security configuration and middleware utilities for Next.js
 */

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
export const createRateLimit = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxRequests = options.max || 100;
  const message = options.message || 'Too many requests from this IP, please try again later.';

  return (identifier: string) => {
    const now = Date.now();
    const key = identifier;
    
    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
    
    const record = rateLimitStore.get(key);
    
    if (!record || record.resetTime < now) {
      // Create new record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }
    
    if (record.count >= maxRequests) {
      return { 
        allowed: false, 
        remaining: 0,
        resetTime: record.resetTime,
        message 
      };
    }
    
    // Increment count
    record.count++;
    rateLimitStore.set(key, record);
      return { 
      allowed: true, 
      remaining: maxRequests - record.count 
    };
  };
};

// Strict rate limiting for sensitive endpoints
export const strictRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many attempts, please try again later.',
});

// Rate limiting for auth endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
});

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// Helper function to add security headers to responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Helper function to validate request origin
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
    'https://localhost:3000'
  ].filter(Boolean);

  if (!origin) return true; // Allow requests without origin (same-origin)
  return allowedOrigins.includes(origin);
}

// CSRF token validation helper
export function validateCSRFToken(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return true; // CSRF not required for safe methods
  }

  const csrfToken = request.headers.get('x-csrf-token');
  const sessionCsrfToken = request.headers.get('x-session-csrf-token');
  
  if (!csrfToken || !sessionCsrfToken) {
    return false;
  }

  return csrfToken === sessionCsrfToken;
}

// Input sanitization helpers
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

export function sanitizeEmail(email: string): string {
  // Basic email validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeString(email).toLowerCase();
  return emailRegex.test(sanitized) ? sanitized : '';
}

// SQL injection protection helpers
export function escapeSQL(input: string): string {
  return input.replace(/'/g, "''");
}

// XSS protection helpers
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return input.replace(/[&<>"']/g, (m) => map[m]);
}

// Security logging helper
export function logSecurityEvent(event: {
  type: 'auth_failure' | 'rate_limit' | 'csrf_failure' | 'sql_injection_attempt' | 'xss_attempt';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: unknown;
}) {
  console.warn('SECURITY EVENT:', {
    timestamp: new Date().toISOString(),
    ...event,
  });
}

// Environment security check
export function isProductionSecure(): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true; // Allow in development
  }

  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
  ];

  return requiredEnvVars.every(envVar => process.env[envVar]);
}
