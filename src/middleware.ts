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
  const pathname = req.nextUrl.pathname; // Skip role check for API routes, static files, and auth pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/sign-out") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }
  // Untuk pengguna yang belum login
  if (!userId) {
    // Jika mencoba mengakses rute terproteksi (admin atau doctor), redirect ke login
    if (
      isAdminRoute(req) ||
      isDoctorRoute(req) ||
      pathname.startsWith("/dashboard")
    ) {
      console.log(
        "[Middleware] Unauthenticated user trying to access protected route:",
        pathname
      );
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Jika mengakses rute publik, izinkan
    console.log(
      "[Middleware] Allowing unauthenticated user to access public route:",
      pathname
    );
    return NextResponse.next();
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
    } // Restrict PATIENT to non-dashboard access
    if (userRole === "PATIENT") {
      if (isDashboardRoute(req)) {
        console.log("[Middleware] Restricting PATIENT from dashboard");
        return NextResponse.redirect(new URL("/", req.url));
      }
      // Patient can access public routes
      return NextResponse.next();
    }

    // For ADMIN users
    if (userRole === "ADMIN") {
      // If admin trying to access doctor routes, redirect to admin dashboard
      if (isDoctorRoute(req)) {
        console.log(
          "[Middleware] Admin accessing doctor route, redirecting to admin dashboard"
        );
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      }

      // If admin accessing any non-admin and non-API route, redirect to admin dashboard
      if (
        !isAdminRoute(req) &&
        !pathname.startsWith("/api/") &&
        !pathname.startsWith("/_next/")
      ) {
        console.log(
          "[Middleware] Admin accessing non-admin route, redirecting to admin dashboard"
        );
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      }

      // Admin can access admin routes
      return NextResponse.next();
    }

    // For DOCTOR users
    if (userRole === "DOCTOR") {
      // If doctor trying to access admin routes, redirect to doctor dashboard
      if (isAdminRoute(req)) {
        console.log(
          "[Middleware] Doctor accessing admin route, redirecting to doctor dashboard"
        );
        return NextResponse.redirect(new URL("/dashboard/doctors", req.url));
      }

      // If doctor accessing any non-doctor and non-API route, redirect to doctor dashboard
      if (
        !isDoctorRoute(req) &&
        !pathname.startsWith("/api/") &&
        !pathname.startsWith("/_next/")
      ) {
        console.log(
          "[Middleware] Doctor accessing non-doctor route, redirecting to doctor dashboard"
        );
        return NextResponse.redirect(new URL("/dashboard/doctors", req.url));
      }

      // Doctor can access doctor routes
      return NextResponse.next();
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
    // Match all routes except Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
