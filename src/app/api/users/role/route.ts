import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get userId from query parameter or use clerkId to find the user
    const searchParams = request.nextUrl.searchParams;
    const queryUserId = searchParams.get("userId");
    
    // Only allow querying other users' roles if the current user is staff or admin
    if (queryUserId && queryUserId !== clerkId) {
      // First get the current user's role
      const currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true }
      });
      
      if (!currentUser || !['ADMIN', 'STAFF'].includes(currentUser.role)) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    // Find the user with the specified clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: queryUserId || clerkId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOAuthUser: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...user });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}