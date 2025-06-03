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

    const patientId = parseInt(params.id);
    if (isNaN(patientId)) {
      return NextResponse.json(
        { error: "Invalid patient ID" },
        { status: 400 }
      );
    }

    // Get user from database with doctor information
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
        { error: "Only doctors can access patient details" },
        { status: 403 }
      );
    }

    // Check if this doctor has any appointments with this patient
    const doctorId = user.doctor.id;
    const hasAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        patientId,
      },
    });

    if (!hasAppointment && !["ADMIN", "STAFF"].includes(user.role)) {
      return NextResponse.json(
        { error: "You do not have access to this patient's information" },
        { status: 403 }
      );
    }

    // Get patient information
    const patient = await prisma.user.findUnique({
      where: {
        id: patientId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        patient: {
          select: {
            dateOfBirth: true,
            gender: true,
            bloodType: true,
            height: true,
            weight: true,
            allergies: true,
            medicalHistory: true,
            emergencyContact: true,
          },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);    } catch (error) {
      console.error("Error fetching patient details:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  },
  {
    rateLimit: { requests: 30, window: 60 }, // 30 requests per minute
    validateInput: false,
  }
)(request);
}
