import Image from "next/image";
import React from "react";

const testimonials = [
  {
    name: "Jennifer Lopez",
    img: "https://randomuser.me/api/portraits/women/33.jpg",
    text: "I was able to consult with a specialist doctor within minutes from my home. The prescription was sent directly to the pharmacy and my medicines were delivered the same day. Amazing service!",
  },
  {
    name: "David Miller",
    img: "https://randomuser.me/api/portraits/men/45.jpg",
    text: "The lab test service is a game changer. I booked a test in the app, the technician came to my home for sample collection, and I got my report online within 24 hours. No more waiting in hospital queues!",
  },
  {
    name: "Sophia Williams",
    img: "https://randomuser.me/api/portraits/women/68.jpg",
    text: "As a working mother, it's hard to take time off for doctor visits. MediCare's video consultation saved me so much time and stress. The doctor was very patient and thorough in her diagnosis.",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Patients Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <Image
                  src={t.img}
                  alt={t.name}
                  className="w-12 h-12 rounded-full"
                     width={50}
              height={50}
                />
                <div className="ml-4">
                  <h4 className="font-bold">{t.name}</h4>
                  <div className="flex items-center">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <i key={i} className="fas fa-star text-yellow-400" />
                      ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">"{t.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
