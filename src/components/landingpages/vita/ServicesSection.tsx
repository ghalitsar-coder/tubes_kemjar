import React, { ReactNode } from "react";
import {
  FaUserMd,
  FaHeartbeat,
  FaBone,
  FaBrain,
  FaBaby,
  FaFlask,
} from "react-icons/fa";

interface Service {
  icon: ReactNode;
  title: string;
  desc: string;
}

export function ServicesSection() {
  const services: Service[] = [
    {
      icon: <FaUserMd />,
      title: "General Medicine",
      desc: "Comprehensive primary care for all ages...",
    },
    {
      icon: <FaHeartbeat />,
      title: "Cardiology",
      desc: "Specialized care for heart conditions...",
    },
    {
      icon: <FaBone />,
      title: "Orthopedics",
      desc: "Expert care for musculoskeletal issues...",
    },
    {
      icon: <FaBrain />,
      title: "Neurology",
      desc: "Care for conditions affecting brain and nerves.",
    },
    {
      icon: <FaBaby />,
      title: "Pediatrics",
      desc: "Healthcare for infants and children.",
    },
    {
      icon: <FaFlask />,
      title: "Laboratory Services",
      desc: "State-of-the-art diagnostic testing.",
    },
  ];

  return (
    <section id="services" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our <span className="text-primary">Services</span>
          </h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We offer a range of medical services...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div
              key={i}
              className="service-card bg-white rounded-lg shadow-md p-6 transition duration-300 hover:-translate-y-2 hover:shadow-lg"
            >
              <div className="w-16 h-16 bg-primary/10 bg-opacity-10 rounded-full flex items-center justify-center mb-4 text-2xl text-primary">
                {s.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {s.title}
              </h3>
              <p className="text-gray-600 mb-4">{s.desc}</p>
              <a
                href="#"
                className="text-primary font-medium flex items-center"
              >
                Learn More <i className="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
