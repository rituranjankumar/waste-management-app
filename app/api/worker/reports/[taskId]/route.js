import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import RatingAndReview from "@/models/RatingAndReview";
export async function GET(req, { params }) {
  try {
    const { error, session } = await requireRole(["worker"]);
    if (error) return error;

    await connectDB();

    const { taskId } = await params;

    const report = await WastePickup.findOne({
      _id: taskId,
      workerId: session.user.id,
    })
      .populate("userId", "name phone userImage.secure_url")
      .lean();


    const rating = await RatingAndReview.findOne({
      report: taskId,
      worker: session.user.id,   // ensures worker only sees his own rating
    })
      .populate("reviewer", "name userImage.secure_url")
      .lean();

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
      rating
    });
  } catch (err) {
    console.error("WORKER TASK FETCHING DETAILS BY ID -> ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load task" },
      { status: 500 }
    );
  }
}
