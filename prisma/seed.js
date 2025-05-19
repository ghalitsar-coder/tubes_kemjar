import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear existing data
    console.log("Clearing existing data...");
    await prisma.$transaction([
      prisma.appointment.deleteMany(),
      prisma.doctorSpecialty.deleteMany(),
      prisma.schedule.deleteMany(),
      prisma.patient.deleteMany(),
      prisma.doctor.deleteMany(),
      prisma.staff.deleteMany(),
      prisma.specialty.deleteMany(),
      prisma.post.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    console.log("Creating specialties...");
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
      { name: "Dentistry", description: "Oral health and dental care" },
      { name: "ENT", description: "Ear, nose, and throat specialist" },
      {
        name: "Gynecology",
        description: "Women's health and reproductive system",
      },
      { name: "Urology", description: "Urinary tract health" },
    ];

    for (const specialty of specialties) {
      await prisma.specialty.create({
        data: specialty,
      });
    }

    console.log("Creating admin users...");
    // Create admin users
    const adminUsers = [
      {
        name: "Super Admin",
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        staff: {
          position: "Administrator",
          department: "Management",
          joinDate: new Date("2022-01-01"),
        },
      },
      {
        name: "John Admin",
        email: "john.admin@example.com",
        password: await bcrypt.hash("admin123", 10),
        role: "ADMIN",
        staff: {
          position: "IT Administrator",
          department: "IT Department",
          joinDate: new Date("2022-03-15"),
        },
      },
    ];

    for (const admin of adminUsers) {
      const { name, email, password, role, staff: staffData } = admin;

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
        },
      });

      await prisma.staff.create({
        data: {
          ...staffData,
          userId: newUser.id,
        },
      });
    }

    console.log("Creating staff members...");
    // Create staff members
    const staffMembers = [
      {
        name: "James Wilson",
        email: "james.wilson@example.com",
        password: await bcrypt.hash("staff123", 10),
        role: "STAFF",
        staff: {
          position: "Receptionist",
          department: "Front Desk",
          joinDate: new Date("2023-02-10"),
        },
      },
      {
        name: "Maria Garcia",
        email: "maria.garcia@example.com",
        password: await bcrypt.hash("staff123", 10),
        role: "STAFF",
        staff: {
          position: "Billing Specialist",
          department: "Accounts",
          joinDate: new Date("2023-05-22"),
        },
      },
      {
        name: "Thomas Brown",
        email: "thomas.brown@example.com",
        password: await bcrypt.hash("staff123", 10),
        role: "STAFF",
        staff: {
          position: "Medical Assistant",
          department: "Nursing",
          joinDate: new Date("2022-11-08"),
        },
      },
    ];

    for (const member of staffMembers) {
      const { name, email, password, role, staff: staffData } = member;

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
        },
      });

      await prisma.staff.create({
        data: {
          ...staffData,
          userId: newUser.id,
        },
      });
    }

    console.log("Creating doctors...");
    // Create doctors
    const doctors = [
      {
        name: "Dr. John Smith",
        email: "john.smith@example.com",
        password: await bcrypt.hash("doctor123", 10),
        role: "DOCTOR",
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
        password: await bcrypt.hash("doctor123", 10),
        role: "DOCTOR",
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
        password: await bcrypt.hash("doctor123", 10),
        role: "DOCTOR",
        doctor: {
          specialization: "Pediatrics",
          licenseNumber: "MD54321",
          experience: 15,
          education: "Stanford University",
          bio: "Child specialist focused on providing comprehensive pediatric care",
          consultationFee: 100.0,
        },
      },
      {
        name: "Dr. Jennifer Lee",
        email: "jennifer.lee@example.com",
        password: await bcrypt.hash("doctor123", 10),
        role: "DOCTOR",
        doctor: {
          specialization: "Neurology",
          licenseNumber: "MD98765",
          experience: 12,
          education: "Yale School of Medicine",
          bio: "Specializing in neurological disorders and stroke recovery",
          consultationFee: 180.0,
        },
      },
    ];

    // Store doctor IDs for later use
    const doctorIds = [];

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

      doctorIds.push(newDoctor.id);

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
      // Find the specialty that matches the doctor's specialization
      const specialty = await prisma.specialty.findFirst({
        where: { name: doctorData.specialization },
      });

      if (specialty) {
        await prisma.doctorSpecialty.create({
          data: {
            doctorId: newDoctor.id,
            specialtyId: specialty.id,
          },
        });
      }

      // For some doctors, add a secondary specialty
      if (
        doctorData.specialization === "Cardiology" ||
        doctorData.specialization === "Pediatrics"
      ) {
        const secondarySpecialty = await prisma.specialty.findFirst({
          where: { name: "General Medicine" },
        });

        if (secondarySpecialty) {
          await prisma.doctorSpecialty.create({
            data: {
              doctorId: newDoctor.id,
              specialtyId: secondarySpecialty.id,
            },
          });
        }
      }
    }

    console.log("Creating patients...");
    // Create patients
    const patients = [
      {
        name: "Alice Johnson",
        email: "alice@example.com",
        password: await bcrypt.hash("patient123", 10),
        role: "PATIENT",
        patient: {
          dateOfBirth: new Date("1985-06-15"),
          gender: "Female",
          bloodType: "A+",
          height: 165.5,
          weight: 58.2,
          allergies: "Penicillin, Peanuts",
          medicalHistory: "Asthma since childhood, Appendectomy in 2010",
          emergencyContact: "John Johnson (Husband): +1234567890",
        },
      },
      {
        name: "Bob Smith",
        email: "bob@example.com",
        password: await bcrypt.hash("patient123", 10),
        role: "PATIENT",
        patient: {
          dateOfBirth: new Date("1990-03-22"),
          gender: "Male",
          bloodType: "O-",
          height: 182.0,
          weight: 85.7,
          allergies: "None",
          medicalHistory: "Fractured right arm in 2015, Hypertension",
          emergencyContact: "Mary Smith (Wife): +0987654321",
        },
      },
      {
        name: "Emma Wilson",
        email: "emma@example.com",
        password: await bcrypt.hash("patient123", 10),
        role: "PATIENT",
        patient: {
          dateOfBirth: new Date("1978-11-30"),
          gender: "Female",
          bloodType: "B+",
          height: 170.0,
          weight: 65.3,
          allergies: "Sulfa drugs, Shellfish",
          medicalHistory: "Type 2 diabetes diagnosed in 2018, Cholesterol",
          emergencyContact: "David Wilson (Son): +1122334455",
        },
      },
    ];

    // Store patient IDs for later use
    const patientIds = [];

    for (const patient of patients) {
      const { name, email, password, role, patient: patientData } = patient;

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password,
          role,
        },
      });

      patientIds.push(newUser.id);

      await prisma.patient.create({
        data: {
          ...patientData,
          userId: newUser.id,
        },
      });
    }

    console.log("Creating posts...");
    // Get all users for post creation
    const allUsers = await prisma.user.findMany({
      select: { id: true, role: true },
      orderBy: { id: "asc" },
    });

    // Get admin and doctor users for posts
    const adminUserIds = allUsers
      .filter((user) => user.role === "ADMIN")
      .map((user) => user.id);
    const doctorUserIds = allUsers
      .filter((user) => user.role === "DOCTOR")
      .map((user) => user.id);

    // Create blog posts
    const posts = [
      {
        title: "Understanding Heart Health",
        content:
          "Cardiovascular health is essential for longevity. This article discusses ways to maintain a healthy heart through diet, exercise, and regular check-ups.",
        published: true,
        authorId: adminUserIds[0], // First admin user
      },
      {
        title: "COVID-19 Updates and Precautions",
        content:
          "Stay informed about the latest COVID-19 guidelines and how our clinic is ensuring patient safety during the pandemic.",
        published: true,
        authorId: adminUserIds[0], // First admin user
      },
      {
        title: "The Importance of Mental Health",
        content:
          "Mental health is as important as physical health. Learn about common mental health issues and when to seek professional help.",
        published: true,
        authorId: adminUserIds.length > 1 ? adminUserIds[1] : adminUserIds[0],
      },
      {
        title: "Summer Health Tips",
        content:
          "Stay healthy during the summer months with these tips on hydration, sun protection, and heat-related illness prevention.",
        published: true,
        authorId: doctorUserIds[0] || adminUserIds[0], // First doctor or fallback to admin
      },
    ];

    for (const post of posts) {
      await prisma.post.create({
        data: post,
      });
    }

    console.log("Creating appointments...");
    // Generate function to create dates in the future
    const futureDate = (days) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    };

    // Create appointments
    if (patientIds.length > 0 && doctorIds.length > 0) {
      const appointments = [
        {
          patientId: patientIds[0],
          doctorId: doctorIds[0],
          date: futureDate(2),
          startTime: new Date(futureDate(2).setHours(9, 0, 0)),
          endTime: new Date(futureDate(2).setHours(9, 30, 0)),
          status: "CONFIRMED",
          type: "IN_PERSON",
          reason: "Annual checkup",
          notes: "Patient has reported occasional chest pain",
        },
        {
          patientId: patientIds[1] || patientIds[0],
          doctorId: doctorIds[1] || doctorIds[0],
          date: futureDate(3),
          startTime: new Date(futureDate(3).setHours(14, 0, 0)),
          endTime: new Date(futureDate(3).setHours(14, 30, 0)),
          status: "PENDING",
          type: "VIDEO_CALL",
          reason: "Skin rash consultation",
          notes: null,
        },
        {
          patientId: patientIds[2] || patientIds[0],
          doctorId: doctorIds[2] || doctorIds[0],
          date: futureDate(1),
          startTime: new Date(futureDate(1).setHours(10, 0, 0)),
          endTime: new Date(futureDate(1).setHours(10, 30, 0)),
          status: "CONFIRMED",
          type: "IN_PERSON",
          reason: "Follow-up on diabetes management",
          notes: "Check recent blood sugar levels",
        },
        {
          patientId: patientIds[0],
          doctorId: doctorIds[0],
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          startTime: new Date(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(9, 0, 0)
          ),
          endTime: new Date(
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(9, 30, 0)
          ),
          status: "COMPLETED",
          type: "IN_PERSON",
          reason: "Heart palpitations",
          notes: "ECG performed, results normal. Follow up in 3 months.",
        },
      ];

      for (const appointment of appointments) {
        await prisma.appointment.create({
          data: appointment,
        });
      }
    }

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
