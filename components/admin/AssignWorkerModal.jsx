"use client";

import { useEffect, useState } from "react";
import { apiConnector } from "@/lib/apiConnector";
import { toast } from "sonner";
import { X, MapPin, Recycle, ChevronDown } from "lucide-react";

export default function AssignWorkerModal({ report, onClose, onSuccess }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    const coords = report.pickupLocation?.geo?.coordinates;
    if (!coords) return;

    const lat = coords[1];
    const lng = coords[0];

    apiConnector("GET", `/api/admin/workers?lat=${lat}&lng=${lng}`)
      .then((res) => setWorkers(res.workers || []))
      .catch(() => toast.error("Failed to load workers"));
  }, [report]);

  
  const assign = async () => {
    if (!selectedWorker) {
      toast.error("Please select a worker");
      return;
    }

    try {
      setLoading(true);
      await apiConnector(
        "POST",
        `/api/admin/reports/${report._id}/assign`,
        { workerId: selectedWorker._id }
      );
      toast.success("Worker assigned successfully");
      onSuccess();
    } catch (err) {
      toast.error(err.message || "Assign failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-3">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 space-y-5">

       
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Assign Worker
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        {/*report info */}
        <div className="rounded-xl border p-4 bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Recycle size={16} />
            {report.wasteType || "Waste Pickup"}
          </div>

          <div className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <MapPin size={14} className="mt-0.5" />
            <p className="line-clamp-2">
              {report.pickupLocation?.address?.fullAddress || "Address not available"}
            </p>
          </div>
        </div>

       {/* worker drop down */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="
              w-full flex items-center justify-between
              px-4 py-2 rounded-xl border
              bg-white dark:bg-zinc-900
              border-zinc-300 dark:border-zinc-700
              hover:border-green-500
              text-sm cursor-pointer
            "
          >
            <div className="flex items-center gap-3">
              {selectedWorker ? (
                <>
                  {selectedWorker.userImage?.secure_url ? (
                    <img
                      src={selectedWorker.userImage.secure_url}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 font-semibold">
                      {selectedWorker.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium">{selectedWorker.name}</span>
                </>
              ) : (
                <span className="text-zinc-500">Select nearest worker</span>
              )}
            </div>
            <ChevronDown size={16} />
          </button>

         
          {dropdownOpen && (
            <div className="absolute z-50  mt-2 w-full max-h-64 overflow-y-auto rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 shadow-lg">
              {workers.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-6">
                  No available workers
                </p>
              )}

              {workers.map((worker) => (
                <button
                  key={worker._id}
                  type="button"
                  onClick={() => {
                    setSelectedWorker(worker);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  {worker.userImage?.secure_url ? (
                    <img
                      src={worker.userImage.secure_url}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 font-semibold">
                      {worker.name.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 text-left">
                    <p className="font-medium">{worker.name}</p>
                    {worker.distance != null && (
                      <p className="text-xs text-zinc-500">
                        {(worker.distance / 1000).toFixed(2)} km away
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        
        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm cursor-pointer border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={assign}
            disabled={!selectedWorker || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
          >
            {loading ? "Assigning..." : "Assign Worker"}
          </button>
        </div>
      </div>
    </div>
  );
}
