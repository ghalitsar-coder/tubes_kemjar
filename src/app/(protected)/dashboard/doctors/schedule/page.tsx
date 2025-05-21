"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CalendarDays, Clock, Users } from "lucide-react";

type Schedule = {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type Appointment = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  patient: {
    name: string;
  };
};

const DAYS_OF_WEEK = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export default function DoctorSchedulePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorSchedule = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/doctors/schedule");
        
        if (!response.ok) {
          throw new Error("Failed to fetch schedule");
        }
        
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error("Error fetching doctor schedule:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorSchedule();
  }, []);

  useEffect(() => {
    // Fetch appointments for selected date
    const fetchAppointmentsForDate = async () => {
      if (!date) return;
      
      try {
        setIsLoading(true);
        const formattedDate = format(date, "yyyy-MM-dd");
        const response = await fetch(`/api/appointments?role=doctor&startDate=${formattedDate}&endDate=${formattedDate}`);
        
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
    
    fetchAppointmentsForDate();
  }, [date]);

  // Format time strings from date objects
  const formatTime = (timeString: string) => {
    return format(new Date(timeString), "HH:mm");
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Jadwal Saya</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Kalender</CardTitle>
              <CardDescription>Pilih tanggal untuk melihat jadwal</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                locale={id}
              />
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Jadwal Praktik</CardTitle>
              <CardDescription>Jadwal tetap praktik Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : schedules.length === 0 ? (
                <p className="text-center py-3 text-muted-foreground">Belum ada jadwal tetap</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hari</TableHead>
                      <TableHead>Jam</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>{DAYS_OF_WEEK[schedule.dayOfWeek]}</TableCell>
                        <TableCell>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</TableCell>
                        <TableCell>
                          {schedule.isAvailable ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">Tersedia</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-100 text-red-800">Tidak Tersedia</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Edit Jadwal
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Jadwal {date ? format(date, "EEEE, dd MMMM yyyy", { locale: id }) : ""}
                  </CardTitle>
                  <CardDescription>
                    Daftar janji temu untuk tanggal yang dipilih
                  </CardDescription>
                </div>
                <Badge className="text-sm" variant="outline">
                  {appointments.length} Janji Temu
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-10 border rounded-lg bg-muted/10">
                  <CalendarDays className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-1">Tidak ada janji temu untuk tanggal ini</p>
                  <p className="text-xs text-muted-foreground">Pilih tanggal lain untuk melihat jadwal</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">{appointment.patient.name}</span>
                          </div>
                          <div className="flex items-center mt-2 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                            </span>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            appointment.status === "CONFIRMED" 
                              ? "bg-blue-100 text-blue-800" 
                              : appointment.status === "PENDING" 
                              ? "bg-yellow-100 text-yellow-800"
                              : appointment.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {appointment.status === "CONFIRMED" 
                            ? "Dikonfirmasi" 
                            : appointment.status === "PENDING" 
                            ? "Menunggu"
                            : appointment.status === "COMPLETED"
                            ? "Selesai"
                            : "Dibatalkan"}
                        </Badge>
                      </div>
                      <div className="flex justify-end mt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/doctors/appointments/${appointment.id}`}
                        >
                          Lihat Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
