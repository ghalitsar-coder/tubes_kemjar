"use client";

import { SignOutButton } from "@clerk/nextjs";

export const SignOutButtonWithRedirect = () => {
  return (
    <SignOutButton redirectUrl="/">
      <button className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded">
        Ya, Keluar
      </button>
    </SignOutButton>
  );
};
