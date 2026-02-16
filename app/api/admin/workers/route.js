import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/UserModal";

export async function GET(req) {
  try {
    const { error } = await requireRole(["admin"]);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    if (!lat || !lng) {
      return NextResponse.json(
        { success: false, message: "Location required" },
        { status: 400 }
      );
    }


    // here using geo near becaue it can also return the distance 
    const workers = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat], //   [lng, lat]
          },
          distanceField: "distance", // in meters
          spherical: true,
          maxDistance:10000,
          query: {
            role: "worker",
             
          },
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          userImage: 1,
          distance: 1,
        },
      },
      {
        $sort: { distance: 1 },  
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        workers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN GET WORKERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch workers" },
      { status: 500 }
    );
  }
}
