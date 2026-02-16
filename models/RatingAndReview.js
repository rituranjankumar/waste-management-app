import mongoose from "mongoose";

const ratingAndReviewsSchema = new mongoose.Schema({
 
    // worker ref->user
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    // user who revied
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // rating number

    // wasteReport 
    report:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"WastePickup"
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },

    // reviews -> string
    review: {
        type: String,
        trim: true,
    },
},
    { timestamps: true }

);

ratingAndReviewsSchema.index({worker:1});
ratingAndReviewsSchema.index({ report: 1, worker: 1 });

export default mongoose.models.ratingAndReview || mongoose.model("ratingAndReview",ratingAndReviewsSchema);

