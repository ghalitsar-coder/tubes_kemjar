import Navbar from "@/components/Navbar";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Simple header */}
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <SignUp
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-slate-500 hover:bg-slate-400 text-sm normal-case",
              socialButtonsIconButton: "hover:bg-slate-100",
              socialButtonsBlockButton: "hover:bg-slate-100",
              // Pastikan tombol login sosial terlihat dengan baik
              socialButtons: "flex flex-col gap-2",
              footerActionText: "text-slate-600",
              footerActionLink: "text-slate-800 hover:text-slate-900",
              card: "shadow-xl border border-slate-100",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          redirectUrl="/dashboard?sync=true"
        />
      </div>
    </div>
  );
}
