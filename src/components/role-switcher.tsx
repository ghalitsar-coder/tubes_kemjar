"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconUsers } from "@tabler/icons-react";

// This component is for development & testing only
// It allows quickly switching between different roles to test UI displays
export function RoleSwitcher() {
  const [isLoading, setIsLoading] = useState(false);

  const changeRole = async (role: string) => {
    setIsLoading(true);
    try {
      await fetch("/api/auth/dev-set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });

      // Force reload to apply new role
      window.location.reload();
    } catch (error) {
      console.error("Failed to change role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-7 gap-1"
          disabled={isLoading}
        >
          <IconUsers className="h-3 w-3" />
          {isLoading ? "Changing..." : "Test Roles"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeRole("PATIENT")}>
          Switch to Patient
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeRole("DOCTOR")}>
          Switch to Doctor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeRole("ADMIN")}>
          Switch to Admin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
