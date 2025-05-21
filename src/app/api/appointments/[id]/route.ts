import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid appointment ID" },
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
    } // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
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
                allergies: true,
                medicalHistory: true,
                emergencyContact: true,
              },
            },
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
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check permissions: only patient, doctor, admin or staff can see appointment
    if (
      user.id !== appointment.patient.id &&
      !(user.doctor && user.doctor.id === appointment.doctor.id) &&
      !["ADMIN", "STAFF"].includes(user.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid appointment ID" },
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

    // Fetch appointment
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Get update data
    const data = await request.json();
    const { status, notes } = data;

    // Check permissions based on update data

    // Status updates are restricted based on role
    if (status) {
      // Check if it's a doctor updating the status
      const isRequestingDoctor =
        user.doctor && user.doctor.id === appointment.doctorId;

      // Only doctors can confirm appointments
      if (status === "CONFIRMED" && !isRequestingDoctor) {
        return NextResponse.json(
          { error: "Only doctors can confirm appointments" },
          { status: 403 }
        );
      }

      // Patients can only cancel their own appointments
      if (
        status === "CANCELLED" &&
        user.role === "PATIENT" &&
        user.id !== appointment.patientId
      ) {
        return NextResponse.json(
          { error: "You can only cancel your own appointments" },
          { status: 403 }
        );
      }

      // Only doctors or admin/staff can mark as completed
      if (
        status === "COMPLETED" &&
        !isRequestingDoctor &&
        !["ADMIN", "STAFF"].includes(user.role)
      ) {
        return NextResponse.json(
          { error: "Only doctors or staff can mark appointments as completed" },
          { status: 403 }
        );
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || undefined,
        notes: notes || undefined,
      },
    });

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
