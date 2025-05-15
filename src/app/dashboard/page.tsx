"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const shouldSync = searchParams?.get("sync") === "true";
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  // Effect to sync the user if needed
  useEffect(() => {
    async function syncUserToDatabase() {
      if (isLoaded && isSignedIn && shouldSync) {
        setSyncing(true);
        setSyncStatus("Menyinkronkan data pengguna...");

        try {
          const response = await fetch("/api/users/sync", {
            method: "POST",
          });

          if (response.ok) {
            setSyncStatus("Sinkronisasi berhasil!");
          } else {
            setSyncStatus("Gagal sinkronisasi, coba lagi.");
          }
        } catch (error) {
          console.error("Error syncing user:", error);
          setSyncStatus("Error sinkronisasi.");
        } finally {
          setSyncing(false);
          // Remove the sync param from URL
          window.history.replaceState({}, "", "/dashboard");
        }
      }
    }

    syncUserToDatabase();
  }, [isLoaded, isSignedIn, shouldSync]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Loading Dashboard
            </h1>
            <p className="text-gray-600">Mohon tunggu sebentar...</p>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-slate-300 mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-64"></div>
              </div>

              <div className="space-y-4">
                <div className="h-24 bg-slate-100 rounded"></div>
                <div className="h-24 bg-slate-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    redirect("/sign-in");
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            TubesApp
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md"
            >
              Beranda
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <div className="py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Selamat datang di aplikasi!</p>
            </div>
            <div className="flex flex-col items-center mb-6">
              {" "}
              {user.imageUrl && (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="rounded-full object-cover mb-4"
                />
              )}
              {!user.imageUrl && (
                <div className="w-20 h-20 rounded-full bg-slate-300 flex items-center justify-center mb-4">
                  <span className="text-2xl text-slate-600">
                    {user.firstName ? user.firstName[0] : "?"}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-semibold">
                {user.fullName || user.firstName}
              </h2>
              <p className="text-gray-500">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>{" "}
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">
                  Status Akun
                </h3>
                <p className="mt-1">✅ Akun Anda telah aktif</p>
              </div>{" "}
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500">
                  Status Database
                </h3>
                <p className="mt-1">✅ Data tersimpan di database</p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/users");
                        const data = await response.json();
                        alert("Pengguna di database: " + JSON.stringify(data));
                      } catch (error) {
                        alert("Error: " + error);
                      }
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Periksa database
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("/api/users/sync", {
                          method: "POST",
                        });
                        const data = await response.json();
                        if (response.ok) {
                          alert(
                            "Akun berhasil disinkronkan ke database\n" +
                              JSON.stringify(data.user, null, 2)
                          );
                        } else {
                          throw new Error(data.error || "Failed to sync user");
                        }
                      } catch (error) {
                        alert("Error: " + error);
                      }
                    }}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Sinkronkan Akun
                  </button>
                </div>
              </div>
              {user.externalAccounts?.some(
                (account) => account.provider === "google"
              ) && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">
                    Login dengan Google
                  </h3>
                  <p className="mt-1">✅ Anda login dengan akun Google</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Provider: Google
                    <br />
                    Email: {user.primaryEmailAddress?.emailAddress}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
