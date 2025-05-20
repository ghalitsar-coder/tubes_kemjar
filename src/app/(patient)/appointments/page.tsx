"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { useState, useEffect } from "react";

interface Appointment {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  type: string;
  reason: string;
  notes?: string;
  doctor: {
    user: {
      name: string;
    };
    specialization: string;
  };
}

// Loading placeholder component
function AppointmentsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <div className="bg-gray-200 h-10 w-40 rounded-md animate-pulse"></div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Content component that uses useSearchParams
function AppointmentsContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successVisible, setSuccessVisible] = useState(showSuccess);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    // Hide success message after 5 seconds
    if (showSuccess) {
      const timer = setTimeout(() => {
        setSuccessVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [user, isLoaded, router, showSuccess]);

  useEffect(() => {
    if (!user) return;

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/appointments");

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  const formatAppointmentDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const formatAppointmentTime = (timeString: string) => {
    return format(new Date(timeString), "h:mm a");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case "IN_PERSON":
        return "In Person";
      case "VIDEO_CALL":
        return "Video Call";
      case "PHONE_CALL":
        return "Phone Call";
      default:
        return type;
    }
  };

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Appointments</h1>
        <button
          onClick={() => router.push("/appointments/book")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Book New Appointment
        </button>
      </div>

      {/* Success notification */}
      {successVisible && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Appointment booked successfully! We`ve sent you an email with
                the details.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setSuccessVisible(false)}
                  className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-200 focus:outline-none focus:bg-green-200"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="p-6">
                <div className="md:flex md:justify-between md:items-center">
                  <div className="mb-4 md:mb-0">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                    <h2 className="text-xl font-semibold mt-2">
                      Dr. {appointment.doctor.user.name}
                    </h2>
                    <p className="text-indigo-600">
                      {appointment.doctor.specialization}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end">
                    <p className="text-gray-700 font-medium">
                      {formatAppointmentDate(appointment.date)}
                    </p>
                    <p className="text-gray-600">
                      {formatAppointmentTime(appointment.startTime)} -{" "}
                      {formatAppointmentTime(appointment.endTime)}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {getAppointmentTypeLabel(appointment.type)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700">
                    Reason for Visit
                  </h3>
                  <p className="mt-1 text-gray-600">{appointment.reason}</p>

                  {appointment.notes && (
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-gray-700">
                        Additional Notes
                      </h3>
                      <p className="mt-1 text-gray-600">{appointment.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  {appointment.status === "PENDING" && (
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Cancel Appointment
                    </button>
                  )}
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16 text-indigo-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No Appointments Yet
          </h2>
          <p className="text-gray-600 mb-6">
            You don`t have any appointments scheduled. Book your first
            appointment now.
          </p>
          <button
            onClick={() => router.push("/appointments/book")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
          >
            Book an Appointment
          </button>
        </div>      )}
    </div>
  );
}

// Main page component with Suspense boundary
export default function AppointmentsPage() {
  return (
    <Suspense fallback={<AppointmentsLoading />}>
      <AppointmentsContent />
    </Suspense>
  );
}
