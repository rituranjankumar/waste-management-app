"use client";

import { useEffect, useState } from "react";
import { apiConnector } from "@/lib/apiConnector";
import { toast } from "sonner";
import Skeleton from "@/components/skeleton";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { key: "All", label: "All" },
  { key: "Assigned", label: "Assigned" },
  { key: "Completed", label: "Completed" },
  { key: "Verified", label: "Verified" },
];

export default function WorkerTasksPage() {
  const router = useRouter();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 6;

  const fetchReports = async () => {
    try {
      setLoading(true);

      const res = await apiConnector(
        "GET",
        `/api/worker/reports?page=${page}&limit=${LIMIT}&status=${selectedStatus}`
      );

      setReports(res.reports || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (error) {
      toast.error(error.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchReports();
  }, [selectedStatus]);

  return (
    <div className="min-h-screen px-4 py-6 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-2xl font-semibold">My Tasks</h1>

        {/* FILTER */}
        <div className="flex justify-end">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border dark:bg-zinc-900"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

         
        {loading ? (
          <>
            <Skeleton />
            <Skeleton />
          </>
        ) : reports.length === 0 ? (
          <div className="border border-dashed p-6 text-center text-sm">
            No tasks found.
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="rounded-xl border bg-white dark:bg-zinc-900 p-4 space-y-2"
              >
                {/* WASTE TYPE */}
                <p className="text-sm font-semibold">
                  {report.wasteType || "Waste Pickup"}
                </p>

                {/* ADDRESS */}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {report.pickupLocation?.address?.fullAddress || "Address not available"}
                </p>

                {/* DATE */}
                <p className="text-xs text-zinc-500">
                  Assigned on{" "}
                  {report.assignedAt
                    ? new Date(report.assignedAt).toLocaleDateString()
                    : "N/A"}
                </p>

                {/* STATUS */}
                <span
                  className={`inline-block text-xs px-2 py-1 rounded-full
                    ${
                      report.status === "Assigned"
                        ? "bg-yellow-100 text-yellow-700"
                        : report.status === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                >
                  {report.status}
                </span>

                {/* ACTION */}
                <div className="pt-2">
                  <button
                    onClick={() => router.push(`/worker/dashboard/tasks/${report._id}`)}
                    className="text-sm cursor-pointer text-green-600 hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>

                <span className="text-sm">
                  Page <strong>{page}</strong> of {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
