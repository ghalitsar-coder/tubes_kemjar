import Image from "next/image";
import React, { ReactNode } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaHandHoldingHeart,
  FaMedal,
} from "react-icons/fa";

interface Reason {
  icon: ReactNode;
  title: string;
  desc: string;
}

export const WhyChooseUs: React.FC = () => {
  const reasons: Reason[] = [
    {
      icon: <FaCheckCircle />,
      title: "Experienced Specialists",
      desc: "Our team consists of highly qualified doctors...",
    },
    {
      icon: <FaMedal />,
      title: "Quality Accreditation",
      desc: "We meet the highest standards of care...",
    },
    {
      icon: <FaClock />,
      title: "Minimal Wait Times",
      desc: "Spend less time waiting and more time healing.",
    },
    {
      icon: <FaHandHoldingHeart />,
      title: "Patient-Centered Care",
      desc: "We involve you in every treatment decision.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-12 lg:mb-0 lg:pr-12">
          {" "}
          <Image
            width={2070}
            height={400}
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=2070&q=80"
            alt="Doctor"
            className="rounded-lg shadow-lg w-full h-auto"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div className="lg:w-1/2">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Why Choose <span className="text-primary">VitaCare</span>
          </h2>
          <div className="w-20 h-1 bg-secondary mb-6"></div>
          <div className="space-y-6">
            {reasons.map((r, i) => (
              <div key={i} className="flex">
                <div className="w-12 h-12 bg-primary/10 bg-opacity-10 rounded-full flex items-center justify-center text-xl text-primary">
                  {r.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {r.title}
                  </h3>
                  <p className="text-gray-600">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
