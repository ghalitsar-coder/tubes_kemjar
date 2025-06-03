import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isDebugAllowed } from "@/lib/admin-auth";

/**
 * Secured debugging endpoint for database connection and basic stats (admin only)
 * GET /api/debug/db
 */
export async function GET() {
  // Check if debug endpoints are allowed
  if (!isDebugAllowed()) {
    return NextResponse.json(
      {
        success: false,
        error: "Debug endpoints are disabled in production",
      },
      { status: 403 }
    );
  }

  // Require admin authentication
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  try {
    // Test basic connection using safe query
    const testResult = await prisma.$queryRaw`SELECT 1 AS result`;

    // Count users
    const userCount = await prisma.user.count();

    // Get list of users (limited to 10)
    const users = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        isOAuthUser: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        testResult,
        stats: {
          userCount,
        },
      },
      users,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown database error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
