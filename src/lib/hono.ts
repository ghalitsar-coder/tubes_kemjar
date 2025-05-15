import { Hono } from "hono";
import { handle } from "hono/vercel";
import type { Next } from "hono";
import type { Context } from "hono";
import { prisma } from "./prisma";

// Tipe untuk middleware authentication
export type AuthVariables = {
  userId: number | null;
  clerkId: string | null;
};

// Membuat instance Hono dengan variabel auth
export const app = new Hono<{
  Variables: AuthVariables;
}>();

// Middleware untuk integrasi dengan Clerk
export const authMiddleware = async (
  c: Context<{ Variables: AuthVariables }>,
  next: Next
) => {
  // Default userId dan clerkId ke null (tidak terotentikasi)
  c.set("userId", null);
  c.set("clerkId", null);

  // Mendapatkan token dari header Authorization (fallback untuk non-web clients)
  const token = c.req.header("Authorization")?.replace("Bearer ", "");

  // Cek header X-Clerk-User-Id yang dibuat oleh middleware Clerk
  const clerkUserId = c.req.header("X-Clerk-User-Id");

  if (clerkUserId) {
    try {
      // Cek apakah user ada di database menggunakan string clerkId
      const dbUser = await prisma.user.findFirst({
        where: {
          clerkId: clerkUserId,
        },
      });

      if (dbUser) {
        c.set("userId", dbUser.id);
        c.set("clerkId", clerkUserId);
      } else {
        console.log(`User with clerkId ${clerkUserId} not found in database`);
      }
    } catch (error) {
      console.error("Error in Hono auth middleware with Clerk:", error);
    }
  } else if (token) {
    try {
      // Fallback ke logika token authorization lama
      const user = await prisma.user.findFirst({
        where: {
          id: parseInt(token) || 0,
        },
      });

      if (user) {
        c.set("userId", user.id);
      }
    } catch (error) {
      console.error("Error in token verification:", error);
    }
  }

  await next();
};

// Middleware untuk hanya mengizinkan user yang sudah login
export const requireAuth = async (
  c: Context<{ Variables: AuthVariables }>,
  next: Next
) => {
  if (!c.get("userId")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
};

// Ekspos fungsi handle() dari Hono untuk Next.js API Routes
export { handle };
