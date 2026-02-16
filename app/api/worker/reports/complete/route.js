import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/uploadAndDeleteToCloudinary";
import WastePickup from "@/models/WastePickupModal";
import { connectDB } from "@/lib/dbConnect";
import Notification from "@/models/NotificationModal"
export async function POST(req) {
  try {
    const { error, session } = await requireRole(["worker"]);
    if (error) return error;

    await connectDB();

    const formData = await req.formData();

    const reportId = formData.get("reportId");
    const imageFile = formData.get("image");
    const estimatedWeight = formData.get("estimatedWeight");

    if (!reportId || !imageFile || !estimatedWeight) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const weight = Number(estimatedWeight);
    if (isNaN(weight) || weight <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid estimated weight" },
        { status: 400 }
      );
    }

    const report = await WastePickup.findOne({
      _id: reportId,
      workerId: session.user.id,
    });

    if (!report) {
      return NextResponse.json(
        { success: false, message: "Task not found" },
        { status: 404 }
      );
    }

    if (report.status !== "Assigned") {
      return NextResponse.json(
        { success: false, message: "Task already completed or verified" },
        { status: 400 }
      );
    }

    // Upload completion proof
    const uploaded = await uploadToCloudinary(imageFile, "waste-completions");

    report.status = "Completed";
    report.estimatedWeight = weight;

    report.completionProof = {
      images: [uploaded.secure_url],  
      completedAt: new Date(),
      workerLocation: null, 
    };

    await report.save();
      await Notification.create({
      recipientId: report.userId,     //   notify user
      recipientRole: "user",
      type: "AWAITING_CONFIRMATION",
      title: "Pickup Completed",
      message: "Your waste pickup has been completed. Please verify the task.",
      relatedPickupId: report._id,
    });
    return NextResponse.json(
      {
        success: true,
        message: "Task marked as completed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("WORKER COMPLETE TASK ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to complete task",
      },
      { status: 500 }
    );
  }
}
