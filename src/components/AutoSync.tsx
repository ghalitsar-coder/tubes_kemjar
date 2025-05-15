"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

interface AutoSyncProps {
  redirectUrl?: string;
  children: ReactNode;
}

export function AutoSync({
  redirectUrl = "/dashboard",
  children,
}: AutoSyncProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function syncUser() {
      if (isLoaded && isSignedIn) {
        setIsSyncing(true);
        try {
          // Sync the user to our database
          const response = await fetch("/api/users/sync", {
            method: "POST",
          });

          if (response.ok) {
            console.log("User successfully synced to database");
          } else {
            console.error("Failed to sync user to database");
          }
        } catch (error) {
          console.error("Error syncing user:", error);
        } finally {
          setIsSyncing(false);
          router.push(redirectUrl);
        }
      }
    }

    if (isLoaded && isSignedIn) {
      syncUser();
    }
  }, [isLoaded, isSignedIn, router, redirectUrl]);

  return (
    <>
      {children}
      {isSyncing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-md shadow-xl max-w-md w-full">
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-8 w-8 text-slate-600 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-slate-700 font-medium">
                Menyinkronkan data pengguna...
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
