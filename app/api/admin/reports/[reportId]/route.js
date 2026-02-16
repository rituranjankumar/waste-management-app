import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import RatingAndReview from "@/models/RatingAndReview";

export async function GET(req, { params }) {
  try {
    const { error } = await requireRole(["admin"]);
    if (error) return error;

    await connectDB();

    const { reportId } =await params;

    const report = await WastePickup.findById(reportId)
      .populate("userId", "name phone userImage.secure_url")
      .populate("workerId", "name phone userImage.secure_url")
      .lean();

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    const rating = await RatingAndReview.findOne({ report: reportId })
      .populate("reviewer", "name")
      .lean();

    return NextResponse.json({
      success: true,
      report,
      rating,
    });
  } catch (err) {
    console.error("ADMIN REPORT DETAILS ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
