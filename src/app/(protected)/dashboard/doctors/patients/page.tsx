"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  FileText,
  Search,
  Star,
  User,
  UserPlus,
  Users,
  AlertCircle,
  Calendar,
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

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const router = useRouter();

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, statusFilter, typeFilter, patients]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/doctors/patients");

      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }

      const data = await response.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (patient) =>
          patient?.user?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((patient) => {
        const latestAppointment = patient.appointments?.[0];
        return latestAppointment && latestAppointment.status === statusFilter;
      });
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((patient) => {
        const latestAppointment = patient.appointments?.[0];
        return latestAppointment && latestAppointment.type === typeFilter;
      });
    }

    setFilteredPatients(filtered);
  };

  const getAgeFromDOB = (dob: string | null) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const ageDifMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getLatestAppointment = (patient: Patient) => {
    if (!patient.appointments || patient.appointments.length === 0) {
      return null;
    }

    // Sort appointments by date, most recent first
    const sortedAppointments = [...patient.appointments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sortedAppointments[0];
  };

  const getNextAppointment = (patient: Patient) => {
    if (!patient.appointments || patient.appointments.length === 0) {
      return null;
    }

    const now = new Date();

    // Filter future appointments and sort by date
    const futureAppointments = patient.appointments
      .filter((app) => new Date(app.date) > now && app.status !== "CANCELLED")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return futureAppointments[0] || null;
  };

  // Color mapping for status badges
  // const getStatusBadgeColor = (status: string) => {
  //   switch (status) {
  //     case "COMPLETED":
  //       return "bg-green-100 text-green-800";
  //     case "CONFIRMED":
  //       return "bg-blue-100 text-blue-800";
  //     case "PENDING":
  //       return "bg-yellow-100 text-yellow-800";
  //     case "CANCELLED":
  //       return "bg-red-100 text-red-800";
  //     case "RESCHEDULED":
  //       return "bg-purple-100 text-purple-800";
  //     default:
  //       return "bg-gray-100 text-gray-800";
  //   }
  // };

  // Appointment type icon mapping
  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case "IN_PERSON":
        return <User className="h-4 w-4 mr-1" />;
      case "VIDEO_CALL":
        return <CalendarCheck className="h-4 w-4 mr-1" />;
      case "PHONE_CALL":
        return <FileText className="h-4 w-4 mr-1" />;
      default:
        return <User className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Patient Consultations</h1>
        <p className="text-muted-foreground">
          Manage your patients and their consultation history
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Today`s Appointments
                </p>
                <h3 className="text-2xl font-bold">
                  {
                    patients.filter((patient) => {
                      const latestAppointment = getLatestAppointment(patient);
                      if (!latestAppointment) return false;
                      return (
                        new Date(latestAppointment.date).toDateString() ===
                        new Date().toDateString()
                      );
                    }).length
                  }
                </h3>
                <p className="text-xs mt-1 text-green-600">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  Updated
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Calendar className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Completed</p>
                <h3 className="text-2xl font-bold">
                  {
                    patients.filter((patient) => {
                      const latestAppointment = getLatestAppointment(patient);
                      return (
                        latestAppointment &&
                        latestAppointment.status === "COMPLETED"
                      );
                    }).length
                  }
                </h3>
                <p className="text-xs mt-1 text-green-600">
                  <CheckCircle className="h-3 w-3 inline mr-1" />
                  Success rate
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg text-green-600">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Upcoming</p>
                <h3 className="text-2xl font-bold">
                  {
                    patients.filter((patient) => getNextAppointment(patient))
                      .length
                  }
                </h3>
                <p className="text-xs mt-1 text-yellow-600">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Scheduled
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <Clock className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Average Rating
                </p>
                <h3 className="text-2xl font-bold">4.8</h3>
                <p className="text-xs mt-1 text-purple-600">
                  <Star className="h-3 w-3 inline mr-1" />
                  36 reviews
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <Star className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Total Patients
                </p>
                <h3 className="text-2xl font-bold">{patients.length}</h3>
                <p className="text-xs mt-1 text-blue-600">
                  <UserPlus className="h-3 w-3 inline mr-1" />
                  Active patients
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="RESCHEDULED">Rescheduled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="IN_PERSON">In-Person</SelectItem>
                  <SelectItem value="VIDEO_CALL">Video Call</SelectItem>
                  <SelectItem value="PHONE_CALL">Phone Call</SelectItem>
                </SelectContent>
              </Select>

              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                New Consultation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <div className="flex justify-center">
                        <svg
                          className="animate-spin h-6 w-6 text-primary"
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
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      <div className="flex flex-col items-center justify-center py-4">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No patients found matching your criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((patient) => {
                    const latestAppointment = getLatestAppointment(patient);
                    const nextAppointment = getNextAppointment(patient);

                    return (
                      <TableRow
                        key={patient.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          router.push(
                            `/dashboard/doctors/patients/${patient.id}`
                          )
                        }
                      >
                        <TableCell>
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-muted">
                                {patient?.user?.profilePic ? (
                                  <Image
                                    src={patient?.user?.profilePic}
                                    alt={patient?.user?.name}
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 object-cover"
                                  />
                                ) : (
                                  <div className="h-10 w-10 bg-primary/10 flex items-center justify-center text-primary">
                                    {patient?.user?.name
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium">
                                {patient?.user?.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {patient.gender || "N/A"} •{" "}
                                {getAgeFromDOB(patient.dateOfBirth)}y
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {latestAppointment ? (
                            <>
                              <div className="text-sm font-medium">
                                {format(
                                  new Date(latestAppointment.date),
                                  "MMM d, yyyy"
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format(
                                  new Date(latestAppointment.startTime),
                                  "h:mm a"
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              No appointments
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {latestAppointment ? (
                            <Badge variant="outline" className="font-normal">
                              {getAppointmentTypeIcon(latestAppointment.type)}
                              {latestAppointment.type === "IN_PERSON"
                                ? "In-Person"
                                : latestAppointment.type === "VIDEO_CALL"
                                ? "Video Call"
                                : "Phone Call"}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {latestAppointment ? (
                            <Badge
                              variant="outline"
                              className={
                                latestAppointment.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : latestAppointment.status === "CONFIRMED"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : latestAppointment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : latestAppointment.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-purple-100 text-purple-800 border-purple-200"
                              }
                            >
                              {latestAppointment.status.charAt(0) +
                                latestAppointment.status.slice(1).toLowerCase()}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {latestAppointment ? (
                            <div
                              className="max-w-[200px] truncate"
                              title={latestAppointment.reason}
                            >
                              {latestAppointment.reason}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              -
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/dashboard/doctors/patients/${patient.id}`
                                );
                              }}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (latestAppointment) {
                                  router.push(
                                    `/dashboard/doctors/appointments/${latestAppointment.id}`
                                  );
                                }
                              }}
                              disabled={!latestAppointment}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
