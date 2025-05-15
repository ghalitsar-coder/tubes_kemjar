import { handle } from "hono/vercel";
import { app, clerkMiddleware, sendSuccess } from "@/lib/hono-clerk";
import type { Context } from "hono";

// Import route handlers
import "@/app/api/posts/routes";
import "@/app/api/users/routes";

// Apply Clerk middleware to all routes
app.use("/*", clerkMiddleware);

// Health check endpoint
app.get("/api", (c: Context) => {
  return sendSuccess(c, {
    message: "API server is running",
    auth: c.get("clerkId") ? "authenticated" : "unauthenticated",
    environment: process.env.NODE_ENV || "development",
  });
});

// Export handler untuk Next.js
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
