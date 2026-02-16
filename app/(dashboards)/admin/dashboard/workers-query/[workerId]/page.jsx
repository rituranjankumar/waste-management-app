"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiConnector } from "@/lib/apiConnector";
import { toast } from "sonner";
import Skeleton from "@/components/skeleton";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  Clock,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function WorkerDetailsPage() {
  const { workerId } = useParams();
  const router = useRouter();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorker = async () => {
    try {
      setLoading(true);
 console.log("SPECIFIC WRKER DETAILS  -> ");
      const res = await apiConnector(
        "GET",
        `/api/admin/workers-query/workers/${workerId}`
      );
       //  console.log("SPECIFIC WRKER DETAILS  -> ",res);
      setWorker(res.worker);
    } catch (err) {
      toast.error(err.message || "Failed to load worker");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorker();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton />
      </div>
    );
  }

  if (!worker) return null;

  const coords = worker.currentLocation?.geo?.coordinates;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-full
          bg-zinc-100 dark:bg-zinc-800 
          text-zinc-700 dark:text-zinc-200
          hover:bg-green-600 hover:text-white
          transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* PROFILE CARD */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex flex-col md:flex-row md:items-start gap-6">

  {/* IMAGE */}
  <div className="h-24 w-24 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
    {worker.userImage?.secure_url ? (
      <img
        src={worker.userImage.secure_url}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="h-full w-full flex items-center justify-center font-bold bg-green-200 text-green-800 text-2xl">
        {worker.name?.charAt(0)}
      </div>
    )}
  </div>

  {/* BASIC INFO */}
  <div className="flex-1">
    <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
      {worker.name} ({worker?.role})
    </h2>

    <div className="space-y-2 mt-3 text-sm text-zinc-600 dark:text-zinc-400">

      <p className="flex items-center gap-2">
        <Mail size={14} />
        {worker.email}
      </p>

      <p className="flex items-center gap-2">
        <Phone size={14} />
        {worker.phone}
      </p>

      <p className="flex items-center gap-2">
        <Activity size={14} />
        {worker.isAvailable ? (
          <span className="text-green-600 dark:text-green-400 font-medium">
            Available
          </span>
        ) : (
          <span className="text-red-600 dark:text-red-400 font-medium">
            Not Available
          </span>
        )}
      </p>

      {/* LOCATION */}
      {worker.currentLocation?.address?.fullAddress && (
        <div className="mt-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">

          <p className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-200">
            <MapPin size={14} />
            Location
          </p>

          <p className="text-xs mt-1 text-zinc-600 dark:text-zinc-400">
            {worker.currentLocation.address.fullAddress}
          </p>

          {/* NAVIGATE BUTTON */}
          {worker.currentLocation?.geo?.coordinates && (
            <button
              onClick={() => {
                const [lng, lat] =
                  worker.currentLocation.geo.coordinates;

                window.open(
                  `https://www.google.com/maps?q=${lat},${lng}`,
                  "_blank"
                );
              }}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg
              bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
            >
              <MapPin size={14} />
              Open in Maps
            </button>
          )}
        </div>
      )}

    </div>
  </div>
</div>

 
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {/* VERIFIED */}
          <div className="rounded-2xl p-6 border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">Verified</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {worker?.verified}
            </p>
          </div>

          {/* ASSIGNED */}
          <div className="rounded-2xl p-6 border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-2">
              <Clock size={18} />
              <span className="text-sm font-medium">Assigned</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {worker?.assigned}
            </p>
          </div>

          {/* COMPLETED */}
          <div className="rounded-2xl p-6 border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            
                    <CheckCircle2
                        size={18}
                        className="text-blue-600 dark:text-blue-400 shrink-0"
                    />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {worker?.completed} 
                
            </p>
          </div>

          {/* AVG RATING */}
          <div className="rounded-2xl p-6 border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
              <Star size={18} />
              <span className="text-sm font-medium">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {worker?.avgRating
                ? worker?.avgRating.toFixed(1)
                : "0"}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
