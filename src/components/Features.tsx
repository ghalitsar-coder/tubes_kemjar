import React from 'react';

const Features: React.FC = () => {
  const features = [
    {
      icon: 'fas fa-user-md',
      color: 'text-blue-600',
      title: 'Doctor Consultation',
      description:
        'Consult with 20,000+ specialist doctors via video, voice or chat from the comfort of your home.',
    },
    {
      icon: 'fas fa-pills',
      color: 'text-green-500',
      title: 'Medicine Delivery',
      description: 'Order medicines and get them delivered to your doorstep within 24 hours.',
    },
    {
      icon: 'fas fa-flask',
      color: 'text-purple-600',
      title: 'Lab Tests',
      description: 'Book diagnostic tests with sample collection at home and get reports online.',
    },
    {
      icon: 'fas fa-hospital',
      color: 'text-red-500',
      title: 'Hospital Finder',
      description:
        'Find the best hospitals near you with verified patient reviews and ratings.',
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon, color, title, description }) => (
            <div
              key={title}
              className="bg-white rounded-xl p-6 shadow-md feature-card transition duration-300"
            >
              <div className={`${color} mb-4`}>
                <i className={`${icon} text-4xl`} />
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
