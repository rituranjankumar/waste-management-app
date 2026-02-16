import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
    },

    recipientRole: {
      type: String,
      enum: ["user", "worker", "admin"],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "PICKUP_CREATED",
        "WORKER_ASSIGNED",
        "PICKUP_COMPLETED",
        "PICKUP_REJECTED",
        "AWAITING_CONFIRMATION",
        "ADMIN_OVERRIDE",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    relatedPickupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WastePickup",
    },

    actionUrl: String,

    metadata: Object,

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipientId: 1, isRead: 1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification",notificationSchema)