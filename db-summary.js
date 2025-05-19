import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const staffCount = await prisma.staff.count();
    const specialtyCount = await prisma.specialty.count();
    const appointmentCount = await prisma.appointment.count();
    const postCount = await prisma.post.count();
    const scheduleCount = await prisma.schedule.count();
    const doctorSpecialtyCount = await prisma.doctorSpecialty.count();

    console.log("===== DATABASE SUMMARY =====");
    console.log("Users: " + userCount);
    console.log("Patients: " + patientCount);
    console.log("Doctors: " + doctorCount);
    console.log("Staff: " + staffCount);
    console.log("Specialties: " + specialtyCount);
    console.log("Appointments: " + appointmentCount);
    console.log("Posts: " + postCount);
    console.log("Schedules: " + scheduleCount);
    console.log("Doctor Specialties: " + doctorSpecialtyCount);
    console.log("===========================");
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
