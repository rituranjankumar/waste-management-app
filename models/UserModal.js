import mongoose from "mongoose";
 
 

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
   userImage: {
  secure_url: String,
  public_id: String,
},

    password: {
      type: String, // empty for Google users
    },

    phone: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "worker", "admin"],
      default: "user",
    },

    // Worker-specific fields
    isAvailable: {
      type: Boolean,
      default: false,
    },

    currentLocation: {
      geo: {
        type: {
          type: String,
          enum: ["Point"],
          
        },
        coordinates: {
          type: [Number], 
           validate: {
        validator: (v) => !v || v.length === 2,
        message: "Coordinates must be [lng, lat]",
      },
        },
      },
      address: {
        fullAddress: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        district:String
      },
    },

    isProfileCompleted: {
      type: Boolean,
      default: false,
    },

     provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
  },
  { timestamps: true }
);

//  Geo index for nearest worker search
userSchema.index({ "currentLocation.geo": "2dsphere" });
userSchema.index({role:1,isAvailable:1});

 

export default mongoose.models.User ||
  mongoose.model("User", userSchema);
