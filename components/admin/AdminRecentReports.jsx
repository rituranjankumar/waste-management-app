"use client";

import { useRouter } from "next/navigation";
import { MapPin, Calendar, User, Truck } from "lucide-react";

export default function AdminRecentReports({ reports }) {
  const router = useRouter();

  if (!reports || reports.length === 0) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        No recent reports found.
      </div>
    );
  }

  const statusStyles = {
    Pending:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Assigned:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Completed:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Verified:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report._id}
          onClick={() =>
            router.push(`/admin/dashboard/reports/${report._id}`)
          }
          className="
            group
            rounded-xl border
            border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-900
            p-4
            cursor-pointer
            transition-all duration-300
            hover:shadow-lg
            hover:-translate-y-1
            hover:border-green-500
          "
        >
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Waste Image */}
            <div className="h-20 w-20 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
              {report.imageUrl ? (
                <img
                  src={report.imageUrl}
                  alt="Waste"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-zinc-500">
                  No Image
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">

              {/* Header */}
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {report.wasteType}
                </h3>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${statusStyles[report.status]}`}
                  >
                    {report.status}
                  </span>

                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <p className="line-clamp-2">
                  {report.pickupLocation?.address?.fullAddress ||
                    "Location not available"}
                </p>
              </div>

              {/* Reported By + Assigned To */}
              <div className="flex flex-wrap gap-6 pt-2 text-xs">

                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <User size={14} />
                  <span>
                    Reported by:{" "}
                    <span className="font-medium">
                      {report.userId?.name || "Unknown"}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Truck size={14} />
                  <span>
                    Assigned to:{" "}
                    <span className="font-medium">
                      {report.workerId?.name || "Not Assigned"}
                    </span>
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
