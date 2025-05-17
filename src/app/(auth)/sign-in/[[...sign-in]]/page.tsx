import Navbar from "@/components/Navbar";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

export default function SignInPage() {
  return (
    <>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-md rounded-lg",
              headerTitle: "text-2xl font-semibold text-center",
              headerSubtitle: "text-center",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/"
        />
    </>
  );
}
