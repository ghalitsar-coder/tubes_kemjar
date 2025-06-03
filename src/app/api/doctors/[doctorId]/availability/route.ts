import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { withSecurity } from "@/lib/security-middleware";

// Static export config to fix the route
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest, context: { params: Promise<{ doctorId: string }> }) {
  return withSecurity(
    async (req: NextRequest) => {
      try {
        // Get current user from auth
        const { userId: clerkId } = await auth();

        if (!clerkId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get doctorId from context params
        const params = await context.params;
        const doctorId = parseInt(params.doctorId || "");

        console.log(`Doctor availability params: `, params);
        if (isNaN(doctorId)) {
          return NextResponse.json({ error: "Invalid doctor ID" }, { status: 400 });
        }

        // Check if doctor exists
        const doctor = await prisma.doctor.findUnique({
          where: { id: doctorId },
        });

        if (!doctor) {
          return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
        }

        // Parse date and dayOfWeek from URL
        const url = new URL(req.url);
        const date = url.searchParams.get("date");
        const dayOfWeek = parseInt(url.searchParams.get("dayOfWeek") || "");

        if (!date || isNaN(dayOfWeek)) {
          return NextResponse.json(
            { error: "Missing or invalid date parameters" },
            { status: 400 }
          );
        }

        // Get doctor's schedule for the specified day
        const schedule = await prisma.schedule.findFirst({
          where: {
            doctorId,
            dayOfWeek,
          },
        });

        if (!schedule) {
          return NextResponse.json({
            availableTimes: [],
            message: "No schedule found for this day",
          });
        }

        // Get appointments on that date to check availability
        const appointments = await prisma.appointment.findMany({
          where: {
            doctorId,
            startTime: {
              gte: new Date(`${date}T00:00:00`),
              lt: new Date(`${date}T23:59:59`),
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        });

        // Generate time slots based on schedule
        const startHour = schedule.startTime.getHours();
        const startMinute = schedule.startTime.getMinutes();
        const endHour = schedule.endTime.getHours();
        const endMinute = schedule.endTime.getMinutes();

        const timeSlots = [];
        const slotDuration = 30; // 30 minute slots

        // Generate slots with 30 min intervals
        for (
          let h = startHour;
          h < endHour || (h === endHour && startMinute < endMinute);
          h++
        ) {
          for (
            let m = h === startHour ? startMinute : 0;
            m < 60;
            m += slotDuration
          ) {
            if (h === endHour && m >= endMinute) {
              break;
            }

            const startTime = `${date}T${h.toString().padStart(2, "0")}:${m
              .toString()
              .padStart(2, "0")}`;

            // Calculate end time (30 mins later)
            let endH = h;
            let endM = m + slotDuration;

            if (endM >= 60) {
              endH += 1;
              endM -= 60;
            }

            // Skip if beyond end time
            if (endH > endHour || (endH === endHour && endM > endMinute)) {
              continue;
            }

            const endTime = `${date}T${endH.toString().padStart(2, "0")}:${endM
              .toString()
              .padStart(2, "0")}`;

            // Check if slot is available (not already booked)
            const isAvailable = !appointments.some((appointment) => {
              const appointmentStart = new Date(
                appointment.startTime
              ).toISOString();
              const appointmentEnd = new Date(appointment.endTime).toISOString();
              const slotStart = new Date(`${startTime}:00.000Z`).toISOString();
              const slotEnd = new Date(`${endTime}:00.000Z`).toISOString();

              // Check for overlap
              return slotStart < appointmentEnd && slotEnd > appointmentStart;
            });

            timeSlots.push({
              start: startTime,
              end: endTime,
              isAvailable,
            });
          }
        }

        return NextResponse.json({
          availableTimes: timeSlots,
        });
      } catch (error) {
        console.error("Error fetching doctor availability:", error);
        return NextResponse.json(
          { error: "Failed to fetch doctor availability" },
          { status: 500 }
        );
      }    },
    {
      rateLimit: { requests: 20, window: 60 }, // 20 requests per minute for availability checks
      validateInput: false,
    }
  )(request);
}
