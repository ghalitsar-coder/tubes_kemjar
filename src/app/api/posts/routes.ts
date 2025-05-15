import { Hono } from "hono";
import {
  app as mainApp,
  requireAuth,
  sendSuccess,
  sendError,
} from "@/lib/hono-clerk";
import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Schema for post validation
const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

// Create a sub-app for /posts routes
const app = new Hono();

// GET /api/posts - Get all posts for the current user
app.get("/", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");

    const posts = await prisma.post.findMany({
      where: {
        authorId: userId!,
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

    return sendSuccess(c, posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return sendError(c, "Failed to fetch posts", "FETCH_POSTS_ERROR", 500, {
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

// POST /api/posts - Create a new post
app.post("/", requireAuth, zValidator("json", postSchema), async (c) => {
  try {
    const userId = c.get("userId");

    const { title, content } = await c.req.valid("json");

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId!,
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

    return sendSuccess(c, post, 201);
  } catch (error) {
    console.error("Error creating post:", error);
    return sendError(c, "Failed to create post", "CREATE_POST_ERROR", 500, {
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

// GET /api/posts/:id - Get a specific post
app.get("/:id", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");
    const postId = parseInt(c.req.param("id"), 10);

    if (isNaN(postId)) {
      return sendError(c, "Invalid post ID", "INVALID_POST_ID", 400);
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
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

    if (!post) {
      return sendError(c, "Post not found", "POST_NOT_FOUND", 404);
    }

    // Check if user owns the post
    if (post.authorId !== userId) {
      return sendError(
        c,
        "You don't have permission to access this post",
        "FORBIDDEN",
        403
      );
    }

    return sendSuccess(c, post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return sendError(c, "Failed to fetch post", "FETCH_POST_ERROR", 500, {
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

// PUT /api/posts/:id - Update a post
app.put("/:id", requireAuth, zValidator("json", postSchema), async (c) => {
  try {
    const userId = c.get("userId");
    const postId = parseInt(c.req.param("id"), 10);

    if (isNaN(postId)) {
      return sendError(c, "Invalid post ID", "INVALID_POST_ID", 400);
    }

    const { title, content } = await c.req.valid("json");

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!existingPost) {
      return sendError(c, "Post not found", "POST_NOT_FOUND", 404);
    }

    if (existingPost.authorId !== userId) {
      return sendError(
        c,
        "You don't have permission to update this post",
        "FORBIDDEN",
        403
      );
    }

    // Update post
    const post = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        title,
        content,
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

    return sendSuccess(c, post);
  } catch (error) {
    console.error("Error updating post:", error);
    return sendError(c, "Failed to update post", "UPDATE_POST_ERROR", 500, {
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

// DELETE /api/posts/:id - Delete a post
app.delete("/:id", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");
    const postId = parseInt(c.req.param("id"), 10);

    if (isNaN(postId)) {
      return sendError(c, "Invalid post ID", "INVALID_POST_ID", 400);
    }

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!existingPost) {
      return sendError(c, "Post not found", "POST_NOT_FOUND", 404);
    }

    if (existingPost.authorId !== userId) {
      return sendError(
        c,
        "You don't have permission to delete this post",
        "FORBIDDEN",
        403
      );
    }

    // Delete post
    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    return sendSuccess(c, { message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return sendError(c, "Failed to delete post", "DELETE_POST_ERROR", 500, {
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

// Mount posts routes to main app
mainApp.route("/api/posts", app);

export default app;
