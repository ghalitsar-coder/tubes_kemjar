import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "img.clerk.com", 
      "images.clerk.dev", 
      "randomuser.me",
      "cdn-icons-png.flaticon.com"
    ],
  },
};

export default nextConfig;
