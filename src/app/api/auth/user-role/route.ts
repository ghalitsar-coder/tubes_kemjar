import { NextResponse } from "next/server";
import { auth } from "@/lib/clerk-helper";
import { prisma } from "@/lib/prisma";

/**
 * API endpoint yang mengintegrasikan role database dan Clerk authentication
 * GET /api/auth/user-role
 */
export async function GET() {
  try {
    // Dapatkan info autentikasi Clerk
    const { userId: clerkId } = auth();

    if (!clerkId) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Dapatkan role dari database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true },
    });

    // Response dari database saja
    const response = {
      authenticated: true,
      role: dbUser?.role || null,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching user role information:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "Failed to fetch user role information",
      },
      { status: 500 }
    );
  }
}
