import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import Notification from  "@/models/NotificationModal"
import { requireRole } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();

    const { error, session } = await requireRole(["admin", "worker", "user"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
    let filter = {recipientRole:session.user.role}
    if(session.user.role !== "admin")
    {
           
      filter.recipientId= session.user.id
     
    } 
  

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Notification.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalResults: total,
      },
    });
  } catch (err) {
    console.log("NOTIFICATION FETCH ERROR:", err);
    return NextResponse.json(
      { success: false },
      { status: 500 }
    );
  }
}
