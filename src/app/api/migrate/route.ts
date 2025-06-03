import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import { requireAdmin, isDebugAllowed } from "@/lib/admin-auth";

const execAsync = promisify(exec);

/**
 * Secured database migration endpoint (admin only)
 * GET /api/migrate
 * WARNING: This endpoint should only be used by administrators for database migrations
 */
export async function GET() {
  try {
    // Check if debug/admin endpoints are allowed
    if (!isDebugAllowed()) {
      return NextResponse.json(
        { 
          success: false,
          error: "Migration endpoints are disabled in production" 
        },
        { status: 403 }
      );
    }

    // Require admin authentication
    const adminCheck = await requireAdmin();
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }    // Run prisma migrations with enhanced error handling
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy");

    if (stderr) {
      console.error("Migration error:", stderr);
      return NextResponse.json({ 
        success: false,
        error: "Migration failed",
        details: stderr 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Migration completed successfully",
      output: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to run migrations",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
