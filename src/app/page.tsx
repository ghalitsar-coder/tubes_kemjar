// app/page.tsx atau pages/index.tsx (untuk router lama)
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Doctors from "@/components/Doctors";
import Testimonials from "@/components/Testimonials";
import DownloadApp from "@/components/DownloadApp";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>MediCare - Your Digital Healthcare Solution</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </Head>
      <main className="font-sans antialiased text-gray-800">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Doctors />
        <Testimonials />
        <DownloadApp />
        <Footer />
      </main>
    </>
  );
}
