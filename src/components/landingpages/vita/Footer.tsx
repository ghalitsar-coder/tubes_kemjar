// components/Footer.tsx
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaHeartbeat } from 'react-icons/fa';
import React from 'react';

const Footer: React.FC = () => {
  const quickLinks: string[] = ['Home', 'Services', 'Doctors', 'About Us', 'Contact', 'Patient Portal'];
  const services: string[] = ['Primary Care', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency Care'];
  const legalLinks: string[] = ['Privacy Policy', 'Terms of Service', 'Sitemap'];

  return (
    <footer id="contact" className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1 */}
          <div>
            <div className="flex items-center mb-6">
              <FaHeartbeat className="text-primary text-3xl mr-2" />
              <span className="text-2xl font-bold text-white">Vita<span className="text-secondary">Care</span></span>
            </div>
            <p className="text-gray-400 mb-6">Compassionate healthcare for you and your family. Our mission is to provide exceptional medical care with a personal touch.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition duration-300"><FaFacebookF /></a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300"><FaTwitter /></a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300"><FaInstagram /></a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-300"><FaLinkedinIn /></a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((text) => (
                <li key={text}>
                  <a href={`#${text.toLowerCase().replace(/ /g, '')}`} className="text-gray-400 hover:text-white transition duration-300">
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <a href="#" className="text-gray-400 hover:text-white transition duration-300">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h3 className="text-xl font-semibold mb-6">Contact Us</h3>
            <address className="not-italic text-gray-400 space-y-4">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-primary mt-1 mr-3" />
                <p>123 Health Street<br />Medical City, MC 12345</p>
              </div>
              <div className="flex items-center">
                <FaPhoneAlt className="text-primary mr-3" />
                <p>(123) 456-7890</p>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="text-primary mr-3" />
                <p>info@vitacare.com</p>
              </div>
              <div className="flex items-center">
                <FaClock className="text-primary mr-3" />
                <p>Mon-Fri: 8:00 AM - 5:00 PM</p>
              </div>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">© 2023 VitaCare Health. All rights reserved.</p>
            <div className="flex space-x-6">
              {legalLinks.map((item) => (
                <a key={item} href="#" className="text-gray-400 hover:text-white transition duration-300">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
