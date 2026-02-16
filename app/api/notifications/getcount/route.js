import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import Notification from "@/models/NotificationModal";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { session, error } = await requireRole([
      "admin",
      "worker",
      "user",
    ]);

    if (error) return error;

    await connectDB();

    const userId = session.user.id;
    const role = session.user.role;

    let filter = { isRead: false };

    //   Admin → role based
    if (role === "admin") {
      filter.recipientRole = "admin";
    } 
    //   User / Worker → id based
    else {
      filter.recipientId = userId;
    }

    const count = await Notification.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        unreadCount: count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UNREAD COUNT ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch unread count",
      },
      { status: 500 }
    );
  }
}
