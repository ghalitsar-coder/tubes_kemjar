import { Hono } from "hono";
import { app as parentApp, requireAuth, AuthVariables } from "@/lib/hono";
import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Schema validasi untuk user
const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

// Sub-app untuk rute /users
export const app = new Hono<{
  Variables: AuthVariables;
}>()
  // GET /users - Mendapatkan semua users (admin only - bisa dimodifikasi sesuai kebutuhan)
  .get("/", async (c) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          // Hanya pilih field yang tersedia dalam model
          createdAt: true,
          updatedAt: true,
          // Jangan mengembalikan password
        },
      });

      return c.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return c.json({ error: "Failed to fetch users" }, 500);
    }
  })

  // POST /users - Membuat user baru
  .post("/", zValidator("json", userCreateSchema), async (c) => {
    try {
      const { name, email, password } = await c.req.valid("json");

      // Cek apakah email sudah terdaftar
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return c.json({ error: "Email already registered" }, 400);
      }

      // Create user (in a real app, password should be hashed)
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password, // In a real app, hash this password
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          // Don't return the password
        },
      });

      return c.json(user, 201);
    } catch (error) {
      console.error("Error creating user:", error);
      return c.json({ error: "Failed to create user" }, 500);
    }
  })
  // GET /users/me - Mendapatkan profile user yang sedang login
  .get("/me", requireAuth, async (c) => {
    try {
      const userId = c.get("userId");

      // Jika user belum terautentikasi, kembalikan error
      if (userId === null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          // Don't return the password
        },
      });

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return c.json({ error: "Failed to fetch user profile" }, 500);
    }
  })

  // GET /users/:id - Mendapatkan detail user berdasarkan ID
  .get("/:id", async (c) => {
    try {
      const userId = parseInt(c.req.param("id"));

      if (isNaN(userId)) {
        return c.json({ error: "Invalid user ID" }, 400);
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          // Jangan mengembalikan password
        },
      });

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }

      return c.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return c.json({ error: "Failed to fetch user" }, 500);
    }
  })
  // PUT /users/:id - Mengupdate user
  .put("/:id", requireAuth, zValidator("json", userUpdateSchema), async (c) => {
    try {
      const userId = parseInt(c.req.param("id"));
      const loggedInUserId = c.get("userId");

      // Jika user belum terautentikasi, kembalikan error
      if (loggedInUserId === null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const updateData = await c.req.valid("json");

      if (isNaN(userId)) {
        return c.json({ error: "Invalid user ID" }, 400);
      }

      // Pastikan user hanya bisa update profil mereka sendiri
      if (userId !== loggedInUserId) {
        return c.json({ error: "You can only update your own profile" }, 403);
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          // Jangan mengembalikan password
        },
      });

      return c.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  })
  // DELETE /users/:id - Menghapus user
  .delete("/:id", requireAuth, async (c) => {
    try {
      const userId = parseInt(c.req.param("id"));
      const loggedInUserId = c.get("userId");

      // Jika user belum terautentikasi, kembalikan error
      if (loggedInUserId === null) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (isNaN(userId)) {
        return c.json({ error: "Invalid user ID" }, 400);
      }

      // Pastikan user hanya bisa hapus akun mereka sendiri
      if (userId !== loggedInUserId) {
        return c.json({ error: "You can only delete your own account" }, 403);
      }

      // Hapus user
      await prisma.user.delete({
        where: { id: userId },
      });

      return c.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return c.json({ error: "Failed to delete user" }, 500);
    }
  });

// Daftarkan app users ke app utama
parentApp.route("/users", app);

// Export app untuk digunakan di route.ts
export default app;
