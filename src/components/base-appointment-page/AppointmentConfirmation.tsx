"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";

interface Doctor {
  id: number;
  user: {
    id: number;
    name: string;
    profilePic?: string | null;
  };
  specialization: string;
  consultationFee: string | null;
}

interface AppointmentConfirmationProps {
  doctor: Doctor;
  date: string;
  startTime: string;
  endTime: string;
  onBack: () => void;
}

export default function AppointmentConfirmation({
  doctor,
  date,
  startTime,
  endTime,
  onBack,
}: AppointmentConfirmationProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [appointmentType, setAppointmentType] = useState<
    "IN_PERSON" | "VIDEO_CALL" | "PHONE_CALL"
  >("IN_PERSON");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date for display
  const formattedDate = format(parseISO(date), "EEEE, MMMM d, yyyy");

  // Format times for display
  const displayStartTime = format(
    parseISO(`2023-01-01T${startTime}`),
    "h:mm a"
  );
  const displayEndTime = format(parseISO(`2023-01-01T${endTime}`), "h:mm a");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError("Please provide a reason for your visit");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const appointmentData = {
        doctorId: doctor.id,
        date,
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`,
        reason,
        notes: notes.trim() || null,
        type: appointmentType,
      };

      console.log("Submitting appointment data:", appointmentData);

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to book appointment");
      }

      console.log("Appointment created:", responseData);

      // Navigate to appointments page on success
      router.push("/appointments?success=true");
    } catch (error) {
      console.error("Error booking appointment:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to book appointment. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Confirm Your Appointment</h2>
        <button
          onClick={onBack}
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Date & Time
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-indigo-50 p-5 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-4 flex-shrink-0">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div className="mt-2 md:mt-0">
            <h3 className="font-bold text-lg">Dr. {doctor.user.name}</h3>
            <p className="text-gray-600">{doctor.specialization}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-2">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-indigo-600 mr-2"
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
            <span className="text-gray-800">{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-indigo-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-gray-800">
              {displayStartTime} - {displayEndTime}
            </span>
          </div>
        </div>

        {doctor.consultationFee && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <p className="font-medium flex justify-between">
              <span>Consultation Fee:</span>
              <span className="text-indigo-700">${doctor.consultationFee}</span>
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="reason"
            className="block text-gray-700 font-medium mb-2"
          >
            Reason for Visit <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            placeholder="Please describe your symptoms or reason for the appointment"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="notes"
            className="block text-gray-700 font-medium mb-2"
          >
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information the doctor should know"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="appointmentType"
            className="block text-gray-700 font-medium mb-2"
          >
            Appointment Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label
              className={`
              flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all
              ${
                appointmentType === "IN_PERSON"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "hover:bg-gray-50"
              }
            `}
            >
              <input
                type="radio"
                name="appointmentType"
                value="IN_PERSON"
                checked={appointmentType === "IN_PERSON"}
                onChange={() => setAppointmentType("IN_PERSON")}
                className="sr-only"
              />
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>In Person</span>
            </label>

            <label
              className={`
              flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all
              ${
                appointmentType === "VIDEO_CALL"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "hover:bg-gray-50"
              }
            `}
            >
              <input
                type="radio"
                name="appointmentType"
                value="VIDEO_CALL"
                checked={appointmentType === "VIDEO_CALL"}
                onChange={() => setAppointmentType("VIDEO_CALL")}
                className="sr-only"
              />
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Video Call</span>
            </label>

            <label
              className={`
              flex items-center justify-center p-3 border rounded-md cursor-pointer transition-all
              ${
                appointmentType === "PHONE_CALL"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "hover:bg-gray-50"
              }
            `}
            >
              <input
                type="radio"
                name="appointmentType"
                value="PHONE_CALL"
                checked={appointmentType === "PHONE_CALL"}
                onChange={() => setAppointmentType("PHONE_CALL")}
                className="sr-only"
              />
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>Phone Call</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
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
                Processing...
              </>
            ) : (
              "Confirm Appointment"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
