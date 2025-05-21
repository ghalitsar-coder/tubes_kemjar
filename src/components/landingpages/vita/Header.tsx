// components/Header.tsx
"use client";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Moon, Sun } from "lucide-react";

import { FaHeart, FaBars, FaUserAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
// Removed invalid Router import
import { useRouter } from "next/navigation";
const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();

  const isExactAuthPath = ["/sign-up", "/sign-in"].includes(pathname);
  return (
    <header className="bg-sidebar shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <FaHeart className="text-primary text-3xl mr-2" />

          <span className="text-2xl font-bold text-primary">
            Vita<span className="text-secondary">Care</span>
          </span>
        </Link>

        <nav className="hidden md:flex space-x-8">
          {["home", "services", "doctors", "about", "contact"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="text-gray-800 hover:text-primary font-medium capitalize"
            >
              {id}
            </a>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {!isExactAuthPath && (
            <>
              <SignedOut>
                <button className="hidden md:block px-4 py-1.5 text-primary font-medium rounded-md border border-primary hover:bg-blue-50 transition">
                  <Link href={"/sign-in"}>Login</Link>
                </button>
                <button className="px-4 py-1.5 bg-primary text-white font-medium rounded-md hover:bg-primary hover:text-secondary transition">
                  <Link href="/sign-up">Sign Up</Link>
                </button>
              </SignedOut>
              <SignedIn>
                <UserButton afterSignOutUrl="/">
                  <UserButton.MenuItems>
                    <UserButton.Action
                      onClick={() => router.push("/profile/edit")}
                      labelIcon={<FaUserAlt />}
                      label="Profile"
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </SignedIn>
            </>
          )}

          <button className="md:hidden text-gray-600">
            <i className="fas fa-bars text-2xl" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button className="md:hidden text-gray-800 text-2xl">
          <FaBars />
        </button>
      </div>
    </header>
  );
};

export default Header;
