import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/clerk-helper";

// GET /api/users/clerk/[clerkId] - Get user by clerkId
export async function GET(
  req: Request,
  { params }: { params: { clerkId: string } }
) {  try {
    // Check authentication
    const { userId } = auth({ request: req });

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the clerkId from the URL params
    const { clerkId } = params;

    // Make sure the user is only accessing their own data
    if (userId !== clerkId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the user in our database
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        isOAuthUser: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
