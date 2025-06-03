import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromApiRoute } from "@/lib/clerk-helper";
import { withSecurity } from "@/lib/security-middleware";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSecurity(
    async (req: NextRequest) => {
      try {
        // Get current user from auth
        const { userId: clerkId } = await getAuthFromApiRoute(req);

        if (!clerkId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
          return NextResponse.json(
            { error: "Invalid schedule ID" },
            { status: 400 }
          );
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

        // Get schedule
        const schedule = await prisma.schedule.findUnique({
          where: { id },
        });

        if (!schedule) {
          return NextResponse.json(
            { error: "Schedule not found" },
            { status: 404 }
          );
        }

        // Check if user is authorized to access this schedule
        if (
          user.role !== "DOCTOR" ||
          !user.doctor ||
          user.doctor.id !== schedule.doctorId
        ) {
          // Allow staff and admin to view any schedule
          if (!["ADMIN", "STAFF"].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
        }

        return NextResponse.json(schedule);
      } catch (error) {
        console.error("Error fetching schedule:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    },
    { 
      requireAuth: true,
      rateLimit: { requests: 100, window: 60 }
    }
  )(request);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSecurity(
    async (req: NextRequest) => {
      try {
        // Get current user from auth
        const { userId: clerkId } = await getAuthFromApiRoute(req);

        if (!clerkId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
          return NextResponse.json(
            { error: "Invalid schedule ID" },
            { status: 400 }
          );
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

        // Get schedule
        const schedule = await prisma.schedule.findUnique({
          where: { id },
        });

        if (!schedule) {
          return NextResponse.json(
            { error: "Schedule not found" },
            { status: 404 }
          );
        }

        // Check if user is authorized to update this schedule
        if (
          user.role !== "DOCTOR" ||
          !user.doctor ||
          user.doctor.id !== schedule.doctorId
        ) {
          // Allow staff and admin to update any schedule
          if (!["ADMIN", "STAFF"].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
        }

        // Get update data
        const data = await req.json();
        const { dayOfWeek, startTime, endTime, isAvailable } = data;

        // Update schedule
        const updatedSchedule = await prisma.schedule.update({
          where: { id },
          data: {
            dayOfWeek: dayOfWeek !== undefined ? dayOfWeek : undefined,
            startTime: startTime ? new Date(startTime) : undefined,
            endTime: endTime ? new Date(endTime) : undefined,
            isAvailable: isAvailable !== undefined ? isAvailable : undefined,
          },
        });

        return NextResponse.json(updatedSchedule);
      } catch (error) {
        console.error("Error updating schedule:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    },
    { 
      requireAuth: true,
      rateLimit: { requests: 50, window: 60 },
      validateInput: true
    }
  )(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withSecurity(
    async (req: NextRequest) => {
      try {
        // Get current user from auth
        const { userId: clerkId } = await getAuthFromApiRoute(req);

        if (!clerkId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const id = parseInt(params.id);
        if (isNaN(id)) {
          return NextResponse.json(
            { error: "Invalid schedule ID" },
            { status: 400 }
          );
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

        // Get schedule
        const schedule = await prisma.schedule.findUnique({
          where: { id },
        });

        if (!schedule) {
          return NextResponse.json(
            { error: "Schedule not found" },
            { status: 404 }
          );
        }

        // Check if user is authorized to delete this schedule
        if (
          user.role !== "DOCTOR" ||
          !user.doctor ||
          user.doctor.id !== schedule.doctorId
        ) {
          // Allow staff and admin to delete any schedule
          if (!["ADMIN", "STAFF"].includes(user.role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
        }

        // Delete schedule
        await prisma.schedule.delete({
          where: { id },
        });

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error("Error deleting schedule:", error);
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 }
        );
      }
    },
    { 
      requireAuth: true,
      rateLimit: { requests: 30, window: 60 }
    }
  )(request);
}
