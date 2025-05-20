import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with patient information
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        patient: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a patient
    if (user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can access patient profiles" },
        { status: 403 }
      );
    }

    // Check if patient profile exists
    if (!user.patient) {
      return NextResponse.json(
        { error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Return patient profile
    return NextResponse.json(user.patient);
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch patient profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        patient: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is a patient
    if (user.role !== "PATIENT") {
      return NextResponse.json(
        { error: "Only patients can create or update patient profiles" },
        { status: 403 }
      );
    }

    // Parse request body
    const data = await request.json();

    // Validate required fields
    if (!data.dateOfBirth || !data.gender || !data.emergencyContact) {
      return NextResponse.json(
        {
          error:
            "Date of birth, gender, and emergency contact are required fields",
        },
        { status: 400 }
      );
    }

    // Format the data
    const profileData = {
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      bloodType: data.bloodType || null,
      height: data.height || null,
      weight: data.weight || null,
      allergies: data.allergies || null,
      medicalHistory: data.medicalHistory || null,
      emergencyContact: data.emergencyContact,
    };

    // Check if patient profile already exists
    if (user.patient) {
      // Update existing profile
      const updatedProfile = await prisma.patient.update({
        where: { id: user.patient.id },
        data: profileData,
      });

      return NextResponse.json(updatedProfile);
    } else {
      // Create new profile
      const newProfile = await prisma.patient.create({
        data: {
          ...profileData,
          user: {
            connect: { id: user.id },
          },
        },
      });

      return NextResponse.json(newProfile);
    }
  } catch (error) {
    console.error("Error saving patient profile:", error);
    return NextResponse.json(
      { error: "Failed to save patient profile" },
      { status: 500 }
    );
  }
}
