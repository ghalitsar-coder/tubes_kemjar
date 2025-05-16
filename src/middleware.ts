import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isPatientRoute = createRouteMatcher(["/appointments(.*)", "/profile(.*)"]);
const isStaffRoute = createRouteMatcher(["/dashboard/admin(.*)", "/dashboard/staff(.*)"]);
const isDoctorRoute = createRouteMatcher(["/dashboard/doctor(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const authData = await auth();
  const { userId } = authData;
  console.log(`Middleware - Auth data available: ${!!userId}`);
  
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
    
    // Get user role from custom fetch
    console.log(`Fetching role for userId: ${userId}`);
    const fetchUrl = `${url.origin}/api/users/role?userId=${userId}`;
    console.log(`Fetch URL: ${fetchUrl}`);
    
    const roleResponse = await fetch(fetchUrl, {
      headers: {
        'Content-Type': 'application/json',
        // Pass Clerk session token
        Authorization: req.headers.get('Authorization') || '',
        Cookie: req.headers.get('Cookie') || '',
      },
    });
    
    if (!roleResponse.ok) {
      const responseText = await roleResponse.text();
      console.error(`Role fetch failed with status: ${roleResponse.status}, response: ${responseText}`);
      throw new Error(`Failed to fetch user role: ${roleResponse.status}`);
    }
    
    const userData = await roleResponse.json();
    console.log('User role data:', userData);
    const { role } = userData;
    
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