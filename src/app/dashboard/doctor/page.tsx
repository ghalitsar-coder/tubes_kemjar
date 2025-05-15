"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface Appointment {
  id: number;
  patient: {
    id: number;
    name: string;
    email: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  notes: string | null;
  type: string;
}

export default function DoctorDashboard() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/appointments?status=${statusFilter}`);
        
        if (!response.ok) throw new Error("Failed to fetch appointments");
        
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user, statusFilter]);

  const updateAppointmentStatus = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error("Failed to update appointment");
      
      // Refresh appointments after update
      const updatedAppointmentResponse = await fetch(`/api/appointments?status=${statusFilter}`);
      const updatedAppointments = await updatedAppointmentResponse.json();
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>
      
      {user && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Welcome, Dr. {user.firstName} {user.lastName}</h2>
          <p className="text-gray-600">Manage your appointments and patient consultations</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Appointments</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setStatusFilter("PENDING")}
              className={`px-3 py-1 rounded ${statusFilter === "PENDING" ? 
                'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`px-3 py-1 rounded ${statusFilter === "CONFIRMED" ? 
                'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Confirmed
            </button>
            <button 
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1 rounded ${statusFilter === "COMPLETED" ? 
                'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Completed
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-4">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No {statusFilter.toLowerCase()} appointments found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{appointment.patient.name}</div>
                      <div className="text-sm text-gray-500">{appointment.patient.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(appointment.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {appointment.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {statusFilter === "PENDING" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, "CONFIRMED")}
                            className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, "CANCELLED")}
                            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      
                      {statusFilter === "CONFIRMED" && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, "COMPLETED")}
                          className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                        >
                          Mark Complete
                        </button>
                      )}
                      
                      <Link
                        href={`/dashboard/doctor/appointments/${appointment.id}`}
                        className="text-indigo-600 hover:text-indigo-900 ml-2"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}