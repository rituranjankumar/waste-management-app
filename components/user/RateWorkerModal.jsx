"use client";

import { useState } from "react";
import ReactStars from "react-stars";
import { apiConnector } from "@/lib/apiConnector";
import { toast } from "sonner";

export default function RateWorkerModal({ report, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const worker = report?.workerId;
  
  const submitRating = async () => {
    if (!rating) return toast.error("Please select a rating");

    try {
      setLoading(true);
      await apiConnector("POST", `/api/user/reports/rate/${report._id}`, {
        rating,
        review,
      });
      toast.success("Thanks for your feedback!");
      onSuccess();
    } catch (err) {
      toast.error("Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md space-y-4">

        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Rate Worker
        </h2>

        {/* Worker info */}
        {worker && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden border">
              {worker.userImage ? (
                <img
                loading="lazy"
                  src={worker.userImage.secure_url}
                  alt={worker.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-green-200 text-green-900 font-semibold">
                  {worker.name?.charAt(0)} 
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {worker.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Assigned Worker
              </p>
            </div>
          </div>
        )}

        {/* ⭐ react-stars */}
        <ReactStars
          count={5}
          value={rating}
          onChange={(newRating) => setRating(newRating)}
          size={28}
          half={true}
          color1="#d1d5db"
          color2="#facc15"
        />

        {/* Review */}
        <textarea
          rows={3}
          placeholder="Optional review"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="
            w-full border rounded-lg p-2 text-sm
            bg-white dark:bg-zinc-800
            border-gray-300 dark:border-zinc-700
          "
        />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border rounded-lg py-2 cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={submitRating}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 cursor-pointer"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
