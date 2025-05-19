import {
  PrismaClient,
  UserRole,
  AppointmentStatus,
  AppointmentType,
} from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
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

  console.log("Cleared existing data");

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

  console.log("Created specialties");
  // Create admin users
  const adminUsers = [
    {
      name: "Super Admin",
      email: "admin@example.com",
      password: await hash("admin123", 10),
      role: UserRole.ADMIN,
      staff: {
        position: "Administrator",
        department: "Management",
        joinDate: new Date("2022-01-01"),
      },
    },
    {
      name: "John Admin",
      email: "john.admin@example.com",
      password: await hash("admin123", 10),
      role: UserRole.ADMIN,
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

  console.log("Created admin users");

  // Create staff members
  const staffMembers = [
    {
      name: "James Wilson",
      email: "james.wilson@example.com",
      password: await hash("staff123", 10),
      role: UserRole.STAFF,
      staff: {
        position: "Receptionist",
        department: "Front Desk",
        joinDate: new Date("2023-02-10"),
      },
    },
    {
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      password: await hash("staff123", 10),
      role: UserRole.STAFF,
      staff: {
        position: "Billing Specialist",
        department: "Accounts",
        joinDate: new Date("2023-05-22"),
      },
    },
    {
      name: "Thomas Brown",
      email: "thomas.brown@example.com",
      password: await hash("staff123", 10),
      role: UserRole.STAFF,
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

  console.log("Created staff members");
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
    {
      name: "Dr. Jennifer Lee",
      email: "jennifer.lee@example.com",
      password: await hash("doctor123", 10),
      role: UserRole.DOCTOR,
      doctor: {
        specialization: "Neurology",
        licenseNumber: "MD98765",
        experience: 12,
        education: "Yale School of Medicine",
        bio: "Specializing in neurological disorders and stroke recovery",
        consultationFee: 180.0,
      },
    },
    {
      name: "Dr. Michael Patel",
      email: "michael.patel@example.com",
      password: await hash("doctor123", 10),
      role: UserRole.DOCTOR,
      doctor: {
        specialization: "Orthopedics",
        licenseNumber: "MD24680",
        experience: 14,
        education: "Duke University School of Medicine",
        bio: "Focused on sports injuries and joint replacements",
        consultationFee: 160.0,
      },
    },
    {
      name: "Dr. Emily Chen",
      email: "emily.chen@example.com",
      password: await hash("doctor123", 10),
      role: UserRole.DOCTOR,
      doctor: {
        specialization: "Ophthalmology",
        licenseNumber: "MD13579",
        experience: 9,
        education: "University of California San Francisco",
        bio: "Expert in cataract surgery and retina disorders",
        consultationFee: 140.0,
      },
    },
    {
      name: "Dr. David Wilson",
      email: "david.wilson@example.com",
      password: await hash("doctor123", 10),
      role: UserRole.DOCTOR,
      doctor: {
        specialization: "Psychiatry",
        licenseNumber: "MD11223",
        experience: 11,
        education: "Columbia University",
        bio: "Specializing in mood disorders and cognitive behavioral therapy",
        consultationFee: 130.0,
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
    } // Associate specialties
    // First, find the specialty that matches the doctor's specialization
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
    if (doctorData.specialization === "Cardiology") {
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
    } else if (doctorData.specialization === "Pediatrics") {
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
      password: await hash("patient123", 10),
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
      password: await hash("patient123", 10),
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
    {
      name: "Michael Chen",
      email: "michael@example.com",
      password: await hash("patient123", 10),
      patient: {
        dateOfBirth: new Date("1995-04-12"),
        gender: "Male",
        bloodType: "AB+",
        height: 175.5,
        weight: 70.0,
        allergies: "Latex, Ibuprofen",
        medicalHistory: "Sports injury to left knee in 2019",
        emergencyContact: "Lisa Chen (Sister): +5544332211",
      },
    },
    {
      name: "Sophia Rodriguez",
      email: "sophia@example.com",
      password: await hash("patient123", 10),
      patient: {
        dateOfBirth: new Date("1988-09-03"),
        gender: "Female",
        bloodType: "A-",
        height: 162.0,
        weight: 54.5,
        allergies: "None",
        medicalHistory: "Tonsillectomy in childhood, Migraine sufferer",
        emergencyContact: "Carlos Rodriguez (Father): +6677889900",
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
  // Get all users
  const allUsers = await prisma.user.findMany({
    select: { id: true, role: true },
    orderBy: { id: "asc" },
  });

  // Get admin and doctor users
  const adminUsers = allUsers.filter((user) => user.role === "ADMIN");
  const doctorUsers = allUsers.filter((user) => user.role === "DOCTOR");

  // Create blog posts
  const posts = [
    {
      title: "Understanding Heart Health",
      content:
        "Cardiovascular health is essential for longevity. This article discusses ways to maintain a healthy heart through diet, exercise, and regular check-ups.",
      published: true,
      authorId: adminUsers[0].id, // First admin user
    },
    {
      title: "COVID-19 Updates and Precautions",
      content:
        "Stay informed about the latest COVID-19 guidelines and how our clinic is ensuring patient safety during the pandemic.",
      published: true,
      authorId: adminUsers[0].id, // First admin user
    },
    {
      title: "The Importance of Mental Health",
      content:
        "Mental health is as important as physical health. Learn about common mental health issues and when to seek professional help.",
      published: true,
      authorId: adminUsers[1].id, // Second admin user
    },
    {
      title: "Summer Health Tips",
      content:
        "Stay healthy during the summer months with these tips on hydration, sun protection, and heat-related illness prevention.",
      published: true,
      authorId: doctorUsers[0].id, // First doctor
    },
    {
      title: "New Medical Technologies",
      content:
        "Our clinic has invested in the latest medical technologies to provide better care for our patients.",
      published: false, // Draft post
      authorId: doctorUsers[1].id, // Second doctor
    },
  ];

  for (const post of posts) {
    await prisma.post.create({
      data: post,
    });
  }

  console.log("Created blog posts");

  // Create appointments  // First, get all patients and doctors
  const allPatients = await prisma.user.findMany({
    where: { role: UserRole.PATIENT },
    select: { id: true },
  });

  const allDoctors = await prisma.doctor.findMany({
    select: { id: true, userId: true },
  });

  // Generate a function to create dates in the near future
  const futureDate = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };
  // Generate a function to create dates in the near future
  const futureDate = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  // Create appointments with various statuses
  const appointments = [
    {
      patientId: allPatients[0].id,
      doctorId: allDoctors[0].id,
      date: futureDate(2),
      startTime: new Date(futureDate(2).setHours(9, 0, 0)),
      endTime: new Date(futureDate(2).setHours(9, 30, 0)),
      status: AppointmentStatus.CONFIRMED,
      type: AppointmentType.IN_PERSON,
      reason: "Annual checkup",
      notes: "Patient has reported occasional chest pain",
    },
    {
      patientId: allPatients[1].id,
      doctorId: allDoctors[1].id,
      date: futureDate(3),
      startTime: new Date(futureDate(3).setHours(14, 0, 0)),
      endTime: new Date(futureDate(3).setHours(14, 30, 0)),
      status: AppointmentStatus.PENDING,
      type: AppointmentType.VIDEO_CALL,
      reason: "Skin rash consultation",
      notes: null,
    },
    {
      patientId: allPatients[2].id,
      doctorId: allDoctors[2].id,
      date: futureDate(1),
      startTime: new Date(futureDate(1).setHours(10, 0, 0)),
      endTime: new Date(futureDate(1).setHours(10, 30, 0)),
      status: AppointmentStatus.CONFIRMED,
      type: AppointmentType.IN_PERSON,
      reason: "Follow-up on diabetes management",
      notes: "Check recent blood sugar levels",
    },
    {
      patientId: allPatients[3].id,
      doctorId: allDoctors[3].id,
      date: futureDate(5),
      startTime: new Date(futureDate(5).setHours(11, 0, 0)),
      endTime: new Date(futureDate(5).setHours(11, 30, 0)),
      status: AppointmentStatus.PENDING,
      type: AppointmentType.PHONE_CALL,
      reason: "Headache and dizziness",
      notes: "Patient reports symptoms starting 3 days ago",
    },
    {
      patientId: allPatients[0].id,
      doctorId: allDoctors[4].id,
      date: futureDate(7),
      startTime: new Date(futureDate(7).setHours(15, 0, 0)),
      endTime: new Date(futureDate(7).setHours(15, 30, 0)),
      status: AppointmentStatus.CONFIRMED,
      type: AppointmentType.IN_PERSON,
      reason: "Knee pain evaluation",
      notes: "MRI recommended",
    },
    {
      patientId: allPatients[4].id,
      doctorId: allDoctors[5].id,
      date: futureDate(4),
      startTime: new Date(futureDate(4).setHours(13, 0, 0)),
      endTime: new Date(futureDate(4).setHours(13, 30, 0)),
      status: AppointmentStatus.CONFIRMED,
      type: AppointmentType.IN_PERSON,
      reason: "Annual eye exam",
      notes: null,
    },
    {
      patientId: allPatients[1].id,
      doctorId: allDoctors[6].id,
      date: futureDate(10),
      startTime: new Date(futureDate(10).setHours(16, 0, 0)),
      endTime: new Date(futureDate(10).setHours(17, 0, 0)),
      status: AppointmentStatus.PENDING,
      type: AppointmentType.VIDEO_CALL,
      reason: "Anxiety and stress management",
      notes: "Patient reports increasing stress at work",
    },
    // Past appointments
    {
      patientId: allPatients[2].id,
      doctorId: allDoctors[0].id,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      startTime: new Date(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(9, 0, 0)
      ),
      endTime: new Date(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(9, 30, 0)
      ),
      status: AppointmentStatus.COMPLETED,
      type: AppointmentType.IN_PERSON,
      reason: "Heart palpitations",
      notes: "ECG performed, results normal. Follow up in 3 months.",
    },
    {
      patientId: allPatients[3].id,
      doctorId: allDoctors[1].id,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      startTime: new Date(
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).setHours(10, 0, 0)
      ),
      endTime: new Date(
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).setHours(10, 30, 0)
      ),
      status: AppointmentStatus.CANCELLED,
      type: AppointmentType.VIDEO_CALL,
      reason: "Acne treatment follow-up",
      notes: "Patient cancelled due to scheduling conflict",
    },
  ];

  for (const appointment of appointments) {
    await prisma.appointment.create({
      data: appointment,
    });
  }

  console.log("Created appointments");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
