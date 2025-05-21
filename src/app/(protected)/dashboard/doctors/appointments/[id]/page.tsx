"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ChevronLeft,
  CalendarClock,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Patient = {
  id: number;
  name: string;
  email: string;
  profilePic?: string;
  patient?: {
    dateOfBirth?: string;
    gender?: string;
    bloodType?: string;
    allergies?: string;
    medicalHistory?: string;
  };
};

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
  patient: Patient;
  createdAt: string;
};

export default function AppointmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const appointmentId = use(params).id; // Use React.use to unwrap params
  
  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/appointments/${appointmentId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch appointment details");
        }

        const data = await response.json();
        setAppointment(data);
        setNotes(data.notes || "");
      } catch (error) {
        console.error("Error fetching appointment details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId]);
  
  // Update appointment status
  const updateAppointmentStatus = async (status: string) => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update appointment");
      }

      const updatedAppointment = await response.json();
      setAppointment(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert(
        `Error: ${
          error instanceof Error
            ? error.message
            : "Failed to update appointment"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Save notes
  const saveNotes = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save notes");
      }

      const updatedAppointment = await response.json();
      setAppointment(updatedAppointment);
      alert("Catatan berhasil disimpan");
    } catch (error) {
      console.error("Error saving notes:", error);
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Failed to save notes"
        }`
      );
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Memuat detail janji temu...</span>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center p-8 bg-muted rounded-lg mt-8">
        <p className="text-muted-foreground">
          Janji temu tidak ditemukan atau Anda tidak memiliki akses
        </p>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.push("/dashboard/doctors/appointments")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Kembali ke Daftar Janji Temu
        </Button>
      </div>
    );
  }

  // Calculate appointment duration in minutes
  const startTime = new Date(appointment.startTime);
  const endTime = new Date(appointment.endTime);
  const durationMinutes = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => router.push("/dashboard/doctors/appointments")}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Kembali ke Daftar Janji Temu
      </Button>

      {/* Appointment header card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Janji Temu #{appointment.id}
              </h2>
              <div className="flex items-center mt-2 space-x-2">
                <Badge
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
                <Badge
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
            <div className="mt-4 md:mt-0">
              <Button className="bg-primary hover:bg-primary/90">
                <CalendarClock className="mr-2 h-4 w-4" /> Buat Resep
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - appointment details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic details card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Detail Janji Temu</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tanggal & Waktu
                  </p>
                  <p className="text-sm mt-1">
                    {" "}
                    {format(new Date(appointment.date), "EEEE, dd MMMM yyyy", {
                      locale: idLocale,
                    })}{" "}
                    • {format(new Date(appointment.startTime), "HH:mm")} -
                    {format(new Date(appointment.endTime), "HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Durasi
                  </p>
                  <p className="text-sm mt-1">{durationMinutes} menit</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tipe Konsultasi
                  </p>
                  <p className="text-sm mt-1">
                    <Badge
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
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <p className="text-sm mt-1">
                    <Badge
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
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Alasan Kunjungan
                  </p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {appointment.reason}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Catatan Pasien
                  </p>
                  <p className="text-sm mt-1 whitespace-pre-wrap">
                    {appointment.notes || "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient information card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Informasi Pasien</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-start">
                <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                  <AvatarImage
                    src={appointment.patient.profilePic}
                    alt={appointment.patient.name}
                  />
                  <AvatarFallback className="text-lg">
                    {appointment.patient.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <h4 className="text-lg font-bold">
                    {appointment.patient.name}
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    ID Pasien: P{appointment.patientId}
                  </div>
                  {appointment.patient.patient && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {appointment.patient.patient.gender && (
                        <Badge variant="outline" className="bg-gray-100">
                          {appointment.patient.patient.gender}
                        </Badge>
                      )}
                      {appointment.patient.patient.dateOfBirth && (
                        <Badge variant="outline" className="bg-gray-100">
                          {format(
                            new Date(appointment.patient.patient.dateOfBirth),
                            "dd MMM yyyy",
                            { locale: idLocale }
                          )}
                        </Badge>
                      )}
                      {appointment.patient.patient.bloodType && (
                        <Badge variant="outline" className="bg-gray-100">
                          Golongan Darah:{" "}
                          {appointment.patient.patient.bloodType}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Informasi Kontak
                  </p>
                  <div className="mt-1">
                    <div className="flex items-center text-sm">
                      <span>{appointment.patient.email}</span>
                    </div>
                  </div>
                </div>

                {appointment.patient.patient && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Informasi Medis
                    </p>
                    <div className="mt-1 grid grid-cols-2 gap-4">
                      {appointment.patient.patient.allergies && (
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Alergi
                          </div>
                          <div className="text-sm font-medium mt-1">
                            {appointment.patient.patient.allergies}
                          </div>
                        </div>
                      )}
                      {appointment.patient.patient.medicalHistory && (
                        <div>
                          <div className="text-xs text-muted-foreground">
                            Riwayat Medis
                          </div>
                          <div className="text-sm font-medium mt-1">
                            {appointment.patient.patient.medicalHistory}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                className="mt-6"
                onClick={() =>
                  router.push(
                    `/dashboard/doctors/patients/${appointment.patientId}`
                  )
                }
              >
                Lihat Profil Lengkap Pasien
              </Button>
            </CardContent>
          </Card>

          {/* Doctor notes section */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Catatan Dokter</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {" "}
              <textarea
                id="notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(e.target.value)
                }
                placeholder="Tambahkan catatan medis, diagnosa, atau instruksi untuk pasien"
                className="h-32 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button className="mt-4" onClick={saveNotes} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Simpan Catatan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Actions card */}
          <Card>
            <CardHeader>
              <CardTitle>Aksi Janji Temu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {appointment.status === "PENDING" && (
                  <>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center p-3 h-auto"
                      onClick={() => updateAppointmentStatus("CONFIRMED")}
                      disabled={isSaving}
                    >
                      <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium">Konfirmasi</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center p-3 h-auto"
                      onClick={() => updateAppointmentStatus("RESCHEDULED")}
                      disabled={isSaving}
                    >
                      <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2">
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium">Jadwal Ulang</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center justify-center p-3 h-auto"
                      onClick={() => updateAppointmentStatus("CANCELLED")}
                      disabled={isSaving}
                    >
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-2">
                        <XCircle className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium">Tolak</span>
                    </Button>
                  </>
                )}

                {appointment.status === "CONFIRMED" && (
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center p-3 h-auto col-span-2"
                    onClick={() => updateAppointmentStatus("COMPLETED")}
                    disabled={isSaving}
                  >
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">
                      Selesaikan Janji Temu
                    </span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Appointment history/timeline card */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Janji Temu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative pl-4">
                <div className="relative pl-4">
                  <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-primary">
                      {appointment.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(appointment.createdAt),
                        "dd MMM, HH:mm",
                        { locale: idLocale }
                      )}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    Janji temu{" "}
                    {appointment.status === "PENDING"
                      ? "menunggu konfirmasi"
                      : appointment.status === "CONFIRMED"
                      ? "telah dikonfirmasi"
                      : appointment.status === "COMPLETED"
                      ? "telah selesai"
                      : appointment.status === "CANCELLED"
                      ? "telah dibatalkan"
                      : "dijadwalkan ulang"}
                  </div>
                </div>

                <div className="relative pl-4">
                  <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-gray-400"></div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Janji Temu Dibuat
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(
                        new Date(appointment.createdAt),
                        "dd MMM, HH:mm",
                        { locale: idLocale }
                      )}
                    </span>
                  </div>
                  <div className="mt-1 text-sm">
                    Janji temu dibuat oleh pasien
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
