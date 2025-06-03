import { NextRequest, NextResponse } from 'next/server';
import { addSecurityHeaders, validateOrigin, logSecurityEvent, createRateLimit } from './security';

// Helper function to extract client IP from NextRequest
function getClientIP(req: NextRequest): string {
  // Try to get IP from various headers in order of preference
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfConnectingIP = req.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to 'unknown' if no IP can be determined
  return 'unknown';
}

/**
 * Apply security headers to a response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  return addSecurityHeaders(response);
}

export interface SecurityOptions {
  rateLimit?: { requests: number; window: number };
  validateInput?: boolean;
  requireAuth?: boolean;
  requiredRole?: string;
}

/**
 * Rate limiting storage
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

/**
 * Enhanced security middleware for API routes with configurable options
 */
export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: SecurityOptions = {}
) {
  return async function secureHandler(req: NextRequest): Promise<NextResponse> {
    try {
      // Validate origin for cross-origin requests
      if (!validateOrigin(req)) {
        logSecurityEvent({
          type: 'csrf_failure',
          ip: getClientIP(req),
          userAgent: req.headers.get('user-agent') || undefined,
          details: { origin: req.headers.get('origin') }
        });
        
        return NextResponse.json(
          { error: 'Invalid origin' },
          { status: 403 }
        );
      }

      // Apply rate limiting if configured
      if (options.rateLimit) {
        const rateLimitResult = await applyRateLimit(req, {
          max: options.rateLimit.requests,
          windowMs: options.rateLimit.window * 1000 // Convert seconds to milliseconds
        });
        
        if (rateLimitResult) {
          return rateLimitResult; // Rate limit exceeded response
        }
      }

      // Apply authentication if required
      if (options.requireAuth) {
        const authResult = await checkAuthentication(req, options.requiredRole);
        if (authResult) {
          return authResult; // Authentication failed response
        }
      }

      // Call the original handler
      const response = await handler(req);

      // Add security headers to response
      return addSecurityHeaders(response);
    } catch (error) {
      console.error('Security middleware error:', error);
      
      // Log security-related errors
      logSecurityEvent({
        type: 'auth_failure',
        ip: getClientIP(req),
        userAgent: req.headers.get('user-agent') || undefined,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper function to apply rate limiting
 */
async function applyRateLimit(
  req: NextRequest,
  options: { max: number; windowMs: number }
): Promise<NextResponse | null> {
  const clientIP = getClientIP(req);
  const now = Date.now();
  const resetTime = now + options.windowMs;

  const clientData = requestCounts.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // First request or window expired
    requestCounts.set(clientIP, { count: 1, resetTime });
  } else {
    // Increment count
    clientData.count++;
    
    if (clientData.count > options.max) {
      logSecurityEvent({
        type: 'rate_limit',
        ip: clientIP,
        userAgent: req.headers.get('user-agent') || undefined,
        details: { count: clientData.count, max: options.max }
      });

      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((clientData.resetTime - now) / 1000).toString()
          }
        }
      );
    }
  }

  return null; // No rate limit exceeded
}

/**
 * Helper function to check authentication
 */
async function checkAuthentication(
  req: NextRequest,
  requiredRole?: string
): Promise<NextResponse | null> {
  const authHeader = req.headers.get('authorization');
  const clerkUserId = req.headers.get('x-clerk-user-id');

  if (!authHeader && !clerkUserId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // For this example, we'll assume the user info is available
  // In practice, you'd validate the token and get user info from your auth provider
  const userId = clerkUserId || 'unknown';
  const userRole = 'USER'; // This would come from your auth system

  if (requiredRole && userRole !== requiredRole) {
    logSecurityEvent({
      type: 'auth_failure',
      userId,
      ip: getClientIP(req),
      userAgent: req.headers.get('user-agent') || undefined,
      details: { requiredRole, userRole }
    });

    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  return null; // Authentication successful
}

/**
 * Authentication middleware with role checking (legacy - use withSecurity with options instead)
 */
export function withAuth(
  handler: (req: NextRequest, context: { userId: string; role: string }) => Promise<NextResponse>,
  requiredRole?: string
) {
  return withSecurity(async (req: NextRequest) => {
    // Get user authentication info (this would integrate with your auth system)
    const authHeader = req.headers.get('authorization');
    const clerkUserId = req.headers.get('x-clerk-user-id');

    if (!authHeader && !clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For this example, we'll assume the user info is available
    // In practice, you'd validate the token and get user info from your auth provider
    const userId = clerkUserId || 'unknown';
    const userRole = 'USER'; // This would come from your auth system

    if (requiredRole && userRole !== requiredRole) {
      logSecurityEvent({
        type: 'auth_failure',
        userId,
        ip: getClientIP(req),
        userAgent: req.headers.get('user-agent') || undefined,
        details: { requiredRole, userRole }
      });

      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req, { userId, role: userRole });
  });
}

/**
 * Rate limiting middleware (legacy - use withSecurity with options instead)
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { max: number; windowMs: number } = { max: 100, windowMs: 15 * 60 * 1000 }
) {
  return withSecurity(async (req: NextRequest) => {
    const rateLimitResult = await applyRateLimit(req, options);
    if (rateLimitResult) {
      return rateLimitResult;
    }
    return handler(req);
  });
}

/**
 * Input validation middleware
 */
export function withValidation<T>(
  handler: (req: NextRequest, data: T) => Promise<NextResponse>,
  schema: {
    parse: (data: unknown) => T;
    safeParse: (data: unknown) => { success: boolean; data?: T; error?: unknown };
  }
) {
  return withSecurity(async (req: NextRequest) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      try {
        const body = await req.json();
        const result = schema.safeParse(body);

        if (!result.success) {
          return NextResponse.json(
            {
              error: 'Invalid input data',
              details: result.error || 'Validation failed'
            },
            { status: 400 }
          );
        }

        return handler(req, result.data!);
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON data' },
          { status: 400 }
        );
      }
    }

    return handler(req, {} as T);
  });
}
