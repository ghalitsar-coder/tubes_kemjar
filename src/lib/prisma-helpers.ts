import { prisma } from "./prisma";

/**
 * Fungsi untuk me-reset koneksi Prisma jika terjadi error
 * Gunakan ini ketika mendapat error "Error in PostgreSQL connection: Error { kind: Closed, cause: None }"
 */
export async function resetPrismaConnection() {
  try {
    // Disconnect dari database untuk membersihkan koneksi yang error
    await prisma.$disconnect();
    console.log("Prisma connection reset successfully");
    return true;
  } catch (error) {
    console.error("Error resetting Prisma connection:", error);
    return false;
  }
}

/**
 * Fungsi untuk melakukan operasi database dengan retry jika terjadi error koneksi
 * @param operation Fungsi yang berisi operasi database
 * @param maxRetries Jumlah maksimum percobaan (default: 3)
 * @returns Hasil dari operasi database
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>, 
  maxRetries = 3
): Promise<T> {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`Database operation failed (attempt ${attempt}/${maxRetries})`);
      
      // Coba reset koneksi jika error
      if (
        error instanceof Error && 
        error.message.includes("connection") || 
        error.message.includes("timeout") ||
        error.message.includes("Closed")
      ) {
        await resetPrismaConnection();
      }
      
      // Tunggu sebelum mencoba lagi (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(100 * Math.pow(2, attempt), 3000); // Max 3 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // Jika semua percobaan gagal
  throw lastError;
}
