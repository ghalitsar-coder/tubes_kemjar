"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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

interface DoctorSelectionProps {
  onSelectDoctor: (doctor: Doctor) => void;
  selectedSpecialty?: string;
}

export default function DoctorSelection({
  onSelectDoctor,
  selectedSpecialty,
}: DoctorSelectionProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<
    { id: number; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState<string | undefined>(
    selectedSpecialty
  );
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/doctors?include=user,specialties");

        if (!response.ok) {
          throw new Error("Failed to fetch doctors");
        }        const data = await response.json();
        if (data.success && data.doctors) {
          setDoctors(data.doctors);
          setFilteredDoctors(data.doctors);
        } else {
          throw new Error(data.error || "Failed to fetch doctors");
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to load doctors. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSpecialties = async () => {
      try {
        const response = await fetch("/api/specialties");

        if (!response.ok) {
          throw new Error("Failed to fetch specialties");
        }        const data = await response.json();
        if (data.success && data.specialties) {
          setSpecialties(data.specialties);
        } else {
          throw new Error(data.error || "Failed to fetch specialties");
        }
      } catch (err) {
        console.error("Error fetching specialties:", err);
      }
    };

    fetchDoctors();
    fetchSpecialties();
  }, []);

  useEffect(() => {
    // Filter doctors based on search query and active specialty
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter(
        (doctor) =>
          doctor?.user?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          doctor.specialization
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    if (activeSpecialty) {
      filtered = filtered.filter(
        (doctor) =>
          doctor.specialization === activeSpecialty ||
          doctor.specialties?.some((s) => s.specialty.name === activeSpecialty)
      );
    }

    setFilteredDoctors(filtered);
  }, [searchQuery, activeSpecialty, doctors]);

  const handleSpecialtyClick = (specialty: string) => {
    setActiveSpecialty((prev) => (prev === specialty ? undefined : specialty));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6">Select a Doctor</h2>

      {/* Search and filter */}
      <div className="mb-6">
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search doctors by name or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Specialties filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {specialties.map((specialty) => (
            <button
              key={specialty.id}
              onClick={() => handleSpecialtyClick(specialty.name)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                activeSpecialty === specialty.name
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
            >
              {specialty.name}
            </button>
          ))}
        </div>
      </div>

      {/* Doctors list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="doctor-card border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => onSelectDoctor(doctor)}
            >
              <div className="flex items-center justify-center bg-indigo-50 h-40 relative">
                {doctor?.user?.profilePic ? (
                  <Image
                    src={doctor?.user?.profilePic}
                    alt={doctor?.user?.name}
                    width={120}
                    height={120}
                    className="h-32 w-32 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-indigo-200 flex items-center justify-center border-4 border-white">
                    <span className="text-4xl font-bold text-indigo-600">
                      {doctor?.user?.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">
                  {!doctor?.user?.name.includes("Dr.") && "Dr."}{" "}
                  {doctor?.user?.name}
                </h3>
                <p className="text-indigo-600 font-medium">
                  {doctor.specialization}
                </p>

                <div className="mt-2 text-sm text-gray-600">
                  {doctor.experience && (
                    <p className="mb-1">
                      <span className="font-medium">Experiences:</span>{" "}
                      {doctor.experience} years
                    </p>
                  )}
                  {doctor.education && (
                    <p className="mb-1">
                      <span className="font-medium">Education:</span>{" "}
                      {doctor.education}
                    </p>
                  )}
                  {doctor.consultationFee && (
                    <p className="mt-2 font-medium text-green-600">
                      Fee: ${doctor.consultationFee}
                    </p>
                  )}
                </div>

                <button className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  Select & Continue
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No doctors found matching your criteria. Please try another search.
          </div>
        )}
      </div>
    </div>
  );
}
