import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="text-blue-400">
                <i className="fas fa-heartbeat text-3xl" />
              </div>
              <a href="#" className="ml-2 text-2xl font-bold text-white">MediCare</a>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted digital healthcare partner providing quality medical services anytime, anywhere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook-f" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-instagram" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-linkedin-in" /></a>
            </div>
          </div>

          {[
            {
              title: 'Services',
              links: ['Doctor Consultation', 'Medicine Delivery', 'Lab Tests', 'Hospital Booking', 'Health Records'],
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Blog', 'Press', 'Contact Us'],
            },
            {
              title: 'Support',
              links: ['Help Center', 'Privacy Policy', 'Terms of Service', 'Refund Policy', 'FAQs'],
            },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-bold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">© 2023 MediCare. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white">Cookies Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
