import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

// Helper function to transform database gender enum to frontend format
function transformGenderForFrontend(gender: string | null): string {
  if (!gender) return "";
  
  switch (gender) {
    case "MALE":
      return "Male";
    case "FEMALE":
      return "Female";
    case "OTHER":
      return "Other";
    default:
      return gender;
  }
}

// Validation schema for patient profile
const patientProfileSchema = z.object({
  dateOfBirth: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate < new Date();
  }, {
    message: "Invalid date of birth",
  }),
  gender: z.string()
    .refine((val) => ["Male", "Female", "Other", "Prefer not to say", "MALE", "FEMALE", "OTHER"].includes(val), {
      message: "Gender must be Male, Female, Other, or Prefer not to say",
    })
    .transform((val) => {
      // Transform frontend values to database enum values
      switch (val.toLowerCase()) {
        case "male":
          return "MALE";
        case "female":
          return "FEMALE";
        case "other":
        case "prefer not to say":
          return "OTHER";
        default:
          return val; // In case it's already in the correct format
      }
    }),
  bloodType: z.string().regex(/^(A|B|AB|O)[+-]$/, "Invalid blood type format").optional(),
  height: z.number().min(0).max(300, "Height must be between 0 and 300 cm").optional(),
  weight: z.number().min(0).max(1000, "Weight must be between 0 and 1000 kg").optional(),
  allergies: z.string().max(2000, "Allergies description too long").optional(),
  medicalHistory: z.string().max(5000, "Medical history too long").optional(),
  emergencyContact: z.string().min(1, "Emergency contact is required").max(500, "Emergency contact too long"),
});

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
    }    // Return patient profile with transformed gender for frontend
    const patientProfile = {
      ...user.patient,
      gender: transformGenderForFrontend(user.patient.gender)
    };
    
    return NextResponse.json(patientProfile);
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

    // Parse and validate request body
    const data = await request.json();
    
    const validationResult = patientProfileSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Format the data from validated input
    const profileData = {
      dateOfBirth: new Date(validatedData.dateOfBirth),
      gender: validatedData.gender,
      bloodType: validatedData.bloodType || null,
      height: validatedData.height || null,
      weight: validatedData.weight || null,
      allergies: validatedData.allergies || null,
      medicalHistory: validatedData.medicalHistory || null,
      emergencyContact: validatedData.emergencyContact,
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
