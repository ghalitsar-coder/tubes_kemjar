import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs";

// POST /api/users/sync
// Manually sync the current user data from Clerk to our database
export async function POST() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user from Clerk
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const primaryEmail = user.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    // Check if this is an OAuth user
    const isOAuthUser =
      user.externalAccounts && user.externalAccounts.length > 0;
    const googleAccount = user.externalAccounts?.find(
      (account) => account.provider.toLowerCase() === "google"
    );

    // Get profile picture
    const profilePic = user.imageUrl || googleAccount?.imageUrl || "";

    // Check if user already exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    let dbUser;

    if (existingUser) {
      // Update existing user
      dbUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: primaryEmail,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          isOAuthUser: isOAuthUser || false,
          profilePic: profilePic || null,
        },
      });
    } else {
      // Create new user
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: primaryEmail,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          password: "", // Empty password for OAuth users
          isOAuthUser: isOAuthUser || false,
          profilePic: profilePic || null,
        },
      });
    }

    return NextResponse.json({
      message: "User synced successfully",
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        isOAuthUser: dbUser.isOAuthUser,
        profilePic: dbUser.profilePic,
      },
    });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
