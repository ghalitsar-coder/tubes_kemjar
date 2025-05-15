// Konfigurasi Auth Provider untuk Clerk
// Sesuaikan file ini dengan OAuth provider yang ingin Anda dukung
import { authConfig } from "@clerk/nextjs";

export default authConfig({
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  secretKey: process.env.CLERK_SECRET_KEY,

  // Definisikan OAuth Provider (Google)
  oauth: {
    providers: ["google"], // Tambahkan provider lain jika diperlukan
  },

  // URL-URL penting untuk autentikasi
  signUpUrl: "/sign-up",
  signInUrl: "/sign-in",
  afterSignInUrl: "/",
  afterSignUpUrl: "/",
});
