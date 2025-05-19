import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Opsi konfigurasi Prisma untuk optimasi di lingkungan serverless
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],

    // Pengaturan koneksi untuk lingkungan production di Vercel
    datasources:
      process.env.NODE_ENV === "production"
        ? {
            db: {
              url: process.env.DATABASE_URL,
            },
          }
        : undefined,
        
    // Konfigurasi reconnect otomatis ketika koneksi terputus
    connection: {
      reconnect: true,
      maxConnections: 5,
    },
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Pastikan koneksi ditutup pada saat development untuk mencegah memory leak
if (process.env.NODE_ENV !== "production") {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("beforeExit", async () => {
      await prisma.$disconnect();
    });
  }
}
