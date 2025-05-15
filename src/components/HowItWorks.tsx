import Image from "next/image";
import React from "react";

const steps = [
  {
    title: "Select Service",
    description:
      "Choose between doctor consultation, medicine delivery, lab tests or hospital booking.",
  },
  {
    title: "Provide Details",
    description:
      "Enter your symptoms, preferred doctor type, or medicine/lab test details.",
  },
  {
    title: "Make Payment",
    description: "Securely pay online using various payment methods available.",
  },
  {
    title: "Get Service",
    description:
      "Receive consultation, medicines, or test results as per your selection.",
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <Image
              src="https://cdn-icons-png.flaticon.com/512/3652/3652191.png"
              alt="How it works"
              className="w-full max-w-md mx-auto"
            />
          </div>

          <div className="md:w-1/2 space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
