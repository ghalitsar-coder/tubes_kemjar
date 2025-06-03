import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { withSecurity } from "@/lib/security-middleware";
import { z } from "zod";

// Input validation schema for user updates
const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  email: z.string().email("Valid email is required").optional(),
}).refine(data => data.name || data.email, {
  message: "At least one field (name or email) must be provided"
});

/**
 * Secured endpoint to get user by ID (admin only or own profile)
 * GET /api/users/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withSecurity(
    async () => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, role: true },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const requestedUserId = parseInt(params.id);
      
      // Check if user is trying to access their own profile or is an admin
      if (currentUser.id !== requestedUserId && currentUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Access denied. You can only view your own profile or need admin privileges" },
          { status: 403 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: requestedUserId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isOAuthUser: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user,
      });
    },
    {
      rateLimit: { requests: 20, window: 60 }, // 20 requests per minute
      validateInput: false,
    }
  );
}

/**
 * Secured endpoint to update user by ID (own profile or admin only)
 * PUT /api/users/[id]
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withSecurity(
    async () => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, role: true },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const requestedUserId = parseInt(params.id);
      
      // Check if user is trying to update their own profile or is an admin
      if (currentUser.id !== requestedUserId && currentUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Access denied. You can only update your own profile or need admin privileges" },
          { status: 403 }
        );
      }

      const body = await request.json();
      
      // Validate input data
      const validationResult = updateUserSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid input data",
            details: validationResult.error.errors,
          },
          { status: 400 }
        );
      }

      const updateData = validationResult.data;

      // Check if email is being changed and if it's already taken
      if (updateData.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: updateData.email,
            id: { not: requestedUserId },
          },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 409 }
          );
        }
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: requestedUserId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isOAuthUser: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user,
      });
    },
    {
      rateLimit: { requests: 10, window: 60 }, // 10 updates per minute
      validateInput: true,
    }
  );
}

/**
 * Secured endpoint to delete user by ID (admin only)
 * DELETE /api/users/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return withSecurity(
    async () => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get current user
      const currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true, role: true },
      });

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Only admins can delete users
      if (currentUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Admin access required to delete users" },
          { status: 403 }
        );
      }

      const requestedUserId = parseInt(params.id);
      
      // Prevent admin from deleting themselves
      if (currentUser.id === requestedUserId) {
        return NextResponse.json(
          { error: "You cannot delete your own account" },
          { status: 400 }
        );
      }

      try {
        // Delete user (this will cascade to related records)
        await prisma.user.delete({
          where: { id: requestedUserId },
        });

        return NextResponse.json({
          success: true,
          message: "User deleted successfully",
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }
        throw error;
      }
    },
    {
      rateLimit: { requests: 5, window: 60 }, // 5 deletions per minute
      validateInput: false,
    }
  );
}
