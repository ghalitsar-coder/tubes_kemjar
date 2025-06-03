import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthFromApiRoute } from "@/lib/clerk-helper";
import { withSecurity } from "@/lib/security-middleware";

export const dynamic = "force-dynamic";

/**
 * Secured endpoint for doctors to get their patients list
 * GET /api/doctors/patients
 */
export async function GET(request: NextRequest) {
  return withSecurity(
    async (req: NextRequest) => {
      // Get current user from auth
      const { userId: clerkId } = await getAuthFromApiRoute(req);

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          { error: "Only doctors can access their patients" },
          { status: 403 }
        );
      }

      // Get all patients who have appointments with this doctor
      const doctorId = user.doctor.id;

      // Get distinct patient IDs who have appointments with this doctor
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId,
        },
        select: {
          patientId: true,
        },
        distinct: ["patientId"],
      });

      const patientIds = appointments.map((app) => app.patientId);

      if (patientIds.length === 0) {
        return NextResponse.json({
          success: true,
          patients: [],
          total: 0,
        });
      }

      // Get patient information (limited to necessary fields)
      const patients = await prisma.user.findMany({
        where: {
          id: {
            in: patientIds,
          },
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
              // Don't expose sensitive medical history in list view
            },
          },
        },
      });

      // For each patient, get their appointment count and most recent appointment
      const patientsWithAppointments = await Promise.all(
        patients.map(async (patient) => {
          // Count appointments
          const appointmentsCount = await prisma.appointment.count({
            where: {
              patientId: patient.id,
              doctorId,
            },
          });

          // Get most recent appointment
          const recentAppointment = await prisma.appointment.findFirst({
            where: {
              patientId: patient.id,
              doctorId,
            },
            orderBy: {
              date: "desc",
            },
            select: {
              id: true,
              date: true,
              status: true,
            },
          });

          return {
            ...patient,
            appointmentsCount,
            recentAppointment,
          };
        })
      );

      return NextResponse.json({
        success: true,
        patients: patientsWithAppointments,
        total: patientsWithAppointments.length,
      });    },
    {
      rateLimit: { requests: 20, window: 60 }, // 20 requests per minute
      validateInput: false,
    }
  )(request);
}
