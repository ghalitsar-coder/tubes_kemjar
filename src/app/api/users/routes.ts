import { Hono } from "hono";
import { app as mainApp, requireAuth } from "@/lib/hono-clerk";
import { prisma } from "@/lib/prisma";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Schema for user validation
const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email").optional(),
  profilePic: z.string().url("Invalid URL").optional(),
});

// Create a sub-app for /users routes
const app = new Hono();

// GET /api/users - Get all users (admin only in a real app)
app.get("/", async (c) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        isOAuthUser: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return c.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// GET /api/users/me - Get current user's profile
app.get("/me", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        clerkId: true,
        isOAuthUser: true,
        profilePic: true,
        createdAt: true,
        updatedAt: true,
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
});

// GET /api/users/:id - Get a specific user
app.get("/:id", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"), 10);

    if (isNaN(userId)) {
      return c.json({ error: "Invalid user ID" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePic: true,
        isOAuthUser: true,
        createdAt: true,
        updatedAt: true,
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
});

// PATCH /api/users/me - Update current user's profile
app.patch(
  "/me",
  requireAuth,
  zValidator("json", userUpdateSchema),
  async (c) => {
    try {
      const userId = c.get("userId");
      const updateData = await c.req.valid("json");

      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          profilePic: true,
          isOAuthUser: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return c.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  }
);

// DELETE /api/users/me - Delete current user's account
app.delete("/me", requireAuth, async (c) => {
  try {
    const userId = c.get("userId");

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Delete all user's posts first
    await prisma.post.deleteMany({
      where: {
        authorId: userId,
      },
    });

    // Delete the user
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return c.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({ error: "Failed to delete user" }, 500);
  }
});

// Mount users routes to main app
mainApp.route("/api/users", app);

export default app;
