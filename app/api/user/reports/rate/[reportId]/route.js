import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import WastePickup from "@/models/WastePickupModal";
import RatingAndReview from "@/models/RatingAndReview";

export async function POST(req, { params }) {
  await connectDB();

  const { session, error } = await requireRole(["user"]);
  if (error) return error;

  try {
    const { rating, review } = await req.json();
    const { reportId } =await params;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Invalid rating" },
        { status: 400 }
      );
    }

    const report = await WastePickup.findById(reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    // Ownership
    if (report.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 403 }
      );
    }

    // Must be verified
    if (report.status !== "Verified") {
      return NextResponse.json(
        { success: false, message: "Pickup not verified yet" },
        { status: 400 }
      );
    }

    // Worker must exist
    if (!report.workerId) {
      return NextResponse.json(
        { success: false, message: "Worker not assigned" },
        { status: 400 }
      );
    }

    // Ensure userConfirmation exists
    if (!report.userConfirmation) {
      report.userConfirmation = {};
    }

    // Prevent duplicate rating (flag)
    if (report.userConfirmation.ratingGiven) {
      return NextResponse.json(
        { success: false, message: "Already rated" },
        { status: 400 }
      );
    }

    // Prevent duplicate rating  
    const existing = await RatingAndReview.findOne({
      report: reportId,
      reviewer: session.user.id,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Rating already exists" },
        { status: 400 }
      );
    }

    // Save rating
    await RatingAndReview.create({
      worker: report.workerId,
      reviewer: session.user.id,
      report: reportId,
      rating,
      review,
    });

    // Mark report as rated
    report.userConfirmation.ratingGiven = true;
    await report.save();

    return NextResponse.json({
      success: true,
      message: "Rating submitted successfully",
    });
  } catch (err) {
    console.error("Rating error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
