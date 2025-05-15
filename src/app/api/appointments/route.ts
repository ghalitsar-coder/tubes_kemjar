import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const data = await request.json();
    const { doctorId, date, startTime, endTime, reason, type } = data;

    // Validate required fields
    if (!doctorId || !date || !startTime || !endTime || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find doctor
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Convert string dates to Date objects
    const appointmentDate = new Date(date);
    const appointmentStartTime = new Date(startTime);
    const appointmentEndTime = new Date(endTime);

    // Validate times
    if (appointmentStartTime >= appointmentEndTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    // Check for conflicts in doctor's schedule
    const dayOfWeek = appointmentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Check if the doctor is available on that day
    const doctorSchedule = await prisma.schedule.findFirst({
      where: {
        doctorId: doctor.id,
        dayOfWeek,
        isAvailable: true,
        startTime: {
          lte: appointmentStartTime,
        },
        endTime: {
          gte: appointmentEndTime,
        },
      },
    });

    if (!doctorSchedule) {
      return NextResponse.json(
        { error: "Doctor is not available at the selected time" },
        { status: 400 }
      );
    }

    // Check for conflicts with existing appointments
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: doctor.id,
        date: {
          equals: appointmentDate,
        },
        OR: [
          {
            // New appointment starts during an existing appointment
            startTime: {
              lte: appointmentStartTime,
            },
            endTime: {
              gt: appointmentStartTime,
            },
          },
          {
            // New appointment ends during an existing appointment
            startTime: {
              lt: appointmentEndTime,
            },
            endTime: {
              gte: appointmentEndTime,
            },
          },
          {
            // New appointment encompasses an existing appointment
            startTime: {
              gte: appointmentStartTime,
            },
            endTime: {
              lte: appointmentEndTime,
            },
          },
        ],
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
      },
    });

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 400 }
      );
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: user.id,
        doctorId: doctor.id,
        date: appointmentDate,
        startTime: appointmentStartTime,
        endTime: appointmentEndTime,
        reason,
        type: type || "IN_PERSON",
        status: "PENDING",
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Filter parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause based on user role and filters
    const whereClause: any = {};
    
    if (user.role === "DOCTOR" && user.doctor) {
      whereClause.doctorId = user.doctor.id;
    } else if (user.role === "PATIENT") {
      whereClause.patientId = user.id;
    } else if (!["ADMIN", "STAFF"].includes(user.role)) {
      // If user is neither doctor, patient, admin nor staff
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    // Fetch appointments
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}