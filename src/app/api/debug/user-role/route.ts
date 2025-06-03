import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabaseRetry } from "@/lib/prisma-helpers";
import { requireAdmin, isDebugAllowed } from "@/lib/admin-auth";

export async function GET() {
  // Check if debug endpoints are allowed
  if (!isDebugAllowed()) {
    return NextResponse.json(
      {
        status: "error",
        message: "Debug endpoints are disabled in production",
      },
      { status: 403 }
    );
  }

  // Require admin authentication
  const adminCheck = await requireAdmin();
  if (adminCheck instanceof NextResponse) {
    return adminCheck;
  }

  const { user } = adminCheck;

  try {    // Get current user data using safe Prisma query
    const userData = await withDatabaseRetry(async () => {
      return await prisma.user.findUnique({
        where: {
          clerkId: user.clerkId,
        },
        select: {
          id: true,
          clerkId: true,
          name: true,
          email: true,
          role: true,
        },
      });
    });

    // Get admin users for debugging using safe Prisma query
    const adminUsers = await withDatabaseRetry(async () => {
      return await prisma.user.findMany({
        where: {
          role: "ADMIN",
        },
        take: 5,
        select: {
          id: true,
          clerkId: true,
          name: true,
          email: true,
          role: true,
        },
      });
    });    return NextResponse.json({
      status: "success",
      auth: { clerkId: user.clerkId },
      currentUser: userData,
      adminUsers,
      timestamp: new Date().toISOString(),
    });} catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : "Unknown",        timestamp: new Date().toISOString(),
        auth: { clerkId: null },
      },
      { status: 500 }
    );
  }
}
