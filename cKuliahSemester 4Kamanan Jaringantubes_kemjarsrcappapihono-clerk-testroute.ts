import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

// GET /api/hono-clerk-test - Test the Clerk integration with Hono
export async function GET() {
  try {
    // Get authenticated user from Clerk
    const { userId: clerkId, sessionId } = auth();
    
    const responseData: {
      message: string;
      auth: {
        clerkId: string;
        sessionId: string;
        isSignedIn: boolean;
      };
      userInfo?: {
        found: boolean;
        id?: number;
        name?: string;
        email?: string;
        isOAuth?: boolean;
        message?: string;
        error?: string;
      };
      timestamp: string;
    } = {
      message: "Hono-Clerk integration test endpoint",
      auth: {
        clerkId: clerkId || "not authenticated",
        sessionId: sessionId || "no session",
        isSignedIn: !!clerkId
      },
      timestamp: new Date().toISOString()
    };
    
    // If user is authenticated, try to fetch from database
    if (clerkId) {
      try {
        // First try direct query
        const users = await prisma.$queryRaw\`SELECT * FROM "User" WHERE "clerkId" = \${clerkId}\`;
        const usersArray = users as any[];
        const user = usersArray.length > 0 ? usersArray[0] : null;
        
        responseData.userInfo = user ? {
          found: true,
          id: user.id,
          name: user.name,
          email: user.email,
          isOAuth: user.isOAuthUser
        } : { found: false, message: "User not found in database" };
      } catch (error) {
        responseData.userInfo = { 
          found: false, 
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in Hono-Clerk test endpoint:", error);
    return NextResponse.json(
      { 
        error: "Server error", 
        message: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}
