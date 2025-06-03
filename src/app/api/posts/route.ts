import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { withSecurity } from "@/lib/security-middleware";
import { z } from "zod";

// Input validation schema for post creation
const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required").max(5000, "Content too long"),
});

/**
 * Secured endpoint to get user's posts (authenticated users only)
 * GET /api/posts
 */
export async function GET() {
  return withSecurity(
    async () => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json(
          {
            error: "Unauthorized",
            message: "You must be logged in to view posts",
          },
          { status: 401 }
        );
      }

      // Find user in database
      const user = await prisma.user.findFirst({
        where: {
          clerkId: {
            equals: clerkId,
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          {
            error: "User not found",
            message: "Your account was not found in the database",
          },
          { status: 404 }
        );
      }

      // Get posts for this user
      const posts = await prisma.post.findMany({
        where: {
          authorId: user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return NextResponse.json({
        success: true,
        posts,
        total: posts.length,
      });
    },
    {
      rateLimit: { requests: 30, window: 60 }, // 30 requests per minute
      validateInput: false,
    }
  );
}

/**
 * Secured endpoint to create a new post (authenticated users only)
 * POST /api/posts
 */
export async function POST(request: Request) {
  return withSecurity(
    async () => {
      const { userId: clerkId } = await auth();

      if (!clerkId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Find user in database
      const user = await prisma.user.findFirst({
        where: {
          clerkId: {
            equals: clerkId,
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const body = await request.json();
      
      // Validate input data
      const validationResult = createPostSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: "Invalid input data",
            details: validationResult.error.errors,
          },
          { status: 400 }
        );
      }

      const { title, content } = validationResult.data;

      // Create post with authenticated user as author
      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId: user.id, // Use authenticated user's ID, not from request
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Post created successfully",
        post,
      }, { status: 201 });
    },
    {
      rateLimit: { requests: 10, window: 60 }, // 10 post creations per minute
      validateInput: true,
    }
  );
}
