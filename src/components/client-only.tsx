"use client";

import { useEffect, useState, ReactNode } from "react";

/**
 * Komponen untuk menampilkan children hanya pada sisi client
 * Berguna untuk mengatasi masalah hydration
 */
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <>{children}</>;
}
