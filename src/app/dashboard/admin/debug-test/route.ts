import { NextResponse } from "next/server";

export async function GET() {
  const timestamp = new Date().toISOString();

  return NextResponse.json({
    status: "success",
    message: "Middleware test endpoint",
    timestamp,
    explanation: `
      Jika Anda bisa melihat halaman ini sebagai user dengan role PATIENT,
      berarti middleware tidak memblokir akses dengan benar.
      
      User dengan role PATIENT seharusnya diredirect ke homepage.
      
      Gunakan endpoint ini untuk menguji apakah role protection middleware berfungsi.
    `,
  });
}
