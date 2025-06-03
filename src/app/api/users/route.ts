import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withSecurity } from "@/lib/security-middleware";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Input validation schema for user creation
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["PATIENT", "DOCTOR", "ADMIN"]).optional().default("PATIENT"),
});

/**
 * Secured endpoint to get users (admin only)
 * GET /api/users
 */
export async function GET() {
  return withSecurity(
    async () => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get current user and check if admin
      const currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true },
      });

      if (!currentUser || currentUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      // Get users with limited information
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isOAuthUser: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        users,
        total: users.length,
      });
    },
    {
      rateLimit: { requests: 10, window: 60 }, // 10 requests per minute
      validateInput: false,
    }
  );
}

/**
 * Secured endpoint to create a new user (admin only)
 * POST /api/users
 */
export async function POST(request: Request) {
  return withSecurity(
    async () => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Get current user and check if admin
      const currentUser = await prisma.user.findUnique({
        where: { clerkId },
        select: { role: true },
      });

      if (!currentUser || currentUser.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validationResult = createUserSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid input data",
            details: validationResult.error.errors,
          },
          { status: 400 }
        );
      }

      const { name, email, password, role } = validationResult.data;

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          isOAuthUser: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isOAuthUser: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user,
      }, { status: 201 });
    },
    {
      rateLimit: { requests: 5, window: 60 }, // 5 user creations per minute
      validateInput: true,
    }
  );
}
