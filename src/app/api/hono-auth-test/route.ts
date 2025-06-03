import { handle } from "hono/vercel";
import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import { getCookie } from "hono/cookie";
import { requireAdmin, isDebugAllowed } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

// Create a Hono app for this route
const app = new Hono<{
  Variables: {
    clerkUserId?: string;
    sessionToken?: string;
    requestId: string;
  };
}>();

// Handler to extract Clerk user ID from cookies or headers
app.use("*", async (c, next) => {
  // Security check - only allow in development/testing
  if (!isDebugAllowed()) {
    return c.json({ error: 'Not available in production' }, 403);
  }

  // Get Clerk session token from cookie
  const sessionToken = getCookie(c, "__session");
  // Get Clerk user ID from header (set by Clerk middleware)
  const clerkUserId = c.req.header("X-Clerk-User-Id");

  c.set("clerkUserId", clerkUserId);
  c.set("sessionToken", sessionToken);

  await next();
});

// Test endpoint
app.get("/", async (c) => {
  try {
    // Require admin access for this test endpoint
    const adminCheck = await requireAdmin();
    
    // Check if adminCheck is an error response (NextResponse)
    if (adminCheck instanceof NextResponse) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const clerkUserId = c.get("clerkUserId");
    const sessionToken = c.get("sessionToken");
    let userData = null;
    
    if (clerkUserId) {
      try {
        // Use safe Prisma query instead of raw SQL
        userData = await prisma.user.findUnique({
          where: {
            clerkId: clerkUserId
          },
          select: {
            id: true,
            name: true,
            email: true,
            isOAuthUser: true
          }
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        return c.json({ error: "Database error" }, 500);
      }
    }

    return c.json({
      success: true,
      message: "Hono with Clerk Test",
      auth: {
        clerkUserId: clerkUserId || "not authenticated",
        hasSession: !!sessionToken,
      },
      userData: userData || "User not found in database",
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Database status endpoint
app.get("/db", async (c) => {
  try {
    // Require admin access for database status
    const adminCheck = await requireAdmin();
    
    // Check if adminCheck is an error response (NextResponse)
    if (adminCheck instanceof NextResponse) {
      return c.json({ error: 'Admin access required' }, 403);
    }

    // Use safe database health check instead of raw SQL
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();

    return c.json({
      database: {
        status: "connected",
        users: userCount,
        posts: postCount,
      },
    });
  } catch (error) {
    console.error("Database status error:", error);
    return c.json(
      {
        database: {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      },
      500
    );
  }
});

// Export handlers
export const GET = handle(app);
export const POST = handle(app);
