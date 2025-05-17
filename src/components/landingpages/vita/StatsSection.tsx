import React from 'react';

interface StatItem {
  label: string;
  value: string;
}

export function StatsSection() {
  const stats: StatItem[] = [
    { label: 'Years Experience', value: '25+' },
    { label: 'Expert Doctors', value: '50+' },
    { label: 'Happy Patients', value: '10K+' },
    { label: 'Emergency Care', value: '24/7' },
  ];

  return (
    <section className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ label, value }) => (
            <div key={label} className="p-4">
              <div className="text-4xl font-bold text-primary mb-2">{value}</div>
              <div className="text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
