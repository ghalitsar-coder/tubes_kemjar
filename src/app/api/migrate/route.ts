import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// PERINGATAN: Endpoint ini hanya untuk development
// Jangan gunakan di production atau hapus setelah selesai migrasi
export async function GET() {
  try {
    // Pastikan ini hanya bisa dijalankan di development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "This endpoint is disabled in production" },
        { status: 403 }
      );
    }

    // Run prisma migrations
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy");
    
    if (stderr) {
      console.error("Migration error:", stderr);
      return NextResponse.json({ error: stderr }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: stdout });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Failed to run migrations" },
      { status: 500 }
    );
  }
}
