"use client";
/**
 * Utilitas untuk melindungi route berdasarkan role user
 */
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, ReactNode } from "react";
import { prisma } from "./prisma";

type UserRoleData = {
  role: string | null;
  isLoading: boolean;
};

/**
 * Hook untuk mendapatkan role user dari database
 */
export function useUserRole(): UserRoleData {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // Jika user belum dimuat, tunggu
    if (!isLoaded) return;

    // Jika tidak ada user (tidak login), set role null dan loading false
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    } // Jika user ada, ambil role dari API
    async function fetchUserRole() {
      try {
        // First, check for development cookie override (only in development)
        if (process.env.NODE_ENV === "development") {
          const cookies = document.cookie.split(";");
          const devRoleCookie = cookies.find((cookie) =>
            cookie.trim().startsWith("dev-user-role=")
          );

          if (devRoleCookie) {
            const devRole = devRoleCookie.split("=")[1].trim();
            console.log("Using development role override:", devRole);
            setRole(devRole);
            setIsLoading(false);
            return;
          }
        }

        // Menambahkan parameter untuk mencegah cache
        const response = await fetch(`/api/auth/get-role?t=${Date.now()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Pastikan kredensial disertakan
          credentials: "include",
        });

        // Jika respons tidak ok, coba ambil pesan error dari server
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn("API error response:", errorData);

          // Fallback ke role default jika terjadi error (hindari blocking UI)
          setRole("PATIENT"); // Default ke PATIENT untuk keamanan
          return;
        }

        const data = await response.json();
        console.log("User role data:", data);
        setRole(data?.role || "PATIENT");
      } catch (error) {
        console.error("Error fetching user role:", error);
        // Fallback ke role default jika terjadi error (hindari blocking UI)
        setRole("PATIENT"); // Default ke PATIENT untuk keamanan
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRole();
  }, [user, isLoaded]);

  return { role, isLoading };
}

/**
 * Component untuk melindungi halaman berdasarkan role
 */
export function RoleProtected({
  allowedRoles,
  children,
  fallback = (
    <div>Unauthorized. You do not have permission to access this page.</div>
  ),
}: {
  allowedRoles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const router = useRouter();
  const { role, isLoading } = useUserRole();

  // Tampilkan loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Jika user tidak memiliki role yang diizinkan, tampilkan fallback
  if (!role || !allowedRoles.includes(role)) {
    // Auto redirect ke home setelah 2 detik
    setTimeout(() => {
      router.push("/");
    }, 2000);

    return <>{fallback}</>;
  }

  // Jika user memiliki role yang diizinkan, tampilkan children
  return <>{children}</>;
}
