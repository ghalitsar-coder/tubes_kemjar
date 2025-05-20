"use client";

import { useState } from "react";
import DoctorSelection from "./DoctorSelection";
import DateTimeSelection from "./DateTimeSelection";
import AppointmentConfirmation from "./AppointmentConfirmation";

interface Doctor {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    profilePic: string | null;
  };
  specialization: string;
  experience: number;
  education: string | null;
  bio: string | null;
  consultationFee: string | null;
  specialties: {
    specialty: {
      id: number;
      name: string;
      description: string | null;
    };
  }[];
}

enum BookingStep {
  SELECT_DOCTOR = 1,
  SELECT_DATE_TIME = 2,
  CONFIRM_DETAILS = 3,
}

export default function BookAppointmentPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(
    BookingStep.SELECT_DOCTOR
  );
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(BookingStep.SELECT_DATE_TIME);
  };

  const handleDateTimeSelect = (
    date: string,
    startTime: string,
    endTime: string
  ) => {
    setSelectedDate(date);
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setCurrentStep(BookingStep.CONFIRM_DETAILS);
  };

  const handleBackToDoctor = () => {
    setCurrentStep(BookingStep.SELECT_DOCTOR);
  };

  const handleBackToDateTime = () => {
    setCurrentStep(BookingStep.SELECT_DATE_TIME);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentStep >= BookingStep.SELECT_DOCTOR
                  ? "bg-indigo-600 text-white"
                  : "border-2 border-gray-300 text-gray-500"
              }`}
            >
              1
            </div>
            <span
              className={`text-sm mt-2 font-medium ${
                currentStep >= BookingStep.SELECT_DOCTOR
                  ? "text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Select Doctor
            </span>
          </div>

          <div
            className={`h-1 flex-1 mx-4 ${
              currentStep >= BookingStep.SELECT_DATE_TIME
                ? "bg-indigo-600"
                : "bg-gray-300"
            }`}
          />

          <div className="flex flex-col items-center">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentStep >= BookingStep.SELECT_DATE_TIME
                  ? "bg-indigo-600 text-white"
                  : "border-2 border-gray-300 text-gray-500"
              }`}
            >
              2
            </div>
            <span
              className={`text-sm mt-2 font-medium ${
                currentStep >= BookingStep.SELECT_DATE_TIME
                  ? "text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Select Date & Time
            </span>
          </div>

          <div
            className={`h-1 flex-1 mx-4 ${
              currentStep >= BookingStep.CONFIRM_DETAILS
                ? "bg-indigo-600"
                : "bg-gray-300"
            }`}
          />

          <div className="flex flex-col items-center">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                currentStep >= BookingStep.CONFIRM_DETAILS
                  ? "bg-indigo-600 text-white"
                  : "border-2 border-gray-300 text-gray-500"
              }`}
            >
              3
            </div>
            <span
              className={`text-sm mt-2 font-medium ${
                currentStep >= BookingStep.CONFIRM_DETAILS
                  ? "text-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Confirm Details
            </span>
          </div>
        </div>
      </div>

      {/* Booking Steps */}
      {currentStep === BookingStep.SELECT_DOCTOR && (
        <DoctorSelection onSelectDoctor={handleDoctorSelect} />
      )}

      {currentStep === BookingStep.SELECT_DATE_TIME && selectedDoctor && (
        <DateTimeSelection
          doctor={selectedDoctor}
          onSelectDateTime={handleDateTimeSelect}
          onBack={handleBackToDoctor}
        />
      )}

      {currentStep === BookingStep.CONFIRM_DETAILS && selectedDoctor && (
        <AppointmentConfirmation
          doctor={selectedDoctor}
          date={selectedDate}
          startTime={selectedStartTime}
          endTime={selectedEndTime}
          onBack={handleBackToDateTime}
        />
      )}
    </div>
  );
}
