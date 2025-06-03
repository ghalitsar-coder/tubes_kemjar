import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, isDebugAllowed } from "@/lib/admin-auth";
import { withSecurity } from "@/lib/security-middleware";

/**
 * Secured database connection test endpoint (admin only)
 * GET /api/admin/database-test
 */
export async function GET() {
  return withSecurity(
    async () => {
      // Check if admin endpoints are allowed
      if (!isDebugAllowed()) {
        return NextResponse.json(
          {
            success: false,
            error: "Admin endpoints are disabled in production",
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
        // Test database connection and get basic stats
        const usersCount = await prisma.user.count();
        const doctorsCount = await prisma.doctor.count();
        const appointmentsCount = await prisma.appointment.count();

        return NextResponse.json({
          success: true,
          status: "Connected",
          stats: {
            users: usersCount,
            doctors: doctorsCount,
            appointments: appointmentsCount,
          },
          message: "Database connection successful",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Database connection error:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Database Connection Error",
            details: error instanceof Error ? error.message : "Unknown error",
            help: "Check your DATABASE_URL environment variable",
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    },
    {
      rateLimit: { requests: 5, window: 60 }, // 5 requests per minute
      validateInput: false,
    }
  );
}

/**
 * Secured database sync endpoint (admin only)
 * POST /api/admin/database-test
 */
export async function POST() {
  return withSecurity(
    async () => {
      // Check if admin endpoints are allowed
      if (!isDebugAllowed()) {
        return NextResponse.json(
          {
            success: false,
            error: "Admin endpoints are disabled in production",
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
        // Check database connection
        let dbStatus;
        try {
          const usersCount = await prisma.user.count();
          const doctorsCount = await prisma.doctor.count();
          const appointmentsCount = await prisma.appointment.count();

          dbStatus = {
            connected: true,
            stats: {
              usersCount,
              doctorsCount,
              appointmentsCount,
            },
          };
        } catch (error) {
          dbStatus = {
            connected: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }

        if (!dbStatus.connected) {
          return NextResponse.json(
            {
              success: false,
              error: "Database connection failed",
              details: dbStatus.error,
              timestamp: new Date().toISOString(),
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          status: "Database check completed",
          database: dbStatus,
          message: "Database is connected and operational",
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error in database test:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    },
    {
      rateLimit: { requests: 3, window: 60 }, // 3 requests per minute
      validateInput: true,
    }
  );
}
