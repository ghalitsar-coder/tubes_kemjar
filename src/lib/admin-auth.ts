import { auth } from "@/lib/clerk-helper";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Middleware to check if the current user is an admin
 * Returns the user data if admin, or an error response if not
 */
export async function requireAdmin() {
  try {
    const authResult = auth();
    const { userId: clerkId } = typeof authResult === 'object' && 'userId' in authResult 
      ? authResult 
      : await authResult;

    if (!clerkId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Find user and check admin role using safe Prisma query
    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clerkId: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: "error",
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          status: "error",
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    return { user, isAdmin: true };
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to check if current environment allows debug endpoints
 */
export function isDebugAllowed(): boolean {
  return process.env.NODE_ENV === "development" || process.env.ALLOW_DEBUG === "true";
}
