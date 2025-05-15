import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/database-test - Test and fix database connection
export async function GET() {
  try {
    // Try to connect to the database and get users count
    const usersCount = await prisma.user.count();

    return NextResponse.json({
      status: "Connected",
      users: usersCount,
      message: "Database connection successful",
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        error: "Database Connection Error",
        details: error instanceof Error ? error.message : "Unknown error",
        help: "Check your DATABASE_URL environment variable",
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/database-test - Force sync all Clerk users
// This is a utility endpoint that can help ensure users are synced
export async function POST(req: Request) {
  try {
    const { secret } = await req.json();

    // Basic security check (you should use a more secure method in production)
    if (
      secret !== process.env.ADMIN_SECRET &&
      secret !== "admin-tubes-kemjar"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Check database connection
    let dbStatus;
    try {
      const usersCount = await prisma.user.count();
      dbStatus = { connected: true, usersCount };
    } catch (error) {
      dbStatus = {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: dbStatus.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "Database check completed",
      database: dbStatus,
      message: "Use the dashboard sync button to sync your user",
    });
  } catch (error) {
    console.error("Error in database test:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
