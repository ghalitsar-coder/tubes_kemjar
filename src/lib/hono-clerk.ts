import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prisma } from "./prisma";
import type { Context, Next } from "hono";

// Variables that will be available in Hono contexts
export type AppVariables = {
  userId: number | null;
  clerkId: string | null;
  requestId: string;
};

// Standardized API response type
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
};

// Main Hono app instance
export const app = new Hono<{ Variables: AppVariables }>();

// Add CORS middleware
app.use(
  "/*",
  cors({
    origin: ["http://localhost:3000", process.env.NEXT_PUBLIC_APP_URL || "*"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Clerk-User-Id"],
    exposeHeaders: ["X-Request-Id"],
    credentials: true,
  })
);

// Add request logger in development
if (process.env.NODE_ENV !== "production") {
  app.use("/*", logger());
}

// Add request ID middleware
app.use("/*", async (c, next) => {
  const requestId = crypto.randomUUID();
  c.set("requestId", requestId);
  c.header("X-Request-Id", requestId);
  await next();
});

// Middleware for Clerk integration
export const clerkMiddleware = async (
  c: Context<{ Variables: AppVariables }>,
  next: Next
) => {
  // Initialize auth variables
  c.set("userId", null);
  c.set("clerkId", null);

  // Get Clerk user ID from header (set by Next.js middleware)
  const clerkId: string | undefined = c.req.header("X-Clerk-User-Id");

  if (clerkId) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Request authenticated with Clerk ID: ${clerkId}`);
    }

    try {
      // Find the user in our database using raw query for better type support
      const users = await prisma.$queryRaw`
        SELECT id, name, email FROM "User" WHERE "clerkId" = ${clerkId} LIMIT 1
      `;

      const user = users[0];

      if (user) {
        c.set("userId", user.id);
        c.set("clerkId", clerkId);

        if (process.env.NODE_ENV !== "production") {
          console.log(`Found database user: ${user.id} (${user.name})`);
        }
      } else {
        if (process.env.NODE_ENV !== "production") {
          console.log(`User with Clerk ID ${clerkId} not found in database`);
        }
      }
    } catch (error) {
      console.error("Error in Clerk middleware:", error);
    }
  }

  await next();
};

// Authorization middleware
export const requireAuth = async (
  c: Context<{ Variables: AppVariables }>,
  next: Next
) => {
  if (!c.get("userId")) {
    return c.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in to access this resource",
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: c.get("requestId"),
        },
      },
      401
    );
  }

  await next();
};

// Helper for standardized success responses
export const sendSuccess = <T>(
  c: Context<{ Variables: AppVariables }>,
  data: T,
  status = 200
) => {
  return c.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: c.get("requestId"),
      },
    },
    status
  );
};

// Helper for standardized error responses
export const sendError = (
  c: Context<{ Variables: AppVariables }>,
  message: string,
  code = "INTERNAL_SERVER_ERROR",
  status = 500,
  details?: any
) => {
  return c.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: c.get("requestId"),
      },
    },
    status
  );
};

// Export the Hono handler
export { handle };
