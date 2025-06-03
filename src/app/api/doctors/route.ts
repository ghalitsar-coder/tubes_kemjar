import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { withSecurity } from "@/lib/security-middleware";
import { z } from "zod";

// Validation schema for query parameters
const querySchema = z.object({
  include: z.string().nullable().optional().transform(val => val || undefined),
  specialty: z.string().nullable().optional().transform(val => val || undefined),
  limit: z.string().nullable().optional().transform(val => val ? Number(val) : undefined).refine(val => val === undefined || (Number.isInteger(val) && val > 0), {
    message: "Limit must be a positive integer"
  }),
});

/**
 * Secured endpoint to get doctors list (authenticated users only)
 * GET /api/doctors
 */
export async function GET(request: NextRequest) {
  return withSecurity(
    async (req: NextRequest) => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verify user exists and is authenticated
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, role: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      try {
        const { searchParams } = new URL(req.url);
        
        // Validate query parameters
        const queryValidation = querySchema.safeParse({
          include: searchParams.get("include"),
          specialty: searchParams.get("specialty"),
          limit: searchParams.get("limit"),
        });

        if (!queryValidation.success) {
          return NextResponse.json(
            {
              error: "Invalid query parameters",
              details: queryValidation.error.errors,
            },
            { status: 400 }
          );
        }        const { include, specialty, limit } = queryValidation.data;
        const includeArray = include?.split(",") || [];// Build include object based on query params (limit what can be included)
        interface IncludeObj {
          user?: {
            select: {
              id: boolean;
              name: boolean;
            };
          };
          specialties?: {
            include: {
              specialty: {
                select: {
                  id: boolean;
                  name: boolean;
                  description: boolean;
                };
              };
            };
          };
        }

        const includeObj: IncludeObj = {};

        if (includeArray.includes("user")) {
          includeObj.user = {
            select: {
              id: true,
              name: true,
              // Don't expose email or sensitive user data
            }
          };
        }

        if (includeArray.includes("specialties")) {
          includeObj.specialties = {
            include: {
              specialty: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                }
              },
            },
          };
        }

        // Build where clause based on query params
        interface WhereObj {
          specialization?: {
            contains: string;
            mode: 'insensitive';
          };
        }

        const whereObj: WhereObj = {};

        if (specialty) {
          whereObj.specialization = {
            contains: specialty,
            mode: 'insensitive'
          };
        }        const doctors = await prisma.doctor.findMany({
          include: includeObj,
          where: whereObj,
          orderBy: { user: { name: "asc" } },
          take: limit || 50, // Default limit to prevent large queries
        });

        return NextResponse.json({
          success: true,
          doctors,
          total: doctors.length,
        });
      } catch (error) {
        console.error("Error fetching doctors:", error);
        return NextResponse.json(
          { 
            success: false,
            error: "Failed to fetch doctors",
            details: error instanceof Error ? error.message : "Unknown error"
          },
          { status: 500 }
        );
      }    },
    {
      rateLimit: { requests: 20, window: 60 }, // 20 requests per minute
      validateInput: false,
    }
  )(request);
}
