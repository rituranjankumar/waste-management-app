import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import User from "@/models/UserModal";
import Notification from "@/models/NotificationModal"
export async function POST(req, { params }) {
  try {
    // Only admin allowed
    const { error } = await requireRole(["admin"]);
    if (error) return error;

    await connectDB();

    const { reportId } =await params;

    //  Find report
    const report = await WastePickup.findById(reportId);
    if (!report) {
      return NextResponse.json(
        { success: false, message: "Report not found" },
        { status: 404 }
      );
    }

    //  Already assigned
    if (report.status !== "Pending") {
      return NextResponse.json(
        {
          success: false,
          message: "Report is already assigned or processed",
        },
        { status: 400 }
      );
    }

    // Pickup coordinates
    const coords = report.pickupLocation?.geo?.coordinates;
    if (!coords || coords.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Pickup location not available",
        },
        { status: 400 }
      );
    }

    const [lng, lat] = coords;

    // Find nearest available workers (within 10km)
    const nearestWorkers = await User.find({
      role: "worker",
      isAvailable: true,
      "currentLocation.geo": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: 10000, // 10km
        },
      },
    })
      .select("_id")
      .lean();

    //   No workers available
    if (!nearestWorkers.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No active worker available nearby",
        },
        { status: 404 }
      );
    }

    //   Pick random worker from nearby pool
    const assignedWorker =
      nearestWorkers[
        Math.floor(Math.random() * nearestWorkers.length)
      ];

    //  Assign worker
    report.workerId = assignedWorker._id;
    report.status = "Assigned";
    report.assignedAt = new Date();
       report.isInProgress = false
    await report.save();

      await Notification.create({
          recipientId: assignedWorker._id,
          recipientRole: "worker",
          type: "WORKER_ASSIGNED",
          title: "New Pickup Assigned",
          message: "You have been assigned a new waste pickup task.",
          relatedPickupId: report._id,
        });

    return NextResponse.json(
      {
        success: true,
        message: "Worker auto-assigned successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN AUTO ASSIGN ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to auto assign worker",
      },
      { status: 500 }
    );
  }
}
