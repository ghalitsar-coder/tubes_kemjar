/**
 * Helper file untuk transisi dari API Clerk lama ke yang baru
 * Ini membantu kompatibilitas kode untuk deployment di Vercel
 */
import {
  auth as clerkAuth,
  currentUser as clerkCurrentUser,
} from "@clerk/nextjs/server";

// Versi kompatibilitas dari auth() yang sebelumnya digunakan
export function auth(options?: { request?: Request }) {
  try {
    if (options?.request) {
      // In newer versions of Clerk, auth() should be called directly in App Router
      // We're using clerkAuth() which doesn't need a request param in App Router
      // This will rely on the middleware to set the auth context
      return clerkAuth();
    }

    // Fallback jika digunakan tanpa parameter
    console.warn(
      "Warning: auth() called without request parameter. This may cause errors in API routes."
    );
    return { userId: null };
  } catch (e) {
    console.error("Clerk auth error:", e);
    return { userId: null };
  }
}

// API Route helper untuk mendapatkan auth dengan request
export async function getAuthFromApiRoute(request: Request) {
  return auth({ request });
}

// Versi kompatibilitas dari currentUser()
export async function currentUser() {
  try {
    return await clerkCurrentUser();
  } catch (e) {
    console.error("Clerk currentUser error:", e);
    return null;
  }
}
