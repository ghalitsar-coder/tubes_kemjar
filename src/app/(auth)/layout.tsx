import Header from "@/components/landingpages/vita/Header";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className=" h-full flex-1 flex justify-center items-center ">{children}</div>
    </div>
  );
}
