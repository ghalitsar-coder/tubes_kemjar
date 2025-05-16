import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

// API route untuk mendapatkan peran pengguna
// Ini akan dipakai oleh middleware
export async function GET(request: NextRequest) {
  try {
    // Mendapatkan userId dari query parameter
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    // Cek apakah request dari middleware
    const isMiddlewareRequest = request.headers.get('x-middleware-request') === 'true';
    
    // Debug request
    console.log(`Role API request for userId: ${userId}, from middleware: ${isMiddlewareRequest}`);

    try {
      // Mencari user berdasarkan Clerk ID
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: {
          id: true,
          role: true,
        },
      });

      if (!user) {
        console.log(`User not found for clerkId: ${userId}, returning default role`);
        // Jika user tidak ditemukan, kita akan gunakan role default
        return NextResponse.json({ role: "USER" });
      }

      return NextResponse.json({ role: user.role });
    } catch (dbError) {
      console.error("Database error in role API:", dbError);
      return NextResponse.json({ role: "USER" });
    }
  } catch (error) {
    console.error("Error in user role API:", error);
    // Kembalikan role default agar sistem tetap berfungsi
    return NextResponse.json({ role: "USER" });
  }
}
