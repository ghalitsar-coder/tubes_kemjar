import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function SignOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <h1 className="text-xl font-bold mb-4 text-center">
          Keluar dari Aplikasi
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Apakah Anda yakin ingin keluar dari aplikasi?
        </p>
        <div className="flex flex-col gap-3">
          <SignOutButton signOutCallback={() => redirect("/")}>
            <button className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded">
              Ya, Keluar
            </button>
          </SignOutButton>
          <button
            onClick={() => window.history.back()}
            className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
