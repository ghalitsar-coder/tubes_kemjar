/**
 * Helper file untuk transisi dari API Clerk lama ke yang baru
 * Ini membantu kompatibilitas kode untuk deployment di Vercel
 */
import { getAuth as clerkGetAuth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";

// Versi kompatibilitas dari auth() yang sebelumnya digunakan
export function auth(options?: { request?: Request }) {
  try {
    if (options?.request) {
      return clerkGetAuth({ request: options.request });
    }
    // Fallback jika digunakan tanpa parameter
    return { userId: null };
  } catch (e) {
    console.error("Clerk auth error:", e);
    return { userId: null };
  }
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
