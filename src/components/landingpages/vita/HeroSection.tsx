// components/HeroSection.tsx
import Link from "next/link";
import React from "react";

const HeroSection: React.FC = () => {
  return (
    <section
      id="home"
      className="hero-bg text-white py-20 md:py-64 bg-cover bg-center relative"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-2xl">
          <Link href="/appointments/book">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              appointments/book (Debug){" "}
              <span className="text-secondary">Top Priority</span>
            </h1>
          </Link>
          <p className="text-lg mb-8">
            We provide exceptional healthcare services with compassion and
            cutting-edge technology to ensure your well-being at every stage of
            life.
          </p>{" "}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/dashboard/admin">
              <button className="bg-primary hover:bg-green-700 text-white px-8 py-3 rounded-full font-medium transition duration-300">
                Admin Area (Debug)
              </button>
            </Link>
            <Link href="/dashboard/doctors">
              <button className="bg-secondary hover:bg-yellow-600 text-gray-800 px-8 py-3 rounded-full font-medium transition duration-300">
                Doctor Area (Debug)
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
