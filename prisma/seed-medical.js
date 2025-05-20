// Seed script for medical specialties and doctor schedules

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seedMedicalData() {
  console.log("Starting to seed medical specialties and doctor schedules...");

  // Create medical specialties
  const specialties = [
    {
      name: "Cardiology",
      description: "Diagnosis and treatment of heart conditions",
    },
    { name: "Dermatology", description: "Skin, hair, and nail health" },
    { name: "Orthopedics", description: "Musculoskeletal system and injuries" },
    {
      name: "Pediatrics",
      description: `Children's health from birth to adolescence`,
    },
    { name: "Neurology", description: "Disorders of the nervous system" },
    { name: "Ophthalmology", description: "Eye diseases and vision care" },
    {
      name: "Psychiatry",
      description: "Mental health and behavioral disorders",
    },
    {
      name: "Radiology",
      description: "Medical imaging for diagnosis and treatment",
    },
    { name: "Gynecology", description: "Female reproductive health" },
    {
      name: "Urology",
      description: "Urinary tract and male reproductive health",
    },
  ];

  // Create specialties and store their IDs
  const specialtyRecords = {};

  for (const specialty of specialties) {
    // Check if specialty already exists
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { name: specialty.name },
    });

    if (!existingSpecialty) {
      const record = await prisma.specialty.create({
        data: specialty,
      });
      specialtyRecords[record.name] = record.id;
      console.log(`Created specialty: ${record.name}`);
    } else {
      specialtyRecords[existingSpecialty.name] = existingSpecialty.id;
      console.log(`Specialty already exists: ${existingSpecialty.name}`);
    }
  }

  // Create doctors with schedules
  const doctorData = [
    {
      user: {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        password:
          "$2a$10$QOgL1qqZXA.PMiRLCsZJGeB2Z5Jb7ICJCri3yws6O.QyQFZ9JnM6q", // hashed password
        role: "DOCTOR",
      },
      doctor: {
        specialization: "Cardiology",
        licenseNumber: "MD12345",
        experience: 10,
        education: "Harvard Medical School",
        bio: "Specializing in heart diseases and preventative cardiology",
        consultationFee: "150.00",
        specialties: ["Cardiology"],
      },
      schedule: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, // Monday
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" }, // Wednesday
        { dayOfWeek: 5, startTime: "09:00", endTime: "15:00" }, // Friday
      ],
    },
    {
      user: {
        name: "Michael Chen",
        email: "michael.chen@example.com",
        password:
          "$2a$10$QOgL1qqZXA.PMiRLCsZJGeB2Z5Jb7ICJCri3yws6O.QyQFZ9JnM6q",
        role: "DOCTOR",
      },
      doctor: {
        specialization: "Dermatology",
        licenseNumber: "MD23456",
        experience: 8,
        education: "Stanford University School of Medicine",
        bio: "Expert in treating skin conditions and cosmetic dermatology",
        consultationFee: "175.00",
        specialties: ["Dermatology"],
      },
      schedule: [
        { dayOfWeek: 2, startTime: "10:00", endTime: "18:00" }, // Tuesday
        { dayOfWeek: 4, startTime: "10:00", endTime: "18:00" }, // Thursday
      ],
    },
    {
      user: {
        name: "James Wilson",
        email: "james.wilson@example.com",
        password:
          "$2a$10$QOgL1qqZXA.PMiRLCsZJGeB2Z5Jb7ICJCri3yws6O.QyQFZ9JnM6q",
        role: "DOCTOR",
      },
      doctor: {
        specialization: "Orthopedics",
        licenseNumber: "MD34567",
        experience: 12,
        education: "Johns Hopkins University",
        bio: "Specialist in joint replacements and sports injuries",
        consultationFee: "160.00",
        specialties: ["Orthopedics"],
      },
      schedule: [
        { dayOfWeek: 1, startTime: "08:00", endTime: "16:00" }, // Monday
        { dayOfWeek: 2, startTime: "08:00", endTime: "16:00" }, // Tuesday
        { dayOfWeek: 3, startTime: "08:00", endTime: "16:00" }, // Wednesday
      ],
    },
    {
      user: {
        name: "Emily Rodriguez",
        email: "emily.rodriguez@example.com",
        password:
          "$2a$10$QOgL1qqZXA.PMiRLCsZJGeB2Z5Jb7ICJCri3yws6O.QyQFZ9JnM6q",
        role: "DOCTOR",
      },
      doctor: {
        specialization: "Pediatrics",
        licenseNumber: "MD45678",
        experience: 7,
        education: "University of California, San Francisco",
        bio: "Dedicated to providing comprehensive care for children of all ages",
        consultationFee: "125.00",
        specialties: ["Pediatrics"],
      },
      schedule: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, // Monday
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" }, // Wednesday
        { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" }, // Friday
      ],
    },
    {
      user: {
        name: "Robert Kim",
        email: "robert.kim@example.com",
        password:
          "$2a$10$QOgL1qqZXA.PMiRLCsZJGeB2Z5Jb7ICJCri3yws6O.QyQFZ9JnM6q",
        role: "DOCTOR",
      },
      doctor: {
        specialization: "Neurology",
        licenseNumber: "MD56789",
        experience: 15,
        education: "Yale School of Medicine",
        bio: "Expert in treating neurological disorders and stroke management",
        consultationFee: "200.00",
        specialties: ["Neurology"],
      },
      schedule: [
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" }, // Tuesday
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" }, // Thursday
      ],
    },
  ];

  // Create doctors, their specialties, and schedules
  for (const data of doctorData) {
    // Check if doctor already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.user.email },
      include: { doctor: true },
    });

    if (!existingUser) {
      // Create user and doctor
      const user = await prisma.user.create({
        data: {
          name: data.user.name,
          email: data.user.email,
          password: data.user.password,
          role: data.user.role,
          doctor: {
            create: {
              specialization: data.doctor.specialization,
              licenseNumber: data.doctor.licenseNumber,
              experience: data.doctor.experience,
              education: data.doctor.education,
              bio: data.doctor.bio,
              consultationFee: data.doctor.consultationFee,
            },
          },
        },
        include: {
          doctor: true,
        },
      });

      // Assign specialties
      for (const specialtyName of data.doctor.specialties) {
        const specialtyId = specialtyRecords[specialtyName];

        if (specialtyId) {
          await prisma.doctorSpecialty.create({
            data: {
              doctorId: user.doctor.id,
              specialtyId: specialtyId,
            },
          });
          console.log(
            `Assigned specialty ${specialtyName} to Dr. ${user.name}`
          );
        }
      }

      // Create schedule
      for (const schedule of data.schedule) {
        const startTimeDate = new Date();
        startTimeDate.setUTCHours(
          parseInt(schedule.startTime.split(":")[0]),
          parseInt(schedule.startTime.split(":")[1]),
          0,
          0
        );

        const endTimeDate = new Date();
        endTimeDate.setUTCHours(
          parseInt(schedule.endTime.split(":")[0]),
          parseInt(schedule.endTime.split(":")[1]),
          0,
          0
        );

        await prisma.schedule.create({
          data: {
            doctorId: user.doctor.id,
            dayOfWeek: schedule.dayOfWeek,
            startTime: startTimeDate,
            endTime: endTimeDate,
            isAvailable: true,
          },
        });
      }

      console.log(
        `Created doctor: ${user.name} (${data.doctor.specialization})`
      );
    } else {
      console.log(`Doctor already exists: ${existingUser.name}`);
    }
  }
  // Create a test patient if not exists
  const testPatient = {
    name: "John Patient",
    email: "john.patient@example.com",
    password: "$2a$10$QOgL1qqZXA.PMiRLCsZJGeB2Z5Jb7ICJCri3yws6O.QyQFZ9JnM6q", // password123
    role: "PATIENT",
  };

  // Check if patient already exists
  const existingPatient = await prisma.user.findUnique({
    where: { email: testPatient.email },
  });

  if (!existingPatient) {
    const patient = await prisma.user.create({
      data: {
        name: testPatient.name,
        email: testPatient.email,
        password: testPatient.password,
        role: testPatient.role,
        patient: {
          create: {
            dateOfBirth: new Date("1990-05-15"),
            gender: "Male",
            bloodType: "A+",
            height: 175,
            weight: 70,
            allergies: "None",
            medicalHistory: "No significant medical history",
            emergencyContact: "Jane Patient, +1-555-123-4567",
          },
        },
      },
    });
    console.log(`Created test patient: ${patient.name}`);
  } else {
    console.log(`Test patient already exists: ${existingPatient.name}`);
  }

  console.log("Medical data seeding completed!");
}

seedMedicalData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
