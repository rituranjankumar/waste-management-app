"use client";

import { apiConnector } from "@/lib/apiConnector";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

const WasteMap = dynamic(() => import("@/components/admin/Map"), {
  ssr: false,
});

const page = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await apiConnector("GET", "/api/admin/map");
   //   console.log("MAP CORDINATES -> ", res);

      if (res.success) {
        setLocations(res.location);
      }
    } catch (error) {
      toast.error(error.message || "error in getting the location");
      console.log(
        "ERROR IN THE LOCATION FETCH INSIDE THE MAP -> ",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-zinc-900 transition-colors duration-300">
  
  {/* Header */}
  <div className="mb-6">
    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
      Waste & Worker Map Dashboard
    </h1>
    <p className="text-sm text-gray-500 dark:text-zinc-400">
      View real-time locations of waste reports and workers.
    </p>
  </div>

  {/* Map Card */}
  <div className="
    bg-white dark:bg-zinc-800
    border border-gray-200 dark:border-zinc-700
    shadow-sm dark:shadow-lg
    rounded-xl
    p-4
    transition-all duration-300
  ">
    
    {/* Loading State */}
    {loading && (
      <div className="flex flex-col items-center justify-center h-125 text-gray-500 dark:text-zinc-400 space-y-2">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 dark:border-zinc-600 border-t-blue-500 rounded-full"></div>
        <p>Loading map data...</p>
      </div>
    )}

    {/* Empty State */}
    {!loading && locations?.length === 0 && (
      <div className="flex flex-col items-center justify-center h-[125] text-gray-500 dark:text-zinc-400 space-y-2">
        <span className="text-lg">📍</span>
        <p>No location data available</p>
      </div>
    )}

    {/* Map */}
    {!loading && locations?.length > 0 && (
      <WasteMap locations={locations} />
    )}
  </div>
</div>

  );
};

export default page;
