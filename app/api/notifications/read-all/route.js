import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import Notification from "@/models/NotificationModal"
import { NextResponse } from "next/server";

export async function PATCH() {
  try {
    // Allow all roles
    const { session, error } = await requireRole([
      "admin",
      "worker",
      "user",
    ]);

    if (error) return error;

    await connectDB();

    const userId = session.user.id;
    const role = session.user.role;

    let filter = {};

    //  Admin notifications are role-based
    if (role === "admin") {
      filter = {
        recipientRole: "admin",
        isRead: false,
      };
    } else {
      //  User / Worker are id-based
      filter = {
        recipientId: userId,
        isRead: false,
      };
    }

    const result = await Notification.updateMany(filter, {
      $set: { isRead: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "All notifications marked as read",
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("READ ALL NOTIFICATIONS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to mark notifications as read",
      },
      { status: 500 }
    );
  }
}
