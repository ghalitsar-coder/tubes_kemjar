import { Hono } from "hono";
import { app as parentApp, requireAuth, AuthVariables } from "@/lib/hono";
import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Schema validasi untuk post
const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

// Sub-app untuk rute /posts
export const app = new Hono<{
  Variables: AuthVariables;
}>()
  // Terapkan middleware otentikasi untuk semua rute posts
  .use("/*", requireAuth)
  // GET /posts - Mendapatkan semua posts
  .get("/", async (c) => {
    try {
      const userId = c.get("userId");

      // Jika user belum terautentikasi, kembalikan error
      if (userId === null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const posts = await prisma.post.findMany({
        where: {
          authorId: userId,
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

      return c.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return c.json({ error: "Failed to fetch posts" }, 500);
    }
  })
  // POST /posts - Membuat post baru
  .post("/", zValidator("json", postSchema), async (c) => {
    try {
      const userId = c.get("userId");
      // Jika user belum terautentikasi, kembalikan error
      if (userId === null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { title, content } = await c.req.valid("json");

      const post = await prisma.post.create({
        data: {
          title,
          content,
          authorId: userId,
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

      return c.json(post, 201);
    } catch (error) {
      console.error("Error creating post:", error);
      return c.json({ error: "Failed to create post" }, 500);
    }
  })
  // GET /posts/:id - Mendapatkan post berdasarkan ID
  .get("/:id", async (c) => {
    try {
      const postId = parseInt(c.req.param("id"));
      const userId = c.get("userId");

      // Jika user belum terautentikasi, kembalikan error
      if (userId === null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (isNaN(postId)) {
        return c.json({ error: "Invalid post ID" }, 400);
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
        return c.json({ error: "Post not found" }, 404);
      }

      // Hanya pemilik post yang bisa melihat
      if (post.authorId !== userId) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      return c.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      return c.json({ error: "Failed to fetch post" }, 500);
    }
  })
  // PUT /posts/:id - Mengupdate post
  .put("/:id", zValidator("json", postSchema), async (c) => {
    try {
      const postId = parseInt(c.req.param("id"));
      const userId = c.get("userId");

      // Jika user belum terautentikasi, kembalikan error
      if (userId === null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { title, content } = await c.req.valid("json");

      if (isNaN(postId)) {
        return c.json({ error: "Invalid post ID" }, 400);
      }

      // Cek apakah post ada dan merupakan milik pengguna
      const existingPost = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!existingPost) {
        return c.json({ error: "Post not found" }, 404);
      }

      if (existingPost.authorId !== userId) {
        return c.json({ error: "Unauthorized" }, 403);
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

      return c.json(post);
    } catch (error) {
      console.error("Error updating post:", error);
      return c.json({ error: "Failed to update post" }, 500);
    }
  })
  // DELETE /posts/:id - Menghapus post
  .delete("/:id", async (c) => {
    try {
      const postId = parseInt(c.req.param("id"));
      const userId = c.get("userId");

      // Jika user belum terautentikasi, kembalikan error
      if (userId === null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (isNaN(postId)) {
        return c.json({ error: "Invalid post ID" }, 400);
      }

      // Cek apakah post ada dan merupakan milik pengguna
      const existingPost = await prisma.post.findUnique({
        where: {
          id: postId,
        },
      });

      if (!existingPost) {
        return c.json({ error: "Post not found" }, 404);
      }

      if (existingPost.authorId !== userId) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      // Hapus post
      await prisma.post.delete({
        where: {
          id: postId,
        },
      });

      return c.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error deleting post:", error);
      return c.json({ error: "Failed to delete post" }, 500);
    }
  });

// Daftarkan app posts ke app utama
parentApp.route("/posts", app);

// Export app untuk digunakan di route.ts
export default app;
