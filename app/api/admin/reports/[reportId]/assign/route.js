import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import User from "@/models/UserModal";
import Notification from "@/models/NotificationModal";

export async function POST(req, { params }) {
  try {
    const { error } = await requireRole(["admin"]);
    if (error) return error;

    await connectDB();

    const { reportId } =await params;
    const { workerId } = await req.json();

    if (!workerId) {
      return NextResponse.json(
        { success: false, message: "Worker ID required" },
        { status: 400 }
      );
    }

    //  Find report
    const report = await WastePickup.findById(reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    //   Lock if already started
    if (report.isInProgress) {
      return NextResponse.json(
        {
          success: false,
          message: "Task already started by worker",
        },
        { status: 400 }
      );
    }

    //   No reassignment after completion
    if (["Completed", "Verified"].includes(report.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Task already completed",
        },
        { status: 400 }
      );
    }

    //  Find worker (admin override → ignore isAvailable)
    const worker = await User.findOne({
      _id: workerId,
      role: "worker",
    });

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker not found",
        },
        { status: 404 }
      );
    }

    const previousWorkerId = report.workerId?.toString();

    //   If same worker → do nothing
    if (previousWorkerId === workerId) {
      return NextResponse.json({
        success: true,
        message: "Worker already assigned to this task",
      });
    }

    
    //   REASSIGN CASE
    
    if (previousWorkerId) {
      // Notify old worker about cancellation
      await Notification.create({
        recipientId: previousWorkerId,
        recipientRole: "worker",
        type: "PICKUP_REJECTED",
        title: "Pickup Reassigned",
        message: "This pickup task has been reassigned to another worker by admin.",
        relatedPickupId: report._id,
      });
    }

     
    //   Assign / Reassign
   
    report.workerId = workerId;
    report.status = "Assigned";
    report.assignedAt = new Date();
    report.isInProgress = false;

    await report.save();

    // Notify new worker
    await Notification.create({
      recipientId: workerId,
      recipientRole: "worker",
      type: "WORKER_ASSIGNED",
      title: "New Pickup Assigned",
      message: "You have been assigned a waste pickup task by admin.",
      relatedPickupId: report._id,
    });

    return NextResponse.json({
      success: true,
      message: previousWorkerId
        ? "Worker reassigned successfully"
        : "Worker assigned successfully",
    });

  } catch (error) {
    console.error("ADMIN ASSIGN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to assign worker",
      },
      { status: 500 }
    );
  }
}
