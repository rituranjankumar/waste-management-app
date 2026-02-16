import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/UserModal";
import { NextResponse } from "next/server";
 

export async function GET(req) {
  
    await connectDB();

  const { session, error } = await requireRole("worker");
  if (error) return error;

  try {
    const workerId = session.user.id;

    const worker = await User.findById(workerId).select("isAvailable");

    if (!worker) {
      return NextResponse.json(
        {
          success: false,
          message: "Worker does not exist",
        },
        { status: 404 }
      );
    }

     
    return NextResponse.json(
      {
        success: true,
        isAvailable: worker.isAvailable,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("ERROR IN WORKER STATUS FETCH =>", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch worker status",
      },
      { status: 500 }
    );
  }
}

// update the status
export async function PATCH() {
  await connectDB();

  const { session, error } = await requireRole("worker");
  if (error) return error;

  try {
    const worker = await User.findOneAndUpdate(
      { _id: session.user.id },
      [
        {
          $set: {
            isAvailable: { $not: "$isAvailable" }, 
          },
        },
      ],
      { new: true ,
        updatePipeline:true // it helps the mongooes to take the array argumant 
      }  
    ).select("isAvailable");

    if (!worker) {
      return NextResponse.json(
        { success: false, message: "Worker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isAvailable: worker.isAvailable,
    });
  } catch (err) {
    console.log("STATUS UPDATE ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    );
  }
}

