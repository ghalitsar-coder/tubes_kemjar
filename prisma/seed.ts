import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create specialties
  const specialties = [
    { name: "Cardiology", description: "Heart and cardiovascular system" },
    { name: "Dermatology", description: "Skin conditions" },
    { name: "Neurology", description: "Brain and nervous system" },
    { name: "Pediatrics", description: "Child healthcare" },
    { name: "Orthopedics", description: "Bone and joint health" },
    { name: "Ophthalmology", description: "Eye health" },
    { name: "Psychiatry", description: "Mental health" },
    { name: "General Medicine", description: "Primary care" },
  ];

  for (const specialty of specialties) {
    await prisma.specialty.create({
      data: specialty,
    });
  }

  console.log("Created specialties");

  // Create admin user
  const adminPassword = await hash("admin123", 10);
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  // Create staff profile for admin
  await prisma.staff.create({
    data: {
      userId: adminUser.id,
      position: "Administrator",
      department: "Management",
    },
  });

  console.log("Created admin user");

  // Create some doctors
  const doctors = [
    {
      name: "Dr. John Smith",
      email: "john.smith@example.com",
      password: await hash("doctor123", 10),
      role: UserRole.DOCTOR,
      doctor: {
        specialization: "Cardiology",
        licenseNumber: "MD12345",
        experience: 10,
        education: "Harvard Medical School",
        bio: "Experienced cardiologist with 10+ years of practice",
        consultationFee: 150.0,
      },
    },
    {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@example.com",
      password: await hash("doctor123", 10),
      role: UserRole.DOCTOR,
      doctor: {
        specialization: "Dermatology",
        licenseNumber: "MD67890",
        experience: 8,
        education: "Johns Hopkins University",
        bio: "Specialized in treating skin conditions and cosmetic dermatology",
        consultationFee: 120.0,
      },
    },
    {
      name: "Dr. Robert Williams",
      email: "robert.williams@example.com",
      password: await hash("doctor123", 10),
      role: UserRole.DOCTOR,
      doctor: {
        specialization: "Pediatrics",
        licenseNumber: "MD54321",
        experience: 15,
        education: "Stanford University",
        bio: "Child specialist focused on providing comprehensive pediatric care",
        consultationFee: 100.0,
      },
    },
  ];

  for (const doctor of doctors) {
    const { name, email, password, role, doctor: doctorData } = doctor;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role,
      },
    });

    const newDoctor = await prisma.doctor.create({
      data: {
        ...doctorData,
        userId: newUser.id,
      },
    });

    // Add schedules for each doctor
    const days = [1, 2, 3, 4, 5]; // Monday to Friday

    for (const day of days) {
      await prisma.schedule.create({
        data: {
          doctorId: newDoctor.id,
          dayOfWeek: day,
          startTime: new Date(`2023-01-01T09:00:00`),
          endTime: new Date(`2023-01-01T17:00:00`),
          isAvailable: true,
        },
      });
    }

    // Associate specialties
    let specialtyId;
    if (doctorData.specialization === "Cardiology") {
      specialtyId = 1;
    } else if (doctorData.specialization === "Dermatology") {
      specialtyId = 2;
    } else if (doctorData.specialization === "Pediatrics") {
      specialtyId = 4;
    }

    if (specialtyId) {
      await prisma.doctorSpecialty.create({
        data: {
          doctorId: newDoctor.id,
          specialtyId,
        },
      });
    }
  }

  console.log("Created doctors with schedules and specialties");

  // Create some patients
  const patients = [
    {
      name: "Alice Johnson",
      email: "alice@example.com",
      password: await hash("patient123", 10),
      patient: {
        dateOfBirth: new Date("1985-06-15"),
        gender: "Female",
        bloodType: "A+",
      },
    },
    {
      name: "Bob Smith",
      email: "bob@example.com",
      password: await hash("patient123", 10),
      patient: {
        dateOfBirth: new Date("1990-03-22"),
        gender: "Male",
        bloodType: "O-",
      },
    },
  ];

  for (const patient of patients) {
    const { name, email, password, patient: patientData } = patient;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: UserRole.PATIENT,
      },
    });

    await prisma.patient.create({
      data: {
        ...patientData,
        userId: newUser.id,
      },
    });
  }

  console.log("Created patients");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
