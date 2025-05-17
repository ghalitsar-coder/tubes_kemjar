import Image from "next/image";
import React from "react";
import { FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";

interface Doctor {
  name: string;
  specialty: string;
  image: string;
  desc: string;
}

export function DoctorsSection() {
  const doctors: Doctor[] = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      image:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=2070&q=80",
      desc: "With over 15 years of experience in cardiology, Dr. Johnson specializes in preventive heart care.",
    },
    {
      name: "Dr. Michael Chen",
      specialty: "Neurologist",
      image:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1964&q=80",
      desc: "Dr. Chen is a leading expert in neurological disorders with a focus on minimally invasive treatments.",
    },
    {
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrician",
      image:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=1974&q=80",
      desc: "Dr. Rodriguez provides compassionate care for children from birth through adolescence.",
    },
    {
      name: "Dr. James Wilson",
      specialty: "Orthopedic Surgeon",
      image:
        "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1974&q=80",
      desc: "Specializing in sports medicine, Dr. Wilson helps patients regain mobility and return to active lifestyles.",
    },
  ];

  return (
    <section id="doctors" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Meet Our <span className="text-primary">Specialists</span>
          </h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our team of dedicated healthcare professionals is committed to
            providing you with exceptional medical care.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {doctors.map((d, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl"
            >
              <Image
                src={d.image}
                alt={d.name}
                width={500}
                height={256}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{d.name}</h3>
                <p className="text-primary mb-3">{d.specialty}</p>
                <p className="text-gray-600 mb-4">{d.desc}</p>
                <div className="flex space-x-3">
                  <a href="#" className="text-primary hover:text-green-700">
                    <FaLinkedin />
                  </a>
                  <a href="#" className="text-primary hover:text-green-700">
                    <FaTwitter />
                  </a>
                  <a href="#" className="text-primary hover:text-green-700">
                    <FaEnvelope />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="bg-primary hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition duration-300">
            View All Doctors
          </button>
        </div>
      </div>
    </section>
  );
}
