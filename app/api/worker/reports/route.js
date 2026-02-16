import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
 
 import WastePickup from "@/models/WastePickupModal"
 

export async function GET(req) {
  try {
    const { error, session } = await requireRole(["worker"]);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 6;
    const status = searchParams.get("status") || "Assigned";

    const skip = (page - 1) * limit;

  
    const filter = {
      workerId: session.user.id,
    };

    if (status !== "All") {
      filter.status = status;
    }

     
    const [reports, totalResults] = await Promise.all([
      WastePickup.find(filter)
        .select( "assignedAt status description wasteType pickupLocation.address.fullAddress"
         )
        .sort({ assignedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      WastePickup.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalResults / limit) || 1;

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
    console.error("GET /api/worker/reports ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch worker tasks",
      },
      { status: 500 }
    );
  }
}
