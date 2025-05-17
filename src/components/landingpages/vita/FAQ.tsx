"use client";
// components/FAQSection.tsx
import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'What insurance plans do you accept?',
      answer: 'We accept most major insurance plans including Medicare, Blue Cross Blue Shield, Aetna, Cigna, and UnitedHealthcare.'
    },
    {
      question: 'How do I request a prescription refill?',
      answer: 'Prescription refills can be requested through our patient portal, or by calling our office during business hours.'
    },
    {
      question: 'What should I bring to my first appointment?',
      answer: 'Bring your insurance card, photo ID, list of medications, medical records, and any questions you have for the doctor.'
    },
    {
      question: 'Do you offer telemedicine appointments?',
      answer: 'Yes, we offer virtual visits for many types of appointments. These can be scheduled through our patient portal.'
    },
    {
      question: 'What are your office hours?',
      answer: 'Monday through Friday from 8:00 AM to 5:00 PM. Extended hours on Tuesdays and Thursdays until 7:00 PM.'
    }
  ];

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Frequently Asked <span className="text-primary">Questions</span></h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
          <p className="text-gray-600">Find answers to common questions about our services, insurance, and patient care.</p>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="mb-4 border-b border-gray-200 pb-4">
            <button
              className="w-full flex justify-between items-center text-left font-semibold text-lg text-gray-800 hover:text-primary transition duration-300"
              onClick={() => toggle(i)}
            >
              <span>{faq.question}</span>
              {openIndex === i ? <FaMinus className="text-primary" /> : <FaPlus className="text-primary" />}
            </button>
            {openIndex === i && (
              <div className="mt-3 text-gray-600">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
