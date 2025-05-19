const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    // Check users
    const users = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "User"`;
    console.log("Users count:", users[0].count);

    // Check patients
    const patients = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Patient"`;
    console.log("Patients count:", patients[0].count);

    // Check doctors
    const doctors = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Doctor"`;
    console.log("Doctors count:", doctors[0].count);

    // Check appointments
    const appointments = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Appointment"`;
    console.log("Appointments count:", appointments[0].count);

    // List some user data
    const userData = await prisma.$queryRaw`SELECT id, name, email, role FROM "User" LIMIT 5`;
    console.log("\nSample users:");
    console.log(userData);

  } catch (error) {
    console.error("Database query error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
