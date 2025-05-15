import Image from "next/image";
import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-blue-500 to-blue-800 text-white py-16 md:py-24">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Healthcare at your fingertips
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Consult with doctors, order medicines, book lab tests and manage
            your health records all in one place.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition flex items-center justify-center">
              <i className="fas fa-video mr-3" />
              Video Consultation
            </button>
            <button className="px-8 py-4 bg-blue-800 text-white font-bold rounded-lg hover:bg-blue-900 transition flex items-center justify-center">
              <i className="fas fa-search mr-3" />
              Find Doctors
            </button>
          </div>

          <div className="mt-8 flex items-center">
            <div className="flex -space-x-2">
              <Image
                src="https://randomuser.me/api/portraits/women/12.jpg"
                className="w-10 h-10 rounded-full border-2 border-white"
                alt="User 1"
                width={300}
                height={300}
              />
              <Image
                src="https://randomuser.me/api/portraits/men/32.jpg"
                className="w-10 h-10 rounded-full border-2 border-white"
                alt="User 2"
                width={300}
                height={300}
              />
              <Image
                src="https://randomuser.me/api/portraits/women/44.jpg"
                className="w-10 h-10 rounded-full border-2 border-white"
                alt="User 3"
                width={300}
                height={300}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm opacity-90">
                Trusted by <span className="font-bold">1M+</span> patients
              </p>
              <div className="flex items-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className="fas fa-star text-yellow-400" />
                ))}
                <span className="ml-2 text-sm">4.9 (25K reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <Image
            src="https://cdn-icons-png.flaticon.com/512/2965/2965300.png"
            alt="App Screenshot"
            className="app-screen w-64 md:w-80"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
