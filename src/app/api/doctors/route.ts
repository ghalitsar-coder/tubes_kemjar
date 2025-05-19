import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const include = searchParams.get("include")?.split(",");
    const specialty = searchParams.get("specialty");

    // Build include object based on query params
    const includeObj: any = {};

    if (include?.includes("user")) {
      includeObj.user = true;
    }

    if (include?.includes("specialties")) {
      includeObj.specialties = {
        include: {
          specialty: true,
        },
      };
    }

    // Build where clause based on query params
    const whereObj: any = {};

    if (specialty) {
      whereObj.specialization = specialty;
    }

    const doctors = await prisma.doctor.findMany({
      include: includeObj,
      where: whereObj,
      orderBy: { user: { name: "asc" } },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}
