"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import BookAppointmentPage from "@/components/base-appointment-page/BookAppointmentPage";

export default function BookAppointment() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [hasPatientProfile, setHasPatientProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    const checkPatientProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/patient/profile");
        
        if (response.status === 404) {
          setHasPatientProfile(false);
          setError("Please complete your patient profile before booking an appointment.");
          return;
        }
        
        if (!response.ok) {
          throw new Error("Failed to check patient profile");
        }
        
        const data = await response.json();
        setHasPatientProfile(true);
      } catch (err) {
        console.error("Error checking patient profile:", err);
        setError("Failed to verify your patient profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkPatientProfile();
    }
  }, [user, isLoaded, router]);
  
  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  if (error && !hasPatientProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Patient Profile Required</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => router.push("/profile/edit")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              >
                Complete Your Profile
              </button>
              <button 
                onClick={() => router.push("/appointments")}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-md transition-colors"
              >
                View My Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return <BookAppointmentPage />;
}
