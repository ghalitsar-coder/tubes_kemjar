import {
  IconCalendarEvent,
  IconDashboard,
  IconFiles,
  IconFirstAidKit,
  IconHeart,
  IconHistory,
  IconListDetails,
  IconNotes,
  IconReportMedical,
  IconSettings,
  IconStethoscope,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";

// Navigation items for patient role
export const patientNavItems = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
    {
      title: "Appointments",
      url: "/appointments",
      icon: IconCalendarEvent,
    },
    {
      title: "Book Appointment",
      url: "/appointments/book",
      icon: IconStethoscope,
    },
    {
      title: "Medical Records",
      url: "/medical-records",
      icon: IconNotes,
    },
    {
      title: "Prescriptions",
      url: "/prescriptions",
      icon: IconReportMedical,
    },
  ],
  documents: [
    {
      name: "Health Tips",
      url: "/health-tips",
      icon: IconFirstAidKit,
    },
    {
      name: "Medical History",
      url: "/medical-history",
      icon: IconHistory,
    },
    {
      name: "Health Vitals",
      url: "/health-vitals",
      icon: IconHeart,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/profile",
      icon: IconUserCircle,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
};

// Navigation items for doctor role
export const doctorNavItems = {
  navMain: [
    {
      title: "Dashboard",
      url: "/doctors",
      icon: IconDashboard,
    },
    {
      title: "My Schedule",
      url: "/doctors/schedule",
      icon: IconCalendarEvent,
    },
    {
      title: "Appointments",
      url: "/doctors/appointments",
      icon: IconListDetails,
    },
    {
      title: "Patients",
      url: "/doctors/patients",
      icon: IconUsers,
    },
    {
      title: "Prescriptions",
      url: "/doctors/prescriptions",
      icon: IconReportMedical,
    },
  ],
  documents: [
    {
      name: "Patient Records",
      url: "/doctors/patient-records",
      icon: IconFiles,
    },
    {
      name: "Medical Reports",
      url: "/doctors/reports",
      icon: IconReportMedical,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/profile",
      icon: IconUserCircle,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
  ],
};

// Navigation items for admin/staff role
export const adminNavItems = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "Patients",
      url: "/admin/patients",
      icon: IconUsers,
    },
    {
      title: "Doctors",
      url: "/admin/doctors",
      icon: IconStethoscope,
    },
    {
      title: "Appointments",
      url: "/admin/appointments",
      icon: IconCalendarEvent,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconReportMedical,
    },
  ],
  documents: [
    {
      name: "Staff Management",
      url: "/admin/staff",
      icon: IconUsers,
    },
    {
      name: "System Logs",
      url: "/admin/logs",
      icon: IconHistory,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/profile",
      icon: IconUserCircle,
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],
};
