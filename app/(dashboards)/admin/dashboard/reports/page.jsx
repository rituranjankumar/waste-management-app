"use client";

import { useEffect, useState } from "react";
import { apiConnector } from "@/lib/apiConnector";
import { toast } from "sonner";
import Skeleton from "@/components/skeleton";
import { useRouter } from "next/navigation";
import AssignWorkerModal from "@/components/admin/AssignWorkerModal";

const STATUS_OPTIONS = [
  { key: "All", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Assigned", label: "Assigned" },
  { key: "Completed", label: "Completed" },
  { key: "Verified", label: "Verified" },
];

export default function AdminReportsPage() {
  const router = useRouter();


  const [reportId, setReportId] = useState("");
const [userEmail, setUserEmail] = useState("");
const [workerEmail, setWorkerEmail] = useState("");

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [assignReport, setAssignReport] = useState(null);

  const LIMIT = 4;

  const [debouncedSearch, setDebouncedSearch] = useState({
  reportId: "",
  userEmail: "",
  workerEmail: "",
});

useEffect(() => {
  const timeout = setTimeout(() => {
    setDebouncedSearch({
      reportId,
      userEmail,
      workerEmail,
    });
    setPage(1); // reset page
  }, 500); // 500ms delay

  return () => clearTimeout(timeout);
}, [reportId, userEmail, workerEmail]);

const fetchReports = async () => {
  try {
    setLoading(true);

    let query = `/api/admin/reports?page=${page}&limit=${LIMIT}&status=${status}`;

    if (debouncedSearch.reportId)
      query += `&reportId=${debouncedSearch.reportId}`;

    if (debouncedSearch.userEmail)
      query += `&userEmail=${debouncedSearch.userEmail}`;

    if (debouncedSearch.workerEmail)
      query += `&workerEmail=${debouncedSearch.workerEmail}`;

    const res = await apiConnector("GET", query);

    setReports(res.reports || []);
    setTotalPages(res.pagination.totalPages);
  } catch (err) {
    toast.error(err.message || "Failed to load reports");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
  fetchReports();
}, [page, status, debouncedSearch]);


const handleAutoAssign = async (reportId) => {
  const toastId = toast.loading("Auto assigning...");

  try {
    await apiConnector(
      "POST",
      `/api/admin/reports/${reportId}/auto-assign`
    );

    toast.dismiss(toastId);
    toast.success("Worker assigned successfully");
    fetchReports();
  } catch (err) {
    toast.dismiss(toastId);

     
    toast.error(err.message || "No active worker available");
  }
};


  return (
    <div className="min-h-screen px-4 py-6 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto space-y-6">

        <h1 className="text-2xl font-semibold">All Waste Reports</h1>
      

        {/* FILTER */}
        <div className="flex justify-end">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border dark:bg-zinc-900"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Report ID */}
              <input
                type="text"
                placeholder="Search by Report ID"
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                className="px-3 py-2 rounded-lg border dark:bg-zinc-900"
              />

              {/* User Email */}
              <input
                type="email"
                placeholder="Search by User Email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="px-3 py-2 rounded-lg border dark:bg-zinc-900"
              />

              {/* Worker Email */}
              <input
                type="email"
                placeholder="Search by Worker Email"
                value={workerEmail}
                onChange={(e) => setWorkerEmail(e.target.value)}
                className="px-3 py-2 rounded-lg border dark:bg-zinc-900"
              />

            </div>
        {/* CONTENT */}
        {loading ? (
          <>
            <Skeleton />
            <Skeleton />
          </>
        ) : reports.length === 0 ? (
          <div className="border border-dashed p-6 text-center text-sm">
            No reports found
          </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="
        rounded-2xl border
        bg-white dark:bg-zinc-900
        border-zinc-200 dark:border-zinc-800
        p-4 space-y-4
        shadow-sm
      "
              >
                {/* HEADER */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {report.wasteType || "Waste Pickup"}
                    </p>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {report.pickupLocation?.address?.fullAddress ||
                        "Address not available"}
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`
            text-xs font-medium px-3 py-1 rounded-full
            ${report.status === "Pending"
                        ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        : report.status === "Assigned"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : report.status === "Completed"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }
          `}
                  >
                    {report.status}
                  </span>
                </div>

                {/* META INFO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Reported by
                    </p>
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                      {report.userId?.name || "Unknown User"}
                    </p>
                  </div>

                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      Assigned to
                    </p>
                    <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                      {report.workerId?.name || "Not assigned"}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
               {/* ACTIONS */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {/* VIEW */}
                    <button
                      onClick={() =>
                        router.push(`/admin/dashboard/reports/${report._id}`)
                      }
                      className="
                        px-4 py-2 rounded-lg text-sm font-medium
                        bg-green-600 hover:bg-green-700
                        text-white
                        transition cursor-pointer
                      "
                    >
                      View Details
                    </button>

                    {/* PENDING */}
                    {report.status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleAutoAssign(report._id)}
                          className="
                            px-4 py-2 rounded-lg text-sm font-medium
                            bg-blue-600 hover:bg-blue-700
                            text-white transition cursor-pointer
                          "
                        >
                          Auto Assign
                        </button>

                        <button
                          onClick={() => setAssignReport(report)}
                          className="
                            px-4 py-2 rounded-lg text-sm font-medium
                            bg-purple-600 hover:bg-purple-700
                            text-white transition cursor-pointer
                          "
                        >
                          Manual Assign
                        </button>
                      </>
                    )}

                    {/* EDIT WORKER */}
                    {report.status === "Assigned" && !report.isInProgress && (
                      <button
                        onClick={() => setAssignReport(report)}
                        className="
                          px-4 py-2 rounded-lg text-sm font-medium
                          bg-orange-600 hover:bg-orange-700
                          text-white transition cursor-pointer
                        "
                      >
                        Change Worker
                      </button>
                    )}

                    {/* LOCKED */}
                    {report.status === "Assigned" && report.isInProgress && (
                      <span className="text-sm  place-self-auto  text-zinc-500 ml-auto self-center italic">
                        Worker has started – reassignment locked
                      </span>
                    )}
                  </div>

              </div>
            ))}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
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

      {/* MANUAL ASSIGN MODAL */}
      {assignReport && (
        <AssignWorkerModal
          report={assignReport}
          onClose={() => setAssignReport(null)}
          onSuccess={() => {
            setAssignReport(null);
            fetchReports();
          }}
        />
      )}
    </div>
  );
}
