import { SignIn } from "@clerk/nextjs";
import React from "react";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Login ke Akun Anda
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Atau{" "}
            <a href="/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
              daftar jika belum memiliki akun
            </a>
          </p>
        </div>
        <div className="mt-8">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-md rounded-lg",
                headerTitle: "text-2xl font-semibold text-center",
                headerSubtitle: "text-center",
              }
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            redirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}