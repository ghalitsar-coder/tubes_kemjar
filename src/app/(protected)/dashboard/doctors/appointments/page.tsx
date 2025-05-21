"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  CalendarX,
  Calendar,
  CheckCheck,
  ClipboardList,
  UserPlus,
  Video,
  CalendarClock,
  FilePlus,
  Eye,
  Edit,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Appointment = {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  type: "IN_PERSON" | "VIDEO_CALL" | "PHONE_CALL";
  reason: string;
  notes?: string;
  patient: {
    name: string;
    email: string;
    profilePic?: string;
  };
  createdAt: string;
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/appointments?role=doctor");

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Update appointment status
  const updateAppointmentStatus = async (
    appointmentId: number,
    status: string
  ) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update appointment");
      }
      // Update local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app.id === appointmentId
            ? { ...app, status: status as Appointment["status"] }
            : app
        )
      );
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert(
        `Error: ${
          error instanceof Error
            ? error.message
            : "Failed to update appointment"
        }`
      );
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    if (activeTab === "pending") return appointment.status === "PENDING";
    if (activeTab === "confirmed") return appointment.status === "CONFIRMED";
    if (activeTab === "completed") return appointment.status === "COMPLETED";
    if (activeTab === "cancelled")
      return (
        appointment.status === "CANCELLED" ||
        appointment.status === "RESCHEDULED"
      );
    return true;
  });
  console.log(`THIS IS  appointments:`, appointments)
  // Get today's appointments
  const today = new Date().toISOString().split("T")[0];
  const todaysAppointments = appointments.filter(
    (app) => {
      // Normalize the date format for comparison
      const appointmentDate = new Date(app.date).toISOString().split("T")[0];
      return appointmentDate === today &&
        (app.status === "CONFIRMED" || app.status === "PENDING");
    }
  );
  console.log(`THIS IS  todaysAppointments:`, todaysAppointments)
  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(
      (app) => {
        // Normalize the date format for comparison
        const appointmentDate = new Date(app.date).toISOString().split("T")[0];
        return (appointmentDate > today &&
          app.status !== "CANCELLED" &&
          app.status !== "COMPLETED") ||
        (appointmentDate === today &&
          app.status !== "CANCELLED" &&
          app.status !== "COMPLETED");
      }
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Get recent patients
  const recentPatients = [...appointments]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .filter(
      (app, index, self) =>
        index === self.findIndex((t) => t.patientId === app.patientId)
    )
    .slice(0, 5);

  // Get stats
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(
    (app) => app.status === "CONFIRMED"
  ).length;
  const pendingAppointments = appointments.filter(
    (app) => app.status === "PENDING"
  ).length;
  const cancelledAppointments = appointments.filter(
    (app) => app.status === "CANCELLED" || app.status === "RESCHEDULED"
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Janji Temu</h1>
          <p className="text-muted-foreground mt-1">
            Kelola janji temu dan jadwal pasien Anda
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button className="flex items-center">
            <CalendarClock className="mr-2 h-4 w-4" /> Janji Temu Baru
          </Button>
          <Button variant="outline" className="flex items-center">
            <ClipboardList className="mr-2 h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-500">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Janji Temu
                </p>
                <h3 className="text-2xl font-bold mt-1">{totalAppointments}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-500">
                <CheckCheck className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Terkonfirmasi
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {confirmedAppointments}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-500">
                <Clock className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Menunggu
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {pendingAppointments}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-50 text-red-500">
                <XCircle className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Dibatalkan
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {cancelledAppointments}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>
                Jadwal Hari Ini •{" "}
                {format(new Date(), "dd MMMM yyyy", { locale: id })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Memuat janji temu...</span>
                </div>
              ) : todaysAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarX className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-2">
                    Tidak ada janji temu untuk hari ini
                  </p>
                </div>
              ) : (
                todaysAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-5 hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            appointment.status === "CONFIRMED"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium">
                            {appointment.patient.name}
                          </h3>
                          <Badge
                            className={
                              appointment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {appointment.status === "PENDING"
                              ? "Menunggu"
                              : "Dikonfirmasi"}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>
                            {format(new Date(appointment.startTime), "HH:mm")} -
                            {format(new Date(appointment.endTime), "HH:mm")}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <CalendarClock className="mr-2 h-4 w-4" />
                          <span>{appointment.reason}</span>
                        </div>
                        <div className="mt-2 flex">
                          <Badge
                            variant="outline"
                            className={`
                            ${
                              appointment.type === "IN_PERSON"
                                ? "bg-blue-100 text-blue-800"
                                : appointment.type === "VIDEO_CALL"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-orange-100 text-orange-800"
                            }
                          `}
                          >
                            {appointment.type === "IN_PERSON"
                              ? "Tatap Muka"
                              : appointment.type === "VIDEO_CALL"
                              ? "Video Call"
                              : "Telepon"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "CANCELLED"
                                )
                              }
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-500 hover:text-green-700 hover:bg-green-50"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "CONFIRMED"
                                )
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            router.push(
                              `/dashboard/doctors/appointments/${appointment.id}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions & upcoming */}
        <div className="space-y-6">
          {/* Quick actions */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center p-3 h-auto"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Janji Temu Baru</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center p-3 h-auto"
                >
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                    <FilePlus className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Resep Baru</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center p-3 h-auto"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Pasien Baru</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center justify-center p-3 h-auto"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
                    <Video className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Video Call</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Janji Temu Mendatang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Tidak ada janji temu mendatang
                    </p>
                  </div>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start">
                      <div className="flex-shrink-0 pt-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {format(new Date(appointment.date), "dd MMM", {
                            locale: id,
                          })}
                        </span>
                      </div>
                      <div className="ml-3 flex-1">
                        <h4 className="text-sm font-medium">
                          {appointment.patient.name}
                        </h4>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <Clock className="mr-1.5 h-3 w-3" />
                          <span>
                            {format(new Date(appointment.startTime), "HH:mm")} -
                            {format(new Date(appointment.endTime), "HH:mm")}
                          </span>
                        </div>
                        <div className="mt-1">
                          <Badge
                            className={
                              appointment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }
                          >
                            {appointment.status === "PENDING"
                              ? "Menunggu"
                              : "Dikonfirmasi"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button
                variant="link"
                className="mt-4 text-sm font-medium p-0 h-auto"
                onClick={() => setActiveTab("all")}
              >
                Lihat Semua <span className="ml-1">→</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent patients */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Pasien Terbaru</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Pasien</TableHead>
                <TableHead>Kunjungan Terakhir</TableHead>
                <TableHead>Janji Temu Berikutnya</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPatients.map((patient) => {
                const lastAppointment = [...appointments]
                  .filter(
                    (app) =>
                      app.patientId === patient.patientId &&
                      app.status === "COMPLETED"
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )[0];

                const nextAppointment = [...appointments]
                  .filter(
                    (app) =>
                      app.patientId === patient.patientId &&
                      (app.status === "CONFIRMED" ||
                        app.status === "PENDING") &&
                      new Date(app.date) >= new Date()
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )[0];

                return (
                  <TableRow key={patient.id} className="hover:bg-muted/10">
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={patient.patient.profilePic || ""}
                            alt={patient.patient.name}
                          />
                          <AvatarFallback>
                            {patient.patient.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium">
                            {patient.patient.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {patient.patient.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lastAppointment ? (
                        <>
                          <div className="text-sm">
                            {format(
                              new Date(lastAppointment.date),
                              "dd MMM yyyy",
                              { locale: id }
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {lastAppointment.reason}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {nextAppointment ? (
                        <>
                          <div className="text-sm">
                            {format(
                              new Date(nextAppointment.date),
                              "dd MMM yyyy",
                              { locale: id }
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(
                              new Date(nextAppointment.startTime),
                              "HH:mm"
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                      >
                        Aktif
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() =>
                            router.push(
                              `/dashboard/doctors/patients/${patient.patientId}`
                            )
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() =>
                            router.push(
                              `/dashboard/doctors/patients/${patient.patientId}/edit`
                            )
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* All appointments (tabs) */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Semua Janji Temu</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="pending">Menunggu</TabsTrigger>
              <TabsTrigger value="confirmed">Dikonfirmasi</TabsTrigger>
              <TabsTrigger value="completed">Selesai</TabsTrigger>
              <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Memuat janji temu...</span>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <CalendarX className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-2">
                    Tidak ada janji temu
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tidak ada janji temu{" "}
                    {activeTab === "pending"
                      ? "yang menunggu konfirmasi"
                      : activeTab === "confirmed"
                      ? "yang telah dikonfirmasi"
                      : activeTab === "completed"
                      ? "yang telah selesai"
                      : activeTab === "cancelled"
                      ? "yang dibatalkan"
                      : ""}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {appointment.patient.name}
                            </CardTitle>
                            <CardDescription>
                              {format(
                                new Date(appointment.date),
                                "EEEE, dd MMMM yyyy",
                                { locale: id }
                              )}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              appointment.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : appointment.status === "CONFIRMED"
                                ? "bg-blue-100 text-blue-800"
                                : appointment.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {appointment.status === "PENDING"
                              ? "Menunggu"
                              : appointment.status === "CONFIRMED"
                              ? "Dikonfirmasi"
                              : appointment.status === "COMPLETED"
                              ? "Selesai"
                              : appointment.status === "CANCELLED"
                              ? "Dibatalkan"
                              : "Dijadwalkan Ulang"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="flex items-center text-sm text-muted-foreground mb-3">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {format(new Date(appointment.startTime), "HH:mm")} -
                            {format(new Date(appointment.endTime), "HH:mm")}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Alasan Kunjungan
                          </p>
                          <p className="text-sm line-clamp-2">
                            {appointment.reason}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex gap-2 border-t pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            router.push(
                              `/dashboard/doctors/appointments/${appointment.id}`
                            )
                          }
                        >
                          Detail
                        </Button>

                        {appointment.status === "PENDING" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-50"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "CANCELLED"
                                )
                              }
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                updateAppointmentStatus(
                                  appointment.id,
                                  "CONFIRMED"
                                )
                              }
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Konfirmasi
                            </Button>
                          </>
                        )}

                        {appointment.status === "CONFIRMED" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "COMPLETED"
                              )
                            }
                          >
                            <CheckCircle className="h-3.5 w-3.5 mr-1" />
                            Selesai
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
