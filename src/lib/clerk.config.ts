import { clerkClient } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

// Function to synchronize Clerk user to database
export async function syncClerkUser(clerkUserId: string) {
  try {
    // Get user from Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);

    if (!clerkUser) {
      throw new Error("User not found in Clerk");
    }

    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      throw new Error("No email found for user");
    }

    // Check if user is OAuth user
    const isOAuthUser =
      clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0;

    // Get profile picture
    const profilePic =
      clerkUser.imageUrl || clerkUser.externalAccounts?.[0]?.imageUrl || null;

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    let dbUser;

    if (existingUser) {
      // Update existing user
      dbUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email: primaryEmail,
          name:
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            "User",
          profilePic: profilePic,
          isOAuthUser: isOAuthUser,
        },
      });
    } else {
      // Create new user
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUserId,
          name:
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            "User",
          email: primaryEmail,
          password: "", // Empty password for OAuth users
          profilePic: profilePic,
          isOAuthUser: isOAuthUser,
        },
      });
    }

    return dbUser;
  } catch (error) {
    console.error("Error syncing user:", error);
    throw error;
  }
}

// Function to check if a user exists in database
export async function checkUserInDatabase(clerkUserId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    return !!user;
  } catch (error) {
    console.error("Error checking user in database:", error);
    return false;
  }
}
