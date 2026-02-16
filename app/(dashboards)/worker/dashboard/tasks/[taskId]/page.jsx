"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiConnector } from "@/lib/apiConnector";
import { toast } from "sonner";
import Skeleton from "@/components/skeleton";
import StatusTracker from "@/components/user/statusTracker";
import CompleteTaskModal from "@/components/worker/CompleteTaskModal";
import {
    MapPin,
    Clock,
    Navigation,
    ArrowLeft,
    Trash2,
    X,
} from "lucide-react";

export default function WorkerTaskDetailsPage() {
    const { taskId } = useParams();
    const router = useRouter();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState(null);
    const[ratingByUser,setRatingByUser] = useState(null);
        const [showCompleteModal, setShowCompleteModal] = useState(false);

        // for accepting the task 
        const [starting, setStarting] = useState(false);

const startWorking = async () => {
  try {
    
    setStarting(true);
    await apiConnector("POST", `/api/worker/reports/${taskId}/start`);
   toast.success("You have started the task", {
      duration: 3000,  
    });
    fetchTask(); // refresh task
  } catch (err) {
    toast.error(err.message || "Failed to start work");
  } finally {
    setStarting(false);
    
  }
};


    const fetchTask = async () => {
        try {
            setLoading(true);
            const res = await apiConnector(
                "GET",
                `/api/worker/reports/${taskId}`
            );
          //  console.log("REPONSE FO THE REPORT -> ",res);
            setTask(res.report);
            if(res?.rating)
            {
                setRatingByUser(res?.rating)
            }
        } catch (err) {
            toast.error(err?.message || "Failed to load task");
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
        window.open(
            `https://www.google.com/maps?q=${lat},${lng}`,
            "_blank"
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-6">
            <div className="max-w-3xl mx-auto space-y-6">

                {/*Back*/}
               <button
                    onClick={() => router.back()}
                    className="
                        flex items-center gap-2 
                        px-4 py-2 
                        rounded-full 
                        bg-zinc-100 dark:bg-zinc-800 
                        text-zinc-700 dark:text-zinc-200 
                        shadow-sm
                        hover:bg-green-500 hover:text-white 
                        active:scale-95
                        transition-all duration-200
                        cursor-pointer
                    "
                    >
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                    <span className="font-medium">Back</span>
                    </button>


                {/*  status  */}
                <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 space-y-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-semibold flex items-center gap-2">
                            <Trash2 size={18} />
                            {task.wasteType} Waste
                        </h1>

                        <span
                            className={`text-xs px-3 py-1 rounded-full font-semibold
                ${task.status === "Assigned"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : task.status === "Completed"
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-green-100 text-green-700"
                                }
              `}
                        >
                            {task.status}
                        </span>
                    </div>

                    <StatusTracker status={task.status} />
                </div>

                {/* user info */}
                <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 flex gap-4 items-center">
                    <div className="h-12 w-12 rounded-full overflow-hidden border bg-zinc-200">
                        {task.userId?.userImage?.secure_url ? (
                            <img
                            loading="lazy"
                                src={task.userId.userImage.secure_url}
                                alt={task.userId.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center font-semibold">
                                {task.userId?.name?.charAt(0)}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-xs text-zinc-500 uppercase">
                            Reported By
                        </p>
                        <p className="font-medium">{task.userId?.name}</p>
                        {task.userId?.phone && (
                            <p className="text-sm text-zinc-500">
                                {task.userId.phone}
                            </p>
                        )}
                    </div>
                </div>

                {/* loaction */}
                <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 space-y-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                        <MapPin size={16} /> Pickup Location
                    </p>

                    <p className="text-sm text-zinc-600">
                        {task.pickupLocation?.address?.fullAddress}
                    </p>

                    <button
                        onClick={openMaps}
                        className="inline-flex items-center gap-2 text-sm text-green-600 hover:underline cursor-pointer"
                    >
                        <Navigation size={14} />
                        Navigate
                    </button>
                </div>

                {/* time*/}
                <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
                    <p className="text-sm font-medium flex items-center gap-2">
                        <Clock size={16} /> Assigned At
                    </p>
                    <p className="text-sm text-zinc-600 mt-1">
                        {new Date(task.assignedAt).toLocaleString()}
                    </p>
                </div>

                {/* decription*/}
                {task.description && (
                    <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-zinc-600">
                            {task.description}
                        </p>
                    </div>
                )}

                {/* esstimated weight */}
                {(task.estimatedWeight || task.actualWeight) && (
                    <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5 grid grid-cols-2 gap-4">
                        {task.estimatedWeight && (
                            <div>
                                <p className="text-xs text-zinc-500">
                                    Estimated Weight
                                </p>
                                <p className="font-medium">
                                    {task.estimatedWeight} kg
                                </p>
                            </div>
                        )}
                        {task.actualWeight && (
                            <div>
                                <p className="text-xs text-zinc-500">
                                    Actual Weight
                                </p>
                                <p className="font-medium">
                                    {task.actualWeight} kg
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* waste image */}
                {task.imageUrl && (
                    <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
                        <p className="text-sm font-medium mb-3">
                            Waste Image
                        </p>
                        <img
                        loading="lazy"
                            src={task.imageUrl}
                            alt="Waste"
                            onClick={() => setPreviewImage(task.imageUrl)}
                            className="
                w-full h-56 object-contain rounded-xl border
                cursor-pointer hover:opacity-80 transition
              "
                        />
                    </div>
                )}

                {/* proof */}
                {(task.status === "Completed" || task.status === "Verified") &&
                    task.completionProof?.images?.length > 0 && (
                        <div className="rounded-2xl border bg-white dark:bg-zinc-900 p-5">
                            <p className="text-sm font-medium mb-3">
                                Completion Proof
                            </p>

                            <div className="flex gap-3 overflow-x-auto">
                                {task.completionProof.images.map((img, i) => (
                                    <img
                                    loading="lazy"
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
            {ratingByUser && (
  <div className="mt-4 p-4 rounded-xl border bg-yellow-50 dark:bg-zinc-800">
    <p className="text-sm font-semibold text-yellow-600">User Rating</p>

    <div className="flex items-center gap-2 mt-1">
      ⭐ <span className="font-bold">{ratingByUser.rating}/5</span>
    </div>

    { ratingByUser.review && (
      <p className="text-sm mt-2 text-zinc-600 dark:text-zinc-300">
        "{ ratingByUser.review}"
      </p>
    )}

    <p className="text-xs mt-2 text-zinc-500">
      — {ratingByUser.reviewer?.name}
    </p>
  </div>
)}
                {/*  COMPLETE BUTTON */}
                
             {/* START WORK */}
                {task.status === "Assigned" && !task.isInProgress && (
                <button
                    onClick={startWorking}
                    disabled={starting}
                    className="
                    w-full py-3 rounded-xl
                    bg-blue-600 hover:bg-blue-700
                    text-white font-semibold
                    cursor-pointer
                    disabled:opacity-50
                    "
                >
                    {starting ? "Starting..." : "Start Working"}
                </button>
                )}

                {/* COMPLETE TASK */}
                {task.status === "Assigned" && task.isInProgress && (
                <button
                    onClick={() => setShowCompleteModal(true)}
                    className="
                    w-full py-3 rounded-xl
                    bg-green-600 hover:bg-green-700
                    text-white font-semibold cursor-pointer
                    "
                >
                    Mark as Completed
                </button>
                )}


                {task.status === "Completed" && (
                    <button
                        disabled
                        className="
      w-full py-3 rounded-xl
      bg-zinc-300 dark:bg-zinc-800
      text-zinc-600 dark:text-zinc-400
      cursor-not-allowed
    "
                    >
                        Waiting for user confirmation
                    </button>
                )}

                {task.status === "Verified" && (
                    <div className="text-center text-green-600 font-semibold">
                        Task Verified
                    </div>
                )}

            </div>




            {/* image preview */}
            {previewImage && (
                <div
                    className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-black/70 backdrop-blur-sm
          "
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-4xl w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="
                absolute top-3 right-3 dark:bg-red-500 p-2 rounded-full
                bg-white hover:bg-gray-100 cursor-pointer
              "
                        >
                            <X size={18} />
                        </button>

                        <img
                            src={previewImage}
                            loading="lazy"
                            className="w-full max-h-[80vh] object-contain rounded-xl"
                        />
                    </div>
                </div>
            )}


            {/* modal render for completion of the task update  */}

            {showCompleteModal && (
  <CompleteTaskModal
    task={task}
    onClose={() => setShowCompleteModal(false)}
    onSuccess={fetchTask}
  />
)}

        </div>
    );
}
