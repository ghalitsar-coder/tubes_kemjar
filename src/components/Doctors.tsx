import Image from "next/image";
import React from "react";

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    rating: "4.9 (1.2K reviews)",
    location: "New York, USA",
    img: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    rating: "4.8 (980 reviews)",
    location: "Boston, USA",
    img: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Dr. Emily Wilson",
    specialty: "Pediatrician",
    rating: "4.9 (1.5K reviews)",
    location: "Chicago, USA",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Dr. Robert Davis",
    specialty: "Dermatologist",
    rating: "4.7 (850 reviews)",
    location: "Los Angeles, USA",
    img: "https://randomuser.me/api/portraits/men/75.jpg",
  },
];

const Doctors: React.FC = () => {
  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Top Doctors
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.name}
              className="bg-white rounded-lg overflow-hidden shadow-md doctor-card transition duration-300"
            >
              <Image
                src={doc.img}
                alt={doc.name}
                className="w-full h-48 object-cover"
                width={192}
                height={192}
              />
              <div className="p-4">
                <h3 className="font-bold text-xl">{doc.name}</h3>
                <p className="text-blue-600 mb-2">{doc.specialty}</p>
                <div className="flex items-center mb-2">
                  <i className="fas fa-star text-yellow-400" />
                  <span className="ml-2">{doc.rating}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-map-marker-alt mr-2" />
                  <span>{doc.location}</span>
                </div>
                <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-full hover:bg-blue-50 transition">
            View All Doctors
          </button>
        </div>
      </div>
    </section>
  );
};

export default Doctors;
