"use client";
// components/AppointmentSection.tsx
import React, { useState, ChangeEvent, FormEvent } from "react";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

interface AppointmentFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  appointmentDate: string;
  department: string;
  message: string;
}

const AppointmentSection: React.FC = () => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    appointmentDate: "",
    department: "General Medicine",
    message: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission - can add API call here
    console.log("Form submitted:", formData);
    // Reset form or show success message
  };

  return (
    <section className="py-16 md:py-24 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
            <h2 className="text-4xl font-bold mb-6">
              Book an <span className="text-secondary">Appointment</span>
            </h2>
            <div className="w-20 h-1 bg-secondary mb-6"></div>
            <p className="text-lg mb-8">
              Schedule your visit with our specialists today. We&apos;re here to
              provide you with personalized healthcare when you need it most.
            </p>
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <FaPhoneAlt className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Emergency Contact</h3>
                  <p className="text-secondary font-medium">(123) 456-7890</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <FaEnvelope className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <p className="text-secondary font-medium">
                    info@vitacare.com
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Location</h3>
                  <p className="text-secondary font-medium">
                    123 Health Street, Medical City
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <form
              className="appointment-form bg-white rounded-lg shadow-lg p-8 text-gray-800"
              onSubmit={handleSubmit}
            >
              <h3 className="text-2xl font-bold mb-6 text-primary">
                Request Appointment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-100 focus:bg-white border-b-2 border-primary focus:border-secondary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-100 focus:bg-white border-b-2 border-primary focus:border-secondary outline-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-100 focus:bg-white border-b-2 border-primary focus:border-secondary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">
                    Appointment Date
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-100 focus:bg-white border-b-2 border-primary focus:border-secondary outline-none"
                    required
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Select Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-100 focus:bg-white border-b-2 border-primary focus:border-secondary outline-none"
                >
                  <option>General Medicine</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Orthopedics</option>
                  <option>Pediatrics</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Message</label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-100 focus:bg-white border-b-2 border-primary focus:border-secondary outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-secondary hover:bg-yellow-600 text-gray-800 font-bold py-3 px-4 rounded transition duration-300"
              >
                Book Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
