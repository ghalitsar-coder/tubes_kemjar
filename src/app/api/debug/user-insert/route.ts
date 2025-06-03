import { NextResponse } from "next/server";
import { requireAdmin, isDebugAllowed } from "@/lib/admin-auth";
import { z } from "zod";

// Input validation schema
const userInsertSchema = z.object({
  clerkId: z.string().min(1, "Clerk ID is required"),
  email: z.string().email("Valid email is required"),
  name: z.string().min(1, "Name is required"),
});

/**
 * Secured endpoint for manual user insertion (admin and development only)
 * POST /api/debug/user-insert
 */
export async function POST(req: Request) {
  // Check if debug endpoints are allowed
  if (!isDebugAllowed()) {
    return NextResponse.json(
      {
        success: false,
        error: "Debug endpoints are disabled in production",
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
    // Import prisma dinamis untuk menghindari masalah inisialisasi
    const { prisma } = await import("@/lib/prisma");

    // Parse and validate body
    const body = await req.json();
    const validationResult = userInsertSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { clerkId, email, name } = validationResult.data;

    // Cek apakah user sudah ada
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ clerkId }, { email }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
          user: {
            id: existingUser.id,
            clerkId: existingUser.clerkId,
            email: existingUser.email,
            name: existingUser.name,
          },
        },
        { status: 409 }
      );
    }

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
        password: "", // Password kosong untuk OAuth users
        isOAuthUser: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: {
          id: newUser.id,
          clerkId: newUser.clerkId,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
