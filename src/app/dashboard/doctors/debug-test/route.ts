import { NextResponse } from "next/server";

export async function GET() {
  const timestamp = new Date().toISOString();

  return NextResponse.json({
    status: "success",
    message: "Middleware test endpoint for doctors area",
    timestamp,
    explanation: `
      Jika Anda bisa melihat halaman ini sebagai user dengan role PATIENT atau ADMIN,
      berarti middleware tidak memblokir akses dengan benar.
      
      Hanya user dengan role DOCTOR yang seharusnya bisa mengakses halaman ini.
      User lain seharusnya diredirect ke homepage.
      
      Gunakan endpoint ini untuk menguji apakah role protection middleware berfungsi.
    `,
  });
}
