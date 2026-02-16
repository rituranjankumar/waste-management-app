import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";

export async function POST(req, { params }) {
  try {
    const { error, session } = await requireRole(["worker"]);
    if (error) return error;

    await connectDB();

    const { taskId } =await params;

    const report = await WastePickup.findOne({
      _id: taskId,
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
        { success: false, message: "Task not in assigned state" },
        { status: 400 }
      );
    }

    if (report.isInProgress) {
      return NextResponse.json(
        { success: false, message: "Task already started" },
        { status: 400 }
      );
    }

    report.isInProgress = true;
    await report.save();

    return NextResponse.json({
      success: true,
      message: "Work started",
    });
  } catch (err) {
    console.error("START WORK ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to start work" },
      { status: 500 }
    );
  }
}
