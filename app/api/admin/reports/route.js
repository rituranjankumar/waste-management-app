import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import WastePickup from "@/models/WastePickupModal";
import User from "@/models/UserModal"
import mongoose from "mongoose";
export async function GET(req) {
  try {
     
    const { error } = await requireRole(["admin"]);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 6;
    const status = searchParams.get("status") || "All";
    const reportId = searchParams.get("reportId");
    const userEmail = searchParams.get("userEmail");
    const workerEmail = searchParams.get("workerEmail");
    const skip = (page - 1) * limit;

    
    const filter = {};

 

if (status !== "All") {
  filter.status = status;
}

if (reportId) {
  if (!mongoose.Types.ObjectId.isValid(reportId)) {
    return NextResponse.json({
      success: true,
      message:"the reoprt id is invalid",
      reports: [],
      pagination: { page, limit, totalPages: 0, totalResults: 0 },
    });
  }

  filter._id = reportId;
}

if (userEmail) {
  const user = await User.findOne({ email: userEmail }).select("_id");
  if (user) {
    filter.userId = user._id;
  } else {
    return NextResponse.json({
      success: true,
      reports: [],
      message:"the user does not exists or no reports found",
      pagination: { page, limit, totalPages: 0, totalResults: 0 },
    });
  }
}

if (workerEmail) {
  const worker = await User.findOne({ email: workerEmail.toLowerCase() }).select("_id");
  if (worker) {
    filter.workerId = worker._id;
  } else {
    return NextResponse.json({
      success: true,
      reports: [],
       message:"the worker does not exists or no reports found",
      pagination: { page, limit, totalPages: 0, totalResults: 0 },
    });
  }
}

    const [reports, totalResults] = await Promise.all([
      WastePickup.find(filter)
        .select(
          `
            createdAt
            assignedAt
            status
            wasteType
            imageUrl
            pickupLocation.address.fullAddress
            pickupLocation.geo.coordinates
            userId
            workerId
            isInProgress
          `
        )
        .populate("userId", "name phone userImage")
        .populate("workerId", "name phone userImage")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      WastePickup.countDocuments(filter),
    ]);

   const totalPages = totalResults === 0 ? 0 : Math.ceil(totalResults / limit);


    return NextResponse.json(
      {
        success: true,
        reports,
        pagination: {
          page,
          limit,
          totalPages,
          totalResults,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/reports ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin reports",
      },
      { status: 500 }
    );
  }
}
