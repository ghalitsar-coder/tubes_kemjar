import { handle } from "hono/vercel";
import { Hono } from "hono";
import { prisma } from "@/lib/prisma";
import { getCookie } from "hono/cookie";
import { sendSuccess, sendError } from "@/lib/hono-clerk";

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
  const clerkUserId = c.get("clerkUserId");
  const sessionToken = c.get("sessionToken");

  let userData = null;

  if (clerkUserId) {
    try {
      // Try to find the user in our database
      const users =
        await prisma.$queryRaw`SELECT id, name, email, "isOAuthUser" FROM "User" WHERE "clerkId" = ${clerkUserId}`;
      const usersArray = users as any[];
      userData = usersArray.length > 0 ? usersArray[0] : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  return sendSuccess(c, {
    message: "Hono with Clerk Test",
    auth: {
      clerkUserId: clerkUserId || "not authenticated",
      hasSession: !!sessionToken,
    },
    userData: userData || "User not found in database",
  });
});

// Database status endpoint
app.get("/db", async (c) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT 1 as status`;
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
