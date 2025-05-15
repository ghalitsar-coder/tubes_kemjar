"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Doctor {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  specialization: string;
  bio: string | null;
  consultationFee: string | null;
}

interface Schedule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export default function BookAppointment() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<{ start: string; end: string }[]>([]);
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [appointmentType, setAppointmentType] = useState<string>("IN_PERSON");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }
    
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors");
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctors();
  }, [user, isLoaded, router]);
  
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableTimes();
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDoctor, selectedDate]);
  
  const fetchAvailableTimes = async () => {
    try {
      const date = new Date(selectedDate);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Format date for API
      const formattedDate = date.toISOString().split("T")[0];
      
      const response = await fetch(
        `/api/doctors/${selectedDoctor}/availability?date=${formattedDate}&dayOfWeek=${dayOfWeek}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch available times");
      
      const data = await response.json();
      setAvailableTimes(data.availableTimes);
    } catch (err) {
      console.error("Error fetching available times:", err);
      setError("Failed to load available time slots. Please try again later.");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || !selectedDate || !selectedStartTime || !selectedEndTime || !reason) {
      setError("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const appointmentData = {
        doctorId: selectedDoctor,
        date: selectedDate,
        startTime: `${selectedDate}T${selectedStartTime}:00`,
        endTime: `${selectedDate}T${selectedEndTime}:00`,
        reason,
        type: appointmentType,
      };
      
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to book appointment");
      }
      
      router.push("/appointments");
    } catch (err: any) {
      console.error("Error booking appointment:", err);
      setError(err.message || "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get today's date in YYYY-MM-DD format for min date in date picker
  const today = new Date().toISOString().split("T")[0];
  
  // Calculate max date (3 months from today)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateString = maxDate.toISOString().split("T")[0];
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="doctor" className="block text-gray-700 font-medium mb-2">
              Select Doctor
            </label>
            <select
              id="doctor"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedDoctor || ""}
              onChange={(e) => setSelectedDoctor(Number(e.target.value))}
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.user.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
          
          {selectedDoctor && (
            <>
              <div className="mb-4">
                <label htmlFor="date" className="block text-gray-700 font-medium mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  max={maxDateString}
                  required
                />
              </div>
              
              {selectedDate && availableTimes.length > 0 && (
                <>
                  <div className="mb-4">
                    <label htmlFor="startTime" className="block text-gray-700 font-medium mb-2">
                      Select Start Time
                    </label>
                    <select
                      id="startTime"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={selectedStartTime}
                      onChange={(e) => {
                        setSelectedStartTime(e.target.value);
                        setSelectedEndTime("");
                      }}
                      required
                    >
                      <option value="">Select start time</option>
                      {availableTimes.map((slot, index) => (
                        <option key={`start-${index}`} value={slot.start.split("T")[1].substring(0, 5)}>
                          {new Date(`2023-01-01T${slot.start.split("T")[1]}`).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedStartTime && (
                    <div className="mb-4">
                      <label htmlFor="endTime" className="block text-gray-700 font-medium mb-2">
                        Select End Time
                      </label>
                      <select
                        id="endTime"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedEndTime}
                        onChange={(e) => setSelectedEndTime(e.target.value)}
                        required
                      >
                        <option value="">Select end time</option>
                        {availableTimes
                          .filter((slot) => {
                            const startTimeMinutes = 
                              parseInt(selectedStartTime.split(":")[0]) * 60 + 
                              parseInt(selectedStartTime.split(":")[1]);
                            const slotEndTimeMinutes = 
                              parseInt(slot.end.split("T")[1].substring(0, 2)) * 60 + 
                              parseInt(slot.end.split("T")[1].substring(3, 5));
                            return slotEndTimeMinutes > startTimeMinutes;
                          })
                          .map((slot, index) => (
                            <option key={`end-${index}`} value={slot.end.split("T")[1].substring(0, 5)}>
                              {new Date(`2023-01-01T${slot.end.split("T")[1]}`).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              
              {selectedDate && availableTimes.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-100 text-yellow-700 rounded-md">
                  No available time slots for this date. Please select a different date.
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="reason" className="block text-gray-700 font-medium mb-2">
                  Reason for Visit
                </label>
                <textarea
                  id="reason"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Please briefly describe your symptoms or reason for the appointment"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
                  Appointment Type
                </label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={appointmentType}
                  onChange={(e) => setAppointmentType(e.target.value)}
                  required
                >
                  <option value="IN_PERSON">In Person</option>
                  <option value="VIDEO_CALL">Video Call</option>
                  <option value="PHONE_CALL">Phone Call</option>
                </select>
              </div>
            </>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={isSubmitting || !selectedDoctor || !selectedDate || !selectedStartTime || !selectedEndTime || !reason}
            >
              {isSubmitting ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}