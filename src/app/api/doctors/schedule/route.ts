import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { withSecurity } from "@/lib/security-middleware";

export const dynamic = "force-dynamic";

/**
 * Secured endpoint for doctors to get their schedule (doctor access only)
 * GET /api/doctors/schedule
 */
export async function GET() {
  return withSecurity(
    async () => {
      // Get current user from auth
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          doctor: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user is a doctor
      if (user.role !== "DOCTOR" || !user.doctor) {
        return NextResponse.json(
          { error: "Only doctors can access their schedules" },
          { status: 403 }
        );
      }

      // Get doctor's schedule
      const schedules = await prisma.schedule.findMany({
        where: {
          doctorId: user.doctor.id,
        },
        orderBy: {
          dayOfWeek: "asc",
        },
      });      return NextResponse.json({
        success: true,
        schedules,
        total: schedules.length,
      });
    },
    {
      rateLimit: { requests: 15, window: 60 }, // 15 requests per minute
      validateInput: false,
    }
  );
}

/**
 * Secured endpoint for doctors to create schedule entries (doctor access only)
 * POST /api/doctors/schedule
 */
export async function POST(request: NextRequest) {
  return withSecurity(
    async () => {
      // Get current user from auth
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          doctor: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if user is a doctor
      if (user.role !== "DOCTOR" || !user.doctor) {
        return NextResponse.json(
          { error: "Only doctors can create schedules" },
          { status: 403 }
        );
      }

      // Get schedule data from request
      const data = await request.json();
      const { dayOfWeek, startTime, endTime, isAvailable = true } = data;

      // Validate required fields
      if (dayOfWeek === undefined || !startTime || !endTime) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if day of week is valid (0-6)
      if (dayOfWeek < 0 || dayOfWeek > 6) {
        return NextResponse.json(
          { error: "Day of week must be between 0 and 6" },
          { status: 400 }
        );
      }

      // Create new schedule
      const schedule = await prisma.schedule.create({
        data: {
          doctorId: user.doctor.id,
          dayOfWeek,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isAvailable,
        },      });

      return NextResponse.json({
        success: true,
        message: "Schedule created successfully",
        schedule,
      });
    },
    {
      rateLimit: { requests: 10, window: 60 }, // 10 creates per minute
      validateInput: true,
    }
  );
}
