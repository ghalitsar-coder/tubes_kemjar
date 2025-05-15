import { Hono } from "hono";
import { handle } from "hono/vercel";
import { prisma } from "@/lib/prisma";

// Create a sub-app for the test route
const app = new Hono();

// Test endpoint with auth information
app.get("/", async (c) => {
  try {
    const databaseStatus = await checkDatabaseConnection();
    const usersCount = await prisma.user.count();

    // Get auth information from headers
    const clerkUserId = c.req.header("X-Clerk-User-Id");
    return c.json({
      status: "success",
      message: "API is working!",
      database: {
        connected: databaseStatus,
        usersCount,
      },
      auth: {
        clerkUserPresent: !!clerkUserId,
        clerkUserId: clerkUserId || "not authenticated",
      },
      honoVersion: "latest",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    return c.json(
      {
        status: "error",
        message: "Error connecting to database",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Function to check database connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Export handler for Next.js API Routes
export const GET = handle(app);
export const POST = handle(app);
