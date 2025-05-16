import Link from "next/link";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-blue-600">
            <i className="fas fa-heartbeat text-3xl" />
          </div>
          <span className="ml-2 text-2xl font-bold text-blue-600">
            MediCare
          </span>
        </div>        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
            Home
          </Link>
          <Link href="/doctors" className="text-gray-600 hover:text-blue-600 transition">
            Doctors
          </Link>
          <Link href="/medicines" className="text-gray-600 hover:text-blue-600 transition">
            Medicines
          </Link>
          
          <SignedIn>
            <Link href="/appointments" className="text-gray-600 hover:text-blue-600 transition">
              My Appointments
            </Link>
          </SignedIn>
          
          <Link href="/services" className="text-gray-600 hover:text-blue-600 transition">
            Services
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">
            About
          </Link>
        </div><div className="flex items-center space-x-4">
          <SignedOut>
            <button className="hidden md:block px-4 py-2 text-blue-600 font-medium rounded-full border border-blue-600 hover:bg-blue-50 transition">
              <Link href={"/sign-in"}>Login</Link>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition">
              <Link href="/sign-up">Sign Up</Link>
            </button>
          </SignedOut>
            <SignedIn>
            <Link 
              href="/dashboard" 
              className="hidden md:block px-4 py-2 text-blue-600 font-medium rounded-full border border-blue-600 hover:bg-blue-50 transition mr-2"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          
          <button className="md:hidden text-gray-600">
            <i className="fas fa-bars text-2xl" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
