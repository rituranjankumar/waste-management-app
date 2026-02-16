
import mongoose from "mongoose";


const WastePickupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    description: {
      type: String
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    pickupLocation: {
      geo: {
        type: {
          type: String,
          enum: ["Point"],
          required: true
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true
        },
      },
      address: {
        fullAddress: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        district: String
      },
    },

    wasteType: {
      type: String,
      enum: ["Plastic", "Organic", "Metal", "Electronic", "Paper", "Glass", "Others"],
    },

    estimatedWeight: Number,
    actualWeight: Number,

    imageUrl: String,

    completionProof: {
      images: [String],
      completedAt: Date,
      workerLocation: {
        lat: Number,
        lng: Number,
      },
    },

    userConfirmation: {
      confirmed: {
        type: Boolean,
        default: false,
      },
      confirmedAt: Date,

      ratingGiven: {
        type: Boolean,
        default: false,
      },
    },

    isInProgress: {
      type: Boolean,
      default: false,
    },

    acceptedAt: {
      type: Date,
    },


    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Completed",
        "Verified"
      ],
      default: "Pending",
    },
    assignedAt: {
      type: Date
    }

    // aiDetected: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true }
);


WastePickupSchema.index({ "pickupLocation.geo": "2dsphere" })



WastePickupSchema.index({ userId: 1, createdAt: -1 });


WastePickupSchema.index({ workerId: 1, status: 1 });


WastePickupSchema.index({ status: 1, createdAt: -1 });
WastePickupSchema.index({ workerId: 1, "completionProof.completedAt": 1 })
WastePickupSchema.index({ workerId: 1 })
WastePickupSchema.index({ userId: 1 })

export default mongoose.models.WastePickup ||
  mongoose.model("WastePickup", WastePickupSchema);
