import { prisma } from "./prisma";

/**
 * Get a user's role directly from the database
 * This function is used by the middleware to check role-based access
 * without creating an API request loop
 */
export async function getUserRole(clerkId: string | null) {
  if (!clerkId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isOAuthUser: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user role directly:", error);
    return null;
  }
}
