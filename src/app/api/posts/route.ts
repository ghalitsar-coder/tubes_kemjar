import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/clerk-helper";

// GET /api/posts - Mendapatkan posts untuk pengguna yang login
export async function GET() {
  try {
    // Get authenticated user
    const { userId: clerkId } = auth();

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
    });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Membuat post baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, authorId } = body;

    // Validasi input
    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Cek apakah author ada
    const author = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    // Buat post baru
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
