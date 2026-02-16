"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { apiConnector } from "@/lib/apiConnector";

export default function CompleteTaskModal({ task, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [estimatedWeight, setEstimatedWeight] = useState("");
  const [submitting, setSubmitting] = useState(false);

 
  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles?.[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

   
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

   
  const handleSubmit = async () => {
    if (!file || !estimatedWeight) {
      toast.error("Please provide all required details");
      return;
    }
    if (Number(estimatedWeight) < 0) {
     toast.error("Estimated weight cannot be negative");
    return;
}

    const formData = new FormData();
    formData.append("reportId", task._id);
    formData.append("image", file);
    formData.append("estimatedWeight", estimatedWeight);

    setSubmitting(true);
    const toastId = toast.loading("Marking task as completed...");

    try {
      await apiConnector("POST","/api/worker/reports/complete",formData);

      toast.success("Task marked as completed");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.message || "Failed to complete task");
    } finally {
      toast.dismiss(toastId);
      setSubmitting(false);
    }
  };

  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Complete Task</h2>
          <button 
          disabled={submitting}
          onClick={onClose} className="cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Task Info */}
        <div className="text-sm space-y-1">
          <p className="font-medium">
            Task: <span className="text-green-600">{task.wasteType} Waste</span>
          </p>
          <p className="text-zinc-500">
            {task.pickupLocation?.address?.fullAddress}
          </p>
        </div>

        {/* Upload */}
        {!file && (
          <div
            {...getRootProps()}
            className={`h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition
              ${
                isDragActive
                  ? "border-green-500 bg-green-50"
                  : "border-zinc-300 hover:border-green-400"
              }`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-8 h-8 text-zinc-400" />
            <p className="text-sm text-zinc-600 mt-1">
              Upload completion photo
            </p>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="relative rounded-xl overflow-hidden border">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
            <button
             disabled={submitting}
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 text-xs rounded-full cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}

        {/* Estimated Weight */}
      <div className="space-y-1">
  <label className="text-sm font-medium">
    Estimated Weight (kg)
  </label>

  <input
    type="number"
    min={0}
    step="0.1"
    value={estimatedWeight}
    onChange={(e) => {
      const value = e.target.value;

       
      if (value === "" || Number(value) >= 0) {
        setEstimatedWeight(value);
      }
    }}
    className="w-full rounded-lg border px-3 py-2 text-sm"
    placeholder="e.g. 5"
  />
</div>


        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
             disabled={submitting}
            className="flex-1 py-2 rounded-lg border cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!file || !estimatedWeight || submitting}
            className=" cursor-pointer
              flex-1 py-2 rounded-lg text-white font-medium
              bg-green-600 hover:bg-green-700
              disabled:bg-zinc-400 disabled:cursor-not-allowed
            "
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}
