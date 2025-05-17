"use client";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Navbar: React.FC = () => {
  const pathname = usePathname();

  const isExactAuthPath = ["/sign-up", "/sign-in"].includes(pathname);

  return (
    <div className="flex items-center space-x-4">
      {!isExactAuthPath && (
        <>
          <SignedOut>
            <button className="hidden md:block px-4 py-2 text-blue-600 font-medium rounded-full border border-blue-600 hover:bg-blue-50 transition">
              <Link href={"/sign-in"}>Login</Link>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition">
              <Link href="/sign-up">Sign Up</Link>
            </button>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </>
      )}

      <button className="md:hidden text-gray-600">
        <i className="fas fa-bars text-2xl" />
      </button>
    </div>
  );
};

export default Navbar;
