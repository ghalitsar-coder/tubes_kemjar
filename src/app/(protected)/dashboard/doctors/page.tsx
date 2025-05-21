"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock, Users, AlertCircle } from "lucide-react";

type Appointment = {
  id: number;
  patientId: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  date: string;
  startTime: string;
  endTime: string;
  patient: {
    name: string;
  };
};

export default function DoctorDashboard() {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        
        // Filter pending appointments
        const pending = data.filter((app: Appointment) => app.status === "PENDING");
        setPendingAppointments(pending);
        
        // Filter today's appointments
        const today = new Date();
        const todaysApps = data.filter((app: Appointment) => {
          const appDate = new Date(app.date);
          return (
            appDate.getDate() === today.getDate() &&
            appDate.getMonth() === today.getMonth() &&
            appDate.getFullYear() === today.getFullYear() &&
            app.status === "CONFIRMED"
          );
        });
        setTodayAppointments(todaysApps);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Dokter</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Pending Appointments Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Janji Temu Menunggu Konfirmasi</CardTitle>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {pendingAppointments.length}
              </Badge>
            </div>
            <CardDescription>
              Janji temu yang memerlukan konfirmasi dari Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : pendingAppointments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <AlertCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                <p>Tidak ada janji temu yang menunggu konfirmasi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAppointments.slice(0, 5).map((app) => (
                  <div key={app.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{app.patient.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>{format(new Date(app.date), "EEE, dd MMM yyyy", { locale: id })}</span>
                          <span className="mx-1">•</span>
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {format(new Date(app.startTime), "HH:mm")} - {format(new Date(app.endTime), "HH:mm")}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/doctors/appointments/${app.id}`)}
                      >
                        Tinjau
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingAppointments.length > 5 && (
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => router.push("/doctors/appointments?tab=pending")}
                  >
                    Lihat Semua ({pendingAppointments.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Appointments Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Janji Temu Hari Ini</CardTitle>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {todayAppointments.length}
              </Badge>
            </div>
            <CardDescription>
              Jadwal konsultasi Anda hari ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                <p>Tidak ada janji temu terjadwal hari ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((app) => (
                  <div key={app.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{app.patient.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {format(new Date(app.startTime), "HH:mm")} - {format(new Date(app.endTime), "HH:mm")}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/doctors/appointments/${app.id}`)}
                      >
                        Detail
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => router.push("/doctors/appointments?tab=confirmed")}
                >
                  Lihat Semua Janji Temu
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pasien</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : pendingAppointments.length + todayAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total pasien yang terdaftar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Konfirmasi</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : pendingAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Janji temu yang memerlukan tindakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jadwal Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : todayAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Konsultasi hari ini
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
