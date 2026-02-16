import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import User from "@/models/UserModal"
import WastePickup from "@/models/WastePickupModal"
export async function GET(req,{params})
{
    try{
        await connectDB();
        const {session,error} = requireRole(["admin"]);
        if(error)
        {
            return error;
        }

        // get the location based on the worker and the waste 
              // get the workers location
    const workers = await User.find({
      role: "worker",
       
      "currentLocation.geo.coordinates": { $exists: true }
    }).select("_id currentLocation.geo");

    const workerLocations = workers.map((w) => ({
      _id: w._id.toString(),
      type: "worker",
      workerId: w._id.toString(),
      lat: w.currentLocation.geo.coordinates[1],
      lng: w.currentLocation.geo.coordinates[0],
    }));


     // fetch report location
    const wastes = await WastePickup.find({
      "pickupLocation.geo.coordinates": { $exists: true }
    }).select("_id pickupLocation.geo status wasteType");

    const wasteLocations = wastes.map((w) => ({
      _id: w._id.toString(),
      type: "waste",
      status: w.status,
      wasteType: w.wasteType,
      lat: w.pickupLocation.geo.coordinates[1],
      lng: w.pickupLocation.geo.coordinates[0],
    }));


     
    const locations = [...workerLocations, ...wasteLocations];

    return NextResponse.json({
      success: true,
      count: locations.length,
      location:locations,
    });

    }catch(err)
    {
          console.error("GET /api/admin/map ERROR:", err);
            return NextResponse.json(
              {
                success: false,
                message: "Failed to fetch admin reports",
              },
              { status: 500 }
            );
    }
}