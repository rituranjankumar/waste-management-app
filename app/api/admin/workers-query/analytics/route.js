import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/UserModal";
import WastePickup from "@/models/WastePickupModal";

export async function GET() {
  try {
    const { error } = await requireRole(["admin"]);
    if (error) return error;

    await connectDB();

    // TOTAL WORKERS
    const totalWorkers = await User.countDocuments({ role: "worker" });

    // TOP WORKERS BY VERIFIED REPORTS
    const topWorkers = await WastePickup.aggregate([
      { $match: { status: "Verified" } },
      {
        $group: {
          _id: "$workerId",
          verifiedCount: { $sum: 1 },
        },
      },
      { $sort: { verifiedCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "worker",
        },
      },
      { $unwind: "$worker" },
      {
        $project: {
          _id: "$worker._id",
          name: "$worker.name",
          userImage: "$worker.userImage",
          verifiedCount: 1,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      totalWorkers,
      topWorkers,
    });
  } catch (err) {
    console.error("WORKERS QUERY DASHBOARD ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load" },
      { status: 500 }
    );
  }
}
