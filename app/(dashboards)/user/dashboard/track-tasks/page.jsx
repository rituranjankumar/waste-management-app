"use client";

import { useEffect, useMemo, useState } from "react";
import { apiConnector } from "@/lib/apiConnector";
import { STATUS_STEPS } from "@/lib/hardcodedData/userReportStatusData";
import { toast } from "sonner";
import ReportStatusCard from "@/components/user/reportStatusCard";
import Skeleton from "@/components/skeleton";
import RateWorkerModal from "@/components/user/RateWorkerModal";

export default function TrackTasksPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [verifyingId, setVerifyingId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 2;
  // rating modal
  const [ratingReport, setRatingReport] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "GET",
       `/api/user/reports?page=${page}&limit=${LIMIT}&status=${selectedStatus}`
      );

      setReports(res.reports || []);
      setTotalPages(res.pagination?.totalPages || 1);

    } catch (error) {
      toast.error(error.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
     // scroll to top on page change
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchReports();
  }, [selectedStatus]);


 
  const handleVerify = async (reportId) => {
    if (verifyingId) return;

    setVerifyingId(reportId);
    const toastId = toast.loading("Verifying pickup...");

    try {
      await apiConnector("POST", `/api/user/reports/verify/${reportId}`);
      toast.success("Pickup verified");
      fetchReports();
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setVerifyingId(null);
      toast.dismiss(toastId);
    }
  };

  console.log("reports fetched are -> ",reports)
  return (
    <div className="min-h-screen px-4 py-6 bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto space-y-6">

        <h1 className="text-2xl font-semibold">My Waste Reports</h1>

        {/* Filter */}
        <div className="flex justify-end">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border dark:bg-zinc-900"
          >
            <option value="All">All Statuses</option>
            {STATUS_STEPS.map((step) => (
              <option key={step.key} value={step.key}>
                {step.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <>
            <Skeleton />
            <Skeleton />
          </>
        ) : reports.length === 0 ? (
          <div className="border border-dashed p-6 text-center text-sm">
            No reports found.
          </div>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <ReportStatusCard
                key={report._id}
                report={report}
                verifying={verifyingId === report._id}
                onVerify={handleVerify}
                onRate={() => setRatingReport(report)}
              />
            ))}

            {!loading && totalPages > 1 && (
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

      {/* Rating Modal */}
      {ratingReport && (
        <RateWorkerModal
          report={ratingReport}
          onClose={() => setRatingReport(null)}
          onSuccess={() => {
            setRatingReport(null);
            fetchReports();
          }}
        />
      )}
    </div>
  );
}
