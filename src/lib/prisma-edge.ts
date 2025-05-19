// PrismaClient untuk Edge Runtime (middleware)
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Membuat konfigurasi Prisma untuk Edge Runtime
export const prismaEdge = new PrismaClient().$extends(withAccelerate());
