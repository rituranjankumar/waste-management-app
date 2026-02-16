import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import WastePickup from "@/models/WastePickupModal";
import { connectDB } from "@/lib/dbConnect";

export async function POST(req, context) {
  await connectDB();

  // Auth + role check
  const { session, error } = await requireRole(["user"]);
  if (error) return error;

 
  const { verifyingId } =await context.params;
      //  console.log("verifying is is  -> ",verifyingId)
  try {
    const report = await WastePickup.findOne({
      _id: verifyingId,
      userId: session.user.id,
      status: "Completed",
    });

    if (!report) {
      return NextResponse.json(
        {
          success: false,
          message: "Report not found or not eligible for verification",
        },
        { status: 404 }
      );
    }

    report.status = "Verified";
    report.userConfirmation = {
      confirmed: true,
      confirmedAt: new Date(),
      ratingGiven:false
    };

    await report.save();

    return NextResponse.json(
      {
        success: true,
        message: "Pickup verified successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to verify pickup",
      },
      { status: 500 }
    );
  }
}
