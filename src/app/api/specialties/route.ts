import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { withSecurity } from "@/lib/security-middleware";

/**
 * Endpoint to get medical specialties (public data with rate limiting)
 * GET /api/specialties
 */
export async function GET(request: NextRequest) {
  return withSecurity(
    async () => {
      try {
        const specialties = await prisma.specialty.findMany({
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            // Don't expose internal fields
          },
        });

        return NextResponse.json({
          success: true,
          specialties,
          total: specialties.length,
        });
      } catch (error) {
        console.error("Error fetching specialties:", error);
        return NextResponse.json(
          { 
            success: false,
            error: "Failed to fetch specialties",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          { status: 500 }
        );
      }
    },
    {
      rateLimit: { requests: 50, window: 60 }, // 50 requests per minute (public endpoint)
      validateInput: false,
    }
  )(request);
}
