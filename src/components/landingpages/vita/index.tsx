import React from "react";
import Header from "./Header";
import HeroSection from "./HeroSection";
import { StatsSection } from "./StatsSection";
import { ServicesSection } from "./ServicesSection";
import { WhyChooseUs } from "./WhyChooseUs";
import { DoctorsSection } from "./DoctorsSection";
import TestimonialsSection from "./Testimonials";
import AppointmentSection from "./Appointment";
import FAQSection from "./FAQ";
import NewsletterSection from "./NewsLetter";
import Footer from "./Footer";

const VitaCareHome: React.FC = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <WhyChooseUs />
      <DoctorsSection />
      <TestimonialsSection />
      <AppointmentSection />
      <FAQSection />
      <NewsletterSection />
      <Footer />
    </>
  );
};

export default VitaCareHome;
