import { NextResponse } from "next/server";
import { auth } from "@/lib/clerk-helper";
import { prisma } from "@/lib/prisma";
import { withDatabaseRetry } from "@/lib/prisma-helpers";

export async function GET() {
  try {
    // Dapatkan Clerk ID dari auth
    const { userId: clerkId } = auth();

    // Jika tidak ada user yang login
    if (!clerkId) {
      return NextResponse.json({
        status: "error",
        message: "Not authenticated",
        auth: { clerkId: null },
      });
    }    // Dapatkan semua user dengan clerkId tersebut (seharusnya hanya 1)
    const userData = await withDatabaseRetry(async () => {
      return await prisma.$queryRaw`
        SELECT id, "clerkId", name, email, role FROM "User" WHERE "clerkId" = ${clerkId}
      `;
    });

    // Dapatkan juga user dengan role ADMIN untuk debugging
    const adminUsers = await withDatabaseRetry(async () => {
      return await prisma.$queryRaw`
        SELECT id, "clerkId", name, email, role FROM "User" WHERE role = 'ADMIN' LIMIT 5
      `;
    });

    return NextResponse.json({
      status: "success",
      auth: { clerkId },
      currentUser: userData,
      adminUsers,
      timestamp: new Date().toISOString(),
    });  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : "Unknown",
        timestamp: new Date().toISOString(),
        auth: { clerkId: auth().userId },
      },
      { status: 500 }
    );
  }
}
