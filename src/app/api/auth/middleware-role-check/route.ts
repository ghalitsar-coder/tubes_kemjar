import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withDatabaseRetry } from "@/lib/prisma-helpers";

export async function GET(request: Request) {
  try {
    // Get the userId from the query parameter
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          role: "PATIENT", // Default ke PATIENT untuk keamanan
          authenticated: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }    // Dapatkan role pengguna dari database dengan retry mechanism
    const user = await withDatabaseRetry(() => 
      prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
      })
    );

    if (!user) {
      // Default to PATIENT if user not found in our database
      return NextResponse.json({
        role: "PATIENT", // Default role for users not in db
        authenticated: true,
        message: "User not found in database",
      });
    }

    return NextResponse.json({
      role: user.role,
      authenticated: true,
    });  } catch (error) {
    console.error("Error fetching user role:", error);
    
    // Selalu return PATIENT role pada error untuk keamanan
    return NextResponse.json({
      role: "PATIENT", 
      authenticated: false,
      error: "Database connection error, defaulting to PATIENT role for security"
    }, { status: 500 });
    return NextResponse.json(
      {
        role: "PATIENT", // Default to lowest access level for security
        authenticated: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
