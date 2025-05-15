import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isPatientRoute = createRouteMatcher(["/appointments(.*)", "/profile(.*)"]);
const isStaffRoute = createRouteMatcher(["/dashboard/admin(.*)", "/dashboard/staff(.*)"]);
const isDoctorRoute = createRouteMatcher(["/dashboard/doctor(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Public routes - allow access
  if (!userId) {
    // If not signed in and trying to access protected route, redirect to sign-in
    if (!isAuthRoute(req) && (isPatientRoute(req) || isDashboardRoute(req))) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // User is authenticated (has userId)
  
  // Redirect from auth pages if already signed in
  if (isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    // Create a URL for the request
    const url = new URL(req.url);
    
    // Get user role from custom fetch (you'll need to implement this API endpoint)
    const roleResponse = await fetch(`${url.origin}/api/users/role?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        // Include any auth headers needed
      },
    });
    
    if (!roleResponse.ok) {
      throw new Error('Failed to fetch user role');
    }
    
    const { role } = await roleResponse.json();
    
    // Route access based on role
    if (isStaffRoute(req) && !['STAFF', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    if (isDoctorRoute(req) && role !== 'DOCTOR') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Redirect to appropriate dashboard for staff and doctors
    if (req.nextUrl.pathname === '/dashboard' || req.nextUrl.pathname === '/dashboard/') {
      if (role === 'DOCTOR') {
        return NextResponse.redirect(new URL('/dashboard/doctor', req.url));
      } else if (['STAFF', 'ADMIN'].includes(role)) {
        return NextResponse.redirect(new URL('/dashboard/admin', req.url));
      } else {
        // Regular users should not access dashboard
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    // Allow all other requests
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request to proceed
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};