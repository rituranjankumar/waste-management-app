"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiConnector } from "@/lib/apiConnector";
import { toast } from "sonner";
import Skeleton from "@/components/skeleton";
import StatusTracker from "@/components/user/statusTracker";
import {
  MapPin,
  Clock,
  Navigation,
  ArrowLeft,
  Trash2,
  X,
  User,
  CheckCircle,
  Star,
} from "lucide-react";

export default function AdminTaskDetailsPage() {
  const { reportId } = useParams();
  const router = useRouter();

  const [task, setTask] = useState(null);
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const res = await apiConnector(
        "GET",
        `/api/admin/reports/${reportId}`
      );

      setTask(res.report);
      setRating(res.rating || null);
    } catch (err) {
      toast.error(err?.message || "Failed to load report");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <Skeleton />
      </div>
    );
  }

  if (!task) return null;

  const coords = task.pickupLocation?.geo?.coordinates;
  const lat = coords?.[1];
  const lng = coords?.[0];

  const openMaps = () => {
    if (!lat || !lng) {
      toast.error("Location not available");
      return;
    }
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="
            flex items-center gap-2 px-4 py-2 rounded-full
            bg-zinc-100 dark:bg-zinc-800
            hover:bg-green-600 hover:text-white
            transition cursor-pointer
          "
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* STATUS */}
        <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Trash2 size={18} />
              {task.wasteType} Waste
            </h1>

            <span
              className={`
                text-xs px-3 py-1 rounded-full font-semibold
                ${
                  task.status === "Pending"
                    ? "bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-200"
                    : task.status === "Assigned"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    : task.status === "Completed"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                }
              `}
            >
              {task.status}
            </span>
          </div>

          <StatusTracker status={task.status} />
        </div>

        {/* REPORTED BY */}
        <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 flex gap-4 items-center">
          <User size={18} />
          <div>
            <p className="text-xs text-zinc-500 uppercase">Reported By</p>
            <p className="font-medium">{task.userId?.name}</p>
            <p className="text-sm text-zinc-500">{task.userId?.phone}</p>
          </div>
        </div>

        {/* ASSIGNED WORKER */}
        {task.workerId && (
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 flex gap-4 items-center">
            <div className="h-12 w-12 rounded-full overflow-hidden border shrink-0">
              {task.workerId.userImage?.secure_url ? (
                <img
                  src={task.workerId.userImage.secure_url}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-semibold">
                  {task.workerId.name?.charAt(0)}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-zinc-500 uppercase">Assigned To</p>
              <p className="font-medium">{task.workerId.name}</p>
              <p className="text-sm text-zinc-500">{task.workerId.phone}</p>
            </div>
          </div>
        )}

        {/* LOCATION */}
        <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <MapPin size={16} /> Pickup Location
          </p>

          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {task.pickupLocation?.address?.fullAddress}
          </p>

          <button
            onClick={openMaps}
            className="
              inline-flex items-center gap-2
              px-3 py-1.5 rounded-lg
              bg-green-600 hover:bg-green-700
              text-white text-sm
              cursor-pointer
            "
          >
            <Navigation size={14} />
            Open in Maps
          </button>
        </div>

        {/* TIME */}
        <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
          <p className="text-sm font-medium flex items-center gap-2">
            <Clock size={16} /> Assigned At
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
           {task.assignedAt ?new Date(task.assignedAt).toLocaleString() : "Not Assigned Yet"} 
          </p>
        </div>

        {/* DESCRIPTION */}
        {task.description && (
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
            <p className="text-sm font-medium">Description</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {task.description}
            </p>
          </div>
        )}

        {/* WEIGHTS */}
        {(task.estimatedWeight || task.actualWeight) && (
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 grid grid-cols-2 gap-4">
            {task.estimatedWeight && (
              <div>
                <p className="text-xs text-zinc-500">Estimated Weight</p>
                <p className="font-medium">{task.estimatedWeight} kg</p>
              </div>
            )}
        
          </div>
        )}

        {/* WASTE IMAGE */}
        {task.imageUrl && (
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
            <p className="text-sm font-medium mb-3">Waste Image</p>
            <img
              src={task.imageUrl}
              onClick={() => setPreviewImage(task.imageUrl)}
              className="
                w-full h-56 object-contain rounded-xl border
                cursor-pointer hover:opacity-80 transition
              "
            />
          </div>
        )}

        {/* COMPLETION PROOF */}
        {task.completionProof?.images?.length > 0 && (
          <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
            <p className="text-sm font-medium mb-3">Completion Proof</p>
            <div className="flex gap-3 overflow-x-auto">
              {task.completionProof.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setPreviewImage(img)}
                  className="
                    h-24 w-24 rounded-lg object-cover border
                    cursor-pointer hover:opacity-80
                  "
                />
              ))}
            </div>
          </div>
        )}

        {/* USER CONFIRMATION */}
        {task.userConfirmation?.confirmed && (
          <div className="rounded-2xl border bg-green-50 dark:bg-green-900/20 p-5">
            <p className="flex items-center gap-2 text-green-700 dark:text-green-300 font-medium">
              <CheckCircle size={16} />
              User Confirmed Completion
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              {new Date(task.userConfirmation.confirmedAt).toLocaleString()}
            </p>
          </div>
        )}

        {/* RATING */}
        {rating && (
          <div className="rounded-2xl border bg-yellow-50 dark:bg-yellow-900/20 p-5">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
              User Rating
            </p>

            <div className="flex items-center gap-2 mt-1">
              <Star size={16} />
              <span className="font-bold">{rating.rating}/5</span>
            </div>

            {rating.review && (
              <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-300">
                “{rating.review}”
              </p>
            )}

            <p className="text-xs mt-2 text-zinc-500">
              — {rating.reviewer?.name}
            </p>
          </div>
        )}
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/70 flex  items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="
                absolute dark:bg-red-400 hover:dark:bg-red-600 top-3 right-3 p-2 rounded-full
                bg-white hover:bg-zinc-100 cursor-pointer
              "
            >
              <X size={18} />
            </button>

            <img
              src={previewImage}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
