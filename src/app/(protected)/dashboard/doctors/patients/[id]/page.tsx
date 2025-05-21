"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  FilePlus,
  MessageSquare,
  Phone,
  Plus,
  Video,
} from "lucide-react";

// Types based on Prisma schema
type Patient = {
  id: number;
  userId: number;
  dateOfBirth: string | null;
  gender: string | null;
  bloodType: string | null;
  height: number | null;
  weight: number | null;
  allergies: string | null;
  medicalHistory: string | null;
  emergencyContact: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    profilePic: string | null;
  };
  appointments: Appointment[];
};

type Appointment = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  type: "IN_PERSON" | "VIDEO_CALL" | "PHONE_CALL";
  reason: string;
  notes: string | null;
};

export default function PatientDetailPage() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("medicalRecords");
  const router = useRouter();
  const params = useParams();
  const patientId = params.id;

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/doctors/patients/${patientId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch patient details");
      }

      const data = await response.json();
      setPatient(data);
    } catch (error) {
      console.error("Error fetching patient details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string | null) => {
    if (!dateOfBirth) return "N/A";

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getBMI = (height: number | null, weight: number | null) => {
    if (!height || !weight) return "N/A";

    // Convert height from cm to meters
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    return bmi.toFixed(1);
  };

  const getRecentAppointments = () => {
    if (
      !patient ||
      !patient.appointments ||
      patient.appointments.length === 0
    ) {
      return [];
    }

    // Sort appointments by date (most recent first)
    return [...patient.appointments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  // const getCompletedAppointments = () => {
  //   if (
  //     !patient ||
  //     !patient.appointments ||
  //     patient.appointments.length === 0
  //   ) {
  //     return [];
  //   }

  //   return patient.appointments.filter((app) => app.status === "COMPLETED");
  // };

  // const getPendingAppointments = () => {
  //   if (
  //     !patient ||
  //     !patient.appointments ||
  //     patient.appointments.length === 0
  //   ) {
  //     return [];
  //   }

  //   return patient.appointments.filter(
  //     (app) => app.status === "PENDING" || app.status === "CONFIRMED"
  //   );
  // };

  // const getAppointmentTypeIcon = (type: string) => {
  //   switch (type) {
  //     case "IN_PERSON":
  //       return <User className="h-4 w-4 mr-1" />;
  //     case "VIDEO_CALL":
  //       return <Video className="h-4 w-4 mr-1" />;
  //     case "PHONE_CALL":
  //       return <Phone className="h-4 w-4 mr-1" />;
  //     default:
  //       return <User className="h-4 w-4 mr-1" />;
  //   }
  // };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-12 w-12 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p>Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <p>
            Patient not found or you don`t have permission to view this patient.
          </p>
          <Button onClick={() => router.push("/dashboard/doctors/patients")}>
            Return to Patients List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/doctors/patients")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Patient Details</h1>
          <p className="text-muted-foreground">
            View and manage patient information
          </p>
        </div>
      </div>

      {/* Patient Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row">
            {/* Patient Profile */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/20">
                    {patient?.user?.profilePic ? (
                      <Image
                        src={patient?.user?.profilePic}
                        alt={patient?.user?.name}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-primary/10 flex items-center justify-center text-primary text-4xl">
                        {patient?.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <h2 className="text-2xl font-bold">
                      {patient?.user?.name}
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" /> Active Patient
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-3">
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-1">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <span>PID-{patient.id}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-1">
                        <Calendar className="h-3.5 w-3.5" />
                      </span>
                      <span>
                        {calculateAge(patient.dateOfBirth)} years old
                        {patient.dateOfBirth &&
                          ` (${format(
                            new Date(patient.dateOfBirth),
                            "MMM d, yyyy"
                          )})`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-1">
                        <User className="h-3.5 w-3.5" />
                      </span>
                      <span>{patient.gender || "Not specified"}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-1">
                        <Phone className="h-3.5 w-3.5" />
                      </span>
                      <span>
                        {patient.emergencyContact || "No contact info"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Button>
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Medical Report
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-muted/50 p-6 md:w-80 lg:w-96 rounded-lg mt-6 md:mt-0 md:ml-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Health Overview
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Blood Type</p>
                  <p className="text-sm font-medium">
                    {patient.bloodType || "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Height</p>
                  <p className="text-sm font-medium">
                    {patient.height
                      ? `${patient.height} cm (${Math.floor(
                          patient.height / 30.48
                        )}'${Math.round((patient.height % 30.48) / 2.54)}")`
                      : "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-sm font-medium">
                    {patient.weight
                      ? `${patient.weight} kg (${Math.round(
                          patient.weight * 2.20462
                        )} lbs)`
                      : "Not recorded"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">BMI</p>
                  <p className="text-sm font-medium">
                    {getBMI(patient.height, patient.weight)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last BP</p>
                  <p className="text-sm font-medium">120/80 mmHg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Allergies</p>
                  <p className="text-sm font-medium">
                    {patient.allergies || "None recorded"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b w-full justify-start rounded-none px-0 mb-4">
          <TabsTrigger
            value="medicalRecords"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <FileText className="h-4 w-4 mr-2" /> Medical Records
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <Calendar className="h-4 w-4 mr-2" /> Appointments
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <FileText className="h-4 w-4 mr-2" /> Prescriptions
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <FileText className="h-4 w-4 mr-2" /> Billing
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
          >
            <FileText className="h-4 w-4 mr-2" /> Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="medicalRecords">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Patient Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Patient Summary</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-primary"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Basic Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Full Name
                          </p>
                          <p className="text-sm font-medium">
                            {patient?.user?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Date of Birth
                          </p>
                          <p className="text-sm font-medium">
                            {patient.dateOfBirth
                              ? `${format(
                                  new Date(patient.dateOfBirth),
                                  "MMMM d, yyyy"
                                )} (${calculateAge(patient.dateOfBirth)} years)`
                              : "Not recorded"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Gender
                          </p>
                          <p className="text-sm font-medium">
                            {patient.gender || "Not specified"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Contact Number
                          </p>
                          <p className="text-sm font-medium">
                            {patient.emergencyContact || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Email Address
                          </p>
                          <p className="text-sm font-medium">
                            {patient?.user?.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Address
                          </p>
                          <p className="text-sm font-medium">Not provided</p>
                        </div>
                      </div>
                    </div>

                    {/* Medical Info */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Medical Information
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Blood Type
                          </p>
                          <p className="text-sm font-medium">
                            {patient.bloodType || "Not recorded"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Height & Weight
                          </p>
                          <p className="text-sm font-medium">
                            {patient.height
                              ? `${patient.height} cm`
                              : "Height not recorded"}{" "}
                            •
                            {patient.weight
                              ? `${patient.weight} kg`
                              : "Weight not recorded"}{" "}
                            • BMI: {getBMI(patient.height, patient.weight)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Allergies
                          </p>
                          <p className="text-sm font-medium">
                            {patient.allergies || "None recorded"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Chronic Conditions
                          </p>
                          <p className="text-sm font-medium">
                            {patient.medicalHistory
                              ? patient.medicalHistory.split(",")[0]
                              : "None recorded"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Current Medications
                          </p>
                          <p className="text-sm font-medium">Not specified</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Emergency Contact
                          </p>
                          <p className="text-sm font-medium">
                            {patient.emergencyContact || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Appointment History */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Appointment History</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-primary"
                    >
                      View All <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {getRecentAppointments().length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">
                        No appointments yet
                      </h3>
                      <p className="text-muted-foreground mt-1">
                        This patient doesn`t have any appointments in the
                        system.
                      </p>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule First Appointment
                      </Button>
                    </div>
                  ) : (
                    getRecentAppointments()
                      .slice(0, 3)
                      .map((appointment) => (
                        <div
                          key={appointment.id}
                          className={`rounded-lg p-4 border ${
                            appointment.status === "COMPLETED"
                              ? "bg-green-50 border-green-100"
                              : appointment.status === "CONFIRMED"
                              ? "bg-blue-50 border-blue-100"
                              : appointment.status === "PENDING"
                              ? "bg-yellow-50 border-yellow-100"
                              : appointment.status === "CANCELLED"
                              ? "bg-red-50 border-red-100"
                              : "bg-purple-50 border-purple-100"
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                            <div>
                              <Badge
                                variant="outline"
                                className={`mb-1 ${
                                  appointment.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : appointment.status === "CONFIRMED"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : appointment.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                    : appointment.status === "CANCELLED"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-purple-100 text-purple-800 border-purple-200"
                                }`}
                              >
                                {appointment.status === "COMPLETED" ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : appointment.status === "CONFIRMED" ? (
                                  <Calendar className="h-3 w-3 mr-1" />
                                ) : appointment.status === "PENDING" ? (
                                  <Clock className="h-3 w-3 mr-1" />
                                ) : appointment.status === "CANCELLED" ? (
                                  <XCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Calendar className="h-3 w-3 mr-1" />
                                )}

                                {appointment.status.charAt(0) +
                                  appointment.status.slice(1).toLowerCase()}
                              </Badge>
                              <h4 className="font-medium">
                                {appointment.reason}
                              </h4>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">
                                {format(
                                  new Date(appointment.date),
                                  "MMMM d, yyyy"
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(appointment.startTime),
                                  "h:mm a"
                                )}{" "}
                                -
                                {format(
                                  new Date(appointment.endTime),
                                  "h:mm a"
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Doctor
                              </p>
                              <p className="text-sm font-medium">
                                Dr. James Wilson
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Type
                              </p>
                              <p className="text-sm font-medium flex items-center">
                                {appointment.type === "IN_PERSON" ? (
                                  <>
                                    <User className="h-3.5 w-3.5 mr-1 text-blue-600" />{" "}
                                    In-Person
                                  </>
                                ) : appointment.type === "VIDEO_CALL" ? (
                                  <>
                                    <Video className="h-3.5 w-3.5 mr-1 text-purple-600" />{" "}
                                    Video Call
                                  </>
                                ) : (
                                  <>
                                    <Phone className="h-3.5 w-3.5 mr-1 text-green-600" />{" "}
                                    Phone Call
                                  </>
                                )}
                              </p>
                            </div>
                            {appointment.status === "COMPLETED" && (
                              <>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Vitals
                                  </p>
                                  <p className="text-sm font-medium">
                                    BP: 120/80 • Pulse: 72 • Temp: 98.6°F
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Notes
                                  </p>
                                  <p className="text-sm font-medium">
                                    {appointment.notes || "No notes recorded"}
                                  </p>
                                </div>
                              </>
                            )}
                            {appointment.status === "CONFIRMED" && (
                              <div className="md:col-span-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1" />{" "}
                                  Cancel Appointment
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </CardContent>
              </Card>

              {/* Medical Notes */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Medical Notes</CardTitle>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Add Note
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {patient.medicalHistory ? (
                    <div className="space-y-4 pl-8 relative">
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="bg-muted/50 border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Added: {format(new Date(), "MMMM d, yyyy • h:mm a")}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                        <div className="flex items-center mb-2">
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800 border-blue-200 mr-2"
                          >
                            Medical History
                          </Badge>
                          <span className="text-xs font-medium">
                            Dr. James Wilson
                          </span>
                        </div>
                        <p className="text-sm">{patient.medicalHistory}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No medical notes</h3>
                      <p className="text-muted-foreground mt-1">
                        No medical notes have been added for this patient yet.
                      </p>
                      <Button className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medical Note
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Health Records */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Health Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b border-border pb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Recent Vitals
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Blood Pressure
                        </p>
                        <p className="text-xl font-bold">120/80</p>
                        <p className="text-xs text-green-600 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1 inline" /> Normal
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Pulse Rate
                        </p>
                        <p className="text-xl font-bold">72</p>
                        <p className="text-xs text-green-600 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1 inline" /> Normal
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Temperature
                        </p>
                        <p className="text-xl font-bold">98.6°F</p>
                        <p className="text-xs text-green-600 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1 inline" /> Normal
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="text-xl font-bold">
                          {patient.weight ? `${patient.weight} kg` : "N/A"}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          <AlertCircle className="h-3 w-3 mr-1 inline" />
                          {getBMI(patient.height, patient.weight) !== "N/A" &&
                          parseFloat(getBMI(patient.height, patient.weight)) >
                            25
                            ? "Overweight"
                            : "Normal"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-border pb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Recent Lab Results
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            Complete Blood Count
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Mar 18, 2023
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Normal
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Metabolic Panel</p>
                          <p className="text-xs text-muted-foreground">
                            Mar 18, 2023
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Normal
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">Lipid Panel</p>
                          <p className="text-xs text-muted-foreground">
                            Jan 5, 2023
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            Warning
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Active Medications
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                        <div>
                          <p className="text-sm font-medium">Loratadine</p>
                          <p className="text-xs text-muted-foreground">
                            10mg tablet • Once daily
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Allergies
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                        <div>
                          <p className="text-sm font-medium">Vitamin D</p>
                          <p className="text-xs text-muted-foreground">
                            1000 IU capsule • Once daily
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                            Supplement
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">
                        New Prescription
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                        <Plus className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">Add Lab Order</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-2">
                        <FilePlus className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">Create Note</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">
                        Schedule Follow-up
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">Send Message</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto py-3 px-4 flex flex-col items-center justify-center"
                    >
                      <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                        <Download className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">
                        Export Records
                      </span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Patient Documents */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Documents</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-primary"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 hover:bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center mr-3 flex-shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Lab Results - March 2023.pdf
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded Mar 18, 2023
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center p-2 hover:bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center mr-3 flex-shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Bloodwork Jan 2023.xlsx
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded Jan 7, 2023
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full text-center text-sm mt-3"
                    >
                      View All Documents{" "}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <div className="bg-card rounded-lg border shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Appointment History</h3>

              {getRecentAppointments().length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium">No appointments found</h3>
                  <p className="text-muted-foreground mt-2 max-w-md">
                    This patient doesn`t have any appointments in the system
                    yet. Schedule their first appointment to get started.
                  </p>
                  <Button className="mt-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {getRecentAppointments().map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`rounded-lg p-4 border ${
                        appointment.status === "COMPLETED"
                          ? "bg-green-50 border-green-100"
                          : appointment.status === "CONFIRMED"
                          ? "bg-blue-50 border-blue-100"
                          : appointment.status === "PENDING"
                          ? "bg-yellow-50 border-yellow-100"
                          : appointment.status === "CANCELLED"
                          ? "bg-red-50 border-red-100"
                          : "bg-purple-50 border-purple-100"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <div>
                          <Badge
                            variant="outline"
                            className={`mb-1 ${
                              appointment.status === "COMPLETED"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : appointment.status === "CONFIRMED"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : appointment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                : appointment.status === "CANCELLED"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-purple-100 text-purple-800 border-purple-200"
                            }`}
                          >
                            {appointment.status === "COMPLETED" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : appointment.status === "CONFIRMED" ? (
                              <Calendar className="h-3 w-3 mr-1" />
                            ) : appointment.status === "PENDING" ? (
                              <Clock className="h-3 w-3 mr-1" />
                            ) : appointment.status === "CANCELLED" ? (
                              <XCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Calendar className="h-3 w-3 mr-1" />
                            )}

                            {appointment.status.charAt(0) +
                              appointment.status.slice(1).toLowerCase()}
                          </Badge>
                          <h4 className="text-lg font-medium">
                            {appointment.reason}
                          </h4>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-medium">
                            {format(new Date(appointment.date), "MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(appointment.startTime), "h:mm a")}{" "}
                            -{format(new Date(appointment.endTime), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Doctor
                          </p>
                          <p className="text-sm font-medium">
                            Dr. James Wilson
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="text-sm font-medium flex items-center">
                            {appointment.type === "IN_PERSON" ? (
                              <>
                                <User className="h-3.5 w-3.5 mr-1 text-blue-600" />{" "}
                                In-Person
                              </>
                            ) : appointment.type === "VIDEO_CALL" ? (
                              <>
                                <Video className="h-3.5 w-3.5 mr-1 text-purple-600" />{" "}
                                Video Call
                              </>
                            ) : (
                              <>
                                <Phone className="h-3.5 w-3.5 mr-1 text-green-600" />{" "}
                                Phone Call
                              </>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Appointment ID
                          </p>
                          <p className="text-sm font-medium">
                            APP-{appointment.id}
                          </p>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="bg-card border rounded-md p-3 mb-4">
                          <p className="text-xs text-muted-foreground mb-1">
                            Notes
                          </p>
                          <p className="text-sm">{appointment.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                        </Button>

                        {(appointment.status === "PENDING" ||
                          appointment.status === "CONFIRMED") && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" /> Reschedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel
                            </Button>
                          </>
                        )}

                        {appointment.status === "COMPLETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-primary border-primary/20 hover:bg-primary/10"
                          >
                            <FilePlus className="h-3.5 w-3.5 mr-1" /> Add Note
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <div className="p-6 flex justify-center items-center">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">Prescriptions</h3>
              <p className="text-muted-foreground mt-2">
                This feature is coming soon. You`ll be able to view and manage
                the patient`s prescriptions here.
              </p>
              <Button className="mt-6">Add New Prescription</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="p-6 flex justify-center items-center">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">Billing Records</h3>
              <p className="text-muted-foreground mt-2">
                This feature is coming soon. You`ll be able to view and manage
                the patient`s billing information here.
              </p>
              <Button className="mt-6">View Billing Settings</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="p-6 flex justify-center items-center">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">Patient Documents</h3>
              <p className="text-muted-foreground mt-2">
                This feature is coming soon. You`ll be able to view and manage
                the patient`s documents here.
              </p>
              <Button className="mt-6">Upload Documents</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
