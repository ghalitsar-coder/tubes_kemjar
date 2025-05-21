"use client";

import { Badge } from "@/components/ui/badge";
import { useUserRole } from "@/lib/auth-protection";

/**
 * A component that displays the current user role
 * Used primarily for development and debugging purposes
 */
export function RoleIndicator() {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Loading...
      </Badge>
    );
  }

  if (!role) {
    return (
      <Badge variant="outline" className="bg-gray-200">
        Not signed in
      </Badge>
    );
  }

  // Style badge based on role
  let variant: "default" | "outline" | "secondary" | "destructive" = "outline";

  switch (role) {
    case "ADMIN":
      variant = "destructive";
      break;
    case "DOCTOR":
      variant = "secondary";
      break;
    default:
      variant = "default";
  }

  return (
    <Badge variant={variant} className="text-xs">
      {role.toLowerCase()}
    </Badge>
  );
}
