import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define route matchers for different protected areas
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAdminRoute = createRouteMatcher(["/dashboard/admin(.*)"]);
const isDoctorRoute = createRouteMatcher(["/dashboard/doctors(.*)"]);

// Cache untuk menyimpan role user (mengurangi API calls)
const roleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Use Clerk's middleware with additional custom logic
export default clerkMiddleware(async (auth, req) => {
  // Get authentication state from Clerk - auth adalah fungsi async
  const authData = await auth();

  // Sekarang kita bisa mengakses userId dari hasil await
  const userId = authData.userId;

  // Route yang sedang diakses
  const pathname = req.nextUrl.pathname;

  // Skip role check for public routes and API routes
  if (pathname.startsWith("/api/") || !isDashboardRoute(req)) {
    return NextResponse.next();
  }

  // Jika tidak ada user yang terautentikasi, redirect ke login
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  try {
    // Get user role - first try cache, then API
    const now = Date.now();
    const cachedData = roleCache.get(userId);
    let userRole = "PATIENT"; // Default to PATIENT for safety

    if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
      // Use cached data if still valid
      userRole = cachedData.role;
      console.log("[Middleware] Using cached role:", userRole);
    } else {
      // Call our role-check API endpoint with the userId
      const apiUrl = new URL("/api/auth/middleware-role-check", req.url);
      apiUrl.searchParams.set("userId", userId);

      try {
        console.log(
          `[Middleware] Fetching role for user ${userId.slice(0, 8)}...`
        );
        const response = await fetch(apiUrl.toString(), {
          signal: AbortSignal.timeout(5000),
        }); // 5 second timeout
        const data = await response.json();

        if (!response.ok) {
          console.error("[Middleware] Role check API error:", data);
          // Continue with PATIENT role (already set as default)
        } else {
          userRole = data.role || "PATIENT";
          // Save to cache
          roleCache.set(userId, { role: userRole, timestamp: now });
          console.log("[Middleware] Fetched new role:", userRole);
        }
      } catch (fetchError) {
        console.error(
          "[Middleware] API fetch failed:",
          fetchError instanceof Error ? fetchError.message : "Unknown error"
        );
        // Continue with PATIENT role for security (already set as default)
      }
    }

    // For any dashboard route, restrict PATIENT access
    if (isDashboardRoute(req) && userRole === "PATIENT") {
      console.log("[Middleware] Restricting PATIENT from dashboard");
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Admin routes are only for ADMIN
    if (isAdminRoute(req) && userRole !== "ADMIN") {
      console.log("[Middleware] Non-ADMIN accessing admin route, redirecting");
      if (userRole === "DOCTOR") {
        // Redirect DOCTOR to their own dashboard
        return NextResponse.redirect(new URL("/dashboard/doctors", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Doctor routes are only for DOCTOR
    if (isDoctorRoute(req) && userRole !== "DOCTOR") {
      console.log(
        "[Middleware] Non-DOCTOR accessing doctor route, redirecting"
      );
      if (userRole === "ADMIN") {
        // Redirect ADMIN to admin dashboard
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch (error) {
    console.error("[Middleware] Error in role check:", error);
    // On error, redirect to home for security
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow the request to proceed if all checks pass
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Run for dashboard routes specifically
    "/dashboard(.*)",
  ],
};
