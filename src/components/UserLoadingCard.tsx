"use client";

import React from "react";

export default function UserLoadingCard() {
  return (
    <div className="bg-white shadow rounded-lg p-6 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="rounded-full bg-gray-200 h-12 w-12"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="flex justify-center mt-6">
          <div className="h-8 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
      <div className="mt-4 pt-2 border-t">
        <div className="h-3 bg-gray-200 rounded w-24 mx-auto"></div>
      </div>
    </div>
  );
}
