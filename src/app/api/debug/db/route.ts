import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Debugging endpoint untuk memeriksa apakah database koneksi berjalan dengan baik
 * GET /api/debug/db
 */
export async function GET() {
  try {
    // Test basic connection
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
