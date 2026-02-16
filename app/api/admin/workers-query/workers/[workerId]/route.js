import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/UserModal";
import WastePickup from "@/models/WastePickupModal";
import RatingAndReview from "@/models/RatingAndReview";

export async function GET(req, { params }) {
  try {
    const { error } = await requireRole(["admin"]);
    if (error) return error;

    await connectDB();
 
    const { workerId } =await params;
    const objectId = new mongoose.Types.ObjectId(workerId);

    const worker = await User.findById(workerId).select("-password -isProfileCompleted -provider -updatedAt -createdAt -userImage.public_id").lean();
    if (!worker) {
      return NextResponse.json(
        { success: false, message: "Worker not found" },
        { status: 404 }
      );
    }
 
    // REPORT COUNTS
    const stats = await WastePickup.aggregate([
      { $match: { workerId: objectId } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = {
      Assigned: 0,
      Completed: 0,
      Verified: 0,
    };

    stats.forEach((s) => {
      if (counts[s._id] !== undefined) {
        counts[s._id] = s.count;
      }
    });

    const totalReports = await WastePickup.countDocuments({
      workerId: objectId,
    });

    // RATING
    const ratingData = await RatingAndReview.aggregate([
      { $match: { worker: objectId } },
      {
        $group: {
          _id: "$worker",
          avgRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      worker: {
        ...worker,
        totalReports,
        assigned: counts.Assigned,
        completed: counts.Completed,
        verified: counts.Verified,
        avgRating: ratingData[0]?.avgRating || 0,
        totalRatings: ratingData[0]?.totalRatings || 0,
      },
    });
  } catch (err) {
    console.error("WORKER DETAILS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load details" },
      { status: 500 }
    );
  }
}
