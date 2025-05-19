import { NextResponse } from "next/server";
import { auth } from "@/lib/clerk-helper";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = auth();
    console.log("Auth check in GET role API:", { clerkId });

    // Jika tidak ada user yang login
    if (!clerkId) {
      console.log("No clerk ID found in auth");
      return NextResponse.json(
        { role: "PATIENT", authenticated: false },
        { status: 200 }
      );
    }

    try {
      // Dapatkan user dari database
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true },
      });

      if (user) {
        console.log(`User role found: ${user.role}`);
        return NextResponse.json(
          {
            role: user.role,
            authenticated: true,
          },
          { status: 200 }
        );
      } else {
        console.log("User not found in database despite valid clerkId");
        // Jika user tidak ditemukan tapi punya clerkId, kemungkinan besar belum disetup di database
        return NextResponse.json(
          {
            role: "PATIENT",
            authenticated: true,
            needsSetup: true,
          },
          { status: 200 }
        );
      }
    } catch (dbError) {
      console.error("Database error while fetching user:", dbError);
      // Jika terjadi error database, kita tetap kembalikan PATIENT untuk mencegah error di UI
      return NextResponse.json(
        {
          role: "PATIENT",
          error: "Database error",
          authenticated: true,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in auth check:", error);
    // Jangan pernah menampilkan error internal ke client, selalu berikan fallback aman
    return NextResponse.json(
      {
        role: "PATIENT",
        authenticated: false,
        error: "Authentication error",
      },
      { status: 200 }
    ); // Return 200 dengan pesan error yang aman
  }
}
