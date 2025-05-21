// This API endpoint is for development & testing only - NOT for production!
// It allows developers to quickly switch between user roles to test UI elements

import { NextResponse } from "next/server";

// Mark as dynamic to avoid caching during development
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // This should only work in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const { role } = await request.json();

    // Validate role
    if (!role || !["PATIENT", "DOCTOR", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Store the role in a cookie for development purposes
    const response = NextResponse.json({ success: true, role });

    // Set a cookie with the development role that will be used
    // by the auth-protection.tsx to override the actual user role
    response.cookies.set("dev-user-role", role, {
      httpOnly: true,
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error setting development role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
