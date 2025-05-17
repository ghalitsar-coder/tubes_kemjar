// components/TestimonialsSection.tsx
import Image from "next/image";
import React from "react";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      name: "Lisa Thompson",
      role: "Cardiac Patient",
      image: "https://randomuser.me/api/portraits/women/32.jpg",
      quote:
        '"The care I received at VitaCare was exceptional. Dr. Johnson took the time to explain everything and made me feel comfortable throughout my treatment."',
      rating: 5,
    },
    {
      name: "Robert Garcia",
      role: "Orthopedic Patient",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      quote:
        '"After my knee surgery with Dr. Wilson, I was back to playing tennis in just 3 months. The physical therapy team was amazing too!"',
      rating: 5,
    },
    {
      name: "Jennifer Park",
      role: "Parent",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
      quote:
        '"Dr. Rodriguez has been our pediatrician for both our children. She\'s patient, knowledgeable, and truly cares about her young patients."',
      rating: 4.5,
    },
  ];

  const renderStars = (rating: number): JSX.Element => {
    const fullStars = Math.floor(rating);
    const half = rating % 1 !== 0;
    return (
      <div className="flex text-secondary text-2xl mb-4">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={i} />
        ))}
        {half && <FaStarHalfAlt />}
      </div>
    );
  };

  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Patient <span className="text-primary">Testimonials</span>
          </h2>
          <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear what our patients have to say about their experiences at
            VitaCare Health.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="testimonial-card bg-white p-8 rounded-lg shadow-md transition transform hover:scale-105"
            >
              {renderStars(t.rating)}
              <p className="text-gray-600 italic mb-6">{t.quote}</p>
              <div className="flex items-center">
                <Image
                  width={50}
                  height={50}
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{t.name}</h4>
                  <p className="text-gray-500 text-sm">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
