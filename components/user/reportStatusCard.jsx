import { WASTE_TYPE_META } from "@/lib/hardcodedData/userReportStatusData";
import StatusTracker from "./statusTracker";
import WorkerRatingStars from "../worker/WorkerRatingStars";
import { Trash2, MapPin, Clock,X } from "lucide-react";
 
import { useState } from "react";
export default function ReportStatusCard({
  report,
  onVerify,
  verifying,
  onRate,
}) {
  const wasteMeta = WASTE_TYPE_META[report.wasteType];
  const WasteIcon = wasteMeta?.icon || Trash2;
const [previewImage, setPreviewImage] = useState(null);
  return (
    <div
      className="
        rounded-2xl border border-gray-200 dark:border-zinc-800
        bg-white dark:bg-zinc-950
        p-5 sm:p-6 space-y-6 shadow-sm
      "
    >
      {/* Header */}

      <h6 className="text-sm font-semibold text-gray-900 dark:text-gray-100"> id:{report._id}</h6>
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2">
          <WasteIcon className={wasteMeta?.color} size={18} />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {report.wasteType} 
          </h3>
        </div>

        <span
          className="
            text-xs px-3 py-1 rounded-full font-medium
            bg-blue-100 text-blue-700
            dark:bg-blue-900/30 dark:text-blue-400
          "
        >
          {report.status}
        </span>
      </div>

      {/* Progress Tracker */}
      <StatusTracker status={report.status} />

      {/* Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Location & Time */}
        <div className="space-y-3 text-sm">
          <div className="flex gap-2 items-start text-gray-700 dark:text-zinc-300">
            <MapPin size={18} className="mt-1 shrink-0" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-gray-600 dark:text-zinc-400">
                {report.pickupLocation?.address?.fullAddress ||
                  "Location not available"}
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-start text-gray-700 dark:text-zinc-300">
            <Clock size={16} className="mt-0.5" />
            <div>
              <p className="font-medium">Reported</p>
              <p className="text-gray-600 dark:text-zinc-400">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Worker Card */}
        {report.workerId && (
          <div
            className="
              rounded-xl bg-green-50 dark:bg-green-900/20
              p-4 flex gap-3 items-center
            "
          >
            {/* Worker image */}
            <div className="h-12 w-12 rounded-full overflow-hidden border shrink-0">
              {report.workerId.userImage ? (
                <img
                  src={report.workerId.userImage?.secure_url}
                  alt={report.workerId.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-200 font-semibold">
                  {report.workerId.name?.charAt(0)}
                </div>
              )}
            </div>

            {/* Worker Info */}
            <div className="text-sm space-y-0.5">
              <p className="text-gray-700 dark:text-gray-200 font-medium">
                Assigned Worker
              </p>
              <p className="text-gray-800 dark:text-gray-100">
                {report.workerId.name}
              </p>

              {/*   Worker Rating */}
              <WorkerRatingStars rating={report.workerId.rating} />
            </div>
          </div>
        )}
      </div>

      {/* Waste Image */}
      {report?.imageUrl && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Waste Image
          </p>
          <img
            src={report.imageUrl}
            alt="Waste"
            loading="lazy"
            className="
              w-full h-48 sm:h-56 object-contain
              rounded-xl border border-gray-200 dark:border-zinc-800
            "
          />
        </div>
      )}

      {/* Completion Proof Images */}
      {(report.status === "Completed" || report.status === "Verified") &&
        report.completionProof?.images?.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Completion Proof
            </p>

            <div className="flex gap-3 overflow-x-auto">
              {report.completionProof.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="Proof"
                  onClick={() => setPreviewImage(img)}
                  className="
              h-24 w-24 rounded-lg object-cover cursor-pointer
              border border-gray-200 dark:border-zinc-800
              hover:opacity-80 transition
            "
                />
              ))}
            </div>
          </div>
        )}


      {/* Verify Button */}
      {report.status === "Completed" && (
        <button
          disabled={verifying}
          onClick={() => onVerify(report._id)}
          className="
            w-full py-3 rounded-xl font-medium
            bg-green-600 hover:bg-green-700
            disabled:opacity-60 disabled:cursor-not-allowed
            text-white transition
          "
        >
          {verifying ? "Verifying..." : "Verify Pickup"}
        </button>
      )}

      {/* Rate Worker Button */}
      {report.status === "Verified" &&
        !report.userConfirmation?.ratingGiven && (
          <button
            onClick={onRate}
            className="
              w-full py-3 rounded-xl font-medium
              border border-gray-300 dark:border-zinc-700
              hover:bg-gray-50 dark:hover:bg-zinc-900
              transition hover:cursor-pointer
            "
          >
            Rate Worker
          </button>
        )}

      {/* Rated Info */}
      {report.userConfirmation?.ratingGiven && (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          ⭐ You have rated this worker
        </p>
      )}

      {/* Image Preview Modal */}
{previewImage && (
  <div
    className="
      fixed inset-0 z-50 flex items-center justify-center
      bg-black/70 backdrop-blur-sm
    "
    onClick={() => setPreviewImage(null)}
  >
    <div
      className="
        relative max-w-4xl w-full mx-4
        bg-white dark:bg-zinc-950
        rounded-2xl p-4
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      <button
        onClick={() => setPreviewImage(null)}
        className="
          absolute top-3 right-3
          rounded-full p-2 hover:cursor-pointer
          bg-white dark:bg-zinc-900
          hover:bg-gray-100 dark:hover:bg-zinc-800
        "
      >
        <X size={18} />
      </button>

      {/* Image */}
      <img
        src={previewImage}
        alt="Completion proof"
        className="
          max-h-[80vh] w-full
          object-contain rounded-xl
        "
      />
    </div>
  </div>
)}

    </div>
  );
}
