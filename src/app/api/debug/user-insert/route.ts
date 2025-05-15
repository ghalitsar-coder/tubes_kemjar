import { NextResponse } from "next/server";

/**
 * Endpoint untuk mencoba insert user secara manual untuk debugging proses
 * POST /api/debug/user-insert
 */
export async function POST(req: Request) {
  try {
    // Import prisma dinamis untuk menghindari masalah inisialisasi
    const { prisma } = await import("@/lib/prisma");

    // Parse body
    const body = await req.json();
    const { clerkId, email, name } = body;

    if (!clerkId || !email || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: clerkId, email, name",
        },
        { status: 400 }
      );
    }

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
